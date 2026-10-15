import { ImageResponse } from "next/og";

import { OG_GOLD } from "@/constants/brand";
import { fetchCoachProfile, isApiSuccess } from "@/lib/api";
import { splitServiceNames } from "@/lib/coach/services";
import { resolveMediaUrl } from "@/lib/media/media-url";

export const alt = "Coach profile on Mera Coach";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** Fetch the photo ourselves so a slow, huge or unsupported image can never break the card. */
async function loadPhoto(url: string): Promise<string> {
  if (!url) return "";
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(4000) });
    const type = res.headers.get("content-type")?.split(";")[0] ?? "";
    if (!res.ok || !["image/png", "image/jpeg"].includes(type)) return "";
    const bytes = new Uint8Array(await res.arrayBuffer());
    if (bytes.length === 0 || bytes.length > 2_000_000) return "";
    return `data:${type};base64,${Buffer.from(bytes).toString("base64")}`;
  } catch {
    return "";
  }
}

function Star({ on }: { on: boolean }) {
  return (
    <svg width="34" height="34" viewBox="0 0 24 24">
      <path
        d="M12 2.5l2.9 6.1 6.6.8-4.9 4.6 1.3 6.6L12 17.4 6.1 20.6l1.3-6.6L2.5 9.4l6.6-.8L12 2.5z"
        fill={on ? OG_GOLD : "rgba(255,255,255,0.28)"}
      />
    </svg>
  );
}

/**
 * Branded share card for a coach profile link (WhatsApp, Facebook, LinkedIn, X).
 * It mirrors the top of the real profile page: photo on the left; category,
 * name, tagline, rating and service chips on the right.
 */
export default async function Image({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  let name = "Mera Coach";
  let category = "Health & Wellness Coach";
  let tagline = "Find verified health, fitness and wellness coaches";
  let rating = 0;
  let reviews = 0;
  let services: string[] = [];
  let photoUrl = "";
  try {
    const asId = Number(code);
    const response = await fetchCoachProfile(
      Number.isFinite(asId) && asId > 0 && String(asId) === code ?
        { coachId: asId }
      : { coachCode: code },
    );
    if (isApiSuccess(response) && response.responseObj) {
      const coach = response.responseObj;
      name = coach.coachName || name;
      category = coach.coachTypeName || category;
      tagline = coach.tagline?.trim() || tagline;
      rating = coach.rating ?? 0;
      reviews = coach.reviewCount ?? 0;
      services = splitServiceNames(coach.serviceNames).slice(0, 4);
      photoUrl = resolveMediaUrl(coach.profile_Pic_Url || coach.logo_Url) || "";
    }
  } catch {
    // Fall back to the generic card.
  }
  const photo = await loadPhoto(photoUrl);
  // Half stars round to the nearest whole star on the card.
  const lit = Math.round(rating);

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        background: "linear-gradient(135deg, #1f4d38 0%, #14301f 100%)",
        color: "#fff",
        fontFamily: "sans-serif",
      }}
    >
      <div
        style={{
          display: "flex",
          flex: 1,
          alignItems: "center",
          padding: "0 72px",
        }}
      >
        <div
          style={{
            display: "flex",
            width: 380,
            height: 380,
            marginRight: 56,
            borderRadius: 40,
            background: "#7a2a22",
            border: "3px solid rgba(212,145,43,0.55)",
            overflow: "hidden",
            flexShrink: 0,
          }}
        >
          {photo ?
            <img
              src={photo}
              width={380}
              height={380}
              alt=""
              style={{ objectFit: "cover" }}
            />
          : null}
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            flex: 1,
            minWidth: 0,
          }}
        >
          <div style={{ display: "flex" }}>
            <div
              style={{
                display: "flex",
                padding: "10px 22px",
                borderRadius: 999,
                background: "rgba(255,255,255,0.14)",
                border: "1px solid rgba(255,255,255,0.3)",
                fontSize: 24,
                fontWeight: 700,
              }}
            >
              {category}
            </div>
            <div
              style={{
                display: "flex",
                marginLeft: 14,
                padding: "10px 22px",
                borderRadius: 999,
                background: "rgba(34,197,94,0.16)",
                border: "1px solid rgba(34,197,94,0.5)",
                color: "#4ade80",
                fontSize: 24,
                fontWeight: 700,
              }}
            >
              Available Now
            </div>
          </div>
          <div
            style={{
              fontSize: name.length > 20 ? 64 : 78,
              fontWeight: 800,
              lineHeight: 1.08,
              marginTop: 24,
            }}
          >
            {name}
          </div>
          <div
            style={{
              fontSize: 34,
              fontWeight: 600,
              marginTop: 14,
              color: "rgba(255,255,255,0.88)",
            }}
          >
            {tagline.length > 64 ? `${tagline.slice(0, 61)}...` : tagline}
          </div>
          {rating > 0 && reviews > 0 ?
            <div
              style={{ display: "flex", alignItems: "center", marginTop: 22 }}
            >
              {[1, 2, 3, 4, 5].map((i) => (
                <Star key={i} on={i <= lit} />
              ))}
              <div
                style={{
                  marginLeft: 14,
                  fontSize: 32,
                  fontWeight: 800,
                  color: OG_GOLD,
                }}
              >
                {rating.toFixed(1)}
              </div>
              {reviews > 0 ?
                <div
                  style={{
                    marginLeft: 14,
                    fontSize: 24,
                    color: "rgba(255,255,255,0.7)",
                  }}
                >
                  {`from ${reviews} ${reviews === 1 ? "review" : "reviews"}`}
                </div>
              : null}
            </div>
          : null}
          {services.length ?
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                marginTop: 26,
              }}
            >
              {services.map((service) => (
                <div
                  key={service}
                  style={{
                    display: "flex",
                    marginRight: 12,
                    marginBottom: 10,
                    padding: "8px 18px",
                    borderRadius: 999,
                    background: "rgba(255,255,255,0.1)",
                    border: "1px solid rgba(255,255,255,0.25)",
                    fontSize: 22,
                    fontWeight: 600,
                  }}
                >
                  {service}
                </div>
              ))}
            </div>
          : null}
        </div>
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 72px",
          height: 84,
          background: "rgba(0,0,0,0.22)",
          fontSize: 26,
        }}
      >
        <div style={{ display: "flex", fontWeight: 800 }}>
          <span style={{ color: "#a8c4b4" }}>Mera</span>
          <span style={{ color: "#f47f1e", marginLeft: 8 }}>Coach</span>
        </div>
        <div
          style={{
            display: "flex",
            padding: "10px 26px",
            borderRadius: 999,
            background: OG_GOLD,
            fontSize: 24,
            fontWeight: 800,
          }}
        >
          Book a free consultation
        </div>
        <div style={{ display: "flex", color: "rgba(255,255,255,0.7)" }}>
          mera-coach.com
        </div>
      </div>
    </div>,
    size,
  );
}
