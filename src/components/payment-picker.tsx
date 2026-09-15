"use client";

import type { PaymentMethod } from "@/lib/orders";
import {
  cardBrand,
  formatCardNumber,
  formatExpiry,
  isValidCvv,
  isValidExpiry,
  isValidUpiId,
  luhnValid,
} from "@/lib/payments";
import { CardIcon, CashIcon, PhoneIcon } from "./icons";

export type PaymentState = {
  method: PaymentMethod;
  upiId: string;
  card: { number: string; expiry: string; cvv: string; name: string };
};

export const EMPTY_PAYMENT: PaymentState = { method: "cod", upiId: "", card: { number: "", expiry: "", cvv: "", name: "" } };

const UPI_APPS = [
  { label: "Google Pay", handle: "@okaxis" },
  { label: "PhonePe", handle: "@ybl" },
  { label: "Paytm", handle: "@paytm" },
];

const OPTIONS: { key: PaymentMethod; label: string; hint: string; Icon: typeof CashIcon }[] = [
  { key: "upi", label: "UPI", hint: "Google Pay, PhonePe, Paytm or any UPI ID", Icon: PhoneIcon },
  { key: "card", label: "Credit / debit card", hint: "Visa, Mastercard, RuPay, Amex", Icon: CardIcon },
  { key: "cod", label: "Cash on delivery", hint: "Pay the rider when your food arrives", Icon: CashIcon },
];

/** Whether the chosen method has everything it needs to be charged. */
export function paymentReady(p: PaymentState) {
  if (p.method === "cod") return true;
  if (p.method === "upi") return isValidUpiId(p.upiId);
  const brand = cardBrand(p.card.number);
  return luhnValid(p.card.number) && isValidExpiry(p.card.expiry) && isValidCvv(p.card.cvv, brand) && p.card.name.trim().length > 1;
}

/** What's written on the order — never the full card number. */
export function paymentLabel(p: PaymentState) {
  if (p.method === "cod") return "Cash on delivery";
  if (p.method === "upi") return `UPI · ${p.upiId.trim()}`;
  return `${cardBrand(p.card.number)} •••• ${p.card.number.replace(/\D/g, "").slice(-4)}`;
}

export function PaymentPicker({ value, onChange }: { value: PaymentState; onChange: (next: PaymentState) => void }) {
  const set = (patch: Partial<PaymentState>) => onChange({ ...value, ...patch });
  const setCard = (patch: Partial<PaymentState["card"]>) => onChange({ ...value, card: { ...value.card, ...patch } });
  const brand = cardBrand(value.card.number);
  const numberDigits = value.card.number.replace(/\D/g, "");

  return (
    <div role="radiogroup" aria-label="Payment method" className="space-y-2">
      {OPTIONS.map(({ key, label, hint, Icon }) => {
        const on = value.method === key;
        return (
          <div key={key} className={`rounded-2xl border transition-colors ${on ? "border-veg bg-veg/10" : "border-line"}`}>
            <button
              type="button"
              role="radio"
              aria-checked={on}
              onClick={() => set({ method: key })}
              className="flex w-full items-center gap-3 p-3 text-left"
            >
              <Icon className={on ? "text-veg" : "text-muted"} />
              <span className="min-w-0 flex-1">
                <span className="block font-medium">{label}</span>
                <span className="block text-xs text-muted">{hint}</span>
              </span>
              <span className={`grid h-5 w-5 shrink-0 place-items-center rounded-full border-2 ${on ? "border-veg" : "border-line"}`}>
                {on && <span className="h-2.5 w-2.5 rounded-full bg-veg" />}
              </span>
            </button>

            {on && key === "upi" && (
              <div className="space-y-3 px-3 pb-3">
                <div className="flex flex-wrap gap-2">
                  {UPI_APPS.map((app) => (
                    <button
                      key={app.label}
                      type="button"
                      onClick={() => {
                        // Keep the user's handle, swap the bank suffix.
                        const user = value.upiId.split("@")[0] || "";
                        set({ upiId: `${user}${app.handle}` });
                      }}
                      className={`rounded-full border px-3 py-1.5 text-xs font-medium ${
                        value.upiId.endsWith(app.handle) ? "border-veg bg-veg/15 text-veg-deep" : "border-line bg-surface text-muted"
                      }`}
                    >
                      {app.label}
                    </button>
                  ))}
                </div>
                <Field label="UPI ID" hint={value.upiId && !isValidUpiId(value.upiId) ? "Looks like name@bank" : undefined}>
                  <input
                    type="text"
                    inputMode="email"
                    autoComplete="off"
                    autoCapitalize="none"
                    spellCheck={false}
                    placeholder="yourname@okaxis"
                    value={value.upiId}
                    onChange={(e) => set({ upiId: e.target.value })}
                    className={inputCls}
                  />
                </Field>
                <p className="text-[11px] text-muted">You&apos;ll approve the request in your UPI app.</p>
              </div>
            )}

            {on && key === "card" && (
              <div className="space-y-3 px-3 pb-3">
                <Field
                  label="Card number"
                  trailing={numberDigits.length >= 4 ? brand : undefined}
                  hint={numberDigits.length >= 12 && !luhnValid(value.card.number) ? "That number doesn't look right" : undefined}
                >
                  <input
                    type="text"
                    inputMode="numeric"
                    autoComplete="cc-number"
                    placeholder="1234 5678 9012 3456"
                    value={value.card.number}
                    onChange={(e) => setCard({ number: formatCardNumber(e.target.value) })}
                    className={`${inputCls} tabular-nums`}
                  />
                </Field>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Expiry" hint={value.card.expiry.length === 5 && !isValidExpiry(value.card.expiry) ? "Expired or invalid" : undefined}>
                    <input
                      type="text"
                      inputMode="numeric"
                      autoComplete="cc-exp"
                      placeholder="MM/YY"
                      value={value.card.expiry}
                      onChange={(e) => setCard({ expiry: formatExpiry(e.target.value) })}
                      className={`${inputCls} tabular-nums`}
                    />
                  </Field>
                  <Field label="CVV">
                    <input
                      type="password"
                      inputMode="numeric"
                      autoComplete="cc-csc"
                      placeholder={brand === "Amex" ? "••••" : "•••"}
                      maxLength={brand === "Amex" ? 4 : 3}
                      value={value.card.cvv}
                      onChange={(e) => setCard({ cvv: e.target.value.replace(/\D/g, "") })}
                      className={`${inputCls} tabular-nums`}
                    />
                  </Field>
                </div>
                <Field label="Name on card">
                  <input
                    type="text"
                    autoComplete="cc-name"
                    placeholder="As printed on the card"
                    value={value.card.name}
                    onChange={(e) => setCard({ name: e.target.value })}
                    className={inputCls}
                  />
                </Field>
                <p className="text-[11px] text-muted">Card details are used for this order only and aren&apos;t saved.</p>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

const inputCls =
  "w-full rounded-xl border border-line bg-surface px-3 py-2.5 text-sm outline-none placeholder:text-muted/70 focus:border-veg";

function Field({
  label,
  hint,
  trailing,
  children,
}: {
  label: string;
  hint?: string;
  trailing?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1 flex items-center justify-between text-xs font-medium text-muted">
        {label}
        {trailing && <span className="font-semibold text-foreground">{trailing}</span>}
      </span>
      {children}
      {hint && <span className="mt-1 block text-xs text-red-600">{hint}</span>}
    </label>
  );
}
