import { useMemo } from "react";
import { useNavigate } from "react-router";
import { parseResumeReview } from "./parser";
import type { ResumeReview } from "./types";
import { Button } from "~/components/ui/button";
import { Download, AlertTriangle, CheckCircle2, XCircle, ArrowLeft } from "lucide-react";
import { cn } from "~/lib/utils";

interface Props {
  data: unknown;
  jobTitle?: string;
  companyName?: string;
  onUploadNew?: () => void;
  onDownload?: () => void;
}

export function ReviewResult({
  data,
  jobTitle,
  companyName,
  onUploadNew,
  onDownload,
}: Props) {
  const navigate = useNavigate();
  const parsed = useMemo(() => parseResumeReview(data), [data]);
  const review: ResumeReview | null = parsed.data;
  const ats = review?.ATS;
  const strengths = ats?.tips.filter((t) => t.type === "good") || [];
  const improvements = ats?.tips.filter((t) => t.type === "improve") || [];
  const keywords = ats?.keywordMatch || [];
  const matched = keywords.filter((k) => k.present).length;
  const total = keywords.length;
  const matchPct = total ? Math.round((matched / total) * 100) : 0;
  const score = ats?.score ?? 0;
  const tier =
    ats?.tier ||
    (score >= 80 ? "Excellent" : score >= 60 ? "Good" : "Needs Improvement");
  const tierColor =
    score >= 80
      ? "bg-green-500/15 text-green-400 border-green-500/40"
      : score >= 60
        ? "bg-yellow-500/15 text-yellow-300 border-yellow-500/40"
        : "bg-red-500/15 text-red-400 border-red-500/40";

  return (
    <div className="space-y-10" role="main">
      <section className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => navigate('/dashboard')}
              className="gap-1 text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </Button>
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">
            {jobTitle || "Role"}{" "}
            {companyName && (
              <span className="text-muted-foreground"> @ {companyName}</span>
            )}
          </h1>
          <p className="text-xs text-muted-foreground">
            Reviewed {new Date().toLocaleDateString()}
          </p>
          {parsed.errors.length > 0 && (
            <div className="text-xs text-amber-400 flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5" /> Data repaired (fallbacks
              applied)
            </div>
          )}
        </div>
        <div className="flex gap-3">
          {onUploadNew && (
            <Button
              variant="outline"
              size="sm"
              onClick={onUploadNew}
              className="gap-1"
            >
              Upload New Version
            </Button>
          )}
          {onDownload && (
            <Button size="sm" onClick={onDownload} className="gap-1">
              <Download className="w-4 h-4" /> Download Resume
            </Button>
          )}
        </div>
      </section>

      <section className="grid lg:grid-cols-3 gap-8">
        <div className="bg-card/70 backdrop-blur border rounded-xl p-6 flex flex-col items-center justify-center shadow-sm relative overflow-hidden">
          <CircularScore value={score} />
          <div
            className={cn(
              "mt-4 text-xs font-medium px-3 py-1 rounded-full border",
              tierColor
            )}
          >
            {tier}
          </div>
          <div className="mt-4 w-full text-center text-xs text-muted-foreground">
            Keyword Match: {matched}/{total}{" "}
            {total > 0 && <span>({matchPct}%)</span>}
          </div>
          <KeywordMiniBar matched={matched} total={total} />
        </div>
        <div className="lg:col-span-2 bg-card/70 border rounded-xl p-6 shadow-sm">
          <h2 className="text-sm font-semibold mb-3 tracking-wide text-muted-foreground">
            SUMMARY
          </h2>
          {review?.summary ? (
            <p className="text-sm leading-relaxed text-foreground/90">
              {review.summary}
            </p>
          ) : (
            <p className="text-sm text-muted-foreground italic">
              No summary generated.
            </p>
          )}
        </div>
      </section>

      <section className="grid md:grid-cols-2 gap-8">
        <CardList
          title="Strengths"
          items={strengths.map((s) => s.tip)}
          icon={<CheckCircle2 className="w-4 h-4 text-green-400" />}
          accent="green"
          empty="No strengths extracted."
        />
        <CardList
          title="Areas to Improve"
          items={improvements.map((s) => s.tip)}
          icon={<AlertTriangle className="w-4 h-4 text-amber-400" />}
          accent="amber"
          empty="No improvement suggestions."
        />
      </section>

      {review?.warnings && review.warnings.length > 0 && (
        <section className="bg-card/70 border rounded-xl p-6 shadow-sm">
          <h2 className="text-sm font-semibold mb-4 tracking-wide flex items-center gap-2 text-red-400">
            <XCircle className="w-4 h-4" /> Warnings
          </h2>
          <ul className="space-y-2">
            {review.warnings.map((w, i) => (
              <li
                key={i}
                className="text-xs bg-red-500/10 border border-red-500/30 px-3 py-2 rounded-md text-red-300"
              >
                {w}
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

function CircularScore({ value }: { value: number }) {
  const radius = 68;
  const stroke = 10;
  const norm = radius - stroke / 2;
  const circ = 2 * Math.PI * norm;
  const pct = Math.min(100, Math.max(0, value));
  const dash = (pct / 100) * circ;
  const color =
    pct >= 80
      ? "stroke-green-400"
      : pct >= 60
        ? "stroke-yellow-300"
        : "stroke-red-400";
  return (
    <div className="relative w-40 h-40">
      <svg
        className="w-40 h-40 rotate-[-90deg]"
        viewBox={`0 0 ${radius * 2} ${radius * 2}`}
      >
        <circle
          cx={radius}
          cy={radius}
          r={norm}
          className="stroke-muted/20"
          strokeWidth={stroke}
          fill="none"
        />
        <circle
          cx={radius}
          cy={radius}
          r={norm}
          strokeLinecap="round"
          className={cn("transition-all duration-700 ease-out", color)}
          strokeWidth={stroke}
          fill="none"
          strokeDasharray={circ}
          strokeDashoffset={circ - dash}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="text-4xl font-bold tracking-tight">{pct}</div>
        <div className="text-[10px] uppercase text-muted-foreground tracking-wider">
          ATS Score
        </div>
      </div>
    </div>
  );
}

function KeywordMiniBar({
  matched,
  total,
}: {
  matched: number;
  total: number;
}) {
  if (!total) return null;
  const pct = Math.round((matched / total) * 100);
  return (
    <div className="mt-4 w-full space-y-1">
      <div className="h-2 w-full rounded bg-muted overflow-hidden">
        <div
          className={cn(
            "h-full rounded transition-all",
            pct >= 70
              ? "bg-green-400"
              : pct >= 50
                ? "bg-yellow-300"
                : "bg-red-400"
          )}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function CardList({
  title,
  items,
  icon,
  accent,
  empty,
}: {
  title: string;
  items: string[];
  icon: React.ReactNode;
  accent: "green" | "amber";
  empty: string;
}) {
  const base =
    accent === "green"
      ? "bg-green-500/10 border-green-500/30 text-green-300"
      : "bg-amber-500/10 border-amber-500/30 text-amber-300";
  return (
    <div className="bg-card/70 border rounded-xl p-6 shadow-sm">
      <h2
        className={cn(
          "text-sm font-semibold mb-4 tracking-wide flex items-center gap-2",
          accent === "green" ? "text-green-400" : "text-amber-400"
        )}
      >
        {icon} {title}
      </h2>
      {items.length === 0 && (
        <p className="text-xs text-muted-foreground">{empty}</p>
      )}
      <ul className="space-y-2">
        {items.map((t, i) => (
          <li
            key={i}
            className={cn("text-xs px-3 py-2 rounded-md border", base)}
          >
            {t}
          </li>
        ))}
      </ul>
    </div>
  );
}
