// Client-side validation + formatting for the mock payment forms. Nothing
// here talks to a gateway; the checkout phase that adds Razorpay/Stripe
// replaces `mockCharge` and keeps the rest.

export function isValidUpiId(v: string) {
  return /^[a-zA-Z0-9._-]{2,}@[a-zA-Z][a-zA-Z0-9.-]{1,}$/.test(v.trim());
}

export function formatCardNumber(v: string) {
  return v.replace(/\D/g, "").slice(0, 19).replace(/(.{4})/g, "$1 ").trim();
}

export function luhnValid(v: string) {
  const d = v.replace(/\D/g, "");
  if (d.length < 12) return false;
  let sum = 0;
  let dbl = false;
  for (let i = d.length - 1; i >= 0; i--) {
    let n = Number(d[i]);
    if (dbl) {
      n *= 2;
      if (n > 9) n -= 9;
    }
    sum += n;
    dbl = !dbl;
  }
  return sum % 10 === 0;
}

export function cardBrand(v: string): "Visa" | "Mastercard" | "RuPay" | "Amex" | "Card" {
  const d = v.replace(/\D/g, "");
  if (/^4/.test(d)) return "Visa";
  if (/^(5[1-5]|2[2-7])/.test(d)) return "Mastercard";
  if (/^(60|65|81|82|508)/.test(d)) return "RuPay";
  if (/^3[47]/.test(d)) return "Amex";
  return "Card";
}

export function formatExpiry(v: string) {
  const d = v.replace(/\D/g, "").slice(0, 4);
  return d.length > 2 ? `${d.slice(0, 2)}/${d.slice(2)}` : d;
}

export function isValidExpiry(v: string) {
  const m = /^(\d{2})\/(\d{2})$/.exec(v);
  if (!m) return false;
  const month = Number(m[1]);
  const year = 2000 + Number(m[2]);
  if (month < 1 || month > 12) return false;
  const now = new Date();
  return year > now.getFullYear() || (year === now.getFullYear() && month >= now.getMonth() + 1);
}

export function isValidCvv(v: string, brand: ReturnType<typeof cardBrand>) {
  return brand === "Amex" ? /^\d{4}$/.test(v) : /^\d{3}$/.test(v);
}

export function last4(v: string) {
  return v.replace(/\D/g, "").slice(-4);
}

/** Pretend to talk to a payment gateway. Always approves after a short wait. */
export function mockCharge(): Promise<{ ok: true }> {
  return new Promise((resolve) => setTimeout(() => resolve({ ok: true }), 1400));
}
