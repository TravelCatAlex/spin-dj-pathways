/**
 * Single source of mock/static data for the student dashboard.
 *
 * Every export here maps 1:1 to a future API response documented in
 * REQUIRED_APIS.md. Swap each export for a fetch/hook when the backend lands —
 * no component should need to change shape.
 */

export const CURRENT_USER = {
  id: '52557498',
  firstName: 'Avery',
  lastName: 'Stuart',
  email: 'brookestuart@gmail.com',
  role: 'Student',
  avatarUrl: '/images/avatar-avery.webp',
};

export const DASHBOARD_DATE = 'Sunday, May 25, 2026';

export const NAV_ITEMS = [
  { id: 'home', label: 'Home', icon: 'home' },
  { id: 'projects', label: 'My Projects', icon: 'projects' },
  { id: 'creations', label: 'My Creations', icon: 'creations' },
  { id: 'pathway', label: 'My Pathway', icon: 'pathway' },
  { id: 'events', label: 'Events', icon: 'calendar' },
];

export const CONTEXT_CHIPS = [
  {
    id: 'program',
    label: 'Program',
    value: 'Podcasting',
    icon: 'mic',
    // Not the brand purple: #7c3aed is the sidebar pill and every primary
    // button, so an accent wearing it reads as chrome rather than as this
    // chip's own colour. Orange also separates it from the blue and teal
    // beside it.
    accent: '#f97316',
  },
  {
    id: 'org',
    label: 'Organization',
    value: 'Sid Jacobson JCC',
    icon: 'organization',
    accent: '#3b82f6',
  },
  {
    id: 'class',
    label: 'Class',
    value: 'Podcasting Group 1',
    icon: 'users',
    accent: '#14b8a6',
  },
];

/** Brand wordmark. */
export const LOGO = {
  src: '/images/logo.webp',
  width: 1717,
  height: 782,
};

/**
 * The pathway the student is on.
 *
 * No longer rendered on Home — the hero there is the project, not the
 * pathway. Kept because it is still the My Pathway tab's subject and the
 * `GET /students/me/pathway` contract is unchanged.
 */
export const CURRENT_PATHWAY = {
  id: 'pw-creator',
  title: 'Creator Pathway',
  track: 'Podcasting Track',
  trackIcon: 'mic',
  description: "You're learning, creating and sharing your voice with the world.",
};

/**
 * The hero's subject: what the student is making right now.
 *
 * `currentFocus` and `latestUpdate` are separate facts and get separate
 * columns. Focus is forward-looking — what this stage is for — while the
 * update is the last thing that actually happened. The card used to collapse
 * both into one "next step" line, which lost the difference between a plan
 * and a record.
 */
export const CURRENT_PROJECT = {
  id: 'proj-1',
  title: 'My First Vlog',
  icon: 'film',
  description: 'A personal video where I introduce myself and share what I love.',
  /** Matches the label of the stage at `currentStageIndex`. */
  status: 'Recording',
  thumbnailUrl: '/images/creation-intro-video.webp',
  stages: [
    { id: 'idea', label: 'Idea', icon: 'idea' },
    { id: 'planning', label: 'Planning', icon: 'plan' },
    { id: 'recording', label: 'Recording', icon: 'mic' },
    { id: 'editing', label: 'Editing', icon: 'editing' },
    { id: 'review', label: 'Review', icon: 'review' },
    { id: 'finished', label: 'Finished', icon: 'finished' },
  ],
  currentStageIndex: 2,
  currentFocus: {
    title: 'Recording the intro segment',
    description:
      'Avery and Coach Jordan are working on recording the introduction.',
  },
  latestUpdate: {
    message: 'Practiced the introduction with Coach Jordan.',
    date: 'May 24, 2026',
  },
};

export const NEXT_SESSION = {
  id: 'sess-1',
  // Same SHAPE as the live payload, not just the same fields the card happened
  // to use. Without a title here the mock rendered no title line and the real
  // one did, so the card jumped the moment the fetch landed - the fixture has to
  // be the right shape or it teaches the layout the wrong one.
  title: 'Podcasting Group 1 | Recording Session | 60 Minutes',
  dateLabel: 'Tue, May 27, 2026',
  timeLabel: '4:30 PM',
  durationMinutes: 60,
  details: [
    {
      id: 'teacher',
      label: 'Teacher',
      icon: 'teacher',
      value: 'Coach Jordan',
      avatarUrl: '/images/avatar-avery.webp',
    },
    {
      id: 'program',
      label: 'Program',
      icon: 'mic',
      value: 'Podcasting',
      valueIcon: 'mic',
    },
    {
      id: 'location',
      label: 'Location',
      icon: 'location',
      value: 'In-Studio',
      valueIcon: 'location',
    },
    {
      id: 'project',
      label: 'Project',
      icon: 'film',
      value: 'My First Vlog',
      valueIcon: 'film',
    },
  ],
};

/**
 * Six interests, six hues spread evenly around the wheel — green, amber,
 * pink, blue, cyan, red. The previous set had Marvel (#e11d48), Music
 * (#ec4899) and YouTube (#ef4444) all in the red-pink family, so half the
 * card read as one colour repeated.
 *
 * YouTube keeps red because that is the thing's own colour; Marvel gives way
 * to green rather than have two reds sitting in the same grid.
 */
export const INTERESTS = [
  { id: 'marvel', name: 'Marvel', icon: 'superhero', accent: '#10b981' },
  { id: 'wwe', name: 'WWE', icon: 'trophy', accent: '#f59e0b' },
  { id: 'music', name: 'Music', icon: 'music', accent: '#ec4899' },
  { id: 'gaming', name: 'Gaming', icon: 'gaming', accent: '#3b82f6' },
  { id: 'podcasts', name: 'Podcasts', icon: 'mic', accent: '#06b6d4' },
  { id: 'youtube', name: 'YouTube', icon: 'youtube', accent: '#ef4444' },
];

export const PROGRESS_ITEMS = [
  {
    id: 'pr-1',
    icon: 'trending',
    // Blue. Teal sat right above pr-2's green and the two read as one colour
    // repeated. The disc background is derived from this value, so it follows
    // automatically.
    accent: '#3b82f6',
    title: 'Working more independently',
    description: "You're prompting less during recording.",
  },
  {
    id: 'pr-2',
    icon: 'check',
    accent: '#12b76a',
    title: 'Completed first intro recording',
    description: 'Great job recording your opening segment!',
  },
  {
    id: 'pr-3',
    icon: 'star',
    accent: '#ff9f1c',
    title: 'Planning ahead',
    description: "You're coming prepared with great ideas.",
  },
];

export const LATEST_FEEDBACK = {
  id: 'fb-1',
  coach: 'Coach Jordan',
  coachAvatarUrl: '/images/avatar-avery.webp',
  date: 'May 24, 2026',
  message:
    "Avery is doing an awesome job! You're getting more comfortable behind the mic and your ideas are getting stronger every week.",
};

/**
 * Finished and in-flight work. Lives on the My Creations tab rather than
 * Home: the dashboard answers "what happens next", and a portfolio is a
 * different question from "what am I making right now".
 */
export const CREATIONS = [
  {
    id: 'cr-1',
    title: 'My Introduction Video',
    icon: 'film',
    status: 'Completed',
    kind: 'Video',
    thumbnailUrl: '/images/creation-intro-video.webp',
    meta: 'May 10, 2026',
    metaIcon: 'calendar',
  },
  {
    id: 'cr-2',
    title: 'Podcast Intro',
    icon: 'mic',
    status: 'Completed',
    kind: 'Audio',
    thumbnailUrl: '/images/creation-podcast-intro.webp',
    meta: 'May 3, 2026',
    metaIcon: 'calendar',
  },
  {
    id: 'cr-3',
    title: 'Episode 1: Superheroes',
    icon: 'note',
    status: 'In Progress',
    kind: 'Podcast',
    thumbnailUrl: '/images/creation-superheroes.webp',
    meta: 'Recording',
    metaIcon: 'mixer',
  },
];

/**
 * What the student could make next, drawn from their interests — the WWE and
 * superhero suggestions are the WWE and Marvel tags in "Things I'm Into"
 * turned into something to do.
 *
 * Same row shape as OPPORTUNITIES on purpose: both cards offer a thing to say
 * yes to, so both render through `LinkRow` and read as one idea in two
 * columns rather than two unrelated lists.
 */
export const NEXT_PROJECTS = [
  {
    id: 'np-1',
    title: 'WWE Commentary Podcast',
    description: 'Talk about your favorite matches',
    icon: 'trophy',
    accent: '#10b981',
  },
  {
    id: 'np-2',
    title: 'Superhero Movie Review',
    description: 'Pick a movie and share what you think',
    icon: 'superhero',
    accent: '#ef4444',
  },
  {
    id: 'np-3',
    title: 'Interview a Friend',
    description: 'Ask someone about their favorite music, movie or sport',
    icon: 'users',
    accent: '#f59e0b',
  },
];

/**
 * Ways to take part beyond your own project.
 *
 * Purple, cyan, blue — cool hues, so the card reads as one family and sits
 * clear of the warm greens and ambers in Possible Next Projects beside it.
 */
export const OPPORTUNITIES = [
  {
    id: 'op-1',
    title: 'Podcast Interviewer',
    description: 'Help interview guests at a Spin event',
    icon: 'mic',
    accent: '#7c3aed',
  },
  {
    id: 'op-2',
    title: 'Camera Operator',
    description: 'Work behind the camera at a live show',
    icon: 'video',
    accent: '#06b6d4',
  },
  {
    id: 'op-3',
    title: 'Event Check-In Team',
    description: 'Help welcome guests and support the event',
    icon: 'users',
    accent: '#3b82f6',
  },
];

/**
 * The journey as the student experiences it.
 *
 * Four stages, not the seven the pipeline actually has. The old set named the
 * machinery — Intake, Supabase, Rules Recommendation, Teacher Review — which
 * describes how the product works, not what the student does. Supabase
 * storing a row is not a stage of anyone's creative journey.
 */
export const PATHWAY_JOURNEY = [
  {
    id: 'j-1',
    title: 'Discover',
    description: 'Explore your interests',
    icon: 'search',
    accent: '#7c3aed',
  },
  {
    id: 'j-2',
    title: 'Create',
    description: 'Make and learn',
    icon: 'settings',
    accent: '#3b82f6',
  },
  {
    id: 'j-3',
    title: 'Share',
    description: 'Show your work with others',
    icon: 'users',
    accent: '#ec4899',
  },
  {
    id: 'j-4',
    title: 'Grow',
    description: 'Build new skills and opportunities',
    icon: 'chart',
    accent: '#10b981',
  },
];

/** The closing line under the journey row. */
export const JOURNEY_NOTE = "You're on an amazing journey — keep creating!";
