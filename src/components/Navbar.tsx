"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/auth-helpers-nextjs";
import { Settings, LogOut, Library } from "lucide-react";

interface NavbarProps {
  userEmail?: string;
}

export default function Navbar({ userEmail }: NavbarProps) {
  const router = useRouter();
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  return (
    <nav className="bg-ink-blue text-white border-b border-[#2A5080]">
      <div className="max-w-dashboard mx-auto px-6 h-14 flex items-center justify-between">
        {/* Logo */}
        <Link href="/series" className="flex items-center gap-1">
          <span className="font-serif text-lg font-bold text-white">Thread</span>
          <span className="font-serif text-lg font-bold text-amber">Key</span>
        </Link>

        {/* Nav links */}
        <div className="flex items-center gap-6">
          <Link
            href="/series"
            className="flex items-center gap-2 text-sm font-medium text-blue-200 hover:text-white transition-colors"
          >
            <Library size={16} />
            <span className="hidden sm:inline">My Series</span>
          </Link>
          <Link
            href="/settings"
            className="flex items-center gap-2 text-sm font-medium text-blue-200 hover:text-white transition-colors"
          >
            <Settings size={16} />
            <span className="hidden sm:inline">Settings</span>
          </Link>
        </div>

        {/* User info + sign out */}
        <div className="flex items-center gap-3">
          {userEmail && (
            <span className="hidden md:block text-xs text-blue-300 truncate max-w-[200px]">
              {userEmail}
            </span>
          )}
          <button
            onClick={handleSignOut}
            className="flex items-center gap-1.5 text-sm text-blue-300 hover:text-white transition-colors px-3 py-1.5 rounded hover:bg-white/10"
          >
            <LogOut size={15} />
            <span className="hidden sm:inline">Sign Out</span>
          </button>
        </div>
      </div>
    </nav>
  );
}
