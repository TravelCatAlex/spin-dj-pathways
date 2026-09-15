'use client';

import { AnimatePresence, m } from 'motion/react';
import { rise, liftChip, spring } from '../../lib/motion';

import Icon from '../atoms/Icon';
import Button from '../atoms/Button';

/**
 * MOLECULE — OpportunityRow
 * Circular tinted icon + copy + action. `cta` picks the wording — some
 * opportunities invite interest, others just link through.
 * Stateless: the parent organism owns `interested`.
 *
 * Registering interest is the one genuinely stateful thing on the dashboard,
 * so it is the one thing that earns a real acknowledgement: the label swaps
 * out for a tick that strokes itself on, and the icon disc answers in the
 * row's accent. The button's fill already eased through the Button atom's own
 * transition — what was missing was any sense that the tap registered.
 *
 * `mode="wait"` on the swap matters: the two labels are different widths, so
 * cross-fading them would jostle the button mid-press.
 */
export default function OpportunityRow({
  title,
  when,
  icon,
  accent,
  cta = "I'm Interested",
  interested = false,
  onToggle,
}) {
  const isInterestCta = cta === "I'm Interested";
  const showTick = isInterestCta && interested;

  // The disc acknowledges alongside the button, so the whole row responds
  // rather than just the control that was pressed.
  const disc = {
    rest: { scale: 1, backgroundColor: `${accent}47` },
    marked: {
      scale: [1, 1.18, 1],
      backgroundColor: `${accent}66`,
      transition: { duration: 0.45, ease: 'easeOut' },
    },
  };

  return (
    <m.div
      className="flex items-center justify-between gap-3 rounded-md border border-line border-l-4 bg-surface px-[15px] py-[13px] max-[760px]:flex-col max-[760px]:items-stretch"
      style={{ borderLeftColor: accent }}
      variants={rise}
      {...liftChip}
    >
      <div className="flex min-w-0 items-center gap-[11px]">
        <m.span
          className="grid h-[34px] w-[34px] shrink-0 place-items-center rounded-full text-[14px]"
          style={{ color: accent }}
          variants={disc}
          animate={showTick ? 'marked' : 'rest'}
          initial={false}
        >
          <Icon name={icon} size={16} />
        </m.span>
        <div>
          <p className="m-0 mb-0.5 text-[13px] font-bold">{title}</p>
          <p className="m-0 text-[11px] text-muted">{when}</p>
        </div>
      </div>

      <Button
        size="sm"
        variant="outline"
        className="whitespace-nowrap max-[760px]:w-full"
        aria-pressed={isInterestCta ? interested : undefined}
        onClick={onToggle}
        // The outline variant fills with purple-50 whatever the row's colour
        // is, so a green or amber row wore a purple button. Tinting the fill
        // from the accent keeps each row a single colour end to end.
        style={
          showTick
            ? { background: accent, color: '#fff', borderColor: accent }
            : {
                background: `${accent}14`,
                color: accent,
                borderColor: `${accent}59`,
              }
        }
      >
        {isInterestCta ? (
          <AnimatePresence mode="wait" initial={false}>
            {showTick ? (
              <m.span
                key="yes"
                className="inline-flex items-center gap-1.5"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0, transition: spring }}
                exit={{ opacity: 0, y: -5, transition: { duration: 0.12 } }}
              >
                <svg
                  width="13"
                  height="13"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                  focusable="false"
                >
                  <m.path
                    d="M20 6 9 17l-5-5"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 0.3, ease: 'easeOut', delay: 0.06 }}
                  />
                </svg>
                Interested
              </m.span>
            ) : (
              <m.span
                key="no"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0, transition: spring }}
                exit={{ opacity: 0, y: -5, transition: { duration: 0.12 } }}
              >
                {cta}
              </m.span>
            )}
          </AnimatePresence>
        ) : (
          cta
        )}
      </Button>
    </m.div>
  );
}
