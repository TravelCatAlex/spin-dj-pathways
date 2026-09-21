'use client';

import Stagger from './Stagger';
import Reveal from '../atoms/Reveal';

/**
 * MOLECULE — StubView
 * A heading and a dashed panel, for a route whose screen is not built yet.
 *
 * One component rather than the same nine lines in three pages: these were a
 * STUBS lookup table inside StudentDashboardPage, and splitting the tabs into
 * routes would otherwise have copied the markup once per file — where they
 * drift, and a "coming soon" panel that renders differently on two tabs looks
 * like one of them is broken.
 */
export default function StubView({ tab, title, message }) {
  return (
    <Stagger trigger={tab}>
      <Reveal as="h1" className="m-0 mb-5 text-left text-[24px] font-extrabold text-ink">
        {title}
      </Reveal>
      <Reveal className="rounded-lg border border-dashed border-line bg-surface px-6 py-14 text-center text-muted">
        {message}
      </Reveal>
    </Stagger>
  );
}
