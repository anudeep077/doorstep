import type { Metadata } from "next";
import { OrdersList } from "@/components/orders-list";

export const metadata: Metadata = { title: "Your orders — Doorstep" };

export default function OrdersPage() {
  return <OrdersList />;
}
