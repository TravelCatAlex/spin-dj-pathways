import {
  FileType2 as FileTypePdf,
  FileArchive,
  Image as ImageIcon,
  AudioLines,
  Clock,
  Hourglass,
  Users2,
  Check,
  Scissors,
  ListChecks,
  Lightbulb,
  Flag,
  Eye,
  ArrowRight,
  Award,
  BarChart3,
  Brain,
  Building2,
  Calendar,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Clapperboard,
  ClipboardList,
  Database,
  FileText,
  Gamepad2,
  GraduationCap,
  Hand,
  Headphones,
  Heart,
  Home,
  LogOut,
  MapPin,
  Mic,
  MessageSquare,
  MoveRight,
  Music,
  Pencil,
  Play,
  Route,
  Search,
  Settings,
  Shield,
  SlidersHorizontal,
  Sparkles,
  Star,
  Target,
  TrendingUp,
  Trophy,
  User,
  Users,
  Video,
  Youtube,
} from 'lucide-react';

/**
 * Semantic icon name -> Lucide component.
 *
 * Fixtures and API payloads carry the NAME (a stable string such as "mic"),
 * never a component or an emoji — so the backend contract stays plain JSON
 * and swapping the icon set is a change to this one file.
 */
export const ICONS = {
  // navigation
  home: Home,
  projects: ClipboardList,
  creations: Sparkles,
  pathway: Route,
  events: Calendar,

  // identity / context
  user: User,
  users: Users,
  organization: Building2,
  teacher: GraduationCap,
  logout: LogOut,
  wave: Hand,

  // media & making
  mic: Mic,
  video: Video,
  film: Clapperboard,
  play: Play,
  note: FileText,
  // File kinds, for anything a student uploads. Named after WHAT THE FILE IS,
  // not after the glyph - a caller asking for `pdf` still gets the right
  // picture if the icon set is swapped, which is the whole point of this file.
  pdf: FileTypePdf,
  document: FileText,
  image: ImageIcon,
  audio: AudioLines,
  archive: FileArchive,
  clock: Clock,
  duration: Hourglass,
  seats: Users2,
  mixer: SlidersHorizontal,
  headphones: Headphones,
  music: Music,

  // scheduling
  calendar: Calendar,
  location: MapPin,

  // progress & recognition
  heart: Heart,
  trending: TrendingUp,
  check: CheckCircle2,
  star: Star,
  target: Target,
  trophy: Trophy,
  award: Award,
  chart: BarChart3,

  // journey
  database: Database,
  brain: Brain,
  search: Search,
  settings: Settings,
  flag: Flag,

  // interests
  superhero: Shield,
  gaming: Gamepad2,
  youtube: Youtube,

  // A bare tick, for when the circle is already drawn around it.
  tick: Check,

  // project stages
  idea: Lightbulb,
  plan: ListChecks,
  editing: Scissors,
  review: Eye,
  finished: Flag,

  // messages
  message: MessageSquare,

  // affordances
  edit: Pencil,
  chevronRight: ChevronRight,
  chevronDown: ChevronDown,
  arrowRight: ArrowRight,
  arrowLong: MoveRight,
};
