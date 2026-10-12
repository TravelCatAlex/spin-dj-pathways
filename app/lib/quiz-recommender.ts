import Anthropic from '@anthropic-ai/sdk';

import { serverSupabase } from './supabase';

/**
 * The course recommender: build a catalogue of teachers and the courses they
 * teach from the EXISTING database, then ask Claude to pick the best fit for a
 * student's quiz answers.
 *
 * THE CATALOGUE IS READ SERVER-SIDE WITH THE SERVICE ROLE, from the WL mirror in
 * the `public` schema (service, staff_service, service_category, person). The
 * portal is specified to read only `app`; this is a backend recommendation job,
 * the same trust level the sync runs at, and the chosen course is snapshotted as
 * text into app.quiz_suggestion (migration 0059) so nothing user-facing ever
 * reads the mirror.
 *
 * CLAUDE CHOOSES ONLY FROM THE CATALOGUE. The prompt lists the real courses and
 * the model must return one of them (or say none fits); the caller validates the
 * choice against the catalogue before saving, so a hallucinated course never
 * reaches the student.
 */

// Per the claude-api skill: default to claude-opus-5-5 unless the user names
// another model. Recorded on each suggestion row.
const MODEL = 'claude-opus-5-5';

export interface CatalogueCourse {
  title: string;
  category: string | null;
  teacher: string | null;
}

export interface QuizAnswerText {
  prompt: string;
  answer: string;
}

export interface Recommendation {
  course_title: string;
  course_category: string | null;
  teacher_name: string | null;
  rationale: string;
  model: string;
}

/**
 * Build the catalogue from the existing WL service data. Returns a de-duplicated
 * list of {course, category, teacher}. Only real, resolved offerings.
 */
export async function buildCatalogue(): Promise<CatalogueCourse[]> {
  const db = serverSupabase();
  const mirror = db.schema('public');

  const [{ data: services }, { data: categories }, { data: links }, { data: staff }] =
    await Promise.all([
      mirror
        .from('service')
        .select('k_service, s_service, k_service_category, is_resolved'),
      mirror.from('service_category').select('k_service_category, s_title'),
      mirror.from('staff_service').select('k_staff, k_service'),
      mirror.from('person').select('k_staff, first_name, last_name').not('k_staff', 'is', null),
    ]);

  const categoryTitle = new Map<string, string>();
  for (const c of (categories ?? []) as { k_service_category: string; s_title: string | null }[]) {
    if (c.s_title) categoryTitle.set(c.k_service_category, c.s_title);
  }

  const serviceById = new Map<
    string,
    { title: string; category: string | null }
  >();
  for (const s of (services ?? []) as {
    k_service: string;
    s_service: string | null;
    k_service_category: string | null;
    is_resolved: boolean | null;
  }[]) {
    // Skip unresolved stubs and untitled services - they are not real offerings
    // a student could be pointed at.
    if (s.is_resolved === false) continue;
    if (!s.s_service || s.s_service.trim() === '') continue;
    serviceById.set(s.k_service, {
      title: s.s_service.trim(),
      category: s.k_service_category ? (categoryTitle.get(s.k_service_category) ?? null) : null,
    });
  }

  const teacherName = new Map<string, string>();
  for (const p of (staff ?? []) as {
    k_staff: string | null;
    first_name: string | null;
    last_name: string | null;
  }[]) {
    if (p.k_staff === null) continue;
    const name = [p.first_name, p.last_name].filter((x) => x && x.trim() !== '').join(' ').trim();
    if (name !== '') teacherName.set(p.k_staff, name);
  }

  // One entry per (teacher, course), de-duplicated.
  const seen = new Set<string>();
  const catalogue: CatalogueCourse[] = [];
  for (const link of (links ?? []) as { k_staff: string; k_service: string }[]) {
    const svc = serviceById.get(link.k_service);
    if (!svc) continue;
    const teacher = teacherName.get(link.k_staff) ?? null;
    const key = `${teacher ?? ''}|${svc.title}`;
    if (seen.has(key)) continue;
    seen.add(key);
    catalogue.push({ title: svc.title, category: svc.category, teacher });
  }

  return catalogue;
}

/** Render the catalogue compactly for the prompt. */
function catalogueText(catalogue: CatalogueCourse[]): string {
  return catalogue
    .map(
      (c, i) =>
        `${i + 1}. course="${c.title}"` +
        (c.category ? ` category="${c.category}"` : '') +
        (c.teacher ? ` teacher="${c.teacher}"` : ''),
    )
    .join('\n');
}

/** How many courses to suggest, best-fit first. */
const TOP_N = 3;

/** Validate one model pick against the catalogue; null if it invented a course. */
function resolvePick(
  pick: Record<string, unknown>,
  catalogue: CatalogueCourse[],
): Omit<Recommendation, 'model'> | null {
  const title = typeof pick.course_title === 'string' ? pick.course_title.trim() : '';
  if (title === '') return null;

  const chosenTeacher =
    typeof pick.teacher_name === 'string' && pick.teacher_name.trim() !== ''
      ? pick.teacher_name.trim()
      : null;

  const matches = catalogue.filter((c) => c.title.toLowerCase() === title.toLowerCase());
  if (matches.length === 0) return null; // hallucinated course - reject

  const match =
    (chosenTeacher &&
      matches.find((c) => (c.teacher ?? '').toLowerCase() === chosenTeacher.toLowerCase())) ||
    matches[0];

  const rationale =
    typeof pick.rationale === 'string' && pick.rationale.trim() !== ''
      ? pick.rationale.trim()
      : 'This course lines up with what you told us you are interested in.';

  return {
    course_title: match.title,
    course_category: match.category,
    teacher_name: match.teacher,
    rationale,
  };
}

/**
 * Ask Claude for up to three best-fit courses, ranked. Returns an empty array
 * when the model (or validation) finds no good match.
 */
export async function recommendCourses(
  answers: QuizAnswerText[],
  catalogue: CatalogueCourse[],
): Promise<Recommendation[]> {
  if (catalogue.length === 0) return [];

  const client = new Anthropic(); // reads ANTHROPIC_API_KEY from the environment

  const answerText = answers.map((a) => `Q: ${a.prompt}\nA: ${a.answer}`).join('\n\n');

  const system =
    `You help a music academy suggest up to ${TOP_N} courses to a student from a ` +
    'fixed catalogue, best fit first. Every course you name must appear verbatim in ' +
    'the catalogue - never invent a course or a teacher, and do not repeat a course. ' +
    'If fewer than three fit well, return fewer. Respond with ONLY a JSON object, no ' +
    'prose, no code fence.';

  const prompt =
    `The student's quiz answers:\n${answerText}\n\n` +
    `The course catalogue (choose only from these):\n${catalogueText(catalogue)}\n\n` +
    `Return JSON of the form:\n` +
    `{"suggestions": [{"course_title": "<exact course from the list>", ` +
    `"course_category": "<its category or null>", "teacher_name": "<its teacher or null>", ` +
    `"rationale": "<one or two sentences, friendly, addressed to the student>"}]}\n` +
    `List them best-fit first, at most ${TOP_N}. If nothing fits, return {"suggestions": []}.`;

  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 2048,
    system,
    messages: [{ role: 'user', content: prompt }],
  });

  const textBlock = response.content.find((b) => b.type === 'text');
  const raw = textBlock && textBlock.type === 'text' ? textBlock.text.trim() : '';

  let parsed: Record<string, unknown>;
  try {
    const cleaned = raw.replace(/^```(?:json)?/i, '').replace(/```$/, '').trim();
    parsed = JSON.parse(cleaned);
  } catch {
    return [];
  }

  const list = Array.isArray(parsed.suggestions) ? parsed.suggestions : [];
  const out: Recommendation[] = [];
  const seen = new Set<string>();
  for (const pick of list as Record<string, unknown>[]) {
    const resolved = resolvePick(pick, catalogue);
    if (!resolved) continue;
    const key = `${(resolved.teacher_name ?? '').toLowerCase()}|${resolved.course_title.toLowerCase()}`;
    if (seen.has(key)) continue; // no duplicate course
    seen.add(key);
    out.push({ ...resolved, model: MODEL });
    if (out.length >= TOP_N) break;
  }
  return out;
}
