'use client';

import { useState } from 'react';

import DashboardLayout from '../templates/DashboardLayout';
import Stagger from '../molecules/Stagger';
import Reveal from '../atoms/Reveal';
import TopBar from '../organisms/TopBar';
import ContextRow from '../organisms/ContextRow';
import CurrentProjectCard from '../organisms/CurrentProjectCard';
import NextSessionCard from '../organisms/NextSessionCard';
import InterestsCard from '../organisms/InterestsCard';
import ProgressCard from '../organisms/ProgressCard';
import FeedbackCard from '../organisms/FeedbackCard';
import NextProjectsCard from '../organisms/NextProjectsCard';
import OpportunitiesSection from '../organisms/OpportunitiesSection';
import JourneySection from '../organisms/JourneySection';
import CreationsSection from '../organisms/CreationsSection';
import ProjectUploads from '../organisms/ProjectUploads';

import { useLiveDashboard } from '../../lib/live-data';
import {
  CURRENT_PROJECT,
  INTERESTS,
  PROGRESS_ITEMS,
  LATEST_FEEDBACK,
  NEXT_PROJECTS,
  OPPORTUNITIES,
  PATHWAY_JOURNEY,
  JOURNEY_NOTE,
  CREATIONS,
} from '../../lib/fixtures';

/** Non-Home tabs are intentionally stubbed for this UI-only milestone. */
const STUBS = {
  projects: ['My Projects', 'Coming soon: full project management view'],
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

/* The two rows of three below the hero. Their third column lands under Next
   Session, which is why the hero splits 8/4 rather than anything else. */
const TRIPLET =
  `${ROW} [&>*]:col-span-4 ` +
  // Two columns from 980px down orphans the third card at half width;
  // span it across so Feedback and Journey fill the row instead.
  `max-[980px]:[&>*]:col-span-6 max-[980px]:[&>*:nth-child(3)]:col-span-12 ` +
  `max-[760px]:[&>*]:col-span-12`;

/**
 * PAGE — StudentDashboardPage
 * Wires fixture data into organisms. Swap the fixture imports for API
 * hooks (see REQUIRED_APIS.md) and nothing below has to change shape.
 *
 * Home is now the hero plus two rows of three: what you are making, then how
 * you are doing, then what you could do next. My Creations left this screen
 * for its own tab — a portfolio of finished work answers a different question
 * from "what happens next", and it was the one full-width section forcing
 * every row below it out of the page's three-column rhythm.
 */
export default function StudentDashboardPage({ onLogout }) {
  const [activeTab, setActiveTab] = useState('home');
  const stub = STUBS[activeTab];

  /* LIVE DATA FOR FOUR OF THE TWELVE SECTIONS.
   *
   * Identity, the context chips, the next session and the schedule come from
   * the database. The other eight have no table anywhere yet and keep their
   * fixtures - see app/lib/live-data.js.
   *
   * Fixtures also stand in while the request is in flight and if it fails, so
   * the dashboard never renders empty. `live.isLive` is what separates "this is
   * real" from "this is the mock" - without it a failed fetch would look
   * exactly like a working one, which is the confusion the whole exercise is
   * meant to end. */
  const live = useLiveDashboard();

  return (
    <DashboardLayout
      user={live.user}
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
              <TopBar user={live.user} dateLabel={live.dateLabel} />
            </Reveal>

            {/* Hidden entirely when there is nothing to put in it.
              *
              * All three chips can be empty at once, and for most students they
              * are: program and organization have no table yet, and the class
              * chip needs a class - measured 18 Sep 2026, 992 of 1,000 sessions
              * in this business are private appointments, which belong to no
              * class group at all. An empty bar reads as a component that
              * failed; no bar reads as a student with no class, which is true. */}
            {live.chips.length > 0 ? (
              <Reveal inView delay={step(1)}>
                <ContextRow
                  chips={live.chips}
                  onViewProfile={() => setActiveTab('profile')}
                />
              </Reveal>
            ) : null}

            {/* Current Project 8 | Next Session 4 — stacked below 1180px. */}
            <Reveal
              inView
              delay={step(2)}
              className={`${ROW} [&>*:nth-child(1)]:col-span-8 [&>*:nth-child(2)]:col-span-4 max-[1180px]:[&>*:nth-child(1)]:col-span-12 max-[1180px]:[&>*:nth-child(2)]:col-span-12`}
            >
              <CurrentProjectCard
                  project={CURRENT_PROJECT}
                  onViewAllUploads={() => setActiveTab('creations')}
                />
              <NextSessionCard session={live.nextSession} />
            </Reveal>

            {/* Interests | Progress | Feedback — where you are right now.
                Two per row below 980px, one below 760px.

                Each card arrives on its own rather than the row landing as a
                block, continuing the page sequence after the hero so the
                reading order holds: heading, context, hero, then these three
                left to right.
                The grid keeps items-stretch, so the wrappers still stretch
                and three cards of different lengths stay the same height. */}
            <div className={TRIPLET}>
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

            {/* Next Projects | Opportunities | Journey — what comes next.
                Possible Next Projects sits under Things I'm Into on purpose:
                the tags say what you like, this says what you could make out
                of that. */}
            <div className={TRIPLET}>
              <Reveal inView delay={CARD.first}>
                <NextProjectsCard projects={NEXT_PROJECTS} />
              </Reveal>
              <Reveal inView delay={CARD.second}>
                <OpportunitiesSection opportunities={OPPORTUNITIES} />
              </Reveal>
              <Reveal inView delay={CARD.third}>
                <JourneySection steps={PATHWAY_JOURNEY} note={JOURNEY_NOTE} />
              </Reveal>
            </div>
          </>
        ) : activeTab === 'creations' ? (
          <>
            <Reveal
              as="h1"
              className="m-0 mb-5 text-left text-[24px] font-extrabold text-ink"
            >
              My Creations
            </Reveal>
            {/* REAL FILES FIRST, FIXTURES BELOW, and labelled so nobody has to
                guess which is which. Everything in the upper panel was actually
                uploaded; the strip under it is still the mock that has always
                been here, because no `creation` table exists yet.

                50 rather than 5: this is the "see everything" view the hero's
                strip links to, and it is the reason that strip can stay short. */}
            <Reveal inView>
              <div className="mb-[18px] rounded-xl border border-black/[0.06] bg-white p-[22px] max-[760px]:p-4">
                <ProjectUploads
                  limit={50}
                  tone="light"
                  title="Uploaded files"
                  showRule={false}
                />
              </div>
            </Reveal>

            <Reveal inView>
              <CreationsSection creations={CREATIONS} />
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
