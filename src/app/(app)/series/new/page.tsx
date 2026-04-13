"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

const GENRES = [
  "Fantasy",
  "Romance",
  "Sci-Fi",
  "Mystery/Thriller",
  "Historical Fiction",
  "Contemporary",
  "Horror",
  "Literary Fiction",
  "Other",
];

export default function NewSeriesPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [genre, setGenre] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/series", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), genre, description: description.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create series");
      router.push(`/series/${data.id}`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setLoading(false);
    }
  };

  return (
    <div className="max-w-reading mx-auto px-6 py-10">
      <Link
        href="/series"
        className="inline-flex items-center gap-2 text-sm text-ink-muted hover:text-ink-blue transition-colors mb-8"
      >
        <ArrowLeft size={16} />
        Back to My Series
      </Link>

      <h1 className="font-serif text-3xl font-bold text-ink-blue mb-2">New Series</h1>
      <p className="text-ink-muted mb-8">
        Create a container for your books. You&apos;ll upload manuscripts next.
      </p>

      <form onSubmit={handleSubmit} className="bg-white border border-[#E2D9CC] rounded-xl shadow-soft p-8 space-y-6">
        {/* Series name */}
        <div>
          <label className="block text-sm font-medium text-ink-blue mb-1.5">
            Series Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            placeholder="e.g., The Ashwood Chronicles"
            className="w-full px-4 py-3 rounded-lg border border-[#E2D9CC] bg-parchment text-ink-blue placeholder-[#B8AFA3] focus:outline-none focus:border-ink-blue focus:ring-1 focus:ring-ink-blue transition-colors"
          />
        </div>

        {/* Genre */}
        <div>
          <label className="block text-sm font-medium text-ink-blue mb-1.5">Genre</label>
          <select
            value={genre}
            onChange={(e) => setGenre(e.target.value)}
            className="w-full px-4 py-3 rounded-lg border border-[#E2D9CC] bg-parchment text-ink-blue focus:outline-none focus:border-ink-blue focus:ring-1 focus:ring-ink-blue transition-colors"
          >
            <option value="">Select a genre (optional)</option>
            {GENRES.map((g) => (
              <option key={g} value={g}>{g}</option>
            ))}
          </select>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-ink-blue mb-1.5">
            Description
            <span className="text-ink-muted font-normal ml-2 text-xs">(optional)</span>
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            placeholder="A brief description of your series — setting, premise, world..."
            className="w-full px-4 py-3 rounded-lg border border-[#E2D9CC] bg-parchment text-ink-blue placeholder-[#B8AFA3] focus:outline-none focus:border-ink-blue focus:ring-1 focus:ring-ink-blue transition-colors resize-none"
          />
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="flex items-center gap-4 pt-2">
          <button
            type="submit"
            disabled={loading || !name.trim()}
            className="bg-amber text-white font-semibold px-8 py-3 rounded-lg hover:bg-amber-light transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? "Creating..." : "Create Series"}
          </button>
          <Link
            href="/series"
            className="text-sm text-ink-muted hover:text-ink-blue transition-colors"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
