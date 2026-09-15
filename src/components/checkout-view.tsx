"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useCart } from "@/lib/cart";
import { formatPrice } from "@/lib/feed";
import { computeBill, FREE_DELIVERY_ABOVE, placeOrder } from "@/lib/orders";
import { mockCharge } from "@/lib/payments";
import { useAddress } from "@/lib/use-address";
import { AddressSheet } from "./address-sheet";
import { BillDetails } from "./bill-details";
import { MapPinIcon, VegMark } from "./icons";
import { ORDER_SPLASH_COVER_MS, showOrderSplash } from "./order-splash";
import { PageBar } from "./page-bar";
import { EMPTY_PAYMENT, PaymentPicker, paymentLabel, paymentReady, type PaymentState } from "./payment-picker";
import { QtyStepper } from "./qty-stepper";

export function CheckoutView() {
  const cart = useCart();
  const address = useAddress();
  const router = useRouter();
  const [addressOpen, setAddressOpen] = useState(false);
  const [payment, setPayment] = useState<PaymentState>(EMPTY_PAYMENT);
  const [placing, setPlacing] = useState<false | "paying" | "placing">(false);

  if (!cart.ready) return null;

  if (cart.count === 0 || !cart.restaurant) {
    return (
      <main className="mx-auto flex w-full max-w-md flex-1 flex-col px-4">
        <PageBar title="Checkout" />
        <div className="flex flex-1 flex-col items-center justify-center gap-3 py-20 text-center">
          <p className="text-lg font-semibold">Your cart is empty</p>
          <p className="text-sm text-muted">Add something from a restaurant to check out.</p>
          <Link href="/" className="mt-2 rounded-2xl bg-brand px-5 py-2.5 font-semibold text-white">
            Browse restaurants
          </Link>
        </div>
      </main>
    );
  }

  const restaurant = cart.restaurant;
  const bill = computeBill(cart.lines);
  const toFree = FREE_DELIVERY_ABOVE - bill.item_total_minor;
  const ready = paymentReady(payment);
  const canPlace = Boolean(address.current) && ready && !placing;

  const submit = async () => {
    if (!address.current || !ready) return;
    // UPI/card go through the (mock) gateway first; cash needs no charge.
    if (payment.method !== "cod") {
      setPlacing("paying");
      await mockCharge();
    }
    setPlacing("placing");
    const order = placeOrder({
      restaurant,
      lines: cart.lines,
      address: address.current,
      payment_method: payment.method,
      payment_label: paymentLabel(payment),
    });
    // Full-screen "Order placed!" sweep; swap pages while it's covering the
    // screen so the confirmation is what's revealed when it fades.
    showOrderSplash();
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setTimeout(() => {
      cart.clear();
      router.replace(`/order/${order.id}`);
    }, reduceMotion ? 0 : ORDER_SPLASH_COVER_MS);
  };

  return (
    <main className="page-enter mx-auto flex w-full max-w-md flex-1 flex-col gap-4 px-4 pb-32">
      <PageBar title="Checkout" />

      {/* Deliver to */}
      <section className="rounded-3xl border border-line bg-surface p-4 shadow-sm">
        <div className="flex items-start gap-3">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-brand/10 text-brand">
            <MapPinIcon />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium uppercase tracking-wide text-muted">Deliver to</p>
            {address.current ? (
              <>
                <p className="font-semibold">{address.current.short_label}</p>
                <p className="truncate text-sm text-muted">{address.current.formatted}</p>
              </>
            ) : (
              <p className="font-semibold text-red-600">Add a delivery address to continue</p>
            )}
          </div>
          <button type="button" onClick={() => setAddressOpen(true)} className="shrink-0 text-sm font-semibold text-brand">
            {address.current ? "Change" : "Add"}
          </button>
        </div>
      </section>

      {/* Items */}
      <section className="rounded-3xl border border-line bg-surface shadow-sm">
        <div className="flex items-center justify-between px-4 pt-4">
          <h2 className="font-semibold">{restaurant.name}</h2>
          <Link href={`/restaurant/${restaurant.slug}`} className="text-sm font-semibold text-brand">
            Add more
          </Link>
        </div>
        <ul className="divide-y divide-line px-4">
          {cart.lines.map(({ item, qty }) => (
            <li key={item.id} className="flex items-center gap-3 py-3">
              <VegMark veg={item.is_veg} className="shrink-0" />
              <span className="min-w-0 flex-1">
                <span className="block truncate font-medium">{item.name}</span>
                <span className="block text-xs text-muted">{formatPrice(item.price_minor, item.currency)} each</span>
              </span>
              <QtyStepper size="sm" qty={qty} onAdd={() => cart.setQty(item.id, 1)} onChange={(q) => cart.setQty(item.id, q)} />
              <span className="w-16 shrink-0 text-right text-sm font-semibold tabular-nums">{formatPrice(item.price_minor * qty, item.currency)}</span>
            </li>
          ))}
        </ul>
        {toFree > 0 && (
          <p className="mx-4 mb-4 rounded-xl bg-veg/10 px-3 py-2 text-xs text-veg-deep">
            Add {formatPrice(toFree, bill.currency)} more for free delivery.
          </p>
        )}
        {toFree <= 0 && <div className="h-2" />}
      </section>

      {/* Bill */}
      <section className="rounded-3xl border border-line bg-surface p-4 shadow-sm">
        <h2 className="mb-3 font-semibold">Bill details</h2>
        <BillDetails bill={bill} />
      </section>

      {/* Payment */}
      <section className="rounded-3xl border border-line bg-surface p-4 shadow-sm">
        <h2 className="mb-3 font-semibold">Payment</h2>
        <PaymentPicker value={payment} onChange={setPayment} />
      </section>

      {/* Bottom bar: total on the left, a proper button on the right. */}
      <div className="fixed inset-x-0 bottom-0 z-30 mx-auto w-full max-w-md border-t border-line bg-surface/95 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur-md sm:rounded-t-2xl sm:border-x">
        <div className="flex w-full items-center justify-between gap-4">
          <div className="leading-tight">
            <p className="text-xs font-medium uppercase tracking-wide text-muted">To pay</p>
            <p className="text-xl font-bold tabular-nums">{formatPrice(bill.total_minor, bill.currency)}</p>
          </div>
          <button
            type="button"
            onClick={submit}
            disabled={!canPlace}
            className={`inline-flex h-12 items-center gap-2 rounded-2xl bg-veg px-6 text-base font-bold text-white transition hover:bg-veg-deep active:scale-95 disabled:cursor-not-allowed disabled:bg-neutral-400 disabled:shadow-none dark:disabled:bg-neutral-600 ${
              canPlace ? "cta-glow" : ""
            }`}
          >
            {placing === "paying"
              ? "Processing payment…"
              : placing
                ? "Placing…"
                : !address.current
                  ? "Add address"
                  : !ready
                    ? "Enter payment details"
                    : payment.method === "cod"
                      ? "Place order"
                      : `Pay ${formatPrice(bill.total_minor, bill.currency)}`}
            {!placing && address.current && ready && (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            )}
          </button>
        </div>
      </div>

      <AddressSheet
        open={addressOpen}
        onClose={() => setAddressOpen(false)}
        status={address.status}
        error={address.error}
        current={address.current}
        saved={address.saved}
        onLocate={address.locate}
        onChoose={address.choose}
        onSave={address.save}
        onRemove={address.remove}
      />
    </main>
  );
}
