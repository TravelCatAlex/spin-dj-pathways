# Component structure — Atomic Design

```
app/
├─ lib/fixtures.js          ← the ONLY data source (swap for APIs; see REQUIRED_APIS.md)
├─ globals.css              ← design tokens + all component classes
└─ components/
   ├─ atoms/                ← indivisible UI primitives, no business meaning
   ├─ molecules/            ← small groups of atoms that form one unit
   ├─ organisms/            ← full dashboard sections
   ├─ templates/            ← page skeletons, no data
   └─ pages/                ← templates + real (currently fixture) data
```

## Atoms

| Component | Purpose |
| --- | --- |
| `Button` | primary / outline / ghost, block and sm modifiers |
| `Icon` | decorative glyph wrapper, `aria-hidden`; one place to swap emoji for SVG |
| `Avatar` | image or initial fallback |
| `StatusBadge` | Completed (green) / in-progress (amber) pill |
| `SectionTitle` | small uppercase card heading |
| `StepDot` | one stepper node — done / current / todo |
| `StepConnector` | line between two StepDots |
| `Tag` | interest tile (icon + label) |

## Molecules

| Component | Composed of |
| --- | --- |
| `Card` | `SectionTitle` + surface + header action slot |
| `NavItem` | `Icon` + label, active state |
| `ContextChip` | `Icon` + label-over-value |
| `Stepper` | `StepDot` × n + `StepConnector` |
| `StageCallout` | `Icon` + stage + next action |
| `MediaCard` | `Icon`/thumbnail + `StatusBadge` + title + meta |
| `ProgressItem` | `Icon` + title + description |
| `SessionDetail` | `Icon` + label-over-value |
| `OpportunityRow` | `Icon` + copy + `Button` toggle (stateless) |
| `JourneyStep` | `Icon` circle + title + description + arrow |
| `PathwayBannerArt` | decorative waveform/mic SVG |

## Organisms — the 12 sections

`Sidebar` (2) · `TopBar` (1) · `ContextRow` (3) · `PathwayCard` (4 + 5) ·
`NextSessionCard` (6) · `InterestsCard` (7) · `ProgressCard` (8) ·
`FeedbackCard` (9) · `CreationsSection` (10) · `OpportunitiesSection` (11) ·
`JourneySection` (12)

## Templates & Pages

- `templates/DashboardLayout` — sidebar + main column, data-free.
- `pages/StudentDashboardPage` — imports fixtures, passes props to organisms,
  owns the active-tab state. This is the only file that touches `lib/fixtures.js`
  apart from `Sidebar` (nav config).

## Rules

1. Atoms never import molecules or organisms; molecules never import organisms.
2. Only **pages** read from `lib/fixtures.js` — organisms receive data as props,
   so replacing fixtures with API calls is a one-file change per section.
3. All styling lives in `globals.css` under BEM-ish class names; inline `style`
   is used only for genuinely dynamic values (accent colors, avatar size).
