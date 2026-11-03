import type {
  CoachPost,
  CoachShowcase,
  CoachShowcasePackage,
  PostCategoryOption,
  ProductBrandOption,
  ProductItemOption,
  SavePackageInput,
  SavePostInput,
} from "@/types/showcase";

import { authedFetch } from "@/lib/api/authed";
import { apiFetch } from "@/lib/api/client";
import { fetchMasterItems } from "@/lib/api/master";
import { isApiSuccess, num, pick, text } from "@/lib/api/normalize";

/** Human-readable brand name from master list; falls back to the code. */
export function productBrandLabel(
  brands: readonly ProductBrandOption[],
  code: string,
): string {
  const trimmed = code.trim();
  if (!trimmed) return "";
  return (
    brands.find((brand) => brand.code === trimmed)?.label.trim() || trimmed
  );
}

function mapPackage(raw: unknown): CoachShowcasePackage {
  const r = (raw ?? {}) as Record<string, unknown>;
  const items = Array.isArray(r.items) ? r.items : [];
  return {
    packageId: num(r.packageId),
    brandCode: text(r.brandCode),
    brandName: text(r.brandName),
    packageName: text(r.packageName),
    totalAmount: num(r.totalAmount),
    isActive: r.isActive !== false,
    items: items.map((item) => {
      const i = (item ?? {}) as Record<string, unknown>;
      return {
        itemCode: i.itemCode ? text(i.itemCode) : null,
        itemName: text(i.itemName),
        amount: num(i.amount),
      };
    }),
  };
}

function mapPost(raw: unknown): CoachPost {
  const r = (raw ?? {}) as Record<string, unknown>;
  return {
    postId: num(r.postId),
    categoryCode: text(r.categoryCode),
    categoryName: text(r.categoryName),
    title: text(r.title),
    description: text(r.description),
    postDate: text(r.postDate),
    location: text(r.location),
    clientCode: r.clientCode ? text(r.clientCode) : null,
    clientName: text(r.clientName),
    mediaUrl: text(r.mediaUrl),
    mediaType: r.mediaType === "video" ? "video" : "image",
    consentAccepted: r.consentAccepted === true,
  };
}

// ── Masters (anonymous, cached) ────────────────────────────────────────────

export async function fetchPostCategories(): Promise<PostCategoryOption[]> {
  const response = await fetchMasterItems({ ItemType: "POSTCATEGORY" });
  if (!isApiSuccess(response)) return [];
  return (response.responseObj ?? []).map((item) => ({
    code: item.code,
    label: item.label,
    iconClass: item.iconClass ?? "fas fa-image",
    requiresClient: /\bclient\b/.test(item.description ?? ""),
    requiresConsent: /\bconsent\b/.test(item.description ?? ""),
  }));
}

export type ReportTemplate = {
  code: string;
  label: string;
  isDefault: boolean;
};

/** BMI report or diet plan designs from MstReportTemplate. `code` is the file name the API renders. */
export async function fetchReportTemplates(
  type: "BMI" | "DIET",
): Promise<ReportTemplate[]> {
  const response = await fetchMasterItems({
    ItemType: type === "BMI" ? "BMITEMPLATE" : "DIETTEMPLATE",
  });
  if (!isApiSuccess(response)) return [];
  return (response.responseObj ?? []).map((item) => ({
    code: item.code,
    label: item.label,
    isDefault: item.description === "default",
  }));
}

export async function fetchProductBrands(): Promise<ProductBrandOption[]> {
  const response = await fetchMasterItems({ ItemType: "PRODUCTBRAND" });
  if (!isApiSuccess(response)) return [];
  return (response.responseObj ?? []).map((item) => ({
    code: item.code,
    label: item.label,
  }));
}

/** Map one Showcase product row (camelCase or PascalCase ASP.NET payload). */
export function mapProductItemOption(
  raw: unknown,
  brandCode: string,
): ProductItemOption {
  const r = (raw ?? {}) as Record<string, unknown>;
  return {
    code: text(pick(r, "itemCode", "ItemCode")),
    label: text(pick(r, "itemName", "ItemName")),
    brandCode,
    price: num(pick(r, "price", "Price")),
    category: text(pick(r, "category", "Category")),
    packSize: text(pick(r, "packSize", "PackSize")),
  };
}

export async function fetchProductItems(
  brandCode: string,
): Promise<ProductItemOption[]> {
  if (!brandCode) return [];
  const rows = await authedFetch<unknown[]>(
    `Showcase/products?brandCode=${encodeURIComponent(brandCode)}`,
  );
  return (rows ?? []).map((raw) => mapProductItemOption(raw, brandCode));
}

// ── Coach's own packages and posts ─────────────────────────────────────────

export async function fetchMyPackages(): Promise<CoachShowcasePackage[]> {
  const rows = await authedFetch<unknown[]>("Showcase/packages");
  return (rows ?? []).map(mapPackage);
}

export async function savePackage(
  input: SavePackageInput,
): Promise<CoachShowcasePackage> {
  const saved = await authedFetch<unknown>("Showcase/packages", {
    method: "POST",
    body: input,
  });
  return mapPackage(saved);
}

export async function setPackageActive(
  packageId: number,
  isActive: boolean,
): Promise<void> {
  await authedFetch<boolean>(`Showcase/packages/${packageId}/active`, {
    method: "POST",
    body: { isActive },
  });
}

export async function deletePackage(packageId: number): Promise<void> {
  await authedFetch<boolean>(`Showcase/packages/${packageId}`, {
    method: "DELETE",
  });
}

export async function fetchMyPosts(): Promise<CoachPost[]> {
  const rows = await authedFetch<unknown[]>("Showcase/posts");
  return (rows ?? []).map(mapPost);
}

export async function savePost(input: SavePostInput): Promise<CoachPost> {
  const saved = await authedFetch<unknown>("Showcase/posts", {
    method: "POST",
    body: input,
  });
  return mapPost(saved);
}

export async function deletePost(postId: number): Promise<void> {
  await authedFetch<boolean>(`Showcase/posts/${postId}`, {
    method: "DELETE",
  });
}

// ── Public profile ─────────────────────────────────────────────────────────

/** Packages and posts for a public coach page. Empty when the API has none. */
export async function fetchPublicShowcase(
  coachCode: string,
): Promise<CoachShowcase> {
  const empty: CoachShowcase = { packages: [], posts: [] };
  if (!coachCode) return empty;
  const response = await apiFetch<unknown>(
    `/Showcase/public?coachCode=${encodeURIComponent(coachCode)}`,
    { next: { revalidate: 60 }, skipAuth: true },
  );
  if (!isApiSuccess(response)) return empty;
  const r = (response.responseObj ?? {}) as Record<string, unknown>;
  return {
    packages: (Array.isArray(r.packages) ? r.packages : []).map(mapPackage),
    posts: (Array.isArray(r.posts) ? r.posts : []).map(mapPost),
  };
}
