'use client';

import { useState } from 'react';

import DashboardLayout from '../templates/DashboardLayout';
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
};

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
    >
      {activeTab === 'home' ? (
        <>
          <TopBar user={CURRENT_USER} dateLabel={DASHBOARD_DATE} />

          <ContextRow chips={CONTEXT_CHIPS} />

          {/* Pathway 8 | Next Session 4 — stacked below 1180px. */}
          <div
            className={`${ROW} [&>*:nth-child(1)]:col-span-8 [&>*:nth-child(2)]:col-span-4 max-[1180px]:[&>*:nth-child(1)]:col-span-12 max-[1180px]:[&>*:nth-child(2)]:col-span-12`}
          >
            <PathwayCard pathway={CURRENT_PATHWAY} project={CURRENT_PROJECT} />
            <NextSessionCard session={NEXT_SESSION} />
          </div>

          {/* Interests 4 | Progress 4 | Feedback 4 — the last aligns with
              Next Session. Two per row below 980px, one below 760px. */}
          <div className={`${ROW} [&>*]:col-span-4 max-[980px]:[&>*]:col-span-6 max-[760px]:[&>*]:col-span-12`}>
            <InterestsCard interests={INTERESTS} />
            <ProgressCard items={PROGRESS_ITEMS} />
            <FeedbackCard feedback={LATEST_FEEDBACK} />
          </div>

          {/* Creations 6 | Opportunities 6 — even halves, equal height. */}
          <div
            className={`${ROW} [&>*:nth-child(1)]:col-span-7 [&>*:nth-child(2)]:col-span-5 max-[1180px]:[&>*:nth-child(1)]:col-span-12 max-[1180px]:[&>*:nth-child(2)]:col-span-12`}
          >
            <CreationsSection creations={CREATIONS} />
            <OpportunitiesSection opportunities={OPPORTUNITIES} />
          </div>

          <JourneySection steps={PATHWAY_JOURNEY} />
        </>
      ) : (
        <>
          <h1 className="m-0 mb-5 text-left text-[24px] font-extrabold text-ink">
            {stub[0]}
          </h1>
          <div className="rounded-lg border border-dashed border-line bg-surface px-6 py-14 text-center text-muted">
            {stub[1]}
          </div>
        </>
      )}
    </DashboardLayout>
  );
}
