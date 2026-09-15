"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { formatPrice } from "@/lib/feed";
import { getOrder, mockStatus, STATUS_STEPS, type Order } from "@/lib/orders";
import { isClientMounted, markClientMounted } from "@/lib/storage";
import { BillDetails } from "./bill-details";
import { CheckIcon, ClockIcon, MapPinIcon, VegMark } from "./icons";
import { PageBar } from "./page-bar";

export function OrderView({ id }: { id: string }) {
  // Orders are in localStorage, so the lookup is client-only. Same
  // first-hydration guard as the other storage hooks.
  const [order, setOrder] = useState<Order | null | undefined>(() => (isClientMounted() ? getOrder(id) : undefined));
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (order !== undefined) return;
    markClientMounted();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setOrder(getOrder(id));
  }, [id, order]);

  // Tick so the mock status timeline advances while the screen is open.
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 15_000);
    return () => clearInterval(t);
  }, []);

  if (order === undefined) return null;

  if (!order) {
    return (
      <main className="mx-auto flex w-full max-w-md flex-1 flex-col px-4">
        <PageBar title="Order" />
        <div className="flex flex-1 flex-col items-center justify-center gap-3 py-20 text-center">
          <p className="text-lg font-semibold">We couldn&apos;t find that order.</p>
          <Link href="/" className="mt-2 rounded-2xl bg-brand px-5 py-2.5 font-semibold text-white">
            Back to home
          </Link>
        </div>
      </main>
    );
  }

  const status = mockStatus(order, now);
  const stepIndex = STATUS_STEPS.findIndex((s) => s.key === status);
  const placed = new Date(order.placed_at);
  const eta = new Date(placed.getTime() + order.eta_max_minutes * 60_000);
  const fmtTime = (d: Date) => d.toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" });

  return (
    <main className="page-enter mx-auto flex w-full max-w-md flex-1 flex-col gap-4 px-4 pb-10">
      <PageBar title={`Order ${order.code}`} back="href" backHref="/" />

      {/* Confirmation hero */}
      <section className="flex flex-col items-center rounded-3xl bg-veg px-4 py-8 text-center text-white shadow-lg shadow-veg/30">
        <span className="pop-in grid h-16 w-16 place-items-center rounded-full bg-white/20">
          <CheckIcon width={36} height={36} strokeWidth={2.5} />
        </span>
        <h2 className="mt-3 text-2xl font-bold">
          {status === "delivered" ? "Delivered" : "Order placed!"}
        </h2>
        <p className="mt-1 text-sm text-white/85">
          {status === "delivered" ? (
            <>Delivered around {fmtTime(eta)}</>
          ) : (
            <>
              Arriving in {order.eta_min_minutes}–{order.eta_max_minutes} min · by {fmtTime(eta)}
            </>
          )}
        </p>
        {status !== "delivered" && (
          <Link href={`/track/${order.id}`} className="mt-4 rounded-full bg-white px-4 py-2 text-sm font-semibold text-veg-deep shadow hover:opacity-90">
            Track on map
          </Link>
        )}
      </section>

      {/* Status timeline */}
      <section className="rounded-3xl border border-line bg-surface p-4 shadow-sm">
        <ol className="space-y-0">
          {STATUS_STEPS.map((step, i) => {
            const done = i < stepIndex;
            const active = i === stepIndex;
            return (
              <li key={step.key} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <span
                    className={`grid h-6 w-6 shrink-0 place-items-center rounded-full border-2 text-white ${
                      done || active ? "border-veg bg-veg" : "border-line bg-surface"
                    } ${active ? "ring-4 ring-veg/25" : ""}`}
                  >
                    {done && <CheckIcon width={14} height={14} strokeWidth={3} />}
                  </span>
                  {i < STATUS_STEPS.length - 1 && <span className={`w-0.5 flex-1 ${done ? "bg-veg" : "bg-line"}`} />}
                </div>
                <div className={`pb-5 ${i === STATUS_STEPS.length - 1 ? "pb-0" : ""}`}>
                  <p className={`font-semibold ${done || active ? "" : "text-muted"}`}>{step.label}</p>
                  <p className="text-xs text-muted">{step.hint}</p>
                </div>
              </li>
            );
          })}
        </ol>
        <p className="mt-4 text-[11px] text-muted">Status is simulated for now — it will come from the restaurant and rider apps.</p>
      </section>

      {/* Details */}
      <section className="rounded-3xl border border-line bg-surface p-4 shadow-sm">
        <div className="flex items-start gap-3">
          <MapPinIcon className="mt-0.5 shrink-0 text-brand" />
          <div className="min-w-0">
            <p className="font-semibold">{order.address.short_label}</p>
            <p className="text-sm text-muted">{order.address.formatted}</p>
          </div>
        </div>
        <div className="mt-3 flex items-center gap-3 text-sm text-muted">
          <ClockIcon width={16} height={16} />
          Placed at {fmtTime(placed)} · {order.payment_label ?? (order.payment_method === "cod" ? "Cash on delivery" : order.payment_method.toUpperCase())}
        </div>
      </section>

      <section className="rounded-3xl border border-line bg-surface p-4 shadow-sm">
        <h3 className="mb-2 font-semibold">
          <Link href={`/restaurant/${order.restaurant.slug}`} className="hover:underline">
            {order.restaurant.name}
          </Link>
        </h3>
        <ul className="divide-y divide-line">
          {order.lines.map(({ item, qty }) => (
            <li key={item.id} className="flex items-center gap-3 py-2 text-sm">
              <VegMark veg={item.is_veg} />
              <span className="min-w-0 flex-1 truncate">
                {item.name} <span className="text-muted">× {qty}</span>
              </span>
              <span className="tabular-nums">{formatPrice(item.price_minor * qty, item.currency)}</span>
            </li>
          ))}
        </ul>
        <div className="mt-3 border-t border-line pt-3">
          <BillDetails bill={order.bill} />
        </div>
      </section>

      <div className="grid grid-cols-2 gap-2">
        <Link href="/orders" className="rounded-2xl border border-line py-3 text-center font-semibold hover:bg-line/40">
          All orders
        </Link>
        <Link href="/" className="rounded-2xl bg-brand py-3 text-center font-semibold text-white hover:opacity-90">
          Order again
        </Link>
      </div>
    </main>
  );
}
