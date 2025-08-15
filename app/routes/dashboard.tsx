import { useEffect, useState, useCallback, useMemo } from "react";
import { Button } from "~/components/ui/button";
import { usePuterStore } from "~/lib/puter.lib";
import type { Route } from "./+types/dashboard";
import type { ResumeRecord } from "types/resume";
import { MoreVertical, Trash2, ExternalLink } from "lucide-react";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Dashboard - ResuRev" },
    { name: "description", content: "Your ResuRev dashboard" },
  ];
}

// Professional relative time formatting leveraging Intl.RelativeTimeFormat with graceful fallback
const RELATIVE_TIME_FORMATTER = ((): Intl.RelativeTimeFormat | null => {
  try {
    return new Intl.RelativeTimeFormat(undefined, {
      numeric: "auto",
      style: "short",
    });
  } catch {
    return null;
  }
})();

const formatRelativeTime = (ts?: number): string => {
  if (!ts) return "—";
  const diffSeconds = (ts - Date.now()) / 1000; // negative => past
  // Ordered divisions moving from seconds → years
  const divisions = [
    { amount: 60, unit: "second" },
    { amount: 60, unit: "minute" },
    { amount: 24, unit: "hour" },
    { amount: 7, unit: "day" },
    { amount: 4.34524, unit: "week" }, // approx weeks per month
    { amount: 12, unit: "month" },
    { amount: Infinity, unit: "year" },
  ] as const;

  let duration = diffSeconds;
  for (const d of divisions) {
    if (Math.abs(duration) < d.amount) {
      const value = Math.round(duration);
      if (RELATIVE_TIME_FORMATTER)
        return RELATIVE_TIME_FORMATTER.format(
          value as number,
          d.unit as Intl.RelativeTimeFormatUnit
        );
      // Fallback: concise manual suffix (e.g., 5m ago)
      const abs = Math.abs(value);
      const suffix = value <= 0 ? "ago" : "from now";
      const label = d.unit.startsWith("second")
        ? "s"
        : d.unit.startsWith("minute")
          ? "m"
          : d.unit.startsWith("hour")
            ? "h"
            : d.unit.startsWith("day")
              ? "d"
              : d.unit.startsWith("week")
                ? "w"
                : d.unit.startsWith("month")
                  ? "mo"
                  : "y";
      return `${abs}${label} ${suffix}`;
    }
    duration /= d.amount;
  }
  return "—";
};

const PAGE_SIZE = 15;
const STORAGE_KEYS = {
  search: "dash:search",
  status: "dash:status",
  sort: "dash:sort",
  lastEvent: "resurev:lastEvent",
  deleted: "dash:deleted", // persisted tombstone id list client-side
} as const;
const BROADCAST_CHANNEL = "resurev";
const TOMBSTONE_PREFIX = "resume_tombstone:"; // persistent tombstone keys so deleted records stay hidden across refresh

export default function Dashboard() {
  const puter = usePuterStore();
  // derive display name once auth info is available
  const userDisplayName = useMemo(() => {
    const u: any = puter.auth.user;
    if (!u) return null;
    return u.name || u.fullName || u.username || u.email || null;
  }, [puter.auth.user]);
  const [loading, setLoading] = useState(true);
  // mobile filters toggle
  const [showFilters, setShowFilters] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [items, setItems] = useState<ResumeRecord[]>([]);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  // view mode for reviews list
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("created-desc");
  const [hydrated, setHydrated] = useState(false);
  // track deleted ids locally to avoid reappearing due to async refresh
  const [deletedIds, setDeletedIds] = useState<string[]>([]);

  // Client preference hydration
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const s = localStorage.getItem(STORAGE_KEYS.search);
      const st = localStorage.getItem(STORAGE_KEYS.status);
      const so = localStorage.getItem(STORAGE_KEYS.sort);
      const del = localStorage.getItem(STORAGE_KEYS.deleted);
      if (s) setSearch(s);
      if (st) setStatusFilter(st);
      if (so) setSortBy(so);
      if (del) {
        try {
          const arr = JSON.parse(del);
          if (Array.isArray(arr))
            setDeletedIds(arr.filter((v: any) => typeof v === "string"));
        } catch {
          /* ignore parse */
        }
      }
    } catch {
      /* ignore */
    }
    setHydrated(true);
  }, []);

  // Persist preferences
  useEffect(() => {
    if (hydrated)
      try {
        localStorage.setItem(STORAGE_KEYS.search, search);
      } catch {}
  }, [search, hydrated]);
  useEffect(() => {
    if (hydrated)
      try {
        localStorage.setItem(STORAGE_KEYS.status, statusFilter);
      } catch {}
  }, [statusFilter, hydrated]);
  useEffect(() => {
    if (hydrated)
      try {
        localStorage.setItem(STORAGE_KEYS.sort, sortBy);
      } catch {}
  }, [sortBy, hydrated]);
  // persist deleted ids
  useEffect(() => {
    if (hydrated)
      try {
        localStorage.setItem(STORAGE_KEYS.deleted, JSON.stringify(deletedIds));
      } catch {}
  }, [deletedIds, hydrated]);

  const load = useCallback(
    async (opts?: { silent?: boolean }) => {
      if (!opts?.silent) setLoading(true);
      setError(null);
      try {
        const keys = await puter.kv.list("resume:*", true);
        // fetch tombstone keys (do not rely solely on transient in-memory deletedIds)
        let tombstoneSet: Set<string> = new Set();
        try {
          const tombKeys = await puter.kv.list(`${TOMBSTONE_PREFIX}*`, false);
          if (Array.isArray(tombKeys)) {
            for (const tk of tombKeys) {
              if (typeof tk === "string" && tk.startsWith(TOMBSTONE_PREFIX)) {
                tombstoneSet.add(tk.substring(TOMBSTONE_PREFIX.length));
              }
            }
          }
        } catch {
          /* ignore tombstone fetch errors */
        }
        const records: ResumeRecord[] = [];
        if (Array.isArray(keys)) {
          for (const raw of keys) {
            let key: string;
            let value: string | null = null;
            if (typeof raw === "string") {
              key = raw;
              value = (await puter.kv.get(raw)) as string | null;
            } else {
              key =
                (raw as any).key || (raw as any).name || (raw as any).id || "";
              value = (raw as any).value || (raw as any).data || null;
              if (!value && key)
                value = (await puter.kv.get(key)) as string | null;
            }
            if (!key.startsWith("resume:") || !value) continue;
            try {
              const parsed = JSON.parse(value);
              if (parsed?.id && parsed?.resumePath) {
                // skip if marked deleted via tombstone or if record status explicitly deleted
                if (tombstoneSet.has(parsed.id) || parsed.status === "deleted")
                  continue;
                records.push(parsed as ResumeRecord);
              }
            } catch {
              /* skip malformed */
            }
          }
        }
        records.sort(
          (a, b) =>
            (b.createdAt || 0) - (a.createdAt || 0) || a.id.localeCompare(b.id)
        );
        // exclude any locally deleted ids (optimistic consistency)
        setItems(records.filter((r) => !deletedIds.includes(r.id)));
      } catch (e: any) {
        setError(e?.message || "Failed to load");
      } finally {
        if (!opts?.silent) setLoading(false);
      }
    },
    [puter, deletedIds]
  );

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    const refresh = () => load({ silent: true });
    window.addEventListener("focus", refresh);
    const onVis = () => {
      if (!document.hidden) refresh();
    };
    document.addEventListener("visibilitychange", onVis);
    let bc: BroadcastChannel | null = null;
    try {
      bc = new BroadcastChannel(BROADCAST_CHANNEL);
      bc.onmessage = (e) => {
        const t = e?.data?.type;
        if (t === "resume-created") {
          if (e.data.record)
            setItems((prev) => {
              const rid = e.data.record.id;
              if (deletedIds.includes(rid)) return prev; // ignore recreated deleted record
              return prev.find((r) => r.id === rid)
                ? prev
                : [e.data.record, ...prev];
            });
          refresh();
        }
        if (t === "resume-deleted") refresh();
      };
    } catch {
      /* ignore */
    }
    const storageHandler = (e: StorageEvent) => {
      if (e.key === STORAGE_KEYS.lastEvent && e.newValue) {
        try {
          const payload = JSON.parse(e.newValue);
          if (
            payload.type === "resume-created" ||
            payload.type === "resume-deleted"
          )
            refresh();
        } catch {}
      }
    };
    window.addEventListener("storage", storageHandler);
    return () => {
      window.removeEventListener("focus", refresh);
      document.removeEventListener("visibilitychange", onVis);
      window.removeEventListener("storage", storageHandler);
      if (bc) bc.close();
    };
  }, [load]);

  const metrics = useMemo(() => {
    if (!items.length)
      return {
        avg: 0,
        completed: 0,
        pending: 0,
        lastTs: undefined as number | undefined,
      };
    let total = 0,
      scored = 0,
      completed = 0,
      pending = 0,
      lastTs = 0;
    for (const r of items) {
      const s = r.feedback?.ATS?.score;
      if (typeof s === "number") {
        total += s;
        scored++;
      }
      if (r.feedback) completed++;
      else pending++;
      if (r.createdAt && r.createdAt > lastTs) lastTs = r.createdAt;
    }
    return {
      avg: scored ? Math.round(total / scored) : 0,
      completed,
      pending,
      lastTs,
    };
  }, [items]);

  const processed = useMemo(() => {
    let list = items.slice();
    // ensure deleted never shows even if present in items from a race
    if (deletedIds.length)
      list = list.filter((r) => !deletedIds.includes(r.id));
    if (hydrated && search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((r) =>
        [r.jobTitle, r.companyName, r.meta?.fileName].some(
          (v) => v && v.toLowerCase().includes(q)
        )
      );
    }
    if (hydrated && statusFilter !== "all")
      list = list.filter(
        (r) => (r.feedback ? "completed" : "pending") === statusFilter
      );
    list.sort((a, b) => {
      const sa = a.feedback?.ATS?.score ?? -1;
      const sb = b.feedback?.ATS?.score ?? -1;
      switch (sortBy) {
        case "score-desc":
          return (
            sb - sa ||
            (b.createdAt || 0) - (a.createdAt || 0) ||
            a.id.localeCompare(b.id)
          );
        case "score-asc":
          return (
            sa - sb ||
            (b.createdAt || 0) - (a.createdAt || 0) ||
            a.id.localeCompare(b.id)
          );
        case "created-asc":
          return (
            (a.createdAt || 0) - (b.createdAt || 0) || a.id.localeCompare(b.id)
          );
        case "created-desc":
        default:
          return (
            (b.createdAt || 0) - (a.createdAt || 0) || a.id.localeCompare(b.id)
          );
      }
    });
    return list;
  }, [items, search, statusFilter, sortBy, hydrated, deletedIds]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(processed.length / PAGE_SIZE));
  useEffect(() => {
    const max = Math.max(1, Math.ceil(processed.length / PAGE_SIZE));
    if (page > max) setPage(max);
  }, [processed, page]);
  const paginated = useMemo(
    () => processed.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [processed, page]
  );

  const tierFor = (score: number) => {
    if (score >= 85)
      return {
        label: "Top",
        class:
          "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
      };
    if (score >= 70)
      return {
        label: "Solid",
        class:
          "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
      };
    if (score >= 55)
      return {
        label: "Fair",
        class:
          "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300",
      };
    return {
      label: "Improve",
      class: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
    };
  };

  const scoreTone = (score?: number) => {
    if (typeof score !== "number") return "bg-muted text-muted-foreground";
    if (score >= 85)
      return "bg-green-500/15 text-green-400 ring-1 ring-inset ring-green-500/30";
    if (score >= 70)
      return "bg-emerald-500/15 text-emerald-300 ring-1 ring-inset ring-emerald-500/30";
    if (score >= 55)
      return "bg-yellow-500/15 text-yellow-300 ring-1 ring-inset ring-yellow-500/30";
    return "bg-red-500/15 text-red-400 ring-1 ring-inset ring-red-500/30";
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this resume record permanently?")) return;
    // optimistic local removal
    setDeletedIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
    setItems((prev) => prev.filter((r) => r.id !== id));
    try {
      const ok = await puter.kv.delete(`resume:${id}`);
      // write tombstone regardless (in case delete failed or eventual consistency)
      try {
        await puter.kv.set(`${TOMBSTONE_PREFIX}${id}`, "1");
      } catch {}
      // If delete failed (ok === false) attempt soft-delete status for future loads
      if (ok === false) {
        try {
          const existing = await puter.kv.get(`resume:${id}`);
          if (existing) {
            const parsed = JSON.parse(existing);
            parsed.status = "deleted";
            parsed.deletedAt = Date.now();
            await puter.kv.set(`resume:${id}`, JSON.stringify(parsed));
          }
        } catch {
          /* ignore */
        }
      }
    } catch {
      /* ignore */
    }
    try {
      const bc = new BroadcastChannel(BROADCAST_CHANNEL);
      bc.postMessage({ type: "resume-deleted", id });
      bc.close();
    } catch {}
    try {
      localStorage.setItem(
        STORAGE_KEYS.lastEvent,
        JSON.stringify({ type: "resume-deleted", id, ts: Date.now() })
      );
    } catch {}
  };

  const ListItem = ({ r }: { r: ResumeRecord }) => {
    const score: number | undefined = r.feedback?.ATS?.score;
    const status = r.feedback ? "completed" : "pending";
    const tier = typeof score === "number" ? tierFor(score) : null;
    const scoreLabel = typeof score === "number" ? `${score}` : "—";
    return (
      <div
        role="listitem"
        className="relative group rounded-lg border bg-card/60 backdrop-blur-sm p-4 hover:border-primary/40 hover:bg-accent/40 transition-colors focus-within:ring-2 focus-within:ring-primary/40"
      >
        <a
          href={`/resume/${r.id}`}
          aria-label={`Open resume review for ${r.jobTitle || r.meta?.fileName || "resume"}`}
          className="absolute inset-0"
        />
        <div className="flex flex-col gap-3 lg:gap-4 relative pointer-events-none">
          <div className="flex items-start gap-3">
            <div
              className={`pointer-events-auto select-none shrink-0 w-10 h-10 rounded-md flex items-center justify-center text-xs font-semibold tracking-tight ${scoreTone(score)}`}
            >
              {scoreLabel}
            </div>
            <div className="min-w-0 flex-1 space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="font-medium truncate max-w-[240px] sm:max-w-[320px] pointer-events-auto relative z-10 text-sm sm:text-base">
                  {r.meta?.fileName || r.jobTitle || "Resume"}
                </h3>
                {tier && (
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-medium tracking-wide ${tier.class}`}
                  >
                    {tier.label}
                  </span>
                )}
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-medium tracking-wide ${status === "completed" ? "bg-blue-500/15 text-blue-300 ring-1 ring-inset ring-blue-500/30" : "bg-orange-500/15 text-orange-300 ring-1 ring-inset ring-orange-500/30"}`}
                >
                  {status}
                </span>
              </div>
              <p
                className="text-[11px] text-muted-foreground truncate max-w-full"
                title={r.jobTitle || ""}
              >
                {r.jobTitle || "Role"}
                {r.companyName ? ` @ ${r.companyName}` : ""}
              </p>
              <p
                className="text-[10px] text-muted-foreground"
                title={
                  r.createdAt ? new Date(r.createdAt).toLocaleString() : ""
                }
              >
                {formatRelativeTime(r.createdAt)} •{" "}
                {r.createdAt && new Date(r.createdAt).toLocaleDateString()}
              </p>
            </div>
            <div className="pointer-events-auto opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity flex items-start gap-1">
              <a
                href={`/resume/${r.id}`}
                className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground"
                aria-label="Open review"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleDelete(r.id);
                }}
                className="p-1.5 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive"
                aria-label="Delete"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <button
                className="p-1.5 rounded-md hover:bg-muted text-muted-foreground"
                aria-label="More actions"
              >
                <MoreVertical className="w-4 h-4" />
              </button>
            </div>
          </div>
          {typeof score === "number" && (
            <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
              <div className="flex-1 h-1.5 rounded bg-muted overflow-hidden">
                <div
                  className={`h-full transition-all ${score >= 85 ? "bg-green-400" : score >= 70 ? "bg-emerald-400" : score >= 55 ? "bg-yellow-300" : "bg-red-400"}`}
                  style={{ width: `${Math.min(100, Math.max(0, score))}%` }}
                />
              </div>
              <span className="font-medium text-foreground/80">
                {score}/100
              </span>
            </div>
          )}
        </div>
      </div>
    );
  };

  const LoadingSkeleton = () => (
    <div className="space-y-4" role="status" aria-label="Loading dashboard">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="rounded-lg border bg-card p-4 animate-pulse h-24"
          />
        ))}
      </div>
      <div className="rounded-lg border bg-card p-4 animate-pulse h-28" />
      <div className="rounded-lg border bg-card p-8 space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-16 border rounded-md animate-pulse" />
        ))}
        <div className="flex items-center justify-between pt-4">
          <div className="h-4 w-32 bg-muted rounded animate-pulse" />
          <div className="flex gap-2">
            <div className="h-8 w-16 bg-muted rounded animate-pulse" />
            <div className="h-8 w-16 bg-muted rounded animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <div className="container mx-auto px-4 py-6 sm:py-8 space-y-6 sm:space-y-8">
        <header className="flex flex-col gap-3 sm:gap-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-1">
            <h1
              className="text-2xl sm:text-3xl font-bold tracking-tight"
              id="dash-heading"
            >
              {userDisplayName ? `Welcome, ${userDisplayName}` : "Dashboard"}
            </h1>
            <div className="flex items-center gap-2 md:hidden">
              <button
                onClick={() => setShowFilters((f) => !f)}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md border bg-card text-xs font-medium"
              >
                {showFilters ? "Hide Filters" : "Show Filters"}
              </button>
              <a
                href="/upload"
                className="inline-flex items-center justify-center bg-primary text-primary-foreground hover:bg-primary/90 px-3 py-1.5 rounded-md text-xs font-medium"
              >
                Upload
              </a>
            </div>
          </div>
          <div className="flex items-center gap-10">
            <a
              href="/upload"
              className="hidden md:inline-flex bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md font-medium"
            >
              Upload Resume
            </a>
          </div>
        </header>

        <section
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4"
          aria-label="Summary metrics"
        >
          <div className="bg-card border rounded-lg p-4">
            <p className="text-xs uppercase text-muted-foreground mb-1">
              Avg Score
            </p>
            <div className="text-2xl font-semibold">{metrics.avg}</div>
            <p className="text-[11px] text-muted-foreground">
              Across {items.length} resume{items.length !== 1 ? "s" : ""}
            </p>
          </div>
          <div className="bg-card border rounded-lg p-4">
            <p className="text-xs uppercase text-muted-foreground mb-1">
              Completed
            </p>
            <div className="text-2xl font-semibold">{metrics.completed}</div>
            <p className="text-[11px] text-muted-foreground">
              {metrics.pending} pending
            </p>
          </div>
          <div className="bg-card border rounded-lg p-4">
            <p className="text-xs uppercase text-muted-foreground mb-1">
              Last Upload
            </p>
            <div className="text-lg font-medium">
              {metrics.lastTs ? formatRelativeTime(metrics.lastTs) : "—"}
            </div>
            <p className="text-[11px] text-muted-foreground">
              {metrics.lastTs && new Date(metrics.lastTs).toLocaleDateString()}
            </p>
          </div>
          <div className="bg-card border rounded-lg p-4">
            <p className="text-xs uppercase text-muted-foreground mb-1">
              Completion Rate
            </p>
            <div className="text-2xl font-semibold">
              {items.length
                ? Math.round((metrics.completed / items.length) * 100)
                : 0}
              %
            </div>
            <p className="text-[11px] text-muted-foreground">
              Processed reviews
            </p>
          </div>
        </section>

        <section
          className={`bg-card border rounded-lg p-4 flex flex-col md:flex-row md:items-end gap-4 transition-all md:opacity-100 ${showFilters ? "opacity-100 mt-2" : "opacity-0 h-0 md:h-auto md:opacity-100 md:mt-0 overflow-hidden md:overflow-visible"} md:mt-0`}
          aria-label="Filters"
        >
          <div className="flex-1 w-full">
            <label
              htmlFor="search"
              className="text-xs font-medium text-muted-foreground block mb-1"
            >
              Search
            </label>
            <input
              id="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Role, company, filename..."
              className="w-full h-10 px-3 rounded-md border border-border bg-card/60 focus:bg-card text-sm placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-primary/50 focus:border-primary transition-colors"
            />
          </div>
          <div>
            <label
              htmlFor="status"
              className="text-xs font-medium text-muted-foreground block mb-1"
            >
              Status
            </label>
            <select
              id="status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-10 px-3 rounded-md border border-border bg-card/60 focus:bg-card text-sm focus:outline-none focus:ring-1 focus:ring-primary/50 focus:border-primary transition-colors"
            >
              <option value="all">All</option>
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
            </select>
          </div>
          <div>
            <label
              htmlFor="sort"
              className="text-xs font-medium text-muted-foreground block mb-1"
            >
              Sort By
            </label>
            <select
              id="sort"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="h-10 px-3 rounded-md border border-border bg-card/60 focus:bg-card text-sm focus:outline-none focus:ring-1 focus:ring-primary/50 focus:border-primary transition-colors"
            >
              <option value="created-desc">Newest</option>
              <option value="created-asc">Oldest</option>
              <option value="score-desc">Score (High→Low)</option>
              <option value="score-asc">Score (Low→High)</option>
            </select>
          </div>
        </section>

        {loading && (
          <div>
            <LoadingSkeleton />
          </div>
        )}
        {!loading && error && (
          <div className="bg-destructive/10 border border-destructive rounded p-4 text-destructive text-sm flex items-center justify-between">
            <span>{error}</span>
            <Button size="sm" variant="ghost" onClick={() => load()}>
              Retry
            </Button>
          </div>
        )}

        {!loading && !error && (
          <section
            className="bg-card rounded-lg border p-6"
            role="region"
            aria-label="Resume reviews list"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <h2 className="text-lg sm:text-xl font-semibold">
                Reviews ({processed.length})
              </h2>
              <div className="flex items-center gap-2">
                <div className="text-[11px] text-muted-foreground order-2 sm:order-1">
                  Page {page} / {totalPages}
                </div>
                <div
                  className="flex gap-1 order-1 sm:order-2"
                  aria-label="View mode switch"
                >
                  <button
                    onClick={() => setViewMode("list")}
                    aria-pressed={viewMode === "list"}
                    className={`px-2 py-1 rounded-md text-[11px] border ${viewMode === "list" ? "bg-primary text-primary-foreground border-primary" : "bg-background hover:bg-accent"}`}
                  >
                    List
                  </button>
                  <button
                    onClick={() => setViewMode("grid")}
                    aria-pressed={viewMode === "grid"}
                    className={`px-2 py-1 rounded-md text-[11px] border ${viewMode === "grid" ? "bg-primary text-primary-foreground border-primary" : "bg-background hover:bg-accent"}`}
                  >
                    Grid
                  </button>
                </div>
              </div>
            </div>
            {processed.length === 0 && (
              <div
                className="text-center py-12"
                role="status"
                aria-live="polite"
              >
                <p className="text-muted-foreground mb-4">
                  No matching resumes
                </p>
                <a
                  href="/upload"
                  className="bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md font-medium inline-block"
                >
                  Upload
                </a>
              </div>
            )}
            <div
              className={
                viewMode === "grid"
                  ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-5"
                  : "space-y-3"
              }
              role="list"
            >
              {paginated.map((r) => (
                <ListItem key={r.id} r={r} />
              ))}
            </div>
            {totalPages > 1 && (
              <nav
                className="flex items-center justify-between mt-6 gap-4"
                aria-label="Pagination controls"
              >
                <div className="text-xs text-muted-foreground">
                  Showing {(page - 1) * PAGE_SIZE + 1}-
                  {Math.min(page * PAGE_SIZE, processed.length)} of{" "}
                  {processed.length}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-3 py-1 text-sm rounded border disabled:opacity-40"
                  >
                    Prev
                  </button>
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="px-3 py-1 text-sm rounded border disabled:opacity-40"
                  >
                    Next
                  </button>
                </div>
              </nav>
            )}
          </section>
        )}
      </div>
    </div>
  );
}
