"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { formatPrice } from "@/lib/feed";
import { listOrders, mockStatus, STATUS_STEPS, type Order } from "@/lib/orders";
import { isClientMounted, markClientMounted } from "@/lib/storage";
import { ChevronRightIcon } from "./icons";
import { PageBar } from "./page-bar";

export function OrdersList() {
  const [orders, setOrders] = useState<Order[] | undefined>(() => (isClientMounted() ? listOrders() : undefined));
  useEffect(() => {
    if (orders !== undefined) return;
    markClientMounted();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setOrders(listOrders());
  }, [orders]);

  return (
    <main className="page-enter mx-auto flex w-full max-w-md flex-1 flex-col gap-3 px-4 pb-10">
      <PageBar title="Your orders" />
      {orders === undefined ? null : orders.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 py-20 text-center">
          <p className="text-lg font-semibold">No orders yet</p>
          <Link href="/" className="mt-2 rounded-2xl bg-brand px-5 py-2.5 font-semibold text-white">
            Browse restaurants
          </Link>
        </div>
      ) : (
        <ul className="flex flex-col gap-3">
          {orders.map((o) => {
            const status = STATUS_STEPS.find((s) => s.key === mockStatus(o))!;
            return (
              <li key={o.id}>
                <Link href={`/order/${o.id}`} className="flex items-center gap-3 rounded-3xl border border-line bg-surface p-4 shadow-sm hover:bg-line/40">
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center justify-between gap-2">
                      <span className="truncate font-semibold">{o.restaurant.name}</span>
                      <span className="shrink-0 text-sm font-semibold tabular-nums">{formatPrice(o.bill.total_minor, o.bill.currency)}</span>
                    </span>
                    <span className="block truncate text-xs text-muted">
                      {o.lines.map((l) => `${l.item.name} × ${l.qty}`).join(", ")}
                    </span>
                    <span className="mt-1 flex items-center gap-2 text-xs">
                      <span className={`rounded-full px-2 py-0.5 font-medium ${status.key === "delivered" ? "bg-line text-muted" : "bg-veg/10 text-veg-deep"}`}>
                        {status.label}
                      </span>
                      <span className="text-muted">
                        {new Date(o.placed_at).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" })} · {o.code}
                      </span>
                    </span>
                  </span>
                  <ChevronRightIcon className="shrink-0 text-muted" />
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}
