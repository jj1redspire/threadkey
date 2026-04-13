import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  { params }: { params: { series_id: string } }
) {
  try {
    const supabase = createServerSupabase();
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: series } = await supabase
      .from("tk_series")
      .select("id")
      .eq("id", params.series_id)
      .eq("user_id", session.user.id)
      .single();

    if (!series) {
      return NextResponse.json({ error: "Series not found" }, { status: 404 });
    }

    const { data, error } = await supabase
      .from("tk_world_rules")
      .select("*")
      .eq("series_id", params.series_id)
      .order("category");

    if (error) throw error;
    return NextResponse.json(data || []);
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Server error" },
      { status: 500 }
    );
  }
}
