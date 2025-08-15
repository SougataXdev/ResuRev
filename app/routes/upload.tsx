import { useCallback, useRef, useState, useEffect } from "react";
import type { Route } from "./+types/upload";
import { usePuterStore } from "~/lib/puter.lib";
import { Button } from "~/components/ui/button";
import { useNavigate } from "react-router";
import { generateUUID } from "~/lib/utils";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Upload Resume - ResuRev" },
    {
      name: "description",
      content: "Upload your resume for AI-powered review",
    },
  ];
}

export default function Upload() {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [progress, setProgress] = useState<number>(0);
  const [companyName, setCompanyName] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [statusText, setStatusText] = useState("");
  const puter = usePuterStore();
  const navigate = useNavigate();
  const abortRef = useRef<{ aborted: boolean } | null>(null);

  const MAX_BYTES = 10 * 1024 * 1024; // 10MB
  const ACCEPTED = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ];

  const validate = (file: File) => {
    if (file.size > MAX_BYTES) return "File is too large (max 10MB).";
    if (!ACCEPTED.includes(file.type) && !/\.docx?$|\.pdf$/i.test(file.name))
      return "Unsupported file type.";
    return null;
  };

  // auth / readiness guard
  useEffect(() => {
    if (!puter.puterReady) return; // wait
    if (!puter.auth.isAuthenticated) {
      navigate(`/auth?next=/upload`, { replace: true });
    }
  }, [puter.puterReady, puter.auth.isAuthenticated, navigate]);

  const resetStateForNewFile = () => {
    abortRef.current && (abortRef.current.aborted = true);
    setIsProcessing(false);
    setStatusText("");
    setProgress(0);
  };

  const handleFiles = useCallback(
    async (files: FileList | null) => {
      setError(null);
      if (!files || files.length === 0) return;
      const file = files[0];
      // validate first
      const v = validate(file);
      if (v) {
        setSelectedFile(null);
        setError(v);
        return;
      }
      resetStateForNewFile();
      // replace preview
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
        setPreviewUrl(null);
      }
      if (/\.pdf$/i.test(file.name)) {
        const url = URL.createObjectURL(file);
        setPreviewUrl(url);
      }
      setSelectedFile(file);
    },
    [previewUrl]
  );

  // convertPdfToImage
  const convertPdfToImage = async (file: File) => {
    try {
      const pdfjs = await import("pdfjs-dist/build/pdf" as any);
      pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
      const pdf = await pdfjs.getDocument(await file.arrayBuffer()).promise;
      const page = await pdf.getPage(1);
      const viewport = page.getViewport({ scale: 2 });
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      await page.render({ canvasContext: ctx!, viewport }).promise;
      return new Promise<File | null>((resolve) => {
        canvas.toBlob((blob) => {
          if (!blob) return resolve(null);
          const imageFile = new File(
            [blob],
            file.name.replace(/\.pdf$/i, "") + ".png",
            { type: "image/png" }
          );
          resolve(imageFile);
        }, "image/png");
      });
    } catch {
      return null;
    }
  };

  const analyze = async () => {
    if (!selectedFile) return;
    if (!puter.puterReady || !puter.auth.isAuthenticated) {
      navigate(`/auth?next=/upload`);
      return;
    }
    if (!jobTitle.trim()) {
      setError("Job Title is required");
      return;
    }

    abortRef.current && (abortRef.current.aborted = true);
    abortRef.current = { aborted: false };
    const localAbort = abortRef.current;

    setError(null);
    setIsProcessing(true);
    setStatusText("Preparing...");
    setProgress(3);

    try {
      // unified input signature & hash
      const inputSignature = `${selectedFile.name}|${selectedFile.size}|${jobTitle}|${jobDescription}`;
      const inputHash = puter.ai.simpleHash
        ? puter.ai.simpleHash(inputSignature)
        : undefined;

      // fast path duplicate lookup via hash index
      if (inputHash) {
        setStatusText("Checking existing analyses...");
        const hashIndexKey = `resume_hash:${inputHash}`;
        const mapped = (await puter.kv.get(hashIndexKey)) as any;
        if (mapped) {
          try {
            const ids: string[] = JSON.parse(mapped);
            for (const existingId of ids) {
              const recRaw = await puter.kv.get(`resume:${existingId}`);
              if (!recRaw) continue;
              try {
                const rec = JSON.parse(recRaw);
                if (rec?.feedback) {
                  setStatusText("Existing analysis found. Redirecting...");
                  setProgress(100);
                  setTimeout(() => navigate(`/resume/${rec.id}`), 600);
                  return;
                }
              } catch {
                /* ignore */
              }
            }
          } catch {
            /* ignore malformed index */
          }
        }
        // legacy fallback scan only if index miss
        if (!mapped) {
          const keys = (await puter.kv.list("resume:*", true)) as any;
          if (Array.isArray(keys)) {
            for (const entry of keys) {
              let key: string;
              let value: string | null = null;
              if (typeof entry === "string") {
                key = entry;
                value = (await puter.kv.get(entry)) as any;
              } else {
                key = entry.key || entry.name || entry.id || "";
                value = entry.value || entry.data || null;
                if (!value && key) value = (await puter.kv.get(key)) as any;
              }
              if (!value || !key.startsWith("resume:")) continue;
              try {
                const parsed = JSON.parse(value);
                if (parsed.inputHash === inputHash && parsed.feedback) {
                  setStatusText("Existing analysis found. Redirecting...");
                  setProgress(100);
                  setTimeout(() => navigate(`/resume/${parsed.id}`), 600);
                  return;
                }
              } catch {
                /* ignore */
              }
            }
          }
        }
      }

      setStatusText("Uploading resume...");
      setProgress(8);
      const resumeUpload = await puter.fs.upload([selectedFile]);
      if (localAbort.aborted) return;
      if (!resumeUpload || !("path" in resumeUpload))
        throw new Error("Upload failed");
      setProgress(25);

      let imageUpload: any | null = null;
      if (/\.pdf$/i.test(selectedFile.name)) {
        setStatusText("Creating preview image...");
        const imgFile = await convertPdfToImage(selectedFile);
        if (localAbort.aborted) return;
        if (imgFile) {
          setStatusText("Uploading preview image...");
          imageUpload = await puter.fs.upload([imgFile]);
          if (localAbort.aborted) return;
        }
      }
      setProgress(40);

      const id = generateUUID();
      setStatusText("Storing metadata...");
      const record: any = {
        id,
        createdAt: Date.now(),
        companyName,
        jobTitle,
        jobDescription,
        resumePath: (resumeUpload as any).path,
        imagePath: imageUpload?.path || null,
        inputHash,
        version: "v1",
        meta: { fileName: selectedFile.name },
        status: "pending",
        feedback: null,
      };
      await puter.kv.set(`resume:${id}`, JSON.stringify(record));
      if (localAbort.aborted) return;
      setProgress(55);

      setStatusText("Analyzing resume...");
      const prompt = puter.ai.buildResumePrompt
        ? puter.ai.buildResumePrompt(jobTitle, jobDescription)
        : `Analyze resume for ${jobTitle}`;
      const feedback = await puter.ai.feedback(
        (resumeUpload as any).path,
        prompt
      );
      if (localAbort.aborted) return;
      setProgress(75);

      if (feedback) {
        const content: any = (feedback as any).message?.content;
        const raw =
          typeof content === "string" ? content : content?.[0]?.text || "";
        const parsed = puter.ai.parseResumeFeedback
          ? puter.ai.parseResumeFeedback(raw)
          : null;
        if (parsed) {
          if (inputHash && !parsed.meta.inputHash)
            parsed.meta.inputHash = inputHash; // augment
          record.feedback = parsed;
          record.status = "completed";
        } else {
          let cleaned = raw.trim();
          if (cleaned.startsWith("```")) {
            cleaned = cleaned
              .replace(/^```(?:json)?\s*/i, "")
              .replace(/```\s*$/, "");
          }
          try {
            record.feedback = JSON.parse(cleaned);
            record.status = "completed";
          } catch {
            record.feedback = { raw, error: "Failed to parse JSON" };
            record.status = "error";
          }
        }
      } else {
        record.feedback = { error: "No feedback returned" };
        record.status = "error";
      }

      await puter.kv.set(`resume:${id}`, JSON.stringify(record));
      // update hash index mapping (append id) if hash available
      if (inputHash) {
        const hashKey = `resume_hash:${inputHash}`;
        try {
          const existing = await puter.kv.get(hashKey);
          if (existing) {
            try {
              const arr = JSON.parse(existing);
              if (Array.isArray(arr)) {
                if (!arr.includes(id)) {
                  arr.push(id);
                  await puter.kv.set(hashKey, JSON.stringify(arr));
                }
              } else {
                await puter.kv.set(hashKey, JSON.stringify([id]));
              }
            } catch {
              await puter.kv.set(hashKey, JSON.stringify([id]));
            }
          } else {
            await puter.kv.set(hashKey, JSON.stringify([id]));
          }
        } catch {
          /* ignore */
        }
      }

      setProgress(90);
      if (localAbort.aborted) return;

      setStatusText("Done. Redirecting...");
      setProgress(100);
      setTimeout(() => {
        if (!localAbort.aborted) navigate(`/resume/${id}`);
      }, 600);
    } catch (e: any) {
      if (!localAbort.aborted) {
        setError(e?.message || "Analysis failed");
        setStatusText("");
      }
    } finally {
      if (!localAbort.aborted) setIsProcessing(false);
    }
  };

  const canAnalyze =
    !!selectedFile && !isProcessing && jobTitle.trim().length > 0;

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    handleFiles(e.dataTransfer.files);
  };
  const onChoose = () => inputRef.current?.click();

  return (
    <div className="min-h-screen bg-background" aria-busy={isProcessing}>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-4">Upload Your Resume</h1>
            <p className="text-muted-foreground">
              Get instant AI-powered feedback on your resume in seconds
            </p>
          </div>

          <div className="bg-card rounded-lg border p-8">
            <div
              onDrop={onDrop}
              onDragOver={(e) => e.preventDefault()}
              className="border-2 border-dashed border-border rounded-lg p-12 text-center hover:border-primary/50 transition-colors"
            >
              <div className="mb-4">
                <svg
                  className="mx-auto h-12 w-12 text-muted-foreground"
                  stroke="currentColor"
                  fill="none"
                  viewBox="0 0 48 48"
                >
                  <path
                    d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>

              <>
                <p className="text-lg font-medium mb-2">
                  Drop your resume here
                </p>
                <p className="text-muted-foreground mb-4">
                  or click to browse files
                </p>
                <p className="text-sm text-muted-foreground">
                  Supports PDF, DOC, and DOCX files (max 10MB)
                </p>
                <div className="mt-6 grid gap-4 text-left">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Company Name (optional)
                    </label>
                    <input
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                      placeholder="Acme Inc"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Job Title *
                    </label>
                    <input
                      required
                      value={jobTitle}
                      onChange={(e) => setJobTitle(e.target.value)}
                      className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                      placeholder="Frontend Engineer"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Job Description (paste snippet)
                    </label>
                    <textarea
                      value={jobDescription}
                      onChange={(e) => setJobDescription(e.target.value)}
                      rows={4}
                      className="w-full rounded-md border bg-background px-3 py-2 text-sm resize-none"
                      placeholder="Responsibilities, required skills..."
                    />
                  </div>
                </div>

                <input
                  ref={inputRef}
                  type="file"
                  className="hidden"
                  id="resume-upload"
                  accept=".pdf,.doc,.docx"
                  onChange={(e) => handleFiles(e.target.files)}
                />
                {!selectedFile && (
                  <div className="mt-4 flex justify-center">
                    <Button onClick={onChoose} className="px-6 py-2">
                      {isProcessing ? "Uploading..." : "Choose File"}
                    </Button>
                  </div>
                )}
                {selectedFile && (
                  <div className="mt-6 flex flex-col gap-3">
                    <Button
                      disabled={!canAnalyze}
                      onClick={analyze}
                      className="w-full"
                      variant="secondary"
                    >
                      {isProcessing
                        ? statusText || "Analyzing..."
                        : "Analyze Resume"}
                    </Button>
                  </div>
                )}
              </>

              {selectedFile && (
                <div className="mt-6">
                  <div className="text-left mb-2">
                    <p className="font-medium">Selected file</p>
                    <p className="text-sm text-muted-foreground truncate">
                      {selectedFile.name} •{" "}
                      {(selectedFile.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                  {previewUrl ? (
                    <div className="mb-3">
                      <embed
                        src={previewUrl}
                        type="application/pdf"
                        className="w-full h-56 rounded"
                      />
                    </div>
                  ) : (
                    <div className="mb-3 text-sm text-muted-foreground">
                      Preview not available for this file type
                    </div>
                  )}

                  <div className="w-full bg-border rounded h-2 overflow-hidden">
                    <div
                      style={{ width: `${progress}%` }}
                      className="h-2 bg-primary transition-all"
                    />
                  </div>
                  {statusText && (
                    <p
                      className="mt-2 text-xs text-muted-foreground"
                      aria-live="polite"
                      role="status"
                    >
                      {statusText}
                    </p>
                  )}
                </div>
              )}

              {error && (
                <p className="text-sm text-destructive mt-4">{error}</p>
              )}
            </div>

            <div className="mt-8">
              <h3 className="font-semibold mb-4">What we analyze:</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm">ATS compatibility</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm">Content quality</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm">Formatting & structure</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm">Keyword optimization</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm">Industry best practices</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm">Grammar & spelling</span>
                </div>
              </div>
            </div>
          </div>

          <div className="text-center mt-6">
            <p className="text-sm text-muted-foreground">
              Your resume is processed securely and deleted after analysis
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
