import { ANDROID_PACKAGE } from "@/constants/app";

/**
 * Android App Links: tells Android that this site's links may open the Mera Coach app instead of the browser.
 * The fingerprints are the SHA-256 certificate fingerprints of the key the Play Store signs the app with
 * (Play Console > Test and release > App integrity > App signing). Separate several with commas.
 * Set ANDROID_APP_SHA256_FINGERPRINTS before building. With none set the list is empty and links open in the browser.
 */
export function GET() {
  const fingerprints = (process.env.ANDROID_APP_SHA256_FINGERPRINTS ?? "")
    .split(",")
    .map((value) => value.trim().toUpperCase())
    .filter(Boolean);

  const body =
    fingerprints.length ?
      [
        {
          relation: ["delegate_permission/common.handle_all_urls"],
          target: {
            namespace: "android_app",
            package_name: ANDROID_PACKAGE,
            sha256_cert_fingerprints: fingerprints,
          },
        },
      ]
    : [];

  return Response.json(body, {
    headers: { "Cache-Control": "public, max-age=3600" },
  });
}
