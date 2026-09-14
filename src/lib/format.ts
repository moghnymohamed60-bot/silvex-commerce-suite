const currencyFormatter = new Intl.NumberFormat("en-EG", {
  style: "currency",
  currency: "EGP",
  maximumFractionDigits: 0,
});

const currencyFormatterWithCents = new Intl.NumberFormat("en-EG", {
  style: "currency",
  currency: "EGP",
  minimumFractionDigits: 2,
});

export function formatPrice(value: number): string {
  return Number.isInteger(value) ? currencyFormatter.format(value) : currencyFormatterWithCents.format(value);
}

export function discountPercent(price: number, compareAt: number | null): number | null {
  if (!compareAt || compareAt <= price) return null;
  return Math.round(((compareAt - price) / compareAt) * 100);
}
