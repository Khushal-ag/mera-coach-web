/** Maps PIN lookup API country values to ISO country codes used in forms. */

const COUNTRY_NAME_TO_CODE: Record<string, string> = {
  india: "IN",
};

export type PinLocationFields = {
  city: string;
  state: string;
  countryCode: string;
};

/**
 * Resolves a dropdown-ready ISO country code from a PIN lookup response.
 * Falls back to the lookup request code, then IN for 6-digit Indian PINs.
 */
export function resolveCountryCodeForPinLookup(params: {
  apiCountry?: string;
  lookupCountryCode?: string;
  pinCode?: string;
}): string {
  const api = (params.apiCountry ?? "").trim();
  if (api) {
    if (/^[A-Za-z]{2}$/.test(api)) return api.toUpperCase();
    const byName = COUNTRY_NAME_TO_CODE[api.toLowerCase()];
    if (byName) return byName;
  }

  const lookup = (params.lookupCountryCode ?? "").trim();
  if (lookup) return lookup.toUpperCase();

  const pin = (params.pinCode ?? "").replace(/\D/g, "");
  if (pin.length === 6) return "IN";

  return "";
}

/** Normalizes raw PIN lookup API data into form fields including country. */
export function mapPinLookupToFields(
  raw: { city?: string; state?: string; country?: string } | null | undefined,
  lookupCountryCode: string,
  pinCode: string,
): PinLocationFields {
  const city = (raw?.city ?? "").trim();
  const state = (raw?.state ?? "").trim();
  const countryCode = resolveCountryCodeForPinLookup({
    apiCountry: raw?.country,
    lookupCountryCode,
    pinCode,
  });
  return { city, state, countryCode };
}
