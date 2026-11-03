import type { PackageItem } from "@/types/showcase";

/** Compare rupee amounts at two decimal places. */
export function roundRupee(amount: number): number {
  return Math.round(amount * 100) / 100;
}

export function itemAmountOverMrp(amount: number, mrp: number): boolean {
  return roundRupee(amount) > roundRupee(mrp);
}

export function packageTotalOverMrp(
  totalAmount: number,
  mrpSum: number,
): boolean {
  return roundRupee(totalAmount) > roundRupee(mrpSum);
}

/** First line item whose coach price exceeds the product master MRP. */
export function firstItemOverMrp(
  items: PackageItem[],
  mrpByItemCode: ReadonlyMap<string, number>,
): { itemName: string; mrp: number } | null {
  for (const item of items) {
    const code = item.itemCode?.trim();
    if (!code) continue;
    const mrp = mrpByItemCode.get(code);
    if (mrp == null || !Number.isFinite(mrp)) continue;
    if (itemAmountOverMrp(item.amount, mrp)) {
      return { itemName: item.itemName, mrp };
    }
  }
  return null;
}

export function sumItemMrp(
  items: PackageItem[],
  mrpByItemCode: ReadonlyMap<string, number>,
): number {
  return items.reduce((acc, item) => {
    const code = item.itemCode?.trim();
    if (!code) return acc;
    const mrp = mrpByItemCode.get(code);
    return acc + (mrp != null && Number.isFinite(mrp) ? mrp : 0);
  }, 0);
}
