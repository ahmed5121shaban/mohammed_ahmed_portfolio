/**
 * Domain models for the profile/portfolio content. Pure data shapes —
 * no Angular, no infrastructure, no presentation concerns.
 */

export interface HeroStat {
  /** Numeric value the counter animates up to. */
  count: number;
  /** Pad to two digits (e.g. "02" instead of "2"). */
  pad?: boolean;
  /** Highlight the number in the accent color. */
  accent?: boolean;
  label: string;
}

export interface ContactLink {
  label: string;
  href: string;
  kind: 'whatsapp' | 'facebook' | 'linkedin';
}

export interface HeroContent {
  name: string;
  nameLatin: string;
  location: string;
  titles: string[];
  photoCaption: string;
  photoAlt: string;
  stats: HeroStat[];
  contactLinks: ContactLink[];
}

export interface ExperienceEntry {
  role: string;
  org: string;
  place: string;
  period: string;
  bullets: string[];
}

export interface VentureCard {
  kicker: string;
  title: string;
  description: string;
}

export interface RecognitionBlock {
  kicker: string;
  title: string;
  subtitle: string;
}

export interface VenturesContent {
  intro: string;
  cards: VentureCard[];
  bullets: string[];
  recognition: RecognitionBlock;
}

export interface TimelineEntry {
  role: string;
  org?: string;
  place?: string;
  period?: string;
  bullets?: string[];
}

export interface AdditionalVolunteerItem {
  year: string;
  org: string;
}

export interface VolunteerContent {
  entries: TimelineEntry[];
}

export interface ScopeInfoItem {
  label: string;
}

export interface ScopeRegion {
  key: string;
  label: string;
  code: string;
  items: ScopeInfoItem[];
}

export interface EducationEntry {
  title: string;
  org: string;
  period: string;
  bullets?: string[];
}

export interface Certificate {
  /** Displayed year text (may include a month, e.g. "أغسطس 2025"). */
  year: string;
  /** Displayed suffix after the year, e.g. "LUXOR" or "80h". */
  yearSuffix?: string;
  /** Plain year used for the filter chips (always a bare "YYYY"). */
  filterYear: string;
  title: string;
  org?: string;
}

export interface SkillGroup {
  index: string;
  title: string;
  items: string[];
}

export interface ContactSectionContent {
  kicker: string;
  headline: string;
  links: ContactLink[];
}

export interface HeaderContent {
  brand: string;
  meta: string;
}

export interface ProfileContent {
  header: HeaderContent;
  hero: HeroContent;
  marquee: string[];
  summary: string[];
  experience: ExperienceEntry[];
  ventures: VenturesContent;
  volunteer: VolunteerContent;
  roles: TimelineEntry[];
  additionalRoleNote: { title: string; items: AdditionalVolunteerItem[] };
  scope: { intro: string; regions: ScopeRegion[] };
  education: EducationEntry[];
  certificates: Certificate[];
  certificateYears: string[];
  skills: SkillGroup[];
  contact: ContactSectionContent;
  footer: { left: string; right: string };
}

/** Repository interface — implemented by an infrastructure-data lib. */
export interface ProfileContentRepository {
  getProfile(): ProfileContent;
}
