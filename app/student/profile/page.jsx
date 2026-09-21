'use client';

import Stagger from '../../components/molecules/Stagger';
import Reveal from '../../components/atoms/Reveal';
import ProfileCard from '../../components/organisms/ProfileCard';
import { useLive } from '../../lib/live-context';

/**
 * PAGE — /student/profile
 *
 * Off the stub list entirely rather than kept with a flag: `student` has
 * carried the name, email and phone since the identity hub landed, and
 * attendance_record has carried the counts. A "coming soon" panel over data
 * that is already there is the one kind of placeholder that actively misleads.
 */
export default function StudentProfilePage() {
  const live = useLive();

  return (
    <Stagger trigger="profile">
      <Reveal as="h1" className="m-0 mb-5 text-left text-[24px] font-extrabold text-ink">
        My Profile
      </Reveal>
      <Reveal inView>
        <ProfileCard
          user={live.user}
          totals={live.sessions?.totals ?? null}
          loading={live.loading}
        />
      </Reveal>
    </Stagger>
  );
}
