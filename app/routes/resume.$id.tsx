import { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router";
import { usePuterStore } from "~/lib/puter.lib";
import { Button } from "~/components/ui/button";
import { ReviewResult } from "~/components/review/ReviewResult";

export function meta() {
  return [
    { title: "Resume Review - ResuRev" },
    { name: "description", content: "AI-powered resume review results" },
  ];
}

interface ResumeRecord {
  id: string;
  companyName?: string;
  jobTitle?: string;
  jobDescription?: string;
  resumePath: string;
  imagePath?: string | null;
  feedback: any | null;
  createdAt?: number;
  inputHash?: string;
  version?: string;
}

export default function ResumeReview() {
  const params = useParams();
  const id = (params as any).id as string | undefined;
  const navigate = useNavigate();
  const puter = usePuterStore();

  const [record, setRecord] = useState<ResumeRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);
  const imagePathRef = useRef<string | null>(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    if (!id) navigate("/dashboard", { replace: true });
  }, [id, navigate]);
  useEffect(
    () => () => {
      if (imageUrl) URL.revokeObjectURL(imageUrl);
    },
    [imageUrl]
  );
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const stored = await puter.kv.get(`resume:${id}`);
      if (!stored) {
        if (mountedRef.current) {
          setError("Record not found");
          setLoading(false);
        }
        return;
      }
      let rec: ResumeRecord | null = null;
      try {
        rec = JSON.parse(stored);
      } catch {
        /* ignore */
      }
      if (!rec) {
        if (mountedRef.current) {
          setError("Failed to parse record");
          setLoading(false);
        }
        return;
      }
      // Backfill meta/version if missing (legacy records)
      let mutated = false;
      if (rec.feedback && typeof rec.feedback === "object") {
        if (!rec.feedback.version) {
          rec.feedback.version = "v1";
          mutated = true;
        }
        if (!rec.feedback.meta) {
          rec.feedback.meta = {
            generatedAt: new Date(rec.createdAt || Date.now()).toISOString(),
          };
          mutated = true;
        } else if (!rec.feedback.meta.generatedAt) {
          rec.feedback.meta.generatedAt = new Date(
            rec.createdAt || Date.now()
          ).toISOString();
          mutated = true;
        }
      }
      if (mutated) {
        try {
          await puter.kv.set(`resume:${id}`, JSON.stringify(rec));
        } catch {
          /* ignore */
        }
      }
      if (mountedRef.current) setRecord(rec);
      // Load preview image only if new path and exists
      if (rec.imagePath && rec.imagePath !== imagePathRef.current) {
        try {
          const blob = await puter.fs.read(rec.imagePath);
          if (blob && mountedRef.current) {
            const url = URL.createObjectURL(blob as Blob);
            setImageUrl((prev) => {
              if (prev) URL.revokeObjectURL(prev);
              return url;
            });
            imagePathRef.current = rec.imagePath as string;
          }
        } catch {
          /* ignore */
        }
      }
    } catch (e: any) {
      if (mountedRef.current) setError(e?.message || "Failed to load data");
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, [id, puter]);

  useEffect(() => {
    load();
  }, [load]);

  const downloadResume = async () => {
    if (!record?.resumePath) return;
    setDownloading(true);
    try {
      const blob = await puter.fs.read(record.resumePath);
      if (blob) {
        const url = URL.createObjectURL(blob as Blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${record.jobTitle || "resume"}-${record.id}.pdf`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        setTimeout(() => URL.revokeObjectURL(url), 1200);
      }
    } catch {
      setError("Failed to download resume");
    } finally {
      setDownloading(false);
    }
  };

  const PageSpinner = () => (
    <div
      className="flex flex-col items-center justify-center py-32"
      role="status"
      aria-live="polite"
    >
      <div className="h-10 w-10 rounded-full border-4 border-primary/30 border-t-primary animate-spin" />
      <p className="mt-4 text-xs text-muted-foreground tracking-wide uppercase">
        Loading review...
      </p>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-7xl space-y-6">
        {loading && <PageSpinner />}
        {!loading && error && (
          <div className="bg-destructive/10 border border-destructive rounded p-4 text-destructive text-sm flex items-center justify-between">
            <span>{error}</span>
            <Button size="sm" variant="ghost" onClick={load}>
              Retry
            </Button>
          </div>
        )}
        {!loading && !error && record && (
          <div className="space-y-10">

            <div className="grid lg:grid-cols-3 gap-8 items-start">
              <div className="lg:col-span-3 space-y-8">
                <ReviewResult
                  data={record.feedback}
                  jobTitle={record.jobTitle}
                  companyName={record.companyName}
                  createdAt={record.createdAt}
                  onDownload={downloadResume}
                  onUploadNew={() => navigate("/upload")}
                />
              </div>
              <div className="space-y-6 lg:sticky lg:top-6">
                {imageUrl && (
                  <div className="bg-card border rounded-xl overflow-hidden">
                    <div className="p-4 flex items-center justify-between">
                      <h3 className="font-medium">Preview</h3>
                    </div>
                    <div className="px-4 pb-4">
                      <img
                        src={imageUrl}
                        alt={`Resume preview (${record.jobTitle || "resume"})`}
                        className="rounded border object-contain max-h-[420px] w-full bg-background"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
