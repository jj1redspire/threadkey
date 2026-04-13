import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServerSupabase();
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: book } = await supabase
      .from("tk_books")
      .select("*, tk_series!inner(user_id)")
      .eq("id", params.id)
      .single();

    if (!book) {
      return NextResponse.json({ error: "Book not found" }, { status: 404 });
    }

    if (book.tk_series.user_id !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const [chars, locs, events] = await Promise.all([
      supabase
        .from("tk_characters")
        .select("id", { count: "exact", head: true })
        .eq("series_id", book.series_id),
      supabase
        .from("tk_locations")
        .select("id", { count: "exact", head: true })
        .eq("series_id", book.series_id),
      supabase
        .from("tk_timeline_events")
        .select("id", { count: "exact", head: true })
        .eq("series_id", book.series_id),
    ]);

    return NextResponse.json({
      book_id: book.id,
      status: book.processing_status,
      character_count: chars.count || 0,
      location_count: locs.count || 0,
      event_count: events.count || 0,
      chapter_count: book.chapter_count || 0,
    });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Server error" },
      { status: 500 }
    );
  }
}
