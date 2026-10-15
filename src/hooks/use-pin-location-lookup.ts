"use client";

import { useEffect, useRef, useState } from "react";

import { PIN_LENGTH, PIN_LOOKUP_DEBOUNCE_MS } from "@/constants/location";
import { fetchLocationByPin } from "@/lib/api/master";

type PinLocation = {
  city: string;
  state: string;
};

/**
 * Debounced PIN → city/state. Applies when PIN is 6 digits (India default).
 * Optional `onResolved` runs in the fetch callback (not a sync effect) so
 * form fields can fill without a setState-in-effect cascade.
 */
export function usePinLocationLookup(
  pinCode: string,
  countryCode = "IN",
  onResolved?: (location: PinLocation) => void,
): {
  lookingUp: boolean;
  error: string | null;
  city: string;
  state: string;
} {
  const digits = pinCode.replace(/\D/g, "").slice(0, PIN_LENGTH);
  const active = digits.length === PIN_LENGTH && Boolean(countryCode);
  const onResolvedRef = useRef(onResolved);

  const [lookingUp, setLookingUp] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [location, setLocation] = useState<PinLocation>({
    city: "",
    state: "",
  });

  useEffect(() => {
    onResolvedRef.current = onResolved;
  }, [onResolved]);

  useEffect(() => {
    if (!active) return;

    let cancelled = false;
    const timer = window.setTimeout(() => {
      setLookingUp(true);
      setError(null);
      void fetchLocationByPin({ pinCode: digits, countryCode })
        .then((loc) => {
          if (cancelled) return;
          const nextCity = loc?.city?.trim() ?? "";
          const nextState = loc?.state?.trim() ?? "";
          if (!nextCity && !nextState) {
            setError("Pin code not found.");
            setLocation({ city: "", state: "" });
            return;
          }
          const next = { city: nextCity, state: nextState };
          setLocation(next);
          onResolvedRef.current?.(next);
        })
        .catch((err) => {
          if (cancelled) return;
          setError(err instanceof Error ? err.message : "Pin code not found.");
          setLocation({ city: "", state: "" });
        })
        .finally(() => {
          if (!cancelled) setLookingUp(false);
        });
    }, PIN_LOOKUP_DEBOUNCE_MS);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [active, digits, countryCode]);

  if (!active) {
    return { lookingUp: false, error: null, city: "", state: "" };
  }

  return {
    lookingUp,
    error,
    city: location.city,
    state: location.state,
  };
}
