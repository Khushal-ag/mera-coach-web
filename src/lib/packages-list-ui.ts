const MAX_PACKAGES = 10;

export function shouldShowPackagesSubtitle(
  hasBrand: boolean,
  packageCount: number,
): boolean {
  return hasBrand || packageCount > 0;
}

export function getPackagesEmptyStateCopy(
  hasBrand: boolean,
  brandName: string,
) {
  if (!hasBrand) {
    return {
      title: "Add a product brand",
      description:
        "Choose your brand under Professional details in Edit profile. Then you can bundle products into packages for your public page.",
      actionLabel: "Go to Professional details",
    };
  }
  const brand = brandName.trim() || "your brand";
  return {
    title: "No packages yet",
    description: `Bundle ${brand} products into one offer with a single price on your public profile.`,
    actionLabel: "Create your first package",
  };
}

export function packagesPageDescription(maxPackages = MAX_PACKAGES): string {
  return `Up to ${maxPackages} product packages for your public profile.`;
}

export const PROFESSIONAL_DETAILS_PROFILE_HREF =
  "/dashboard/profile?step=professional";
