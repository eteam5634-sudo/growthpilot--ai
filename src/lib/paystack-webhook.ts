import crypto from "crypto";

/** Paystack signs webhooks with HMAC SHA512 of the raw body using your secret key. */
export function verifyPaystackWebhookSignature(
  payload: string,
  signatureHeader: string | null,
  secret: string
): boolean {
  if (!signatureHeader || !secret) return false;
  const hash = crypto.createHmac("sha512", secret).update(payload, "utf8").digest("hex");
  try {
    return crypto.timingSafeEqual(Buffer.from(hash, "utf8"), Buffer.from(signatureHeader, "utf8"));
  } catch {
    return false;
  }
}
