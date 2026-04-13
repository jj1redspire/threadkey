"use client";

import { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Search, ArrowLeft, Loader2, History } from "lucide-react";

interface QueryEntry {
  id: string;
  question: string;
  answer: string;
  sources: Array<{ book_number: number; chapter_number: number; excerpt: string }>;
  timestamp: Date;
}

const EXAMPLE_QUERIES = [
  "What does Elara look like?",
  "What is the magic system in this series?",
  "Who are the main antagonists and their motivations?",
  "What happened at the Battle of Varenhold?",
  "Describe the capital city",
  "What is the relationship between the two main characters?",
];

export default function QueryPage() {
  const params = useParams();
  const seriesId = params.series_id as string;

  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [currentResult, setCurrentResult] = useState<QueryEntry | null>(null);
  const [history, setHistory] = useState<QueryEntry[]>([]);
  const [displayedAnswer, setDisplayedAnswer] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const animateAnswer = (text: string) => {
    setDisplayedAnswer("");
    let i = 0;
    const interval = setInterval(() => {
      if (i >= text.length) {
        clearInterval(interval);
        return;
      }
      setDisplayedAnswer(text.slice(0, i + 1));
      i += 3; // speed up typing
    }, 12);
    return () => clearInterval(interval);
  };

  useEffect(() => {
    if (currentResult) {
      return animateAnswer(currentResult.answer);
    }
  }, [currentResult]);

  const handleSubmit = async (q?: string) => {
    const queryText = q || question;
    if (!queryText.trim() || loading) return;

    setLoading(true);
    setCurrentResult(null);
    setDisplayedAnswer("");

    try {
      const res = await fetch("/api/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: queryText, series_id: seriesId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Query failed");

      const entry: QueryEntry = {
        id: Date.now().toString(),
        question: queryText,
        answer: data.answer,
        sources: data.sources || [],
        timestamp: new Date(),
      };

      setCurrentResult(entry);
      setHistory((prev) => [entry, ...prev.slice(0, 19)]);
      setQuestion("");
    } catch (err: unknown) {
      setCurrentResult({
        id: Date.now().toString(),
        question: queryText,
        answer: `Error: ${err instanceof Error ? err.message : "Query failed"}`,
        sources: [],
        timestamp: new Date(),
      });
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="max-w-dashboard mx-auto px-6 py-10">
      <Link
        href={`/series/${seriesId}`}
        className="inline-flex items-center gap-2 text-sm text-ink-muted hover:text-ink-blue transition-colors mb-6"
      >
        <ArrowLeft size={16} />
        Back to Series
      </Link>

      <div className="flex gap-8">
        {/* Main content */}
        <div className="flex-1 min-w-0">
          <h1 className="font-serif text-3xl font-bold text-ink-blue mb-2">Ask Your Story</h1>
          <p className="text-ink-muted mb-6">
            Ask anything about your manuscripts in plain English. ThreadKey searches across all your books.
          </p>

          {/* Query input */}
          <div className="bg-white border border-[#E2D9CC] rounded-xl shadow-soft p-4 mb-6">
            <textarea
              ref={textareaRef}
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={handleKeyDown}
              rows={3}
              placeholder="Ask anything about your story... (Press Enter to search)"
              className="w-full bg-transparent text-ink-blue placeholder-[#B8AFA3] resize-none focus:outline-none text-base leading-relaxed"
            />
            <div className="flex items-center justify-between pt-3 border-t border-[#E2D9CC]">
              <p className="text-xs text-ink-muted">Press Enter to search · Shift+Enter for new line</p>
              <button
                onClick={() => handleSubmit()}
                disabled={loading || !question.trim()}
                className="flex items-center gap-2 bg-amber text-white font-semibold px-5 py-2 rounded-lg hover:bg-amber-light transition-colors disabled:opacity-60 text-sm"
              >
                {loading ? <Loader2 size={14} className="animate-spin" /> : <Search size={14} />}
                Search
              </button>
            </div>
          </div>

          {/* Example queries */}
          {!currentResult && !loading && (
            <div className="mb-8">
              <p className="text-xs font-medium text-ink-muted uppercase tracking-widest mb-3">
                Example queries
              </p>
              <div className="flex flex-wrap gap-2">
                {EXAMPLE_QUERIES.map((q) => (
                  <button
                    key={q}
                    onClick={() => { setQuestion(q); handleSubmit(q); }}
                    className="px-3 py-1.5 bg-white border border-[#E2D9CC] rounded-lg text-sm text-ink-muted hover:text-ink-blue hover:border-ink-blue/30 transition-colors"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Loading state */}
          {loading && (
            <div className="bg-white border border-[#E2D9CC] rounded-xl p-8 shadow-soft text-center">
              <Loader2 size={32} className="text-amber mx-auto mb-4 animate-spin" />
              <p className="text-ink-blue font-medium">Searching your manuscripts...</p>
              <p className="text-ink-muted text-sm mt-1">Cross-referencing all uploaded books</p>
            </div>
          )}

          {/* Result */}
          {currentResult && !loading && (
            <div className="bg-white border border-[#E2D9CC] rounded-xl shadow-soft overflow-hidden">
              <div className="px-6 py-4 border-b border-[#E2D9CC] bg-parchment">
                <p className="text-sm font-medium text-ink-blue">{currentResult.question}</p>
              </div>
              <div className="p-6">
                <div className="prose-bible typewriter-text">
                  <p className="text-ink-blue leading-relaxed whitespace-pre-wrap">
                    {displayedAnswer}
                  </p>
                </div>

                {/* Sources */}
                {currentResult.sources?.length > 0 && (
                  <div className="mt-6 pt-4 border-t border-[#E2D9CC]">
                    <p className="text-xs font-semibold text-ink-muted uppercase tracking-widest mb-3">
                      Sources
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {currentResult.sources.map((s, i) => (
                        <div key={i} className="group relative">
                          <span className="source-badge cursor-default">
                            Book {s.book_number}, Ch. {s.chapter_number}
                          </span>
                          {s.excerpt && (
                            <div className="absolute bottom-full left-0 mb-2 w-72 bg-ink-blue text-white text-xs rounded-lg p-3 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 leading-relaxed">
                              &ldquo;{s.excerpt.substring(0, 200)}...&rdquo;
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar — query history */}
        {history.length > 0 && (
          <div className="w-72 flex-shrink-0 hidden lg:block">
            <div className="bg-white border border-[#E2D9CC] rounded-xl shadow-soft overflow-hidden">
              <div className="px-4 py-3 border-b border-[#E2D9CC] flex items-center gap-2">
                <History size={14} className="text-ink-muted" />
                <span className="text-sm font-medium text-ink-blue">Query History</span>
              </div>
              <div className="overflow-y-auto max-h-[600px]">
                {history.map((entry) => (
                  <button
                    key={entry.id}
                    onClick={() => {
                      setCurrentResult(entry);
                      setQuestion(entry.question);
                    }}
                    className="w-full text-left px-4 py-3 hover:bg-parchment transition-colors border-b border-[#E2D9CC] last:border-b-0"
                  >
                    <p className="text-sm font-medium text-ink-blue line-clamp-2 mb-1">
                      {entry.question}
                    </p>
                    <p className="text-xs text-ink-muted line-clamp-1">
                      {entry.answer.substring(0, 80)}...
                    </p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
