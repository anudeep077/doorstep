import { formatPrice } from "@/lib/feed";
import type { Bill } from "@/lib/orders";

export function BillDetails({ bill }: { bill: Bill }) {
  const f = (n: number) => formatPrice(n, bill.currency);
  return (
    <dl className="space-y-2 text-sm">
      <Row label="Item total" value={f(bill.item_total_minor)} />
      <Row
        label="Delivery fee"
        value={
          bill.free_delivery ? (
            <>
              <s className="mr-1.5 text-muted">{f(3500)}</s>
              <span className="font-semibold text-veg-deep">Free</span>
            </>
          ) : (
            f(bill.delivery_fee_minor)
          )
        }
      />
      <Row label="Platform fee" value={f(bill.platform_fee_minor)} />
      <Row label="GST (5%)" value={f(bill.tax_minor)} />
      <div className="my-1 border-t border-line" />
      <Row label={<span className="font-bold text-foreground">To pay</span>} value={<span className="font-bold text-foreground">{f(bill.total_minor)}</span>} />
    </dl>
  );
}

function Row({ label, value }: { label: React.ReactNode; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="text-muted">{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}
