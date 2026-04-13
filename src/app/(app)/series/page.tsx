import { notFound } from "next/navigation";
import Link from "next/link";
import { Plus, BookOpen, Users, MapPin, Clock } from "lucide-react";
import { createServerSupabase } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

export default async function SeriesListPage() {
  const supabase = createServerSupabase();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) notFound();

  // Fetch all series for user
  const { data: series } = await supabase
    .from("tk_series")
    .select("*")
    .eq("user_id", session.user.id)
    .order("created_at", { ascending: false });

  // For each series, get counts
  const seriesWithCounts = await Promise.all(
    (series || []).map(async (s) => {
      const [books, chars, locs, events] = await Promise.all([
        supabase.from("tk_books").select("id", { count: "exact", head: true }).eq("series_id", s.id),
        supabase.from("tk_characters").select("id", { count: "exact", head: true }).eq("series_id", s.id),
        supabase.from("tk_locations").select("id", { count: "exact", head: true }).eq("series_id", s.id),
        supabase.from("tk_timeline_events").select("id", { count: "exact", head: true }).eq("series_id", s.id),
      ]);
      return {
        ...s,
        book_count: books.count || 0,
        character_count: chars.count || 0,
        location_count: locs.count || 0,
        event_count: events.count || 0,
      };
    })
  );

  return (
    <div className="max-w-dashboard mx-auto px-6 py-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-serif text-3xl font-bold text-ink-blue">My Series</h1>
          <p className="text-ink-muted mt-1">Your fiction universe, organized.</p>
        </div>
        <Link
          href="/series/new"
          className="flex items-center gap-2 bg-amber text-white font-semibold px-5 py-2.5 rounded-lg hover:bg-amber-light transition-colors shadow-sm"
        >
          <Plus size={18} />
          New Series
        </Link>
      </div>

      {/* Empty state */}
      {seriesWithCounts.length === 0 && (
        <div className="text-center py-24 bg-white rounded-xl border border-[#E2D9CC] shadow-soft">
          <div className="text-6xl mb-4">📚</div>
          <h2 className="font-serif text-2xl font-bold text-ink-blue mb-3">
            Your library is empty
          </h2>
          <p className="text-ink-muted mb-8 max-w-sm mx-auto">
            Start your first series and upload your manuscripts. ThreadKey will build your series bible automatically.
          </p>
          <Link
            href="/series/new"
            className="inline-flex items-center gap-2 bg-amber text-white font-semibold px-6 py-3 rounded-lg hover:bg-amber-light transition-colors"
          >
            <Plus size={18} />
            Start Your First Series
          </Link>
        </div>
      )}

      {/* Series grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {seriesWithCounts.map((s) => (
          <Link
            key={s.id}
            href={`/series/${s.id}`}
            className="block bg-white border border-[#E2D9CC] rounded-xl p-6 shadow-soft hover:shadow-card hover:border-ink-blue/30 transition-all group"
          >
            {/* Genre badge */}
            {s.genre && (
              <span className="inline-block px-2.5 py-1 bg-amber-pale text-amber text-xs font-medium rounded-full mb-4">
                {s.genre}
              </span>
            )}
            <h3 className="font-serif text-xl font-bold text-ink-blue mb-2 group-hover:text-amber transition-colors">
              {s.name}
            </h3>
            {s.description && (
              <p className="text-ink-muted text-sm leading-relaxed mb-4 line-clamp-2">
                {s.description}
              </p>
            )}
            {/* Counts */}
            <div className="grid grid-cols-2 gap-3 pt-4 border-t border-[#E2D9CC]">
              <div className="flex items-center gap-2 text-sm text-ink-muted">
                <BookOpen size={14} className="text-ink-blue/60" />
                <span>{s.book_count} {s.book_count === 1 ? "book" : "books"}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-ink-muted">
                <Users size={14} className="text-ink-blue/60" />
                <span>{s.character_count} characters</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-ink-muted">
                <MapPin size={14} className="text-ink-blue/60" />
                <span>{s.location_count} locations</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-ink-muted">
                <Clock size={14} className="text-ink-blue/60" />
                <span>{s.event_count} events</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
