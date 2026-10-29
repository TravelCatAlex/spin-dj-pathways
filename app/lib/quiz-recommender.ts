import Anthropic from '@anthropic-ai/sdk';

import { serverSupabase } from './supabase';

/**
 * The course recommender: build a catalogue of teachers and the courses they
 * teach from the EXISTING database, then ask an LLM to pick the best fits for a
 * student's quiz answers. The provider is chosen by which API key is set - Gemini
 * when GEMINI_API_KEY is present, otherwise Claude (see `generate` below).
 *
 * THE CATALOGUE IS READ SERVER-SIDE WITH THE SERVICE ROLE, from the WL mirror in
 * the `public` schema (service, staff_service, service_category, person). The
 * portal is specified to read only `app`; this is a backend recommendation job,
 * the same trust level the sync runs at, and the chosen course is snapshotted as
 * text into app.quiz_suggestion (migration 0059) so nothing user-facing ever
 * reads the mirror.
 *
 * THE MODEL CHOOSES ONLY FROM THE CATALOGUE. The prompt lists the real courses and
 * the model must return ones from that list (or say none fits); the caller
 * validates every choice against the catalogue before saving, so a hallucinated
 * course never reaches the student.
 */

// Provider is chosen by which key is set, so testing can run on Gemini today and
// switch back to Claude with no code change. If GEMINI_API_KEY is present, Gemini
// is used; otherwise Claude (ANTHROPIC_API_KEY). The model actually used is
// recorded on each suggestion row.
const ANTHROPIC_MODEL = process.env.ANTHROPIC_MODEL || 'claude-opus-5-5';
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-3.8-flash';

/**
 * Ask the configured LLM for a JSON response. Returns the raw text and the model
 * id used. Throws on an API error (the caller treats that as "no suggestion this
 * time" without losing the saved attempt).
 */
async function generate(system: string, prompt: string): Promise<{ text: string; model: string }> {
  const geminiKey = process.env.GEMINI_API_KEY;
  if (geminiKey) {
    const model = GEMINI_MODEL;
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${geminiKey}`;
    const body = JSON.stringify({
      system_instruction: { parts: [{ text: system }] },
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      // Ask Gemini for JSON directly so parsing is reliable, and turn thinking
      // OFF: Gemini 3.x flash is a reasoning model that otherwise spends the
      // output budget on internal "thoughts" and returns empty content
      // (finishReason MAX_TOKENS). thinkingBudget 0 makes it answer directly.
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.4,
        maxOutputTokens: 2048,
        thinkingConfig: { thinkingBudget: 0 },
      },
    });

    // Retry transient overloads (429 / 5xx) - Gemini returns 503 under load.
    let lastStatus = 0;
    let lastDetail = '';
    for (let attempt = 0; attempt < 3; attempt += 1) {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body,
      });
      if (res.ok) {
        const data = (await res.json()) as {
          candidates?: { content?: { parts?: { text?: string }[] } }[];
        };
        const text = (data.candidates?.[0]?.content?.parts ?? [])
          .map((p) => p.text ?? '')
          .join('')
          .trim();
        return { text, model };
      }
      lastStatus = res.status;
      lastDetail = await res.text().catch(() => '');
      if (res.status !== 429 && res.status < 500) break; // not transient
      await new Promise((r) => setTimeout(r, 1200 * (attempt + 1)));
    }
    throw new Error(`Gemini API ${lastStatus}: ${lastDetail.slice(0, 200)}`);
  }

  // Claude (Anthropic).
  const anthropicKey = process.env.ANTHROPIC_API_KEY;
  if (anthropicKey) {
    const client = new Anthropic({ apiKey: anthropicKey });
    const response = await client.messages.create({
      model: ANTHROPIC_MODEL,
      max_tokens: 2048,
      system,
      messages: [{ role: 'user', content: prompt }],
    });
    const block = response.content.find((b) => b.type === 'text');
    const text = block && block.type === 'text' ? block.text.trim() : '';
    return { text, model: ANTHROPIC_MODEL };
  }

  // Neither provider is configured - a clear message rather than an SDK error.
  throw new Error('No LLM API key configured: set ANTHROPIC_API_KEY (Claude) or GEMINI_API_KEY (Gemini).');
}

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
 * Build the catalogue from the `app.course_catalogue` view (migration 0061): one
 * row per (base course, teacher), unioning the WL `public.service` catalogue (123
 * sold courses, teachers recovered through their sessions) and `app.cohort`
 * (teachers via class_session_teacher), grouped by base course - the title before
 * the first "|", so a course's duration/location variants collapse to one. A course
 * with no resolvable teacher arrives as a single row with teacher_name null.
 *
 * The heavy cross-schema join lives in the view, so this is one read. Returns
 * {course, category, teacher}: up to a few teachers per course, or a teacher-less
 * entry when the course has none. (Category is not resolved; the model is told it
 * may be null.)
 */
export async function buildCatalogue(): Promise<CatalogueCourse[]> {
  const db = serverSupabase(); // app schema

  const { data: rows } = await db.from('course_catalogue').select('base_title, teacher_name');

  // The view already deduped (base_title, teacher_name) pairs; group teachers
  // under each base course here.
  const byCourse = new Map<string, Set<string>>();
  for (const r of (rows ?? []) as { base_title: string | null; teacher_name: string | null }[]) {
    const title = (r.base_title ?? '').trim();
    if (title === '') continue;
    if (!byCourse.has(title)) byCourse.set(title, new Set());
    const name = (r.teacher_name ?? '').trim();
    if (name !== '') byCourse.get(title)!.add(name);
  }

  const catalogue: CatalogueCourse[] = [];
  for (const [title, teachers] of byCourse) {
    if (teachers.size === 0) {
      catalogue.push({ title, category: null, teacher: null });
    } else {
      // At most a few teachers per course so the catalogue stays compact.
      for (const n of [...teachers].slice(0, 3)) {
        catalogue.push({ title, category: null, teacher: n });
      }
    }
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
 * Icon names the LLM may assign to an interest tag. This is the subset of
 * iconRegistry.js that makes sense for interests; the model picks from this
 * list so every tag gets a meaningful, consistent icon.
 */
export const INTEREST_ICONS = [
  'music', 'mic', 'headphones', 'mixer', 'video', 'film', 'play',
  'superhero', 'gaming', 'youtube', 'star', 'heart', 'trophy',
  'brain', 'sparkles', 'target', 'award',
] as const;

export type InterestIcon = (typeof INTEREST_ICONS)[number];

export interface InterestTag {
  tag: string;
  icon: InterestIcon;
}

export interface RecommendationResult {
  suggestions: Recommendation[];
  /** Interest tags with LLM-assigned icons. */
  interests: InterestTag[];
}

/**
 * Ask the model for up to three best-fit courses (ranked) AND a few interest tags
 * it infers from the student's answers. Returns empty lists when nothing fits or
 * the response can't be parsed.
 */
export async function recommendCourses(
  answers: QuizAnswerText[],
  catalogue: CatalogueCourse[],
): Promise<RecommendationResult> {
  if (catalogue.length === 0) return { suggestions: [], interests: [] };

  const answerText = answers.map((a) => `Q: ${a.prompt}\nA: ${a.answer}`).join('\n\n');

  const iconList = INTEREST_ICONS.join(', ');

  const system =
    `You help a music academy. From a student's quiz answers you (1) infer a few ` +
    `short interest tags each with an icon, and (2) suggest up to ${TOP_N} courses ` +
    'from a fixed catalogue, best fit first. Every course you name must appear ' +
    'verbatim in the catalogue - never invent a course or a teacher, and do not ' +
    'repeat a course. If fewer than three fit well, return fewer. Respond with ONLY ' +
    'a JSON object, no prose, no code fence.';

  const prompt =
    `The student's quiz answers:\n${answerText}\n\n` +
    `The course catalogue (choose only from these):\n${catalogueText(catalogue)}\n\n` +
    `Available icon names (pick the best fit for each interest):\n${iconList}\n\n` +
    `Return JSON of the form:\n` +
    `{"interests": [{"tag": "<1-2 word interest>", "icon": "<icon name from the list above>"}], ` +
    `"suggestions": [{"course_title": "<exact course from the list>", ` +
    `"course_category": "<its category or null>", "teacher_name": "<its teacher or null>", ` +
    `"rationale": "<one or two sentences, friendly, addressed to the student>"}]}\n` +
    `Return 3-6 interests drawn from the answers including any free text. ` +
    `List suggestions best-fit first, at most ${TOP_N}. If nothing fits, use an empty array.`;

  const { text: raw, model: usedModel } = await generate(system, prompt);

  let parsed: Record<string, unknown>;
  try {
    const cleaned = raw.replace(/^```(?:json)?/i, '').replace(/```$/, '').trim();
    parsed = JSON.parse(cleaned);
  } catch {
    return { suggestions: [], interests: [] };
  }

  const list = Array.isArray(parsed.suggestions) ? parsed.suggestions : [];
  const out: Recommendation[] = [];
  const seen = new Set<string>();
  for (const pick of list as Record<string, unknown>[]) {
    const resolved = resolvePick(pick, catalogue);
    if (!resolved) continue;
    // One suggestion per course: the same course with a different teacher is
    // still the same course, so key on the title alone (not teacher+title).
    const key = resolved.course_title.toLowerCase();
    if (seen.has(key)) continue; // no duplicate course
    seen.add(key);
    out.push({ ...resolved, model: usedModel });
    if (out.length >= TOP_N) break;
  }

  // Interest tags with icons: de-duplicated, capped, icon validated.
  const validIcons = new Set<string>(INTEREST_ICONS);
  const interests: InterestTag[] = [];
  const seenInterest = new Set<string>();
  const rawInterests = Array.isArray(parsed.interests) ? parsed.interests : [];
  for (const item of rawInterests) {
    // Accept both {tag, icon} objects and plain strings (backward compat).
    const tag = (typeof item === 'string' ? item : (item as Record<string, unknown>)?.tag as string ?? '').trim();
    const rawIcon = typeof item === 'string' ? 'star' : (item as Record<string, unknown>)?.icon;
    const icon = (typeof rawIcon === 'string' && validIcons.has(rawIcon) ? rawIcon : 'star') as InterestIcon;
    if (tag === '' || tag.length > 40) continue;
    const key = tag.toLowerCase();
    if (seenInterest.has(key)) continue;
    seenInterest.add(key);
    interests.push({ tag, icon });
    if (interests.length >= 6) break;
  }

  return { suggestions: out, interests };
}
