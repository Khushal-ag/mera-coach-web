/** Up to `size` consecutive page numbers around `page`, sliding at either end. */
export function pageWindow(page: number, pages: number, size = 5) {
  const end = Math.min(pages, Math.max(1, page - 2) + size - 1);
  const start = Math.max(1, end - size + 1);
  return { start, end };
}
