'use client';

import Icon from '../atoms/Icon';

/**
 * MOLECULE — JourneyStep
 * One coloured circle + title + description in the Pathway Journey stepper.
 * `hideArrowAtMedium` blanks the arrow on the last column of the 4-up layout.
 */
export default function JourneyStep({
  icon,
  title,
  description,
  accent,
  showArrow,
  hideArrowAtMedium,
}) {
  return (
    <li className="relative px-1 text-center">
      <div
        className="mx-auto mb-[9px] grid h-[46px] w-[46px] place-items-center rounded-full text-white"
        style={{
          background: accent,
          boxShadow: `0 6px 14px ${accent}47`,
        }}
      >
        <Icon name={icon} size={20} />
      </div>
      <p className="m-0 mb-[3px] text-[11.5px] font-bold">{title}</p>
      <p className="m-0 text-[10px] leading-[1.35] text-muted">{description}</p>
      {showArrow && (
        <div
          className={`absolute top-[23px] right-[-5px] grid translate-x-1/2 -translate-y-1/2 place-items-center leading-none text-purple max-[760px]:hidden ${
            hideArrowAtMedium ? 'max-[1180px]:hidden' : ''
          }`}
        >
          <Icon name="arrowLong" size={22} strokeWidth={2} />
        </div>
      )}
    </li>
  );
}
