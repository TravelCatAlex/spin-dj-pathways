'use client';

/**
 * MOLECULE — PathwayBannerArt
 * Decorative waveform + mic illustration for the pathway hero card.
 */
const BARS = [14, 26, 38, 22, 46, 30, 18, 40, 24, 34, 16, 28];

export default function PathwayBannerArt() {
  return (
    <svg
      className="pathway-card__art"
      viewBox="0 0 320 148"
      preserveAspectRatio="xMaxYMin meet"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient id="spin-wave" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#ff8a3d" stopOpacity="0.2" />
          <stop offset="55%" stopColor="#ff5fa2" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#ffb347" stopOpacity="0.95" />
        </linearGradient>
      </defs>

      {BARS.map((h, i) => (
        <rect
          key={i}
          x={16 + i * 16}
          y={74 - h / 2}
          width="5"
          height={h}
          rx="2.5"
          fill="url(#spin-wave)"
        />
      ))}

      <g transform="translate(232 26)">
        <rect x="18" y="0" width="22" height="46" rx="11" fill="#ffd9a0" />
        <rect x="23" y="6" width="12" height="7" rx="3.5" fill="#c2410c" opacity="0.5" />
        <rect x="23" y="17" width="12" height="7" rx="3.5" fill="#c2410c" opacity="0.5" />
        <rect x="23" y="28" width="12" height="7" rx="3.5" fill="#c2410c" opacity="0.5" />
        <path
          d="M10 38a19 19 0 0 0 38 0"
          fill="none"
          stroke="#ffd9a0"
          strokeWidth="4"
          strokeLinecap="round"
        />
        <rect x="27" y="57" width="4" height="16" rx="2" fill="#ffd9a0" />
        <rect x="16" y="73" width="26" height="5" rx="2.5" fill="#ffd9a0" />
      </g>
    </svg>
  );
}
