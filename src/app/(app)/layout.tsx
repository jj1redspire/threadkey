import { redirect } from "next/navigation";
import Navbar from "@/components/Navbar";
import { createServerSupabase } from "@/lib/supabase-server";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createServerSupabase();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-parchment flex flex-col">
      <Navbar userEmail={session.user.email} />
      <main className="flex-1">{children}</main>
    </div>
  );
}
