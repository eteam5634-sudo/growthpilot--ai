import crypto from "crypto";

const TOLERANCE_SECONDS = 300;

export function verifyStripeWebhookSignature(
  payload: string,
  signatureHeader: string | null,
  secret: string
): boolean {
  if (!signatureHeader) return false;

  let timestamp = "";
  const signatures: string[] = [];

  for (const part of signatureHeader.split(",")) {
    const [key, value] = part.split("=");
    if (key === "t") timestamp = value;
    if (key === "v1" && value) signatures.push(value);
  }

  if (!timestamp || signatures.length === 0) return false;

  const age = Math.floor(Date.now() / 1000) - Number(timestamp);
  if (Number.isNaN(age) || age > TOLERANCE_SECONDS) return false;

  const signedPayload = `${timestamp}.${payload}`;
  const expected = crypto.createHmac("sha256", secret).update(signedPayload, "utf8").digest("hex");

  return signatures.some((signature) => {
    try {
      return crypto.timingSafeEqual(Buffer.from(signature, "hex"), Buffer.from(expected, "hex"));
    } catch {
      return false;
    }
  });
}
