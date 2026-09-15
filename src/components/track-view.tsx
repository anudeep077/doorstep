"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  getOrder,
  mockStatus,
  orderEndpoints,
  riderPosition,
  riderProgress,
  routePolyline,
  STATUS_STEPS,
  type Order,
} from "@/lib/orders";
import { isClientMounted, markClientMounted } from "@/lib/storage";
import { ClockIcon, DrivingScooter, PhoneIcon } from "./icons";
import { PageBar } from "./page-bar";

// Leaflet touches `window` at import time — client-only.
const RiderMap = dynamic(() => import("./rider-map"), {
  ssr: false,
  loading: () => <div className="h-full w-full animate-pulse bg-line" />,
});

const TICK_MS = 2000;
const RIDER = { name: "Ravi K.", vehicle: "TS 09 EF 4821" }; // mock

export function TrackView({ id }: { id: string }) {
  const [order, setOrder] = useState<Order | null | undefined>(() => (isClientMounted() ? getOrder(id) : undefined));
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (order !== undefined) return;
    markClientMounted();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setOrder(getOrder(id));
  }, [id, order]);

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), TICK_MS);
    return () => clearInterval(t);
  }, []);

  const endpoints = useMemo(() => (order ? orderEndpoints(order) : null), [order]);
  const route = useMemo(() => (endpoints ? routePolyline(endpoints.from, endpoints.to) : []), [endpoints]);

  if (order === undefined) return null;
  if (!order || !endpoints) {
    return (
      <main className="mx-auto flex w-full max-w-md flex-1 flex-col px-4">
        <PageBar title="Track order" />
        <div className="flex flex-1 flex-col items-center justify-center gap-3 py-20 text-center">
          <p className="text-lg font-semibold">We couldn&apos;t find that order.</p>
          <Link href="/orders" className="mt-2 rounded-2xl bg-brand px-5 py-2.5 font-semibold text-white">
            Your orders
          </Link>
        </div>
      </main>
    );
  }

  const status = mockStatus(order, now);
  const step = STATUS_STEPS.find((s) => s.key === status)!;
  const rider = riderPosition(order, now);
  const progress = riderProgress(order, now);
  const eta = new Date(new Date(order.placed_at).getTime() + order.eta_max_minutes * 60_000);
  const minsLeft = Math.max(0, Math.round((eta.getTime() - now) / 60_000));

  return (
    <main className="page-enter mx-auto flex w-full max-w-md flex-1 flex-col px-4">
      <PageBar title={`Track ${order.code}`} />

      {/* Map fills the space above the status card. */}
      <div className="relative -mx-4 h-[52dvh] min-h-72 overflow-hidden">
        <RiderMap restaurant={endpoints.from} home={endpoints.to} rider={rider} route={route} />
      </div>

      <section className="relative z-10 -mt-4 flex flex-col gap-4 rounded-t-3xl border border-line bg-surface p-4 shadow-2xl">
        <div className="flex items-center gap-3">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-veg text-white">
            <DrivingScooter size={26} driving={status === "on_the_way"} />
          </span>
          <div className="min-w-0 flex-1">
            <p className="font-semibold">{step.label}</p>
            <p className="text-sm text-muted">
              {status === "delivered"
                ? "Delivered — enjoy your meal"
                : status === "on_the_way"
                  ? `${RIDER.name} is ${Math.round(progress * 100)}% of the way to you`
                  : `${order.restaurant.name} is ${status === "placed" ? "confirming" : "preparing"} your order`}
            </p>
          </div>
          <div className="shrink-0 text-right">
            <p className="text-xs text-muted">ETA</p>
            <p className="inline-flex items-center gap-1 font-bold tabular-nums">
              <ClockIcon width={14} height={14} />
              {status === "delivered" ? "Done" : `${minsLeft} min`}
            </p>
          </div>
        </div>

        {/* progress track: restaurant → home */}
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-line">
          <div className="h-full rounded-full bg-veg transition-[width] duration-1000 ease-linear" style={{ width: `${Math.round(progress * 100)}%` }} />
        </div>

        {status === "on_the_way" && (
          <div className="flex items-center justify-between rounded-2xl border border-line px-3 py-2 text-sm">
            <span>
              <span className="font-medium">{RIDER.name}</span>
              <span className="text-muted"> · {RIDER.vehicle}</span>
            </span>
            <button type="button" disabled title="Calling comes with the rider app" className="inline-flex items-center gap-1 text-veg opacity-60">
              <PhoneIcon width={16} height={16} /> Call
            </button>
          </div>
        )}

        <Link href={`/order/${order.id}`} className="text-center text-sm font-semibold text-brand">
          View order details
        </Link>
        <p className="text-[11px] text-muted">Rider position is simulated until the rider app exists.</p>
      </section>
    </main>
  );
}
