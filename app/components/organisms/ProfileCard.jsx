'use client';

import { m } from 'motion/react';

import Avatar from '../atoms/Avatar';
import Icon from '../atoms/Icon';
import Card from '../molecules/Card';
import Skeleton from '../atoms/Skeleton';
import { group, rise } from '../../lib/motion';

/**
 * ORGANISM — ProfileCard
 *
 * The My Profile tab. Who the student is, and what the database can actually
 * say about them.
 *
 * EVERY FIELD HERE IS REAL. The tab used to be a "Coming soon" stub, which was
 * honest while nothing was wired up - but `student` has carried the name, email
 * and phone since the identity hub landed, and `attendance_record` has carried
 * the counts. The stub outlived its own truth.
 *
 * A MISSING FIELD IS OMITTED, NOT DASHED. "Phone: —" invites somebody to go and
 * add a phone number that WellnessLiving never had; an absent row says the same
 * thing without the errand. The one exception is the stat strip, where a zero
 * IS the answer - a student who has attended nothing has attended nothing.
 *
 * ACCOUNT SETTINGS ARE STILL ABSENT, and deliberately. Changing a name or an
 * email is a WRITE, and nothing in this portal writes yet: there is no sign-in,
 * so the API cannot tell who is asking, and an edit form that posts as "whoever
 * called" is worse than no edit form.
 */

const LABEL = 'text-[10px] font-semibold uppercase tracking-[1.1px] text-ink/50';

/** ISO date -> a date a person reads. Null stays null. */
function readableDate(iso) {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' });
}

function Field({ icon, label, value }) {
  if (!value) return null;
  return (
    <m.div variants={rise} className="min-w-0">
      <p className={`m-0 mb-1 ${LABEL}`}>{label}</p>
      <p className="m-0 flex items-center gap-2 text-[13.5px] font-medium text-ink">
        <Icon name={icon} size={14} aria-hidden="true" />
        <span className="truncate" title={value}>
          {value}
        </span>
      </p>
    </m.div>
  );
}

function Stat({ label, value }) {
  return (
    <m.div
      variants={rise}
      className="min-w-0 rounded-[10px] border border-black/[0.06] bg-black/[0.02] px-3.5 py-3"
    >
      <p className="m-0 text-[20px] font-extrabold leading-none text-ink">{value}</p>
      <p className={`m-0 mt-1.5 ${LABEL}`}>{label}</p>
    </m.div>
  );
}

/**
 * A block the size of the text it stands in for, shimmering, until the value
 * arrives.
 *
 * SIZED IN THE SAME UNITS AS THAT TEXT, so nothing moves when the two swap. A
 * spinner would have been less work and would tell the reader only that
 * something is happening; a skeleton tells them WHAT is coming and where it will
 * be.
 */
function Bar({ w = 'w-40', h = 'h-[15px]', className = '' }) {
  return (
    <span className={`relative inline-block overflow-hidden rounded ${w} ${h} ${className}`}>
      <Skeleton tone="light" rounded="rounded" />
    </span>
  );
}

export default function ProfileCard({ user, totals = null, loading = false }) {
  const name = [user.firstName, user.lastName].filter(Boolean).join(' ').trim();
  const dob = readableDate(user.dateOfBirth);

  return (
    <Card title="My Profile" icon="user">
      <m.div variants={group(0.06)} initial="hidden" animate="show">
        <m.div variants={rise} className="mb-6 flex items-center gap-4">
          <Avatar name={name || 'Student'} src={user.avatarUrl} size={56} />
          <div className="min-w-0">
            {loading ? (
              <>
                <Bar w="w-44" h="h-[20px]" />
                <Bar w="w-20" h="h-[12px]" className="mt-2" />
              </>
            ) : (
              <>
                <p className="m-0 truncate text-[19px] font-extrabold text-ink">
                  {name || 'Student'}
                </p>
                <p className="m-0 mt-0.5 text-[12.5px] text-ink/60">{user.role}</p>
              </>
            )}
          </div>
        </m.div>

        <div className="grid grid-cols-2 gap-x-6 gap-y-5 max-[560px]:grid-cols-1">
          {loading ? (
            /* The LABELS are known before the fetch — only the values are not —
               so they stay put and only the value shimmers. Blanking a label you
               already have is a skeleton pretending to know less than it does,
               and it makes the card jump twice instead of once. */
            ['Email', 'Phone', 'Date of birth'].map((label) => (
              <div key={label}>
                <p className={`m-0 mb-1 ${LABEL}`}>{label}</p>
                <Bar w="w-48" />
              </div>
            ))
          ) : (
            <>
              <Field icon="message" label="Email" value={user.email} />
              <Field icon="user" label="Phone" value={user.phone} />
              <Field icon="calendar" label="Date of birth" value={dob} />
            </>
          )}
        </div>

        {/* The counts come from attendance_record, so they are this student's
            own history rather than a studio-wide figure. `upcoming` is the only
            one that can move without them doing anything, which is why it reads
            last. */}
        {loading && (
          <>
            <div className="mb-5 mt-7 border-t border-t-black/[0.07]" />
            <p className={`m-0 mb-3 ${LABEL}`}>Sessions</p>
            <div className="grid grid-cols-3 gap-3 max-[560px]:grid-cols-1">
              {['Booked', 'Attended', 'Upcoming'].map((label) => (
                <div
                  key={label}
                  className="min-w-0 rounded-[10px] border border-black/[0.06] bg-black/[0.02] px-3.5 py-3"
                >
                  <Bar w="w-12" h="h-[20px]" />
                  <p className={`m-0 mt-1.5 ${LABEL}`}>{label}</p>
                </div>
              ))}
            </div>
          </>
        )}

        {!loading && totals !== null && (
          <>
            <div className="mb-5 mt-7 border-t border-t-black/[0.07]" />
            <p className={`m-0 mb-3 ${LABEL}`}>Sessions</p>
            <div className="grid grid-cols-3 gap-3 max-[560px]:grid-cols-1">
              <Stat label="Booked" value={totals.booked ?? 0} />
              <Stat label="Attended" value={totals.attended ?? 0} />
              <Stat label="Upcoming" value={totals.upcoming ?? 0} />
            </div>
          </>
        )}

        <p className="m-0 mt-7 text-[12px] leading-relaxed text-ink/50">
          Account settings arrive with sign-in. Until the portal knows who is
          asking, nothing here can be edited safely.
        </p>
      </m.div>
    </Card>
  );
}
