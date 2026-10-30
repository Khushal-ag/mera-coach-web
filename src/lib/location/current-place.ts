import type { CoachProfile } from "@/types/coach";

import { fetchLocationByPin } from "@/lib/api/master";
import { saveCoachProfileEssentials } from "@/lib/api/practice";

/** Asks the browser for the coach's position and looks the address up on OpenStreetMap (Nominatim). */

export type DetectedPlace = {
  pinCode: string;
  locality: string;
  addLine: string;
};

type NominatimAddress = {
  postcode?: string;
  suburb?: string;
  neighbourhood?: string;
  city_district?: string;
  village?: string;
  road?: string;
  house_number?: string;
};

/** Picks the fields the profile form asks for out of a reverse-geocode answer. */
export function parseNominatimPlace(json: unknown): DetectedPlace {
  const address = ((json as { address?: NominatimAddress } | null)?.address ??
    {}) as NominatimAddress;
  const pin = (address.postcode ?? "").replace(/\D/g, "").slice(0, 6);
  const locality =
    address.suburb ??
    address.neighbourhood ??
    address.city_district ??
    address.village ??
    "";
  const addLine = [address.house_number, address.road]
    .filter(Boolean)
    .join(" ");
  return { pinCode: pin.length === 6 ? pin : "", locality, addLine };
}

function currentPosition(): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      reject(new Error("This browser cannot share your location."));
      return;
    }
    navigator.geolocation.getCurrentPosition(resolve, (error) => {
      reject(
        new Error(
          error.code === error.PERMISSION_DENIED ?
            "Location permission was not given. You can type your address instead."
          : "Could not get your location. You can type your address instead.",
        ),
      );
    });
  });
}

export async function detectCurrentPlace(): Promise<DetectedPlace> {
  const { coords } = await currentPosition();
  const response = await fetch(
    `https://nominatim.openstreetmap.org/reverse?format=jsonv2&addressdetails=1&zoom=18&accept-language=en&lat=${coords.latitude}&lon=${coords.longitude}`,
  );
  if (!response.ok) {
    throw new Error("Could not look up your address. You can type it instead.");
  }
  const place = parseNominatimPlace(await response.json());
  if (!place.pinCode) {
    throw new Error(
      "Your pin code could not be found here. You can type your address instead.",
    );
  }
  return place;
}

const ASKED_KEY = "mc-location-asked";

/** Asks the browser for location once per tab session and saves the address when the profile has no pin code. */
export async function autoFillProfileLocation(
  profile: CoachProfile,
): Promise<boolean> {
  if (profile.pinCode?.trim()) return false;
  try {
    if (sessionStorage.getItem(ASKED_KEY)) return false;
    sessionStorage.setItem(ASKED_KEY, "1");
  } catch {
    return false;
  }
  try {
    const place = await detectCurrentPlace();
    const country = profile.country_Cd || "IN";
    const city = await fetchLocationByPin({
      pinCode: place.pinCode,
      countryCode: country,
    }).catch(() => null);
    await saveCoachProfileEssentials({
      profile,
      coachName: profile.coachName,
      tagline: profile.tagline ?? "",
      coachDesc: profile.coachDesc ?? "",
      mobile: profile.mobile ?? "",
      email: profile.email ?? "",
      locality: profile.locality || place.locality,
      add_Line: profile.add_Line || place.addLine,
      city_Cd: profile.city_Cd || city?.city || "",
      state_Cd: profile.state_Cd || city?.state || "",
      country_Cd: country,
      pinCode: place.pinCode,
    });
    return true;
  } catch {
    // Location is a convenience; the coach can still type the address in Edit Profile.
    return false;
  }
}
