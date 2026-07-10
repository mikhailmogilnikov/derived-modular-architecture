const currencyFormatter = new Intl.NumberFormat("en-US", {
  currency: "USD",
  style: "currency",
});

export function formatCurrency(amount: number): string {
  return currencyFormatter.format(amount);
}
