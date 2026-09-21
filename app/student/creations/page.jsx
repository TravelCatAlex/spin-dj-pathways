'use client';

import { useState } from 'react';

import Stagger from '../../components/molecules/Stagger';
import Reveal from '../../components/atoms/Reveal';
import ProjectUploads from '../../components/organisms/ProjectUploads';
import CreationsSection from '../../components/organisms/CreationsSection';
import { useLive } from '../../lib/live-context';
import { CREATIONS } from '../../lib/fixtures';

/**
 * PAGE — /student/creations
 *
 * REAL FILES FIRST, FIXTURES BELOW, and labelled so nobody has to guess which
 * is which. Everything in the upper panel was actually uploaded; the strip at
 * the bottom is still the mock that has always been here, because no
 * `creation` table exists for titles and statuses yet.
 *
 * 50 rather than 5: this is the "see everything" view the home hero's strip
 * links to, and it is the reason that strip can stay short.
 *
 * RECENTLY DELETED IS ONLY ON THIS PAGE. The bin belongs where the files are,
 * not under the hero — the strip on Home answers "what am I working on", and
 * a row of things you threw away is the wrong answer to that question.
 *
 * The two lists cannot see each other, so the page holds a counter between
 * them: deleting in the upper list bumps it, which makes the bin re-read, and
 * restoring does the same in reverse. Without it a deleted file vanished from
 * one panel and did not appear in the other until a reload, which reads as the
 * delete having lost the file.
 */
/* The panel both lists sit in. Passed to the component rather than wrapped
   around it, so the bin's card disappears with the bin. */
const CARD =
  'mb-[18px] rounded-lg border border-line bg-surface p-4 shadow-sm max-[560px]:p-3.5';

export default function StudentCreationsPage() {
  const live = useLive();
  const [version, setVersion] = useState(0);
  const bump = () => setVersion((v) => v + 1);

  const studentId = live.isLive ? live.user.id : null;

  return (
    <Stagger trigger="creations">
      <Reveal as="h1" className="m-0 mb-5 text-left text-[24px] font-extrabold text-ink">
        My Creations
      </Reveal>

      <Reveal inView>
        <ProjectUploads
          studentId={studentId}
          limit={50}
          tone="light"
          title="Uploaded files"
          showRule={false}
          className={CARD}
          reloadKey={version}
          onChanged={bump}
        />
      </Reveal>

      {/* Hidden entirely when the bin is empty, which for most students is
          always. An empty "Recently deleted" panel is a permanent reminder of
          a feature rather than a place to go when something went wrong. */}
      <Reveal inView>
        <ProjectUploads
          studentId={studentId}
          limit={50}
          tone="light"
          title="Recently deleted"
          showRule={false}
          className={CARD}
          deleted
          hideWhenEmpty
          reloadKey={version}
          onChanged={bump}
        />
      </Reveal>

      {/* STILL FIXTURES, AND STILL THE RIGHT CALL.
          These three are the mock portfolio — titles, statuses, artwork — and
          no `creation` row carries a title or a status, because a file is not
          "In Progress". Feeding the real uploads in here once made every card
          a filename with no badge, which is a worse answer than an honest mock
          sitting under the real one. It goes live when there is something to
          say beyond the file's own name. */}
      <Reveal inView>
        <CreationsSection creations={CREATIONS} />
      </Reveal>
    </Stagger>
  );
}
