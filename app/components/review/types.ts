export interface KeywordMatchItem {
  term: string; present: boolean; count: number;
}
export type TipType = 'good' | 'improve';
export interface ATSTip { type: TipType; tip: string; }
export type ATSTier = 'Excellent' | 'Good' | 'Fair' | 'Poor';

export interface ATSSection {
  score: number; tier: ATSTier; keywordMatch: KeywordMatchItem[]; tips: ATSTip[];
}
export interface ExperienceSection { projects: string[]; }
export interface SkillsSection { programming: string[]; backend: string[]; frontend: string[]; tools: string[]; }
export interface EducationSection { degree: string; institution: string; period: string; percentage: string; }
export interface AchievementsSection { competitions: string[]; training: string[]; }

export interface Sections {
  experience: ExperienceSection; skills: SkillsSection; education: EducationSection; achievements: AchievementsSection;
}

export interface ResumeReview {
  version: 'v1';
  meta: { generatedAt: string };
  ATS?: ATSSection; // optional for graceful fallback
  summary?: string;
  sections?: Partial<Sections>;
  warnings?: string[];
  raw?: unknown; // debugging
  errors?: unknown[];
}

export interface ParseResult { data: ResumeReview | null; errors: string[]; diagnostics?: unknown[]; }
