import type { Metadata } from "next";
import { OrderView } from "@/components/order-view";

export const metadata: Metadata = { title: "Your order — Doorstep" };

export default async function OrderPage(props: PageProps<"/order/[id]">) {
  const { id } = await props.params;
  return <OrderView id={id} />;
}
