/** Local calendar date as yyyy-MM-dd. Matches the app's formatLocalDate. */
export function formatLocalDate(date = new Date()): string {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function isRealDate(year: number, month: number, day: number): boolean {
  if (month < 1 || month > 12 || day < 1 || day > 31) return false;
  const dt = new Date(year, month - 1, day);
  return (
    dt.getFullYear() === year &&
    dt.getMonth() === month - 1 &&
    dt.getDate() === day
  );
}

/**
 * Value for save-client-detail date columns.
 * The app sends yyyy-MM-dd (toApiDob / formatLocalDate). SQL style 23 reads that
 * unambiguously. The detail API returns DOB as dd/MM/yyyy (CONVERT style 103),
 * and an empty date must be null rather than "" or the "dd/mm/yyyy" placeholder.
 */
export function toApiDate(value: string | null | undefined): string | null {
  const trimmed = (value ?? "").trim();
  if (!trimmed || /^dd\/mm\/yyyy$/i.test(trimmed)) return null;

  const ymd = /^(\d{4})-(\d{2})-(\d{2})$/.exec(trimmed);
  if (ymd) {
    const year = Number(ymd[1]);
    const month = Number(ymd[2]);
    const day = Number(ymd[3]);
    if (!isRealDate(year, month, day)) return null;
    return `${ymd[1]}-${ymd[2]}-${ymd[3]}`;
  }

  const dmy = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(trimmed);
  if (dmy) {
    const day = Number(dmy[1]);
    const month = Number(dmy[2]);
    const year = Number(dmy[3]);
    if (!isRealDate(year, month, day)) return null;
    return `${String(year)}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  }

  return null;
}
