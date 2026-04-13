"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createBrowserClient } from "@supabase/auth-helpers-nextjs";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const [tab, setTab] = useState<"login" | "signup">(
    searchParams.get("tab") === "signup" ? "signup" : "login"
  );
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [magicLinkSent, setMagicLinkSent] = useState(false);
  const [useMagicLink, setUseMagicLink] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (useMagicLink) {
        const { error } = await supabase.auth.signInWithOtp({
          email,
          options: { emailRedirectTo: `${window.location.origin}/series` },
        });
        if (error) throw error;
        setMagicLinkSent(true);
      } else if (tab === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: `${window.location.origin}/series` },
        });
        if (error) throw error;
        setMagicLinkSent(true);
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        router.push("/series");
        router.refresh();
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  if (magicLinkSent) {
    return (
      <div className="min-h-screen bg-parchment flex items-center justify-center px-6">
        <div className="max-w-md w-full text-center">
          <div className="text-5xl mb-6">✉️</div>
          <h1 className="font-serif text-3xl font-bold text-ink-blue mb-4">Check Your Email</h1>
          <p className="text-ink-muted mb-6">
            We&apos;ve sent a {tab === "signup" ? "confirmation" : "sign-in"} link to{" "}
            <strong className="text-ink-blue">{email}</strong>. Click the link to{" "}
            {tab === "signup" ? "activate your account" : "sign in"}.
          </p>
          <button
            onClick={() => { setMagicLinkSent(false); setEmail(""); }}
            className="text-amber hover:underline text-sm"
          >
            Use a different email
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-parchment flex items-center justify-center px-6 py-12">
      <div className="max-w-md w-full">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-1 mb-6">
            <span className="font-serif text-2xl font-bold text-ink-blue">Thread</span>
            <span className="font-serif text-2xl font-bold text-amber">Key</span>
          </Link>
          <h1 className="font-serif text-3xl font-bold text-ink-blue">
            {tab === "login" ? "Welcome Back" : "Begin Your Story"}
          </h1>
          <p className="text-ink-muted mt-2">
            {tab === "login"
              ? "Sign in to your ThreadKey account"
              : "Create your free account — 14-day trial included"}
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex bg-parchment-dark rounded-lg p-1 mb-6 border border-[#E2D9CC]">
          <button
            onClick={() => { setTab("login"); setError(null); }}
            className={`flex-1 py-2.5 text-sm font-medium rounded-md transition-all ${
              tab === "login"
                ? "bg-white text-ink-blue shadow-soft"
                : "text-ink-muted hover:text-ink-blue"
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => { setTab("signup"); setError(null); }}
            className={`flex-1 py-2.5 text-sm font-medium rounded-md transition-all ${
              tab === "signup"
                ? "bg-white text-ink-blue shadow-soft"
                : "text-ink-muted hover:text-ink-blue"
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-[#E2D9CC] shadow-soft p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-ink-blue mb-1.5">
              Email address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="you@example.com"
              className="w-full px-4 py-3 rounded-lg border border-[#E2D9CC] bg-parchment text-ink-blue placeholder-[#B8AFA3] focus:outline-none focus:border-ink-blue focus:ring-1 focus:ring-ink-blue transition-colors text-sm"
            />
          </div>

          {!useMagicLink && (
            <div>
              <label className="block text-sm font-medium text-ink-blue mb-1.5">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required={!useMagicLink}
                placeholder={tab === "signup" ? "Create a password (8+ characters)" : "Your password"}
                minLength={tab === "signup" ? 8 : undefined}
                className="w-full px-4 py-3 rounded-lg border border-[#E2D9CC] bg-parchment text-ink-blue placeholder-[#B8AFA3] focus:outline-none focus:border-ink-blue focus:ring-1 focus:ring-ink-blue transition-colors text-sm"
              />
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-amber text-white font-semibold py-3.5 rounded-lg hover:bg-amber-light transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading
              ? "Please wait..."
              : useMagicLink
              ? "Send Magic Link"
              : tab === "signup"
              ? "Create Account"
              : "Sign In"}
          </button>

          <div className="text-center">
            <button
              type="button"
              onClick={() => { setUseMagicLink(!useMagicLink); setError(null); }}
              className="text-sm text-amber hover:underline"
            >
              {useMagicLink
                ? "Use password instead"
                : "Sign in with magic link (no password)"}
            </button>
          </div>
        </form>

        <p className="text-center text-sm text-ink-muted mt-6">
          {tab === "login" ? "Don't have an account? " : "Already have an account? "}
          <button
            onClick={() => { setTab(tab === "login" ? "signup" : "login"); setError(null); }}
            className="text-amber hover:underline font-medium"
          >
            {tab === "login" ? "Start free trial" : "Sign in"}
          </button>
        </p>

        <p className="text-center text-xs text-ink-muted mt-4">
          <Link href="/" className="hover:underline">← Back to ThreadKey</Link>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-parchment flex items-center justify-center">
        <div className="text-ink-muted">Loading...</div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
