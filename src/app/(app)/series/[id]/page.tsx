import { notFound } from "next/navigation";
import Link from "next/link";
import { BookOpen, Users, MapPin, Clock, Scroll, Upload, Search, AlertTriangle, ArrowLeft } from "lucide-react";
import { createServerSupabase } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

interface PageProps {
  params: { id: string };
}

export default async function SeriesDetailPage({ params }: PageProps) {
  const supabase = createServerSupabase();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) notFound();

  const { data: series } = await supabase
    .from("tk_series")
    .select("*")
    .eq("id", params.id)
    .eq("user_id", session.user.id)
    .single();

  if (!series) notFound();

  // Fetch counts and recent books
  const [books, chars, locs, events, worldRules] = await Promise.all([
    supabase.from("tk_books").select("*").eq("series_id", params.id).order("book_number"),
    supabase.from("tk_characters").select("id", { count: "exact", head: true }).eq("series_id", params.id),
    supabase.from("tk_locations").select("id", { count: "exact", head: true }).eq("series_id", params.id),
    supabase.from("tk_timeline_events").select("id", { count: "exact", head: true }).eq("series_id", params.id),
    supabase.from("tk_world_rules").select("id", { count: "exact", head: true }).eq("series_id", params.id),
  ]);

  const stats = [
    { label: "Books Uploaded", value: books.data?.length || 0, icon: <BookOpen size={20} /> },
    { label: "Characters", value: chars.count || 0, icon: <Users size={20} /> },
    { label: "Locations", value: locs.count || 0, icon: <MapPin size={20} /> },
    { label: "Timeline Events", value: events.count || 0, icon: <Clock size={20} /> },
    { label: "World Rules", value: worldRules.count || 0, icon: <Scroll size={20} /> },
  ];

  const quickActions = [
    {
      title: "Upload Manuscript",
      description: "Add a new book to your series",
      icon: <Upload size={24} className="text-ink-blue" />,
      href: `/upload/${params.id}`,
      color: "border-ink-blue/20 hover:border-ink-blue/40",
    },
    {
      title: "Series Bible",
      description: "Browse characters, locations, timeline",
      icon: <BookOpen size={24} className="text-amber" />,
      href: `/bible/${params.id}`,
      color: "border-amber/20 hover:border-amber/40",
    },
    {
      title: "Ask a Question",
      description: "Query your manuscripts in plain English",
      icon: <Search size={24} className="text-green-600" />,
      href: `/query/${params.id}`,
      color: "border-green-500/20 hover:border-green-500/40",
    },
    {
      title: "Check Continuity",
      description: "Paste a new chapter, find contradictions",
      icon: <AlertTriangle size={24} className="text-red-500" />,
      href: `/check/${params.id}`,
      color: "border-red-400/20 hover:border-red-400/40",
    },
  ];

  const statusColors: Record<string, string> = {
    pending: "bg-slate-100 text-slate-600",
    processing: "bg-blue-100 text-blue-700",
    complete: "bg-green-100 text-green-700",
    error: "bg-red-100 text-red-700",
  };

  return (
    <div className="max-w-dashboard mx-auto px-6 py-10">
      {/* Back link */}
      <Link
        href="/series"
        className="inline-flex items-center gap-2 text-sm text-ink-muted hover:text-ink-blue transition-colors mb-6"
      >
        <ArrowLeft size={16} />
        All Series
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          {series.genre && (
            <span className="inline-block px-2.5 py-1 bg-amber-pale text-amber text-xs font-medium rounded-full mb-3">
              {series.genre}
            </span>
          )}
          <h1 className="font-serif text-3xl font-bold text-ink-blue">{series.name}</h1>
          {series.description && (
            <p className="text-ink-muted mt-2 max-w-xl">{series.description}</p>
          )}
        </div>
        <Link
          href={`/upload/${params.id}`}
          className="flex items-center gap-2 bg-amber text-white font-semibold px-5 py-2.5 rounded-lg hover:bg-amber-light transition-colors shadow-sm"
        >
          <Upload size={16} />
          Upload Book
        </Link>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-10">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white border border-[#E2D9CC] rounded-xl p-4 shadow-soft">
            <div className="flex items-center gap-2 text-ink-muted mb-2">
              <span className="text-ink-blue/60">{stat.icon}</span>
            </div>
            <div className="font-serif text-2xl font-bold text-ink-blue">{stat.value}</div>
            <div className="text-xs text-ink-muted mt-0.5">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <h2 className="font-serif text-xl font-bold text-ink-blue mb-4">Quick Actions</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {quickActions.map((action) => (
          <Link
            key={action.title}
            href={action.href}
            className={`block bg-white border-2 ${action.color} rounded-xl p-5 shadow-soft hover:shadow-card transition-all group`}
          >
            <div className="mb-3">{action.icon}</div>
            <h3 className="font-medium text-ink-blue mb-1 group-hover:text-amber transition-colors">
              {action.title}
            </h3>
            <p className="text-xs text-ink-muted">{action.description}</p>
          </Link>
        ))}
      </div>

      {/* Books list */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-serif text-xl font-bold text-ink-blue">Uploaded Books</h2>
        <Link
          href={`/upload/${params.id}`}
          className="text-sm text-amber hover:underline"
        >
          + Add book
        </Link>
      </div>

      {(!books.data || books.data.length === 0) ? (
        <div className="text-center py-16 bg-white rounded-xl border border-[#E2D9CC] border-dashed">
          <BookOpen size={40} className="text-ink-muted/40 mx-auto mb-4" />
          <p className="text-ink-muted mb-4">No books uploaded yet.</p>
          <Link
            href={`/upload/${params.id}`}
            className="inline-flex items-center gap-2 bg-amber text-white text-sm font-semibold px-5 py-2.5 rounded-lg hover:bg-amber-light transition-colors"
          >
            <Upload size={15} />
            Upload Your First Book
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {books.data.map((book) => (
            <div
              key={book.id}
              className="flex items-center justify-between bg-white border border-[#E2D9CC] rounded-xl px-5 py-4 shadow-soft"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-ink-blue/10 flex items-center justify-center font-serif font-bold text-ink-blue text-sm">
                  {book.book_number}
                </div>
                <div>
                  <div className="font-medium text-ink-blue">{book.title}</div>
                  <div className="text-xs text-ink-muted mt-0.5">
                    {book.chapter_count ? `${book.chapter_count} chapters` : "Processing..."}
                    {" · "}
                    {new Date(book.uploaded_at).toLocaleDateString()}
                  </div>
                </div>
              </div>
              <span
                className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusColors[book.processing_status] || statusColors.pending}`}
              >
                {book.processing_status}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
