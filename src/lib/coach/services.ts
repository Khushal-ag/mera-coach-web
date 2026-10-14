/** Split API `serviceNames` CSV into trimmed tags. */
export function splitServiceNames(serviceNames?: string | null): string[] {
  if (!serviceNames?.trim()) return [];
  return serviceNames
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}
