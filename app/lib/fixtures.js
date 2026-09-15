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
  avatarUrl: null,
};

export const DASHBOARD_DATE = 'Sunday, May 25, 2026';

export const NAV_ITEMS = [
  { id: 'home', label: 'Home', icon: '🏠' },
  { id: 'projects', label: 'My Projects', icon: '📋' },
  { id: 'creations', label: 'My Creations', icon: '✨' },
  { id: 'pathway', label: 'My Pathway', icon: '🛤️' },
  { id: 'events', label: 'Events', icon: '📅' },
];

export const CONTEXT_CHIPS = [
  { id: 'program', label: 'Program', value: 'Podcasting', icon: '🎙️' },
  { id: 'org', label: 'Organization', value: 'Sid Jacobson JCC', icon: '🏢' },
  { id: 'class', label: 'Class', value: 'Podcasting Group 1', icon: '👥' },
  {
    id: 'profile',
    label: 'Profile',
    value: 'View My Profile',
    icon: '👤',
    action: true,
  },
];

export const CURRENT_PATHWAY = {
  id: 'pw-creator',
  title: 'Creator Pathway',
  track: 'Podcasting Track',
  trackIcon: '🎙️',
  description: "You're learning, creating and sharing your voice with the world.",
};

export const CURRENT_PROJECT = {
  id: 'proj-1',
  title: 'My First Vlog',
  icon: '🎬',
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
    { id: 'teacher', label: 'Teacher', value: 'Coach Jordan', icon: '👨‍🏫' },
    { id: 'program', label: 'Program', value: 'Podcasting', icon: '🎙️' },
    { id: 'location', label: 'Location', value: 'In-Studio', icon: '📍' },
    { id: 'project', label: 'Project', value: 'My First Vlog', icon: '🎬' },
  ],
};

export const INTERESTS = [
  { id: 'marvel', name: 'Marvel', icon: '🦸' },
  { id: 'music', name: 'Music', icon: '🎵' },
  { id: 'podcasts', name: 'Podcasts', icon: '🎙️' },
  { id: 'wwe', name: 'WWE', icon: '🏆' },
  { id: 'gaming', name: 'Gaming', icon: '🎮' },
  { id: 'youtube', name: 'YouTube', icon: '📺' },
];

export const PROGRESS_ITEMS = [
  {
    id: 'pr-1',
    icon: '📈',
    accent: '#7c3aed',
    title: 'Working more independently',
    description: "You're prompting less during recording.",
  },
  {
    id: 'pr-2',
    icon: '✅',
    accent: '#12b76a',
    title: 'Completed first intro recording',
    description: 'Great job recording your opening segment!',
  },
  {
    id: 'pr-3',
    icon: '⭐',
    accent: '#ff9f1c',
    title: 'Planning ahead',
    description: "You're coming prepared with great ideas.",
  },
];

export const LATEST_FEEDBACK = {
  id: 'fb-1',
  coach: 'Coach Jordan',
  date: 'May 24, 2026',
  message:
    "Avery is doing an awesome job! You're getting more comfortable behind the mic and your ideas are getting stronger every week.",
};

export const CREATIONS = [
  {
    id: 'cr-1',
    title: 'My Introduction Video',
    icon: '🎬',
    status: 'Completed',
    kind: 'Video',
    gradient: 'linear-gradient(135deg, #b79bff, #e9ddff)',
    meta: 'May 10, 2026',
    metaIcon: '📅',
  },
  {
    id: 'cr-2',
    title: 'Podcast Intro',
    icon: '🎙️',
    status: 'Completed',
    kind: 'Audio',
    gradient: 'linear-gradient(135deg, #8b5cf6, #c4b5fd)',
    meta: 'May 3, 2026',
    metaIcon: '📅',
  },
  {
    id: 'cr-3',
    title: 'Episode 1: Superheroes',
    icon: '📝',
    status: 'In Progress',
    kind: 'Podcast',
    gradient: 'linear-gradient(135deg, #d9c6ff, #f3ecff)',
    meta: 'Recording',
    metaIcon: '🎚️',
  },
];

export const OPPORTUNITIES = [
  {
    id: 'op-1',
    title: 'Spin DJ Live - Summer Show',
    icon: '🎧',
    when: 'Jun 14, 2026 - 2:00 PM',
    accent: '#7c3aed',
  },
  {
    id: 'op-2',
    title: 'Camera Operator',
    icon: '📹',
    when: 'Jun 14, 2026 - 2:00 PM',
    accent: '#10b981',
  },
  {
    id: 'op-3',
    title: 'Podcast Interviewer',
    icon: '🎙️',
    when: 'Jun 14, 2026 - 2:00 PM',
    accent: '#f59e0b',
  },
  {
    id: 'op-4',
    title: 'Event Check-In Team',
    icon: '⭐',
    when: 'Jun 14, 2026 - 2:00 PM',
    accent: '#7c3aed',
  },
];

export const PATHWAY_JOURNEY = [
  { id: 'j-1', title: 'Intake', description: 'Your interests and goals', icon: '👤' },
  { id: 'j-2', title: 'Suplabase', description: 'Securely stores your data', icon: '💾' },
  {
    id: 'j-3',
    title: 'Rules Recommendation',
    description: 'AI-driven learning path',
    icon: '🧠',
  },
  {
    id: 'j-4',
    title: 'Teacher Review',
    description: 'Coach reviews and personalizes',
    icon: '👨‍🏫',
  },
  {
    id: 'j-5',
    title: 'Your Pathway',
    description: 'Personalized learning just for you',
    icon: '🛤️',
  },
  {
    id: 'j-6',
    title: 'Projects & Progress',
    description: 'Create, learn, and grow',
    icon: '📊',
  },
  {
    id: 'j-7',
    title: 'Artifacts & Achievements',
    description: 'Show your progress to the world',
    icon: '🏆',
  },
];
