import { NextResponse } from "next/server";
import { stripe, APP_URL } from "@/lib/stripe";
import { createServerSupabase } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

export async function POST() {
  try {
    const supabase = createServerSupabase();
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: existingSub } = await supabase
      .from("tk_subscriptions")
      .select("stripe_customer_id")
      .eq("user_id", session.user.id)
      .single();

    const checkoutSession = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      customer: existingSub?.stripe_customer_id || undefined,
      customer_email: existingSub?.stripe_customer_id ? undefined : session.user.email,
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: "ThreadKey Pro",
              description: "AI series bible for fiction authors — unlimited manuscripts, continuity checker, PDF export",
            },
            unit_amount: 2900,
            recurring: { interval: "month" },
          },
          quantity: 1,
        },
      ],
      subscription_data: {
        trial_period_days: 14,
        metadata: { user_id: session.user.id },
      },
      success_url: `${APP_URL}/series?checkout=success`,
      cancel_url: `${APP_URL}/#pricing`,
      metadata: { user_id: session.user.id },
    });

    return NextResponse.json({ url: checkoutSession.url });
  } catch (err: unknown) {
    console.error("Checkout error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Checkout failed" },
      { status: 500 }
    );
  }
}
