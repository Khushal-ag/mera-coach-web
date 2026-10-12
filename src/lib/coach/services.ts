/** Split API `serviceNames` CSV into trimmed tags. */
export function splitServiceNames(serviceNames?: string | null): string[] {
  if (!serviceNames?.trim()) return [];
  return serviceNames
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

export function buildEnquiryLookingForOptions(opts: {
  packageNames?: string[];
  serviceNames?: string | null;
}): string[] {
  const fromPackages = (opts.packageNames ?? [])
    .map((n) => n.trim())
    .filter(Boolean);
  const fromServices = splitServiceNames(opts.serviceNames);
  const seen = new Set<string>();
  const options: string[] = [];
  for (const item of [...fromPackages, ...fromServices]) {
    const key = item.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    options.push(item);
  }
  options.push("Not sure yet, need advice");
  return options;
}
