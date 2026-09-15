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
    accent: '#7c3aed',
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

/** Hero artwork for the Creator Pathway card. */
export const PATHWAY_BANNER = {
  src: '/images/pathway-banner.webp',
  width: 1800,
  height: 645,
};

export const CURRENT_PATHWAY = {
  id: 'pw-creator',
  title: 'Creator Pathway',
  track: 'Podcasting Track',
  trackIcon: 'mic',
  description: "You're learning, creating and sharing your voice with the world.",
};

export const CURRENT_PROJECT = {
  id: 'proj-1',
  title: 'My First Vlog',
  icon: 'film',
  stages: ['Idea', 'Planning', 'Recording', 'Editing', 'Review', 'Finished'],
  currentStageIndex: 2,
  nextAction: 'Record your intro segment',
};

export const NEXT_SESSION = {
  id: 'sess-1',
  dateLabel: 'Tue, May 27, 2026',
  timeLabel: '4:30 PM',
  durationMinutes: 60,
  details: [
    { id: 'teacher', label: 'Teacher', value: 'Coach Jordan', icon: 'teacher' },
    { id: 'program', label: 'Program', value: 'Podcasting', icon: 'mic' },
    { id: 'location', label: 'Location', value: 'In-Studio', icon: 'location' },
    { id: 'project', label: 'Project', value: 'My First Vlog', icon: 'film' },
  ],
};

export const INTERESTS = [
  { id: 'marvel', name: 'Marvel', icon: 'superhero', accent: '#e11d48' },
  { id: 'wwe', name: 'WWE', icon: 'trophy', accent: '#f59e0b' },
  { id: 'music', name: 'Music', icon: 'music', accent: '#7c3aed' },
  { id: 'gaming', name: 'Gaming', icon: 'gaming', accent: '#3b82f6' },
  { id: 'podcasts', name: 'Podcasts', icon: 'mic', accent: '#14b8a6' },
  { id: 'youtube', name: 'YouTube', icon: 'youtube', accent: '#ef4444' },
];

export const PROGRESS_ITEMS = [
  {
    id: 'pr-1',
    icon: 'trending',
    accent: '#7c3aed',
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
  coachAvatarUrl: null,
  date: 'May 24, 2026',
  message:
    "Avery is doing an awesome job! You're getting more comfortable behind the mic and your ideas are getting stronger every week.",
};

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

export const OPPORTUNITIES = [
  {
    id: 'op-1',
    title: 'Spin DJ Live - Summer Show',
    icon: 'headphones',
    when: 'Jun 14, 2026 - 2:00 PM',
    accent: '#7c3aed',
    cta: "I'm Interested",
  },
  {
    id: 'op-2',
    title: 'Camera Operator',
    icon: 'video',
    when: 'Jun 14, 2026 - 2:00 PM',
    accent: '#10b981',
    cta: 'View',
  },
  {
    id: 'op-3',
    title: 'Podcast Interviewer',
    icon: 'mic',
    when: 'Jun 14, 2026 - 2:00 PM',
    accent: '#f59e0b',
    cta: "I'm Interested",
  },
  {
    id: 'op-4',
    title: 'Event Check-In Team',
    icon: 'star',
    when: 'Jun 14, 2026 - 2:00 PM',
    accent: '#7c3aed',
    cta: 'View',
  },
];

export const PATHWAY_JOURNEY = [
  {
    id: 'j-1',
    title: 'Intake',
    description: 'Your interests and goals',
    icon: 'user',
    accent: '#7c3aed',
  },
  {
    id: 'j-2',
    title: 'Supabase',
    description: 'Securely stores your data',
    icon: 'database',
    accent: '#3b82f6',
  },
  {
    id: 'j-3',
    title: 'Rules Recommendation',
    description: 'AI + Rules recommend your pathway',
    icon: 'brain',
    accent: '#14b8a6',
  },
  {
    id: 'j-4',
    title: 'Teacher Review',
    description: 'Coach reviews and personalizes',
    icon: 'teacher',
    accent: '#f59e0b',
  },
  {
    id: 'j-5',
    title: 'Your Pathway',
    description: 'Personalized learning just for you',
    icon: 'pathway',
    accent: '#8b5cf6',
  },
  {
    id: 'j-6',
    title: 'Projects & Progress',
    description: 'Create, learn and grow',
    icon: 'chart',
    accent: '#ec4899',
  },
  {
    id: 'j-7',
    title: 'Artifacts & Achievements',
    description: 'Show your progress to the world',
    icon: 'trophy',
    accent: '#10b981',
  },
];
