'use client';

import { useEffect, useState } from 'react';

import Reveal from '../../components/atoms/Reveal';
import Card from '../../components/molecules/Card';
import Button from '../../components/atoms/Button';
import Icon from '../../components/atoms/Icon';

/**
 * PAGE — /student/quiz ("Find your course")
 *
 * A short interest quiz. On submit the answers go to the server, which asks the
 * Claude API to pick a course from the real teacher/course catalogue and saves
 * the suggestion. The result (and any past one) is read back under the student's
 * own RLS - nothing here reads the WL mirror.
 *
 * No fixtures: an error says so rather than showing invented content.
 */
export default function StudentQuizPage() {
  const [questions, setQuestions] = useState(null); // null = loading
  const [loadError, setLoadError] = useState(null);
  const [choices, setChoices] = useState({}); // question_id -> option_id
  const [texts, setTexts] = useState({}); // question_id -> free text

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [result, setResult] = useState(null); // { suggestion, warning } or null
  const [retaking, setRetaking] = useState(false);

  // Load the questions, and any previous result.
  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const [qRes, aRes] = await Promise.all([
          fetch('/api/v1/quiz'),
          fetch('/api/v1/quiz/attempts'),
        ]);

        if (qRes.status === 401 || aRes.status === 401) {
          window.location.href = '/login';
          return;
        }

        const qBody = await qRes.json();
        if (cancelled) return;
        if (!qRes.ok) {
          setLoadError(qBody?.error?.code ?? 'unknown');
          return;
        }
        setQuestions(qBody.questions ?? []);

        if (aRes.ok) {
          const aBody = await aRes.json();
          if (!cancelled && aBody.attempt && (aBody.suggestions?.length ?? 0) > 0) {
            setResult({ suggestions: aBody.suggestions, warning: null });
          }
        }
      } catch {
        if (!cancelled) setLoadError('fetch_failed');
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  // A question is answered when it has a chosen option, or - for a text-only
  // question - some typed text. A text box on a question that also has options is
  // optional extra detail.
  function isAnswered(q) {
    if (q.options.length > 0) return Boolean(choices[q.id]);
    return Boolean((texts[q.id] ?? '').trim());
  }

  const allAnswered =
    questions !== null && questions.length > 0 && questions.every(isAnswered);

  async function submit() {
    if (submitting) return;
    if (!allAnswered) {
      setSubmitError('Please answer every question.');
      return;
    }
    setSubmitting(true);
    setSubmitError(null);

    // One answer per question: its chosen option and/or its typed text.
    const answers = (questions ?? [])
      .map((q) => ({
        question_id: q.id,
        option_id: choices[q.id] ?? null,
        answer_text: (texts[q.id] ?? '').trim() || null,
      }))
      .filter((a) => a.option_id || a.answer_text);

    try {
      const response = await fetch('/api/v1/quiz/attempts', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ answers }),
      });
      const body = await response.json();
      if (!response.ok) {
        setSubmitError(body?.error?.message ?? 'That did not work.');
        setSubmitting(false);
        return;
      }
      setResult({ suggestions: body.suggestions ?? [], warning: body.warning ?? null });
      setRetaking(false);
      setSubmitting(false);
    } catch {
      setSubmitError('Could not reach the server.');
      setSubmitting(false);
    }
  }

  function retake() {
    setChoices({});
    setTexts({});
    setResult(null);
    setRetaking(true);
    setSubmitError(null);
  }

  const showResult = result !== null && !retaking;

  return (
    <>
      <Reveal as="h1" className="m-0 mb-5 text-left text-[24px] font-extrabold text-ink">
        Find your course
      </Reveal>

      <Reveal inView>
        <Card>
          {/* Result view */}
          {showResult ? (
            <div className="flex flex-col gap-4">
              {result.suggestions.length > 0 ? (
                <>
                  <span className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted">
                    <Icon name="target" size={14} /> Suggested for you
                  </span>
                  <ol className="flex flex-col gap-3">
                    {result.suggestions.map((s, i) => (
                      <li
                        key={`${s.course_title}-${i}`}
                        className="rounded-lg border border-purple-100 bg-purple-50 p-4"
                      >
                        <div className="flex items-baseline gap-2">
                          <span className="text-xs font-bold text-purple">#{i + 1}</span>
                          <p className="m-0 text-lg font-bold text-ink">{s.course_title}</p>
                        </div>
                        <p className="m-0 mt-0.5 text-sm text-muted">
                          {s.course_category && <span>{s.course_category}</span>}
                          {s.teacher_name && (
                            <span>
                              {s.course_category ? ' · ' : ''}with {s.teacher_name}
                            </span>
                          )}
                        </p>
                        <p className="m-0 mt-2 text-sm leading-relaxed text-ink">{s.rationale}</p>
                      </li>
                    ))}
                  </ol>
                </>
              ) : (
                <p className="text-sm text-ink-soft">
                  {result.warning ??
                    'We couldn’t find a clear match this time — try different answers, or ask your studio for a recommendation.'}
                </p>
              )}

              <div>
                <Button type="button" variant="outline" onClick={retake}>
                  Retake the quiz
                </Button>
              </div>
            </div>
          ) : (
            // Quiz view
            <div className="flex flex-col gap-6">
              <p className="m-0 text-sm text-muted">
                Answer a few quick questions and we’ll suggest a course that fits.
              </p>

              {questions === null && !loadError && (
                <p className="text-sm text-muted">Loading the quiz…</p>
              )}

              {loadError && (
                <p className="text-sm text-ink-soft">The quiz could not be loaded ({loadError}).</p>
              )}

              {questions !== null && questions.length === 0 && !loadError && (
                <p className="text-sm text-muted">No quiz is available right now.</p>
              )}

              {questions !== null &&
                questions.map((q, i) => (
                  <fieldset key={q.id} className="flex flex-col gap-2 border-0 p-0">
                    <legend className="mb-1 text-sm font-semibold text-ink">
                      {i + 1}. {q.prompt}
                    </legend>
                    {q.options.length > 0 && (
                      <div className="flex flex-col gap-1.5">
                        {q.options.map((o) => (
                          <label
                            key={o.id}
                            className={`flex cursor-pointer items-center gap-2 rounded-[10px] border px-3 py-2 text-sm transition-colors ${
                              choices[q.id] === o.id
                                ? 'border-purple bg-purple-50 text-ink'
                                : 'border-line text-ink-soft hover:border-purple-100'
                            }`}
                          >
                            <input
                              type="radio"
                              name={q.id}
                              checked={choices[q.id] === o.id}
                              onChange={() => {
                                setChoices((c) => ({ ...c, [q.id]: o.id }));
                                if (submitError) setSubmitError(null);
                              }}
                            />
                            {o.label}
                          </label>
                        ))}
                      </div>
                    )}
                    {q.allow_text && (
                      <textarea
                        value={texts[q.id] ?? ''}
                        onChange={(e) => {
                          setTexts((t) => ({ ...t, [q.id]: e.target.value }));
                          if (submitError) setSubmitError(null);
                        }}
                        placeholder={
                          q.options.length > 0 ? 'Add anything else (optional)…' : 'Type your answer…'
                        }
                        rows={2}
                        className="mt-1 w-full resize-y rounded-[10px] border border-line bg-white px-3 py-2 text-sm text-ink outline-none focus:border-purple"
                      />
                    )}
                  </fieldset>
                ))}

              {questions !== null && questions.length > 0 && (
                <div className="flex flex-col gap-2">
                  <div>
                    <Button type="button" onClick={submit} disabled={submitting}>
                      {submitting ? 'Finding your course…' : 'Get my suggestion'}
                    </Button>
                  </div>
                  {submitting && (
                    <p className="text-xs text-muted">This takes a few seconds.</p>
                  )}
                  {submitError && <p className="text-sm text-rose-600">{submitError}</p>}
                </div>
              )}
            </div>
          )}
        </Card>
      </Reveal>
    </>
  );
}
