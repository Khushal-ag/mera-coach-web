import Image from "next/image";
import Link from "next/link";

import { AppStoreBadges } from "@/components/app-store-badges";
import {
  CONTACT_ADDRESS_LINE1,
  CONTACT_ADDRESS_LINE2,
  contactWhatsAppDisplay,
  contactWhatsAppUrl,
  SUPPORT_HOURS,
} from "@/config/contact";
import { env } from "@/config/env";
import { isSubscriptionRequired } from "@/config/practice";
import { siteConfig } from "@/config/site";
import { FOOTER_SOCIALS } from "@/constants/footer";

export function SiteFooter() {
  const showSubscriptionPlans = isSubscriptionRequired();

  return (
    <div className="mc-public">
      <footer className="footer">
        <div className="container">
          <div className="footer-grid">
            <div className="footer-brand">
              <Link href="/" className="nav-logo">
                <div className="nav-logo-icon">
                  <Image
                    src={siteConfig.brand.logoMark}
                    alt=""
                    width={42}
                    height={42}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "contain",
                    }}
                  />
                </div>
                <div className="nav-logo-text footer-logo-text">
                  <span>Mera Coach</span>
                  <span>Wellness Platform</span>
                </div>
              </Link>
              <p>
                India&apos;s complete coaching and wellness platform connecting
                you with verified Health, Fitness, Yoga, Nutrition and Lifestyle
                coaches for every goal.
              </p>
              <div className="footer-apps">
                <p className="footer-apps-title">Get the app</p>
                <div className="footer-apps-row">
                  <AppStoreBadges />
                  {FOOTER_SOCIALS.filter((item) => env.social[item.key]).map(
                    (item) => (
                      <a
                        key={item.key}
                        className={`footer-social-link footer-social-link--${item.key}`}
                        href={env.social[item.key]}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`Mera Coach on ${item.label}`}
                      >
                        <i className={item.icon} aria-hidden />
                        <span className="footer-social-name">{item.label}</span>
                      </a>
                    ),
                  )}
                </div>
              </div>
            </div>
            <div className="footer-col">
              <h4 aria-level={3}>Platform</h4>
              <ul>
                <li>
                  <Link href="/coach">Find a Coach</Link>
                </li>
                <li>
                  <Link href="/services">Features</Link>
                </li>
                <li>
                  <Link href="/bmi">BMI Calculator</Link>
                </li>
                <li>
                  <Link href="/#stories">Coach Stories</Link>
                </li>
              </ul>
            </div>
            <div className="footer-col">
              <h4 aria-level={3}>For Coaches</h4>
              <ul>
                <li>
                  <Link href="/register">Become a Coach</Link>
                </li>
                <li>
                  <Link href="/coach-login">Coach Login</Link>
                </li>
                <li>
                  <Link href="/dashboard">Coach Dashboard</Link>
                </li>
                {showSubscriptionPlans ?
                  <li>
                    <Link href="/premium">Subscription Plans</Link>
                  </li>
                : null}
              </ul>
            </div>
            <div className="footer-col">
              <h4 aria-level={3}>Company</h4>
              <ul>
                <li>
                  <Link href="/#about">About Us</Link>
                </li>
                <li>
                  <Link href="/contact">Contact Us</Link>
                </li>
                <li>
                  <Link href="/terms">Terms of Service</Link>
                </li>
                <li>
                  <Link href="/privacy">Privacy Policy</Link>
                </li>
              </ul>
            </div>
            <div className="footer-col">
              <h4 aria-level={3}>Contact Us</h4>
              <div className="footer-contact">
                <div className="footer-contact-item">
                  <i className="fas fa-envelope" />
                  <span>
                    <a href={`mailto:${siteConfig.email}`}>
                      {siteConfig.email}
                    </a>
                  </span>
                </div>
                <div className="footer-contact-item">
                  <i className="fab fa-whatsapp" />
                  <span>
                    <a
                      href={contactWhatsAppUrl()}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {contactWhatsAppDisplay()}
                    </a>
                  </span>
                </div>
                <div className="footer-contact-item">
                  <i className="fas fa-map-marker-alt" />
                  <span>
                    {CONTACT_ADDRESS_LINE1}
                    <br />
                    {CONTACT_ADDRESS_LINE2}
                  </span>
                </div>
                <div className="footer-contact-item">
                  <i className="fas fa-clock" />
                  <span>{SUPPORT_HOURS}</span>
                </div>
              </div>
            </div>
          </div>
          <div className="footer-bottom">
            <p>
              &#169; 2026 Mera Coach. All rights reserved. Made with{" "}
              <i className="fas fa-heart" style={{ color: "#ef4444" }} /> for a
              healthier India.
            </p>
            <div className="footer-bottom-links">
              <Link href="/privacy">Privacy Policy</Link>
              <Link href="/terms">Terms of Service</Link>
              <a href="/sitemap.xml">Sitemap</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
