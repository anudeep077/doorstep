import type { Metadata } from "next";
import { CheckoutView } from "@/components/checkout-view";

export const metadata: Metadata = { title: "Checkout — Doorstep" };

export default function CheckoutPage() {
  return <CheckoutView />;
}
