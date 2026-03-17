export function formatCurrency(amount) {
  return `฿${Number(amount).toLocaleString('th-TH', { minimumFractionDigits: 2 })}`;
}
