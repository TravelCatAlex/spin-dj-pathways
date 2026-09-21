# Component structure — Atomic Design

```
app/
├─ layout.tsx               ← html/body, fonts, <Providers>
├─ providers.jsx            ← LazyMotion(domMax) for the whole app
├─ page.tsx                 ← redirect → /login
├─ login/                   ← the role gate (a picker, NOT authentication)
├─ student/                 ← layout.jsx = sidebar + one dashboard fetch
│  └─ page + projects|creations|pathway|events|profile
├─ teacher/, organization/  ← coming soon
├─ lib/fixtures.js          ← the ONLY fixture source (see REQUIRED_APIS.md)
├─ lib/live-context.jsx     ← one useLiveDashboard() for the student section
├─ globals.css              ← design tokens + all component classes
└─ components/
   ├─ atoms/                ← indivisible UI primitives, no business meaning
   ├─ molecules/            ← small groups of atoms that form one unit
   ├─ organisms/            ← full dashboard sections
   ├─ templates/            ← page skeletons, no data
   └─ pages/                ← screens shared by more than one route
```

## Routing

Every screen has an address. Tabs were `useState` in one page until then, so a
refresh threw you back to the role gate, nothing could be linked to and the
back button did nothing.

`Sidebar` still speaks in the tab ids from `NAV_ITEMS` — `app/student/layout.jsx`
owns the tab→path table and derives the active tab from `usePathname()`. That
is what kept Sidebar, NavItem and the mobile drawer untouched by the move.

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
| `StageCallout` | stage + next action + go button (white panel) |
| `MediaCard` | thumbnail + scrim + `StatusBadge` + title + meta |
| `ProgressItem` | `Icon` + title + description |
| `SessionDetail` | `Icon` + label-over-value |
| `OpportunityRow` | `Icon` + copy + `Button` toggle (stateless) |
| `JourneyStep` | `Icon` circle + title + description + arrow |
| `PathwayBanner` | hero artwork layer + legibility scrim |

## Organisms — the 12 sections

`Sidebar` (2) · `TopBar` (1) · `ContextRow` (3) · `PathwayCard` (4 + 5) ·
`NextSessionCard` (6) · `InterestsCard` (7) · `ProgressCard` (8) ·
`FeedbackCard` (9) · `CreationsSection` (10) · `OpportunitiesSection` (11) ·
`JourneySection` (12)

## Templates & Pages

- `templates/DashboardLayout` — sidebar + main column, data-free.
- `pages/RoleComingSoonPage` — the teacher and organization placeholder, one
  component for both so the two cannot drift.
- Route files under `app/student/` are the pages: they read fixtures and
  `useLive()`, and pass props to organisms. Together with `Sidebar` (nav
  config) they are the only files that touch `lib/fixtures.js`.

## Rules

1. Atoms never import molecules or organisms; molecules never import organisms.
2. Only **pages** read from `lib/fixtures.js` — organisms receive data as props,
   so replacing fixtures with API calls is a one-file change per section.
3. All styling lives in `globals.css` under BEM-ish class names; inline `style`
   is used only for genuinely dynamic values (accent colors, avatar size).
