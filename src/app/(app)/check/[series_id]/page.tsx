"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { AlertTriangle, CheckCircle, ArrowLeft, Loader2, X } from "lucide-react";
import type { ContinuityFlag } from "@/types";

const PLACEHOLDER = `Paste your new chapter text here...

Example:
Kael adjusted his silver ring — a habit from childhood — as he surveyed the battlefield. The east gate of Varenhold loomed ahead, its ancient hinges groaning in the wind. Elara stood beside him, her gray eyes scanning the treeline.`;

export default function CheckPage() {
  const params = useParams();
  const seriesId = params.series_id as string;

  const [chapterText, setChapterText] = useState("");
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState("");
  const [flags, setFlags] = useState<ContinuityFlag[]>([]);
  const [confirmed, setConfirmed] = useState(0);
  const [contradictions, setContradictions] = useState(0);
  const [dismissed, setDismissed] = useState<Set<number>>(new Set());
  const [hasResults, setHasResults] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCheck = async () => {
    if (!chapterText.trim() || loading) return;
    setLoading(true);
    setHasResults(false);
    setFlags([]);
    setDismissed(new Set());
    setError(null);

    // Simulate progress stages
    const stages = [
      "Extracting factual claims...",
      "Generating semantic embeddings...",
      "Cross-referencing against manuscripts...",
      "Analyzing for contradictions...",
      "Compiling results...",
    ];
    let stageIdx = 0;
    const progressInterval = setInterval(() => {
      setProgress(stages[Math.min(stageIdx++, stages.length - 1)]);
    }, 1500);

    try {
      const res = await fetch("/api/check-continuity", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chapter_text: chapterText, series_id: seriesId }),
      });
      const data = await res.json();
      clearInterval(progressInterval);

      if (!res.ok) throw new Error(data.error || "Check failed");

      setFlags(data.flags || []);
      setConfirmed(data.confirmed_count || 0);
      setContradictions(data.contradiction_count || 0);
      setHasResults(true);
    } catch (err: unknown) {
      clearInterval(progressInterval);
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
      setProgress("");
    }
  };

  const dismissFlag = (index: number) => {
    setDismissed((prev) => {
      const next = new Set(Array.from(prev));
      next.add(index);
      return next;
    });
  };

  const activeFlags = flags.filter((_, i) => !dismissed.has(i));
  const possibleCount = flags.filter(f => f.status === 'no_data').length;

  const cardStyles: Record<string, string> = {
    contradiction: "border-l-red-500 bg-red-50",
    no_data: "border-l-amber bg-amber-pale",
    confirmed: "border-l-green-500 bg-green-50",
  };

  const cardIconStyles: Record<string, React.ReactNode> = {
    contradiction: <AlertTriangle size={15} className="text-red-500 mt-0.5 flex-shrink-0" />,
    no_data: <AlertTriangle size={15} className="text-amber mt-0.5 flex-shrink-0" />,
    confirmed: <CheckCircle size={15} className="text-green-600 mt-0.5 flex-shrink-0" />,
  };

  const cardLabelStyles: Record<string, string> = {
    contradiction: "text-red-800",
    no_data: "text-amber",
    confirmed: "text-green-800",
  };

  const cardTextStyles: Record<string, string> = {
    contradiction: "text-red-700",
    no_data: "text-amber/90",
    confirmed: "text-green-700",
  };

  return (
    <div className="max-w-reading mx-auto px-6 py-10">
      <Link
        href={`/series/${seriesId}`}
        className="inline-flex items-center gap-2 text-sm text-ink-muted hover:text-ink-blue transition-colors mb-6"
      >
        <ArrowLeft size={16} />
        Back to Series
      </Link>

      <h1 className="font-serif text-3xl font-bold text-ink-blue mb-2">Continuity Checker</h1>
      <p className="text-ink-muted mb-8">
        Paste a new chapter below. ThreadKey will cross-reference every factual claim against your uploaded books.
      </p>

      {/* Input area */}
      <div className="bg-white border border-[#E2D9CC] rounded-xl shadow-soft p-5 mb-6">
        <label className="block text-sm font-medium text-ink-blue mb-3">
          Paste your new chapter here
        </label>
        <textarea
          value={chapterText}
          onChange={(e) => setChapterText(e.target.value)}
          rows={14}
          placeholder={PLACEHOLDER}
          className="w-full bg-parchment text-ink-blue placeholder-[#B8AFA3] rounded-lg border border-[#E2D9CC] px-4 py-3 text-sm leading-relaxed focus:outline-none focus:border-ink-blue resize-none font-serif"
        />
        <div className="flex items-center justify-between mt-4">
          <span className="text-xs text-ink-muted">
            {chapterText.split(/\s+/).filter(Boolean).length} words
          </span>
          <button
            onClick={handleCheck}
            disabled={loading || !chapterText.trim()}
            className="flex items-center gap-2 bg-amber text-white font-semibold px-6 py-2.5 rounded-lg hover:bg-amber-light transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? (
              <><Loader2 size={15} className="animate-spin" /> Checking...</>
            ) : (
              <><AlertTriangle size={15} /> Check for Continuity</>
            )}
          </button>
        </div>
      </div>

      {/* Progress */}
      {loading && (
        <div className="bg-white border border-[#E2D9CC] rounded-xl p-6 shadow-soft text-center mb-6">
          <Loader2 size={32} className="text-amber mx-auto mb-3 animate-spin" />
          <p className="text-ink-blue font-medium">{progress || "Analyzing..."}</p>
          <p className="text-xs text-ink-muted mt-1">
            Cross-referencing against all uploaded books and known facts
          </p>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-5 py-4 text-red-700 text-sm mb-6">
          {error}
        </div>
      )}

      {/* Results */}
      {hasResults && (
        <div>
          {/* Summary bar */}
          <div className="flex items-center flex-wrap gap-4 bg-white border border-[#E2D9CC] rounded-xl px-5 py-4 shadow-soft mb-5">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
              <span className="text-sm font-semibold text-red-700">
                {contradictions} contradiction{contradictions !== 1 ? "s" : ""}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-amber" />
              <span className="text-sm font-semibold text-amber">
                {possibleCount} possible issue{possibleCount !== 1 ? "s" : ""}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
              <span className="text-sm font-semibold text-green-700">
                {confirmed} confirmed consistent
              </span>
            </div>
            {dismissed.size > 0 && (
              <span className="text-xs text-ink-muted ml-auto">
                {dismissed.size} dismissed
              </span>
            )}
          </div>

          {flags.length === 0 && (
            <div className="text-center py-12 bg-green-50 border border-green-200 rounded-xl">
              <CheckCircle size={40} className="text-green-600 mx-auto mb-3" />
              <h3 className="font-serif text-xl font-bold text-green-800 mb-2">
                No Issues Found
              </h3>
              <p className="text-green-700 text-sm">
                This chapter appears consistent with your previous books.
              </p>
            </div>
          )}

          {/* Flag cards */}
          <div className="space-y-3">
            {/* Contradictions first */}
            {activeFlags
              .sort((a, b) => {
                const order = { contradiction: 0, no_data: 1, confirmed: 2 };
                return (order[a.status] || 2) - (order[b.status] || 2);
              })
              .map((flag, i) => {
                const originalIndex = flags.indexOf(flag);
                return (
                  <div
                    key={i}
                    className={`border-l-4 rounded-r-xl p-5 ${cardStyles[flag.status] || cardStyles.confirmed} ${
                      flag.status === "contradiction" ? "pulse-contradiction" : ""
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-2 flex-1 min-w-0">
                        {cardIconStyles[flag.status]}
                        <div className="flex-1 min-w-0">
                          <div className={`text-sm font-semibold mb-1 ${cardLabelStyles[flag.status]}`}>
                            {flag.status === "contradiction"
                              ? "Contradiction"
                              : flag.status === "no_data"
                              ? "Possible Issue"
                              : "Confirmed Consistent"}
                          </div>
                          <p className={`text-sm leading-relaxed mb-2 ${cardTextStyles[flag.status]}`}>
                            <span className="font-medium italic">&ldquo;{flag.claim}&rdquo;</span>
                          </p>
                          <p className={`text-xs leading-relaxed ${cardTextStyles[flag.status]}`}>
                            {flag.explanation}
                          </p>
                          {flag.source && (
                            <span className="source-badge mt-2 inline-block">{flag.source}</span>
                          )}
                          {flag.existing_value && (
                            <p className={`text-xs mt-2 ${cardTextStyles[flag.status]}`}>
                              <span className="font-medium">Previously established:</span>{" "}
                              {flag.existing_value}
                            </p>
                          )}
                        </div>
                      </div>
                      {flag.status !== "confirmed" && (
                        <button
                          onClick={() => dismissFlag(originalIndex)}
                          title="Dismiss (intentional plot point)"
                          className="flex-shrink-0 text-ink-muted/50 hover:text-ink-muted transition-colors mt-0.5"
                        >
                          <X size={16} />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}
    </div>
  );
}
