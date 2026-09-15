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

          <div className="grid-hero">
            <PathwayCard pathway={CURRENT_PATHWAY} project={CURRENT_PROJECT} />
            <NextSessionCard session={NEXT_SESSION} />
          </div>

          <div className="grid-three">
            <InterestsCard interests={INTERESTS} />
            <ProgressCard items={PROGRESS_ITEMS} />
            <FeedbackCard feedback={LATEST_FEEDBACK} />
          </div>

          <div className="grid-split">
            <CreationsSection creations={CREATIONS} />
            <OpportunitiesSection opportunities={OPPORTUNITIES} />
          </div>
          <JourneySection steps={PATHWAY_JOURNEY} />
        </>
      ) : (
        <>
          <h1 className="stub__title">{stub[0]}</h1>
          <div className="stub">{stub[1]}</div>
        </>
      )}
    </DashboardLayout>
  );
}
