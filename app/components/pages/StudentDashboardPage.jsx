'use client';

import { useState } from 'react';

import DashboardLayout from '../templates/DashboardLayout';
import Stagger from '../molecules/Stagger';
import Reveal from '../atoms/Reveal';
import TopBar from '../organisms/TopBar';
import ContextRow from '../organisms/ContextRow';
import PathwayCard from '../organisms/PathwayCard';
import NextSessionCard from '../organisms/NextSessionCard';
import InterestsCard from '../organisms/InterestsCard';
import ProgressCard from '../organisms/ProgressCard';
import FeedbackCard from '../organisms/FeedbackCard';
import CreationsSection from '../organisms/CreationsSection';
import OpportunitiesSection from '../organisms/OpportunitiesSection';
import JourneySection from '../organisms/JourneySection';

import {
  CURRENT_USER,
  DASHBOARD_DATE,
  CONTEXT_CHIPS,
  CURRENT_PATHWAY,
  CURRENT_PROJECT,
  NEXT_SESSION,
  INTERESTS,
  PROGRESS_ITEMS,
  LATEST_FEEDBACK,
  CREATIONS,
  OPPORTUNITIES,
  PATHWAY_JOURNEY,
} from '../../lib/fixtures';

/** Non-Home tabs are intentionally stubbed for this UI-only milestone. */
const STUBS = {
  projects: ['My Projects', 'Coming soon: full project management view'],
  creations: ['My Creations', 'Coming soon: portfolio and creation showcase'],
  pathway: ['My Pathway', 'Coming soon: learning progress and pathway quiz'],
  events: ['Events', 'Coming soon: event calendar and opportunities'],
  profile: ['My Profile', 'Coming soon: your profile, avatar and account settings'],
};

/* Every section reveals when it is scrolled to, at every breakpoint.
 *
 * A load sequence only works if the whole sequence is on screen. It is not:
 * a phone fits about one section, a tablet two, so sections further down
 * finished animating while they were still below the fold and were simply
 * there, fully formed, by the time you reached them.
 *
 * So scroll drives everything and these delays only order sections that
 * arrive together — the three or four visible on a desktop at load, and the
 * cards within a row. They stay short and capped because a delay is paid on
 * every reveal, including when a section is scrolled to alone: what reads as
 * a graceful cascade on a wide screen reads as lag on a narrow one.
 */
const BEAT = 0.07;
const step = (i) => Math.min(i * BEAT, 0.14);

/* Cards inside one row always enter together, so they can afford a slightly
   wider gap between them than the rows get. */
const CARD = { first: 0, second: 0.1, third: 0.2 };

/* Every section row shares one 12-column rhythm, so the columns line up
   vertically down the page. Without this each row invented its own split
   and the right-hand cards sat ~16px out of true with each other. */
const ROW = 'mb-[18px] grid grid-cols-12 items-stretch gap-[18px]';

/**
 * PAGE — StudentDashboardPage
 * Wires fixture data into organisms. Swap the fixture imports for API
 * hooks (see REQUIRED_APIS.md) and nothing below has to change shape.
 */
export default function StudentDashboardPage({ onLogout }) {
  const [activeTab, setActiveTab] = useState('home');
  const stub = STUBS[activeTab];

  return (
    <DashboardLayout
      user={CURRENT_USER}
      activeTab={activeTab}
      onTabChange={setActiveTab}
      onLogout={onLogout}
      onProfileClick={() => setActiveTab('profile')}
    >
      {/* Keyed on the tab, so each view staggers in as you switch.
          The first screen — heading, context bar, hero — arrives in reading
          order off this stagger. Everything below the fold opts out with
          `inView` and waits to be scrolled to instead. */}
      <Stagger trigger={activeTab}>
        {activeTab === 'home' ? (
          <>
            <Reveal inView delay={step(0)}>
              <TopBar user={CURRENT_USER} dateLabel={DASHBOARD_DATE} />
            </Reveal>

            <Reveal inView delay={step(1)}>
              <ContextRow
                chips={CONTEXT_CHIPS}
                onViewProfile={() => setActiveTab('profile')}
              />
            </Reveal>

            {/* Pathway 8 | Next Session 4 — stacked below 1180px. */}
            <Reveal
              inView
              delay={step(2)}
              className={`${ROW} [&>*:nth-child(1)]:col-span-8 [&>*:nth-child(2)]:col-span-4 max-[1180px]:[&>*:nth-child(1)]:col-span-12 max-[1180px]:[&>*:nth-child(2)]:col-span-12`}
            >
              <PathwayCard pathway={CURRENT_PATHWAY} project={CURRENT_PROJECT} />
              <NextSessionCard session={NEXT_SESSION} />
            </Reveal>

            {/* Interests 4 | Progress 4 | Feedback 4 — the last aligns with
                Next Session. Two per row below 980px, one below 760px.

                Each card arrives on its own rather than the row landing as a
                block, continuing the page sequence after the hero so the
                reading order holds: heading, context, hero, then these three
                left to right.
                The grid keeps items-stretch, so the wrappers still stretch and
                the cards' footer buttons stay on one line. */}
            <div
              className={`${ROW} [&>*]:col-span-4 max-[980px]:[&>*]:col-span-6 max-[760px]:[&>*]:col-span-12`}
            >
              <Reveal inView delay={CARD.first}>
                <InterestsCard interests={INTERESTS} />
              </Reveal>
              <Reveal inView delay={CARD.second}>
                <ProgressCard items={PROGRESS_ITEMS} />
              </Reveal>
              <Reveal inView delay={CARD.third}>
                <FeedbackCard feedback={LATEST_FEEDBACK} />
              </Reveal>
            </div>

            {/* Creations 6 | Opportunities 6 — even halves, equal height. */}
            <Reveal
              inView
              className={`${ROW} [&>*:nth-child(1)]:col-span-7 [&>*:nth-child(2)]:col-span-5 max-[1180px]:[&>*:nth-child(1)]:col-span-12 max-[1180px]:[&>*:nth-child(2)]:col-span-12`}
            >
              <CreationsSection creations={CREATIONS} />
              <OpportunitiesSection opportunities={OPPORTUNITIES} />
            </Reveal>

            <Reveal inView>
              <JourneySection steps={PATHWAY_JOURNEY} />
            </Reveal>
          </>
        ) : (
          <>
            <Reveal as="h1" className="m-0 mb-5 text-left text-[24px] font-extrabold text-ink">
              {stub[0]}
            </Reveal>
            <Reveal className="rounded-lg border border-dashed border-line bg-surface px-6 py-14 text-center text-muted">
              {stub[1]}
            </Reveal>
          </>
        )}
      </Stagger>
    </DashboardLayout>
  );
}
