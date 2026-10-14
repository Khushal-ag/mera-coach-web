import { publicPageMetadata } from "@/lib/seo";

export const metadata = publicPageMetadata({
  title: "Privacy Policy",
  description: "Use this page to detail your site's privacy policy.",
  path: "/privacy",
  absolute: true,
});

export default function PrivacyPage() {
  return (
    <div className="mc-public">
      <div className="container" style={{ paddingTop: 112, paddingBottom: 48 }}>
        <h1
          style={{
            margin: 0,
            fontFamily: "var(--font-poppins), sans-serif",
            fontSize: 32,
            fontWeight: 700,
            lineHeight: "48px",
            color: "#2c1810",
          }}
        >
          Privacy Policy
        </h1>
        <p
          style={{
            margin: 0,
            fontFamily: "var(--font-nunito), sans-serif",
            fontSize: 16,
            fontWeight: 400,
            lineHeight: "normal",
            color: "#2c1810",
          }}
        >
          Use this page to detail your site&apos;s privacy policy.
        </p>
      </div>
    </div>
  );
}
