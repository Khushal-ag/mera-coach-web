export type PackageItem = {
  itemCode?: string | null;
  itemName: string;
  amount: number;
};

export type CoachShowcasePackage = {
  packageId: number;
  brandCode: string;
  brandName: string;
  packageName: string;
  totalAmount: number;
  items: PackageItem[];
};

export type CoachPost = {
  postId: number;
  categoryCode: string;
  categoryName: string;
  title: string;
  description: string;
  /** yyyy-MM-dd */
  postDate: string;
  location: string;
  /** Only for the signed-in coach. Public reads leave it out. */
  clientCode?: string | null;
  /** Full name for the coach, first name only in public reads. */
  clientName: string;
  mediaUrl: string;
  mediaType: "image" | "video";
  consentAccepted: boolean;
};

export type CoachShowcase = {
  packages: CoachShowcasePackage[];
  posts: CoachPost[];
};

export type SavePackageInput = {
  packageId: number;
  brandCode: string;
  packageName: string;
  totalAmount: number;
  items: PackageItem[];
};

export type SavePostInput = {
  postId: number;
  categoryCode: string;
  title: string;
  description: string;
  postDate: string;
  location: string;
  clientCode: string;
  mediaUrl: string;
  consentAccepted: boolean;
};

/** Rules for a category from the post category master. */
export type PostCategoryOption = {
  code: string;
  label: string;
  iconClass: string;
  requiresClient: boolean;
  requiresConsent: boolean;
};

export type ProductBrandOption = { code: string; label: string };
export type ProductItemOption = {
  code: string;
  label: string;
  brandCode: string;
};
