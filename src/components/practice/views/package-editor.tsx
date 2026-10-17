"use client";

import { useEffect, useMemo, useState } from "react";

import type {
  CoachShowcasePackage,
  PackageItem,
  ProductBrandOption,
  ProductItemOption,
  SavePackageInput,
} from "@/types/showcase";

import { AlertBanner } from "@/components/ui/alert-banner";
import { SelectField, TextField } from "@/components/ui/field";
import {
  PACKAGE_MAX_AMOUNT,
  PACKAGE_MAX_ITEMS,
  PACKAGE_NAME_MAX,
} from "@/constants/showcase";
import { fetchProductItems } from "@/lib/api/showcase";
import { formatMoney } from "@/lib/format";
import { cn } from "@/lib/utils";

type Props = {
  brands: ProductBrandOption[];
  /** Package being edited, or null for a new one. */
  initial: CoachShowcasePackage | null;
  busy: boolean;
  error: string | null;
  onPublish: (input: SavePackageInput) => void;
  onCancel: () => void;
};

function parseAmount(value: string): number | null {
  if (value.trim() === "") return null;
  const n = Number(value);
  return Number.isFinite(n) && n >= 0 && n <= PACKAGE_MAX_AMOUNT ? n : null;
}

/**
 * Package creation: pick a product master once, name the package, add products
 * from that master with a price, and set a total. The total is the coach's own
 * figure and does not have to match the breakup.
 */
export function PackageEditor({
  brands,
  initial,
  busy,
  error,
  onPublish,
  onCancel,
}: Props) {
  const [brandCode, setBrandCode] = useState(initial?.brandCode ?? "");
  const [name, setName] = useState(initial?.packageName ?? "");
  const [items, setItems] = useState<PackageItem[]>(initial?.items ?? []);
  const [catalog, setCatalog] = useState<ProductItemOption[]>([]);
  const [pick, setPick] = useState("");
  const [price, setPrice] = useState("");
  const [total, setTotal] = useState(
    initial ? String(initial.totalAmount) : "",
  );
  const [totalEdited, setTotalEdited] = useState(Boolean(initial));
  const [isActive, setIsActive] = useState(initial?.isActive ?? true);
  const [localError, setLocalError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void fetchProductItems(brandCode).then((rows) => {
      if (!cancelled) setCatalog(rows);
    });
    return () => {
      cancelled = true;
    };
  }, [brandCode]);

  const sum = useMemo(
    () => items.reduce((acc, item) => acc + item.amount, 0),
    [items],
  );
  const shownTotal =
    totalEdited ? total
    : items.length ? String(sum)
    : "";
  const available = catalog.filter(
    (option) => !items.some((item) => item.itemCode === option.code),
  );
  const brandLocked = items.length > 0;

  function addItem() {
    setLocalError(null);
    const product = catalog.find((option) => option.code === pick);
    const amount = parseAmount(price);
    if (!product) return setLocalError("Select a product to add.");
    if (amount == null) return setLocalError("Enter the price of the product.");
    if (items.length >= PACKAGE_MAX_ITEMS) {
      return setLocalError(
        `A package can have up to ${PACKAGE_MAX_ITEMS} products.`,
      );
    }
    setItems((prev) => [
      ...prev,
      { itemCode: product.code, itemName: product.label, amount },
    ]);
    setPick("");
    setPrice("");
  }

  function changeAmount(index: number, value: string) {
    const amount = parseAmount(value) ?? 0;
    setItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, amount } : item)),
    );
  }

  function publish() {
    setLocalError(null);
    const trimmed = name.trim();
    const totalAmount = parseAmount(shownTotal);
    if (!brandCode) return setLocalError("Choose a product master.");
    if (!trimmed) return setLocalError("Enter a package name.");
    if (items.length === 0) return setLocalError("Add at least one product.");
    if (totalAmount == null) return setLocalError("Enter the package total.");
    onPublish({
      packageId: initial?.packageId ?? 0,
      brandCode,
      packageName: trimmed,
      totalAmount,
      isActive,
      items,
    });
  }

  return (
    <section className="clt-card min-w-0" aria-label="Package details">
      <div className="clt-card-header">
        <h2>
          <i className="fas fa-box" />{" "}
          {initial ? "Edit package" : "Create package"}
        </h2>
      </div>
      <div className="clt-card-body grid gap-6">
        {error || localError ?
          <div
            ref={(el) =>
              el?.scrollIntoView({ behavior: "smooth", block: "center" })
            }
          >
            <AlertBanner tone="error">{localError ?? error}</AlertBanner>
          </div>
        : null}

        <fieldset className="min-w-0">
          <legend className="mc-field-label mb-2">Product master</legend>
          <div className="flex flex-wrap gap-2" role="radiogroup">
            {brands.map((brand) => {
              const on = brand.code === brandCode;
              return (
                <button
                  key={brand.code}
                  type="button"
                  role="radio"
                  aria-checked={on}
                  disabled={brandLocked && !on}
                  onClick={() => setBrandCode(brand.code)}
                  className={cn(
                    "inline-flex min-h-11 items-center gap-2 rounded-full border-2 px-5 font-display text-sm font-semibold transition",
                    on ?
                      "border-mc-secondary bg-mc-secondary-light text-mc-secondary"
                    : "border-line bg-white text-ink hover:border-mc-secondary",
                    brandLocked && !on && "cursor-not-allowed opacity-45",
                  )}
                >
                  <i
                    className={on ? "fas fa-check-circle" : "far fa-circle"}
                    aria-hidden
                  />
                  {brand.label}
                </button>
              );
            })}
          </div>
          <p className="mc-field-hint mt-2">
            {brands.length === 0 ?
              "No product masters are available yet. They will appear here once added."
            : brandLocked ?
              "Remove all products to choose a different master."
            : "Select one master. It can only be chosen once per package."}
          </p>
        </fieldset>

        <TextField
          label="Package name"
          required
          value={name}
          maxLength={PACKAGE_NAME_MAX}
          placeholder="For example Starter"
          onChange={(e) => setName(e.target.value)}
        />

        <div className="grid gap-3 rounded-2xl border border-line bg-[#fdf8f2] p-4 sm:grid-cols-[minmax(0,1fr)_9rem_auto] sm:items-end">
          <SelectField
            label="Select product"
            value={pick}
            disabled={!brandCode}
            hint={
              !brandCode ? "Choose a product master first."
              : available.length === 0 ?
                "No products are available for this master yet."
              : undefined
            }
            onChange={(e) => {
              setPick(e.target.value);
              const suggested = catalog.find(
                (option) => option.code === e.target.value,
              )?.price;
              setPrice(suggested ? String(suggested) : "");
            }}
          >
            <option value="">
              {brandCode ? "Select a product" : "Select product master first"}
            </option>
            {available.map((option) => (
              <option key={option.code} value={option.code}>
                {option.label}
              </option>
            ))}
          </SelectField>
          <TextField
            label="Price"
            type="number"
            inputMode="decimal"
            min={0}
            value={price}
            placeholder="0"
            onChange={(e) => setPrice(e.target.value)}
          />
          <button
            type="button"
            className="mc-btn-secondary min-h-11 w-full sm:w-auto"
            disabled={!brandCode || busy}
            onClick={addItem}
          >
            <i className="fas fa-plus" aria-hidden /> Add
          </button>
        </div>

        <div className="min-w-0">
          <h3 className="mc-field-label mb-2">Package items</h3>
          {items.length === 0 ?
            <p className="rounded-xl border border-dashed border-line px-4 py-6 text-center text-sm text-ink-muted">
              No products yet. Select a product, enter its price and tap Add.
            </p>
          : <ul className="divide-y divide-line overflow-hidden rounded-xl border border-line">
              {items.map((item, index) => (
                <li
                  key={`${item.itemCode ?? item.itemName}-${index}`}
                  className="flex items-center gap-3 px-4 py-2.5"
                >
                  <span className="min-w-0 flex-1 text-sm font-semibold break-words text-ink">
                    {item.itemName}
                  </span>
                  <label className="sr-only" htmlFor={`amt-${index}`}>
                    Amount for {item.itemName}
                  </label>
                  <span className="text-sm text-ink-muted">₹</span>
                  <input
                    id={`amt-${index}`}
                    type="number"
                    inputMode="decimal"
                    min={0}
                    className="mc-field !min-h-9 w-28 text-right"
                    value={String(item.amount)}
                    onChange={(e) => changeAmount(index, e.target.value)}
                  />
                  <button
                    type="button"
                    aria-label={`Remove ${item.itemName}`}
                    title="Remove"
                    className="grid size-9 shrink-0 place-items-center rounded-full text-mc-destructive hover:bg-[var(--mc-destructive-soft)]"
                    onClick={() =>
                      setItems((prev) => prev.filter((_, i) => i !== index))
                    }
                  >
                    <i className="fas fa-trash-alt" aria-hidden />
                  </button>
                </li>
              ))}
            </ul>
          }
        </div>

        <div className="grid gap-2 rounded-2xl bg-mc-secondary px-5 py-4 text-white sm:grid-cols-[1fr_12rem] sm:items-center">
          <div>
            <p className="font-display text-sm font-semibold">Total</p>
            <p className="text-xs text-white/75">
              Editable. It does not need to match the breakup
              {items.length ? ` (${formatMoney(sum)})` : ""}.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-display text-lg font-bold">₹</span>
            <input
              aria-label="Package total"
              type="number"
              inputMode="decimal"
              min={0}
              className="mc-field !min-h-11 w-full text-right font-display text-lg font-bold !text-ink"
              value={shownTotal}
              onChange={(e) => {
                setTotalEdited(true);
                setTotal(e.target.value);
              }}
            />
          </div>
        </div>

        <div className="flex items-center justify-between gap-4 rounded-2xl border border-line px-5 py-4">
          <div className="min-w-0">
            <p className="font-display text-sm font-semibold text-ink">
              {isActive ? "Active" : "Inactive"}
            </p>
            <p className="text-xs text-ink-muted">
              {isActive ?
                "Shown on your public profile."
              : "Hidden from your public profile. You can switch it on any time."
              }
            </p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={isActive}
            aria-label="Show this package on your public profile"
            onClick={() => setIsActive((on) => !on)}
            className={`relative inline-flex h-7 w-12 shrink-0 items-center rounded-full transition ${isActive ? "bg-mc-secondary" : "bg-[#c9c2bb]"}`}
          >
            <span
              className={`inline-block size-5 rounded-full bg-white shadow transition-transform ${isActive ? "translate-x-6" : "translate-x-1"}`}
            />
          </button>
        </div>

        <div className="flex flex-col gap-3 border-t border-line pt-5 sm:flex-row">
          <button
            type="button"
            className="mc-btn-primary w-full sm:w-auto sm:min-w-[11rem]"
            disabled={busy}
            aria-busy={busy}
            onClick={publish}
          >
            {busy ?
              "Saving"
            : initial ?
              "Save package"
            : "Create package"}
          </button>
          <button
            type="button"
            className="mc-btn-secondary w-full sm:w-auto"
            disabled={busy}
            onClick={onCancel}
          >
            Cancel
          </button>
        </div>
      </div>
    </section>
  );
}
