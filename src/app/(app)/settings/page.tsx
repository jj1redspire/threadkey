import { CreditCard, User, AlertTriangle } from "lucide-react";
import BillingButton from "./BillingButton";
import { createServerSupabase } from "@/lib/supabase-server";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const supabase = createServerSupabase();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) notFound();

  const { data: subscription } = await supabase
    .from("tk_subscriptions")
    .select("*")
    .eq("user_id", session.user.id)
    .single();

  const isPastDue = subscription?.status === "past_due";

  const statusLabel: Record<string, { label: string; color: string }> = {
    trialing: { label: "Free Trial", color: "bg-blue-100 text-blue-700" },
    active: { label: "Active", color: "bg-green-100 text-green-700" },
    past_due: { label: "Past Due", color: "bg-red-100 text-red-700" },
    canceled: { label: "Canceled", color: "bg-slate-100 text-slate-600" },
    inactive: { label: "Inactive", color: "bg-slate-100 text-slate-600" },
  };

  const statusInfo = statusLabel[subscription?.status || "inactive"] || statusLabel.inactive;

  return (
    <div className="max-w-reading mx-auto px-6 py-10">
      <h1 className="font-serif text-3xl font-bold text-ink-blue mb-8">Account Settings</h1>

      {/* Account info */}
      <div className="bg-white border border-[#E2D9CC] rounded-xl shadow-soft p-6 mb-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-full bg-ink-blue/10 flex items-center justify-center">
            <User size={18} className="text-ink-blue" />
          </div>
          <h2 className="font-serif text-lg font-bold text-ink-blue">Account</h2>
        </div>
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-ink-muted uppercase tracking-widest mb-1">
              Email Address
            </label>
            <p className="text-ink-blue">{session?.user.email}</p>
          </div>
          <div>
            <label className="block text-xs font-medium text-ink-muted uppercase tracking-widest mb-1">
              Member Since
            </label>
            <p className="text-ink-blue">
              {session?.user.created_at
                ? new Date(session.user.created_at).toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })
                : "—"}
            </p>
          </div>
        </div>
      </div>

      {/* Subscription */}
      <div className="bg-white border border-[#E2D9CC] rounded-xl shadow-soft p-6 mb-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-full bg-amber/10 flex items-center justify-center">
            <CreditCard size={18} className="text-amber" />
          </div>
          <h2 className="font-serif text-lg font-bold text-ink-blue">Subscription</h2>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-ink-muted text-sm">Status</span>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusInfo.color}`}>
              {statusInfo.label}
            </span>
          </div>

          {subscription?.current_period_end && (
            <div className="flex items-center justify-between">
              <span className="text-ink-muted text-sm">
                {subscription.status === "trialing" ? "Trial Ends" : "Next Billing Date"}
              </span>
              <span className="text-ink-blue text-sm">
                {new Date(subscription.current_period_end).toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
            </div>
          )}

          {!subscription && (
            <div className="bg-amber-pale border border-amber/20 rounded-lg p-4">
              <p className="text-sm text-amber">
                No active subscription. Start your free 14-day trial to unlock all features.
              </p>
              <a
                href="/api/stripe/checkout"
                className="inline-block mt-3 bg-amber text-white font-semibold text-sm px-5 py-2 rounded-lg hover:bg-amber-light transition-colors"
              >
                Start Free Trial
              </a>
            </div>
          )}

          {isPastDue && (
            <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-lg p-4">
              <AlertTriangle size={16} className="text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">
                Your payment failed. Please update your billing information to continue using ThreadKey.
              </p>
            </div>
          )}

          {subscription && (
            <div className="flex flex-wrap gap-3 pt-2 border-t border-[#E2D9CC]">
              <BillingButton />
            </div>
          )}
        </div>
      </div>

      {/* Pen name note */}
      <div className="bg-parchment border border-[#E2D9CC] rounded-xl p-5 text-sm text-ink-muted">
        <p>
          <span className="font-medium text-ink-blue">Pen names:</span> ThreadKey doesn&apos;t display
          your account email publicly. Your manuscripts and series data are private and secured with
          row-level access controls — only your account can access them.
        </p>
      </div>
    </div>
  );
}
