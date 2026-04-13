import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { getSupabaseAdmin } from "@/lib/supabase";
import Stripe from "stripe";

export const dynamic = "force-dynamic";

// Helper: get period end from subscription (Stripe v22 uses items[0].current_period_end)
function getPeriodEnd(sub: Stripe.Subscription): string | null {
  try {
    // In Stripe v22, period_end is on the subscription items
    const item = sub.items?.data?.[0];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const end = (item as any)?.current_period_end ?? (sub as any)?.current_period_end;
    if (end) return new Date(end * 1000).toISOString();
    return null;
  } catch {
    return null;
  }
}

export async function POST(req: Request) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "No signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: unknown) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const admin = getSupabaseAdmin();

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.user_id;
        if (!userId) break;

        const subscription = await stripe.subscriptions.retrieve(
          session.subscription as string
        );

        await admin.from("tk_subscriptions").upsert(
          {
            user_id: userId,
            stripe_customer_id: session.customer as string,
            stripe_sub_id: subscription.id,
            status: subscription.status,
            current_period_end: getPeriodEnd(subscription),
            updated_at: new Date().toISOString(),
          },
          { onConflict: "user_id" }
        );
        break;
      }

      case "customer.subscription.updated": {
        const sub = event.data.object as Stripe.Subscription;
        const userId = sub.metadata?.user_id;

        if (!userId) {
          const { data } = await admin
            .from("tk_subscriptions")
            .select("user_id")
            .eq("stripe_sub_id", sub.id)
            .single();
          if (data) {
            await admin.from("tk_subscriptions").update({
              status: sub.status,
              current_period_end: getPeriodEnd(sub),
              updated_at: new Date().toISOString(),
            }).eq("stripe_sub_id", sub.id);
          }
        } else {
          await admin.from("tk_subscriptions").update({
            status: sub.status,
            current_period_end: getPeriodEnd(sub),
            updated_at: new Date().toISOString(),
          }).eq("user_id", userId);
        }
        break;
      }

      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        await admin.from("tk_subscriptions").update({
          status: "canceled",
          updated_at: new Date().toISOString(),
        }).eq("stripe_sub_id", sub.id);
        break;
      }

      case "invoice.payment_failed": {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const invoice = event.data.object as any;
        const subId = invoice?.parent?.subscription_details?.subscription ?? invoice?.subscription;
        if (subId) {
          await admin.from("tk_subscriptions").update({
            status: "past_due",
            updated_at: new Date().toISOString(),
          }).eq("stripe_sub_id", typeof subId === "string" ? subId : subId.id);
        }
        break;
      }

      default:
        break;
    }

    return NextResponse.json({ received: true });
  } catch (err: unknown) {
    console.error("Webhook handler error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Webhook error" },
      { status: 500 }
    );
  }
}
