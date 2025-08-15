// Convert type-only imports to avoid runtime named export errors
import type {
  ResumeReview,
  ParseResult,
  ATSTier,
  TipType,
  KeywordMatchItem,
  ATSTip,
} from "./types";

const isString = (v: unknown): v is string => typeof v === "string";
const isNumber = (v: unknown): v is number =>
  typeof v === "number" && !isNaN(v);
const isArray = Array.isArray;

const tierSet: Record<string, ATSTier> = {
  Excellent: "Excellent",
  Good: "Good",
  Fair: "Fair",
  Poor: "Poor",
};
const tipTypeSet: Record<string, TipType> = {
  good: "good",
  improve: "improve",
};

export function parseResumeReview(input: unknown): ParseResult {
  const errors: string[] = [];
  const diagnostics: unknown[] = [];
  if (typeof input !== "object" || input === null)
    return { data: null, errors: ["Root is not an object"] };
  const obj: any = input;

  if (obj.version !== "v1") errors.push("Unsupported or missing version");
  if (!obj.meta || !isString(obj.meta.generatedAt))
    errors.push("meta.generatedAt missing");

  const review: ResumeReview = {
    version: "v1",
    meta: {
      generatedAt: isString(obj.meta?.generatedAt)
        ? obj.meta.generatedAt
        : new Date().toISOString(),
    },
    ATS: undefined,
    summary: isString(obj.summary) ? obj.summary : undefined,
    sections: {},
    warnings: isArray(obj.warnings) ? obj.warnings.filter(isString) : undefined,
    raw: obj.raw,
    errors: obj.errors,
  };

  if (obj.ATS && typeof obj.ATS === "object") {
    const ats: any = obj.ATS;
    const score = isNumber(ats.score)
      ? Math.min(100, Math.max(0, ats.score))
      : 0;
    const tier: ATSTier =
      tierSet[ats.tier] ||
      (score >= 80
        ? "Excellent"
        : score >= 60
          ? "Good"
          : score >= 40
            ? "Fair"
            : "Poor");
    let keywordMatch: any[] = [];
    if (isArray(ats.keywordMatch)) {
      keywordMatch = ats.keywordMatch
        .filter(
          (k: any): k is { term: string; present: boolean; count?: number } =>
            isString(k?.term) && typeof k?.present === "boolean"
        )
        .map(
          (k: {
            term: string;
            present: boolean;
            count?: number;
          }): KeywordMatchItem => ({
            term: k.term,
            present: !!k.present,
            count: isNumber(k.count) ? k.count : 0,
          })
        );
    }
    let tips: ATSTip[] = [];
    if (isArray(ats.tips)) {
      tips = ats.tips
        .filter(
          (t: any): t is { type: string; tip: string } =>
            !!tipTypeSet[t?.type] && isString(t?.tip)
        )
        .map(
          (t: { type: string; tip: string }): ATSTip =>
            ({ type: tipTypeSet[t.type], tip: t.tip.trim() }) as ATSTip
        );
    }
    review.ATS = { score, tier, keywordMatch, tips } as any;
  }

  const sections = obj.sections || {};
  if (sections.experience && isArray(sections.experience.projects)) {
    review.sections!.experience = {
      projects: sections.experience.projects.filter(isString),
    };
  }
  if (sections.skills) {
    const s = sections.skills;
    review.sections!.skills = {
      programming: isArray(s.programming) ? s.programming.filter(isString) : [],
      backend: isArray(s.backend) ? s.backend.filter(isString) : [],
      frontend: isArray(s.frontend) ? s.frontend.filter(isString) : [],
      tools: isArray(s.tools) ? s.tools.filter(isString) : [],
    };
  }
  if (sections.education) {
    const e = sections.education;
    if (
      isString(e.degree) ||
      isString(e.institution) ||
      isString(e.period) ||
      isString(e.percentage)
    ) {
      review.sections!.education = {
        degree: isString(e.degree) ? e.degree : "",
        institution: isString(e.institution) ? e.institution : "",
        period: isString(e.period) ? e.period : "",
        percentage: isString(e.percentage) ? e.percentage : "",
      };
    }
  }
  if (sections.achievements) {
    const a = sections.achievements;
    review.sections!.achievements = {
      competitions: isArray(a.competitions)
        ? a.competitions.filter(isString)
        : [],
      training: isArray(a.training) ? a.training.filter(isString) : [],
    };
  }

  if (errors.length) diagnostics.push({ errors });
  return { data: review, errors, diagnostics };
}
