import { env } from "@/config/env";

const STORES = [
  {
    key: "playStore",
    icon: "fab fa-google-play",
    sub: "Get it on",
    name: "Google Play",
  },
  {
    key: "appStore",
    icon: "fab fa-apple",
    sub: "Download on the",
    name: "App Store",
  },
] as const;

/** Store buttons for the Mera Coach app. A store without a URL shows as "Coming soon". */
export function AppStoreBadges() {
  return (
    <>
      {STORES.map((store) => {
        const href = env.appLinks[store.key];
        const body = (
          <>
            <i className={store.icon} aria-hidden />
            <span>
              <span className="app-badge-sub">
                {href ? store.sub : "Coming soon"}
              </span>
              <span className="app-badge-name">{store.name}</span>
            </span>
          </>
        );
        return href ?
            <a
              key={store.key}
              className="app-badge"
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Get the Mera Coach app on ${store.name}`}
            >
              {body}
            </a>
          : <span
              key={store.key}
              className="app-badge app-badge-soon"
              role="img"
              aria-label={`Mera Coach app on ${store.name}: coming soon`}
            >
              {body}
            </span>;
      })}
    </>
  );
}
