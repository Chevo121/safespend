"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Check,
  CopyX,
  ImagePlus,
  Loader2,
  Lock,
  RefreshCw,
  ScanLine,
  Wand2
} from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Card } from "@/components/ui";
import { toTransactions, type ExtractedTransaction } from "@/lib/extract-map";
import { useStore, type ImportResult } from "@/lib/store";

const steps = [
  "Reading screenshot…",
  "Detecting transaction rows…",
  "Extracting merchants and amounts…",
  "Checking for duplicates…",
  "Applying your saved rules…"
];

const CODE_KEY = "safespend.accessCode";

// Downscale to a reasonable size and re-encode to JPEG. This shrinks the
// upload and, on iOS, converts HEIC photos to something the API accepts.
async function fileToJpegBase64(
  file: File,
  maxDim = 1600
): Promise<{ media_type: string; data: string }> {
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = () => reject(new Error("Could not read that image."));
      image.src = url;
    });

    const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(img.width * scale);
    canvas.height = Math.round(img.height * scale);
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      throw new Error("Could not process that image.");
    }
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
    return { media_type: "image/jpeg", data: dataUrl.split(",")[1] };
  } finally {
    URL.revokeObjectURL(url);
  }
}

export default function UploadPage() {
  const { pendingCount, importTransactions, importNextBatch, resetDemo } = useStore();
  const [phase, setPhase] = useState<"idle" | "scanning" | "done" | "error">("idle");
  const [stepIndex, setStepIndex] = useState(0);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [error, setError] = useState("");
  const [needsCode, setNeedsCode] = useState(false);
  const [codeInput, setCodeInput] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    const pending = timers.current;
    return () => pending.forEach(clearTimeout);
  }, []);

  function runSteps() {
    setStepIndex(0);
    steps.forEach((_, index) => {
      timers.current.push(setTimeout(() => setStepIndex(index), index * 700));
    });
  }

  async function handleFile(file: File) {
    setPhase("scanning");
    setError("");
    runSteps();

    let image: { media_type: string; data: string };
    try {
      image = await fileToJpegBase64(file);
    } catch {
      setError("Couldn't read that image. Try a PNG or JPEG screenshot.");
      setPhase("error");
      return;
    }

    const code = (() => {
      try {
        return localStorage.getItem(CODE_KEY) ?? "";
      } catch {
        return "";
      }
    })();

    try {
      const response = await fetch("/api/extract", {
        method: "POST",
        headers: { "content-type": "application/json", "x-access-code": code },
        body: JSON.stringify({ image })
      });

      if (response.status === 401) {
        setNeedsCode(true);
        setPhase("idle");
        return;
      }

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        setError(payload.error ?? "Extraction failed. Please try again.");
        setPhase("error");
        return;
      }

      const payload = (await response.json()) as { transactions: ExtractedTransaction[] };
      if (!payload.transactions?.length) {
        setError("No transactions found in that image. Try a clearer screenshot.");
        setPhase("error");
        return;
      }

      setResult(importTransactions(toTransactions(payload.transactions)));
      setPhase("done");
    } catch {
      setError("Couldn't reach the server. Check your connection and try again.");
      setPhase("error");
    }
  }

  function onPick(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (file) {
      void handleFile(file);
    }
  }

  function saveCode() {
    const value = codeInput.trim();
    if (!value) {
      return;
    }
    try {
      localStorage.setItem(CODE_KEY, value);
    } catch {
      // Non-persistent is fine; they can re-enter.
    }
    setNeedsCode(false);
    setCodeInput("");
  }

  function loadSample() {
    const outcome = importNextBatch();
    setResult(outcome);
    setPhase(outcome ? "done" : "error");
    if (!outcome) {
      setError("Sample already loaded. Reset demo data to replay it.");
    }
  }

  return (
    <AppShell title="Upload" subtitle="Turn an ARQ screenshot into reviewed spending">
      <input
        ref={fileRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/heic"
        className="hidden"
        onChange={onPick}
      />

      {needsCode ? (
        <Card className="mb-4 border-amber-500/30 bg-amber-500/[0.07] dark:bg-amber-500/10">
          <div className="flex items-center gap-2 font-semibold">
            <Lock className="size-4 text-amber-700 dark:text-amber-400" aria-hidden="true" />
            Enter your access code
          </div>
          <p className="mt-1 text-sm text-ink/55 dark:text-cloud/55">
            One-time — it unlocks screenshot extraction on this device.
          </p>
          <form
            onSubmit={(event) => {
              event.preventDefault();
              saveCode();
            }}
            className="mt-3 flex items-center gap-2"
          >
            <input
              value={codeInput}
              onChange={(event) => setCodeInput(event.target.value)}
              placeholder="Access code"
              className="min-h-10 flex-1 rounded-full border border-black/10 bg-white px-4 text-sm outline-none focus:border-emerald-500/60 dark:border-white/15 dark:bg-white/[0.06]"
            />
            <button
              type="submit"
              className="min-h-10 rounded-full bg-ink px-4 text-sm font-semibold text-white dark:bg-cloud dark:text-ink"
            >
              Save
            </button>
          </form>
        </Card>
      ) : null}

      {phase === "idle" ? (
        <>
          <button
            onClick={() => fileRef.current?.click()}
            className="grid w-full place-items-center gap-3 rounded-3xl border-2 border-dashed border-black/15 bg-white/60 px-6 py-14 text-center transition hover:border-emerald-500/50 hover:bg-emerald-500/[0.04] active:scale-[0.99] dark:border-white/15 dark:bg-white/[0.03] dark:hover:border-emerald-400/50"
          >
            <span className="grid size-14 place-items-center rounded-2xl bg-emerald-500/12 text-emerald-600 dark:text-emerald-400">
              <ImagePlus className="size-7" aria-hidden="true" />
            </span>
            <span>
              <span className="block text-lg font-semibold">Add a screenshot</span>
              <span className="mt-1 block text-sm text-ink/50 dark:text-cloud/50">
                Duplicates from earlier screenshots are removed automatically
              </span>
            </span>
            <span className="mt-1 inline-flex min-h-10 items-center rounded-full bg-ink px-5 text-sm font-semibold text-white dark:bg-cloud dark:text-ink">
              Choose screenshot
            </span>
          </button>
          <p className="mt-4 px-1 text-center text-xs leading-5 text-ink/40 dark:text-cloud/40">
            Your screenshot is sent once to read the transactions — it isn&apos;t stored.
          </p>
          <div className="mt-4 flex items-center justify-center gap-4 text-sm font-semibold">
            <button
              onClick={loadSample}
              className="text-ink/50 transition hover:text-ink dark:text-cloud/50 dark:hover:text-cloud"
            >
              Try sample data
            </button>
            <button
              onClick={resetDemo}
              className="flex items-center gap-1.5 text-ink/50 transition hover:text-ink dark:text-cloud/50 dark:hover:text-cloud"
            >
              <RefreshCw className="size-3.5" aria-hidden="true" />
              Reset
            </button>
          </div>
          {pendingCount > 0 ? (
            <Link href="/" className="mt-4 block">
              <Card className="flex items-center justify-between gap-3 transition active:scale-[0.99]">
                <span className="text-sm font-semibold">{pendingCount} to review on Home</span>
                <ArrowRight className="size-4 shrink-0 text-ink/35 dark:text-cloud/35" aria-hidden="true" />
              </Card>
            </Link>
          ) : null}
        </>
      ) : null}

      {phase === "scanning" ? (
        <Card className="p-6">
          <div className="flex items-center gap-3">
            <span className="grid size-12 place-items-center rounded-2xl bg-emerald-500/12 text-emerald-600 dark:text-emerald-400">
              <ScanLine className="size-6" aria-hidden="true" />
            </span>
            <div>
              <p className="font-semibold">Reading your screenshot</p>
              <p className="text-xs text-ink/45 dark:text-cloud/45">This takes a few seconds</p>
            </div>
          </div>
          <ul className="mt-5 space-y-3">
            {steps.map((step, index) => (
              <li key={step} className="flex items-center gap-2.5 text-sm">
                {index < stepIndex ? (
                  <Check className="size-4 shrink-0 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
                ) : index === stepIndex ? (
                  <Loader2 className="size-4 shrink-0 animate-spin text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
                ) : (
                  <span className="size-4 shrink-0 rounded-full border border-black/15 dark:border-white/20" />
                )}
                <span className={index <= stepIndex ? "text-ink dark:text-cloud" : "text-ink/35 dark:text-cloud/35"}>
                  {step}
                </span>
              </li>
            ))}
          </ul>
        </Card>
      ) : null}

      {phase === "error" ? (
        <Card className="border-rose-500/25 bg-rose-500/[0.06] p-6 text-center dark:bg-rose-500/10">
          <p className="font-semibold text-rose-700 dark:text-rose-300">{error}</p>
          <button
            onClick={() => {
              setPhase("idle");
              setError("");
            }}
            className="mx-auto mt-4 flex min-h-10 items-center gap-2 rounded-full bg-ink px-5 text-sm font-semibold text-white dark:bg-cloud dark:text-ink"
          >
            Try again
          </button>
        </Card>
      ) : null}

      {phase === "done" ? (
        <div className="space-y-4">
          <Card className="border-emerald-500/25 bg-emerald-500/[0.07] p-6 text-center">
            <span className="mx-auto grid size-12 place-items-center rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
              <Check className="size-6" aria-hidden="true" />
            </span>
            <p className="mt-3 text-lg font-bold">
              {result ? `${result.added} new since last upload` : "Already imported"}
            </p>
            {result ? (
              <div className="mx-auto mt-3 max-w-xs space-y-1.5 text-left text-sm text-ink/60 dark:text-cloud/60">
                {result.duplicatesRemoved > 0 ? (
                  <p className="flex items-center gap-2">
                    <CopyX className="size-4 shrink-0 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
                    {result.duplicatesRemoved} duplicates removed
                  </p>
                ) : null}
                {result.flaggedDuplicates > 0 ? (
                  <p className="flex items-center gap-2">
                    <CopyX className="size-4 shrink-0 text-amber-600 dark:text-amber-400" aria-hidden="true" />
                    {result.flaggedDuplicates} possible duplicate flagged
                  </p>
                ) : null}
                {result.autoCategorized > 0 ? (
                  <p className="flex items-center gap-2">
                    <Wand2 className="size-4 shrink-0 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
                    {result.autoCategorized} auto-categorized from your rules
                  </p>
                ) : null}
                {result.autoApproved > 0 ? (
                  <p className="flex items-center gap-2">
                    <Check className="size-4 shrink-0 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
                    {result.autoApproved} high-confidence auto-approved
                  </p>
                ) : null}
              </div>
            ) : null}
          </Card>
          <Link
            href="/"
            className="flex min-h-12 items-center justify-center gap-2 rounded-full bg-ink text-sm font-semibold text-white transition hover:opacity-90 active:scale-[0.99] dark:bg-cloud dark:text-ink"
          >
            {pendingCount > 0 ? `Review ${pendingCount} on Home` : "Back to Home"}
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </div>
      ) : null}
    </AppShell>
  );
}
