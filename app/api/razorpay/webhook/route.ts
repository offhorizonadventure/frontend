import { NextResponse } from "next/server";

import { verifyWebhookSignature } from "@/lib/razorpay";
import { settlePayment } from "@/lib/settle-payment";

// Signature is computed over the exact bytes Razorpay sent, so this route must
// never be statically optimised or have its body re-serialised.
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * Razorpay webhook.
 *
 * This is the authoritative confirmation path. The browser callback is a
 * convenience — riders close tabs, lose signal and bounce off UPI apps — so a
 * booking must still get confirmed when nobody comes back to the site.
 *
 * Configure at Razorpay Dashboard > Settings > Webhooks:
 *   URL:    https://<your-domain>/api/razorpay/webhook
 *   Events: payment.captured, payment.failed
 *   Secret: must match RAZORPAY_WEBHOOK_SECRET
 */
export async function POST(request: Request) {
  // Read as raw text, not request.json(): parsing and re-stringifying changes
  // key order and whitespace, and the digest would never match.
  const rawBody = await request.text();
  const signature = request.headers.get("x-razorpay-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let valid: boolean;
  try {
    valid = verifyWebhookSignature({ rawBody, signature });
  } catch (error) {
    // Missing secret — a configuration problem, not a bad request. Return 500
    // so Razorpay retries once it's fixed rather than giving up.
    console.error("Razorpay webhook: verification unavailable", error);
    return NextResponse.json({ error: "Not configured" }, { status: 500 });
  }

  if (!valid) {
    console.error("Razorpay webhook: signature mismatch");
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  let event: {
    event?: string;
    payload?: {
      payment?: { entity?: { id?: string; order_id?: string } };
    };
  };

  try {
    event = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const payment = event.payload?.payment?.entity;

  if (event.event === "payment.captured" && payment?.id && payment.order_id) {
    const result = await settlePayment({
      razorpayOrderId: payment.order_id,
      razorpayPaymentId: payment.id,
    });

    if (!result.ok) {
      // 500 asks Razorpay to retry — a transient database problem shouldn't
      // lose a payment we've already taken.
      console.error("Razorpay webhook: settlement failed", result.error);
      return NextResponse.json({ error: "Settlement failed" }, { status: 500 });
    }
  }

  // Everything else (payment.failed, events we don't handle) is acknowledged
  // so Razorpay stops retrying. The order simply stays unpaid.
  return NextResponse.json({ received: true });
}
