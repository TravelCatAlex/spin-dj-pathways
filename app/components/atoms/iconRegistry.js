import {
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
  MoveRight,
  Music,
  Pencil,
  Play,
  Route,
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

  // interests
  superhero: Shield,
  gaming: Gamepad2,
  youtube: Youtube,

  // affordances
  edit: Pencil,
  chevronRight: ChevronRight,
  chevronDown: ChevronDown,
  arrowRight: ArrowRight,
  arrowLong: MoveRight,
};
