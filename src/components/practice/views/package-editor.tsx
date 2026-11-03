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
import { fetchAuthedCoachProfile } from "@/lib/api/practice";
import {
  fetchProductBrands,
  fetchProductItems,
  productBrandLabel,
} from "@/lib/api/showcase";
import { formatMoney } from "@/lib/format";
import {
  firstItemOverMrp,
  itemAmountOverMrp,
  packageTotalOverMrp,
  sumItemMrp,
} from "@/lib/package-validation";
import { cn } from "@/lib/utils";

/** Blank category on a product. Not an extra API level. */
const UNSPECIFIED = "\u241e";
const EMPTY_PRODUCTS: ProductItemOption[] = [];

function levelKey(value: string | undefined): string {
  const trimmed = value?.trim() ?? "";
  return trimmed || UNSPECIFIED;
}

function levelLabel(value: string): string {
  return value === UNSPECIFIED ? "Not specified" : value;
}

function uniqueLevels(values: (string | undefined)[]): string[] {
  const keys = [...new Set(values.map(levelKey))];
  keys.sort((a, b) => {
    if (a === UNSPECIFIED) return 1;
    if (b === UNSPECIFIED) return -1;
    return a.localeCompare(b);
  });
  return keys;
}

type Props = {
  /** Product brand from the signed-in coach profile. */
  coachBrandCode: string;
  /** Readable brand label from profile (optional; avoids empty header while profile loads). */
  coachBrandName?: string;
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
 * Package creation: name the package, then pick products from the coach profile
 * brand catalog (category, then product). The coach sets each price and a total.
 */
export function PackageEditor({
  coachBrandCode,
  coachBrandName = "",
  initial,
  busy,
  error,
  onPublish,
  onCancel,
}: Props) {
  const [profileBrandCode, setProfileBrandCode] = useState("");
  const [profileBrandName, setProfileBrandName] = useState("");
  const [productBrands, setProductBrands] = useState<ProductBrandOption[]>([]);
  const [profileBrandReady, setProfileBrandReady] = useState(false);
  const brandCode = (
    profileBrandCode ||
    coachBrandCode.trim() ||
    initial?.brandCode?.trim() ||
    ""
  ).trim();
  const [name, setName] = useState(initial?.packageName ?? "");
  const [items, setItems] = useState<PackageItem[]>(initial?.items ?? []);
  const [catalog, setCatalog] = useState<ProductItemOption[]>([]);
  const [loadedFor, setLoadedFor] = useState("");
  const [catalogError, setCatalogError] = useState(false);
  const [category, setCategory] = useState("");
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
    void Promise.all([fetchAuthedCoachProfile(), fetchProductBrands()])
      .then(([profile, brands]) => {
        if (cancelled) return;
        setProfileBrandCode(profile?.brandCode?.trim() ?? "");
        setProfileBrandName(profile?.brandName?.trim() ?? "");
        setProductBrands(brands);
      })
      .catch(() => {
        if (!cancelled) {
          setProfileBrandCode("");
          setProfileBrandName("");
          setProductBrands([]);
        }
      })
      .finally(() => {
        if (!cancelled) setProfileBrandReady(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const brandDisplayName = useMemo(() => {
    if (!brandCode) return "";
    return (
      profileBrandName ||
      coachBrandName.trim() ||
      initial?.brandName?.trim() ||
      productBrandLabel(productBrands, brandCode)
    );
  }, [
    brandCode,
    profileBrandName,
    coachBrandName,
    initial?.brandName,
    productBrands,
  ]);

  useEffect(() => {
    if (!brandCode) return;
    let cancelled = false;
    void fetchProductItems(brandCode)
      .then((rows) => {
        if (cancelled) return;
        setCatalog(rows);
        setCatalogError(false);
        setLoadedFor(brandCode);
      })
      .catch(() => {
        if (cancelled) return;
        setCatalog([]);
        setCatalogError(true);
        setLoadedFor(brandCode);
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
  const brandLoading =
    !profileBrandReady && !coachBrandCode.trim() && !initial?.brandCode?.trim();
  const catalogLoading =
    brandLoading || (Boolean(brandCode) && loadedFor !== brandCode);
  const catalogFailed =
    Boolean(brandCode) && loadedFor === brandCode && catalogError;
  const visibleCatalog = useMemo(
    () => (loadedFor === brandCode && !catalogError ? catalog : EMPTY_PRODUCTS),
    [loadedFor, brandCode, catalogError, catalog],
  );
  const available = useMemo(
    () =>
      visibleCatalog.filter(
        (option) => !items.some((item) => item.itemCode === option.code),
      ),
    [visibleCatalog, items],
  );
  const categories = useMemo(
    () => uniqueLevels(available.map((option) => option.category)),
    [available],
  );
  const categoryValue = categories.includes(category) ? category : "";
  const shownProducts = useMemo(() => {
    if (!categoryValue) return [];
    return available.filter(
      (option) => levelKey(option.category) === categoryValue,
    );
  }, [available, categoryValue]);
  const picked = shownProducts.find((option) => option.code === pick) ?? null;
  const mrpByItemCode = useMemo(() => {
    const map = new Map<string, number>();
    for (const option of visibleCatalog) {
      map.set(option.code, option.price);
    }
    return map;
  }, [visibleCatalog]);

  const addPriceMrpError = useMemo(() => {
    if (!picked) return null;
    const amount = parseAmount(price);
    if (amount == null) return null;
    if (itemAmountOverMrp(amount, picked.price)) {
      return `Price cannot be higher than the product MRP (${formatMoney(picked.price)}).`;
    }
    return null;
  }, [picked, price]);

  const itemMrpErrorByIndex = useMemo(() => {
    const errors = new Map<number, string>();
    items.forEach((item, index) => {
      const code = item.itemCode?.trim();
      if (!code) return;
      const mrp = mrpByItemCode.get(code);
      if (mrp == null || !Number.isFinite(mrp)) return;
      if (itemAmountOverMrp(item.amount, mrp)) {
        errors.set(index, `Cannot exceed MRP (${formatMoney(mrp)}).`);
      }
    });
    return errors;
  }, [items, mrpByItemCode]);

  const totalMrpError = useMemo(() => {
    const totalAmount = parseAmount(shownTotal);
    if (totalAmount == null || items.length === 0) return null;
    const mrpSum = sumItemMrp(items, mrpByItemCode);
    if (packageTotalOverMrp(totalAmount, mrpSum)) {
      return `Package total cannot be higher than the combined MRP (${formatMoney(mrpSum)}).`;
    }
    return null;
  }, [shownTotal, items, mrpByItemCode]);

  function chooseCategory(value: string) {
    if (value === category) return;
    setCategory(value);
    setPick("");
    setPrice("");
  }

  function addItem() {
    setLocalError(null);
    const product = picked;
    const amount = parseAmount(price);
    if (!brandCode) {
      return setLocalError(
        "Set a product brand on your profile before adding products.",
      );
    }
    if (!categoryValue) return setLocalError("Select a category.");
    if (!product) return setLocalError("Select a product to add.");
    if (amount == null) return setLocalError("Enter the price of the product.");
    if (itemAmountOverMrp(amount, product.price)) {
      return setLocalError(
        `Price cannot be higher than the product MRP (${formatMoney(product.price)}).`,
      );
    }
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
    if (!brandCode) {
      return setLocalError(
        "Set a product brand on your profile before saving packages.",
      );
    }
    if (!trimmed) return setLocalError("Enter a package name.");
    if (items.length === 0) return setLocalError("Add at least one product.");
    if (totalAmount == null) return setLocalError("Enter the package total.");
    const overItem = firstItemOverMrp(items, mrpByItemCode);
    if (overItem) {
      return setLocalError(
        `${overItem.itemName} cannot be priced above its MRP (${formatMoney(overItem.mrp)}).`,
      );
    }
    const mrpSum = sumItemMrp(items, mrpByItemCode);
    if (packageTotalOverMrp(totalAmount, mrpSum)) {
      return setLocalError(
        `Package total cannot be higher than the combined MRP (${formatMoney(mrpSum)}).`,
      );
    }
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
      <div className="clt-card-header clt-card-header--stack">
        <div className="min-w-0">
          <h2>
            <i className="fas fa-box" />{" "}
            {initial ? "Edit package" : "Create package"}
          </h2>
          {brandCode && brandDisplayName ?
            <p className="clt-card-header-meta">
              <i className="fas fa-tags" aria-hidden /> Product brand:{" "}
              {brandDisplayName}
            </p>
          : null}
        </div>
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

        <TextField
          label="Package name"
          required
          value={name}
          maxLength={PACKAGE_NAME_MAX}
          placeholder="For example Starter"
          onChange={(e) => setName(e.target.value)}
        />

        {profileBrandReady && !brandCode ?
          <AlertBanner tone="info">
            Choose a product brand under Edit profile → Professional details
            before you add products to a package.
          </AlertBanner>
        : null}

        <div className="grid gap-3 rounded-2xl border border-line bg-[#fdf8f2] p-4">
          <SelectField
            label="Category"
            value={categoryValue}
            disabled={
              !brandCode ||
              catalogLoading ||
              catalogFailed ||
              categories.length === 0
            }
            hint={
              !brandCode && profileBrandReady ?
                "Set a product brand under Edit profile → Professional details before choosing products."
              : brandCode && catalogFailed ?
                "Could not load products."
              : brandCode && catalogLoading ?
                "Loading products."
              : brandCode && !catalogLoading && visibleCatalog.length === 0 ?
                "No products are available for this brand yet."
              : brandCode && !catalogLoading && available.length === 0 ?
                "Every product from this brand is already in the package."
              : undefined
            }
            onChange={(e) => chooseCategory(e.target.value)}
          >
            <option value="">
              {catalogLoading ? "Loading..." : "Select a category"}
            </option>
            {categories.map((key) => (
              <option key={key} value={key}>
                {levelLabel(key)}
              </option>
            ))}
          </SelectField>

          <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_9rem_auto] sm:items-end">
            <SelectField
              label="Product"
              value={picked?.code ?? ""}
              disabled={!categoryValue || shownProducts.length === 0}
              hint={
                (
                  categoryValue &&
                  shownProducts.length === 0 &&
                  available.length > 0
                ) ?
                  "No products are left in this category."
                : undefined
              }
              onChange={(e) => {
                setPick(e.target.value);
                const suggested = visibleCatalog.find(
                  (option) => option.code === e.target.value,
                )?.price;
                setPrice(suggested ? String(suggested) : "");
              }}
            >
              <option value="">
                {categoryValue ? "Select a product" : "Select a category first"}
              </option>
              {shownProducts.map((option) => (
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
              value={picked ? price : ""}
              placeholder="0"
              error={addPriceMrpError}
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
        </div>

        <div className="min-w-0">
          <h3 className="mc-field-label mb-2">Package items</h3>
          {items.length === 0 ?
            <p className="rounded-xl border border-dashed border-line px-4 py-6 text-center text-sm text-ink-muted">
              No products yet. Select a product, enter its price and tap Add.
            </p>
          : <ul className="divide-y divide-line overflow-hidden rounded-xl border border-line">
              {items.map((item, index) => {
                const itemMrpError = itemMrpErrorByIndex.get(index);
                return (
                  <li
                    key={`${item.itemCode ?? item.itemName}-${index}`}
                    className="flex flex-wrap items-center gap-3 px-4 py-2.5"
                  >
                    <span className="min-w-0 flex-1 text-sm font-semibold break-words text-ink">
                      {item.itemName}
                    </span>
                    <label className="sr-only" htmlFor={`amt-${index}`}>
                      Amount for {item.itemName}
                    </label>
                    <span className="text-sm text-ink-muted">₹</span>
                    <div className="flex flex-col items-end gap-1">
                      <input
                        id={`amt-${index}`}
                        type="number"
                        inputMode="decimal"
                        min={0}
                        aria-invalid={itemMrpError ? true : undefined}
                        className={cn(
                          "mc-field !min-h-9 w-28 text-right",
                          itemMrpError && "mc-field-error",
                        )}
                        value={String(item.amount)}
                        onChange={(e) => changeAmount(index, e.target.value)}
                      />
                      {itemMrpError ?
                        <p
                          className="mc-field-error-text max-w-36 text-right text-xs"
                          role="alert"
                        >
                          {itemMrpError}
                        </p>
                      : null}
                    </div>
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
                );
              })}
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
          <div className="flex flex-col gap-1 sm:items-end">
            <div className="flex items-center gap-2">
              <span className="font-display text-lg font-bold">₹</span>
              <input
                aria-label="Package total"
                type="number"
                inputMode="decimal"
                min={0}
                aria-invalid={totalMrpError ? true : undefined}
                className={cn(
                  "mc-field !min-h-11 w-full text-right font-display text-lg font-bold !text-ink",
                  totalMrpError && "mc-field-error",
                )}
                value={shownTotal}
                onChange={(e) => {
                  setTotalEdited(true);
                  setTotal(e.target.value);
                }}
              />
            </div>
            {totalMrpError ?
              <p className="text-xs text-red-200" role="alert">
                {totalMrpError}
              </p>
            : null}
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
