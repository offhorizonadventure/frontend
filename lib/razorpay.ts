import "server-only";

import { createHmac, timingSafeEqual } from "node:crypto";

/**
 * Razorpay server-side helpers.
 *
 * `server-only` is load-bearing: this module reads the key secret, and the
 * import would fail the build rather than quietly ship it if a client
 * component ever pulled it in. Only RAZORPAY_KEY_ID is safe in a browser, and
 * it's exposed separately as NEXT_PUBLIC_RAZORPAY_KEY_ID.
 */

const API = "https://api.razorpay.com/v1";

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    // Fail loudly at the point of use — a half-configured payment path is
    // worse than an obvious error.
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function authHeader(): string {
  const id = requireEnv("RAZORPAY_KEY_ID");
  const secret = requireEnv("RAZORPAY_KEY_SECRET");
  return `Basic ${Buffer.from(`${id}:${secret}`).toString("base64")}`;
}

/**
 * Constant-time string comparison.
 *
 * `===` on a signature leaks how many leading characters matched through
 * timing, which is enough to forge one byte at a time. Lengths are compared
 * first because timingSafeEqual throws on a mismatch.
 */
function safeEqual(a: string, b: string): boolean {
  const left = Buffer.from(a, "utf8");
  const right = Buffer.from(b, "utf8");
  if (left.length !== right.length) return false;
  return timingSafeEqual(left, right);
}

export type RazorpayOrder = {
  id: string;
  amount: number;
  currency: string;
  status: string;
};

/**
 * Creates a Razorpay order.
 *
 * `amountInRupees` must come from prices read out of our own database. The
 * amount the browser eventually pays is fixed to the order, so this is the
 * single place the price is decided.
 */
export async function createRazorpayOrder({
  amountInRupees,
  receipt,
  notes,
}: {
  amountInRupees: number;
  receipt: string;
  notes?: Record<string, string>;
}): Promise<RazorpayOrder> {
  // Razorpay works in paise and rejects anything that isn't an integer.
  const amount = Math.round(amountInRupees * 100);

  if (!Number.isInteger(amount) || amount <= 0) {
    throw new Error("Invalid order amount");
  }

  const response = await fetch(`${API}/orders`, {
    method: "POST",
    headers: {
      Authorization: authHeader(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      amount,
      currency: "INR",
      receipt,
      notes,
      // Razorpay captures automatically, so a successful payment can't sit
      // authorised-but-uncaptured and silently expire.
      payment_capture: 1,
    }),
    cache: "no-store",
  });

  if (!response.ok) {
    const body = await response.text();
    console.error("Razorpay order creation failed:", response.status, body);
    throw new Error("Could not start the payment. Please try again.");
  }

  return (await response.json()) as RazorpayOrder;
}

export type RazorpayPayment = {
  id: string;
  order_id: string;
  status: string;
  amount: number;
  currency: string;
  method?: string;
};

/** Fetches a payment straight from Razorpay, bypassing anything the client said. */
export async function fetchRazorpayPayment(
  paymentId: string
): Promise<RazorpayPayment | null> {
  const response = await fetch(
    `${API}/payments/${encodeURIComponent(paymentId)}`,
    {
      headers: { Authorization: authHeader() },
      cache: "no-store",
    }
  );

  if (!response.ok) {
    console.error("Razorpay payment lookup failed:", response.status);
    return null;
  }

  return (await response.json()) as RazorpayPayment;
}

/**
 * Verifies the signature Razorpay Checkout hands back in the browser.
 *
 * Signed as HMAC-SHA256 of "<order_id>|<payment_id>" with the key secret, so
 * only someone holding the secret could have produced it. Without this check
 * anyone could POST a made-up payment id and get a booking confirmed.
 */
export function verifyCheckoutSignature({
  orderId,
  paymentId,
  signature,
}: {
  orderId: string;
  paymentId: string;
  signature: string;
}): boolean {
  const expected = createHmac("sha256", requireEnv("RAZORPAY_KEY_SECRET"))
    .update(`${orderId}|${paymentId}`)
    .digest("hex");

  return safeEqual(expected, signature);
}

/**
 * Verifies a webhook payload.
 *
 * Signed with the webhook secret (a different secret from the API key) over
 * the exact raw body — so the caller must hand us the unparsed text, not a
 * re-serialised object, or the digest won't match.
 */
export function verifyWebhookSignature({
  rawBody,
  signature,
}: {
  rawBody: string;
  signature: string;
}): boolean {
  const expected = createHmac(
    "sha256",
    requireEnv("RAZORPAY_WEBHOOK_SECRET")
  )
    .update(rawBody)
    .digest("hex");

  return safeEqual(expected, signature);
}
