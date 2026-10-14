import Image from "next/image";
import Link from "next/link";

import type { ReactNode } from "react";

import { siteConfig } from "@/config/site";

function HashLink({ children }: { children: ReactNode }) {
  return <a href="#">{children}</a>;
}

export function SiteFooter() {
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
              <div className="footer-social">
                <HashLink>
                  <i className="fab fa-facebook-f" />
                </HashLink>
                <HashLink>
                  <i className="fab fa-instagram" />
                </HashLink>
                <HashLink>
                  <i className="fab fa-twitter" />
                </HashLink>
                <HashLink>
                  <i className="fab fa-youtube" />
                </HashLink>
                <HashLink>
                  <i className="fab fa-linkedin-in" />
                </HashLink>
              </div>
            </div>
            <div className="footer-col">
              <h4>Platform</h4>
              <ul>
                <li>
                  <Link href="/coach">Find a Coach</Link>
                </li>
                <li>
                  <HashLink>Browse Categories</HashLink>
                </li>
                <li>
                  <HashLink>Wellness Programs</HashLink>
                </li>
                <li>
                  <HashLink>Success Stories</HashLink>
                </li>
                <li>
                  <Link href="/bmi">BMI Calculator</Link>
                </li>
                <li>
                  <HashLink>Blog &amp; Tips</HashLink>
                </li>
              </ul>
            </div>
            <div className="footer-col">
              <h4>For Coaches</h4>
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
                <li>
                  <Link href="/premium">Subscription Plans</Link>
                </li>
                <li>
                  <HashLink>Coach Resources</HashLink>
                </li>
                <li>
                  <HashLink>Success Tips</HashLink>
                </li>
              </ul>
            </div>
            <div className="footer-col">
              <h4>Company</h4>
              <ul>
                <li>
                  <HashLink>About Us</HashLink>
                </li>
                <li>
                  <HashLink>Our Mission</HashLink>
                </li>
                <li>
                  <HashLink>Careers</HashLink>
                </li>
                <li>
                  <HashLink>Press</HashLink>
                </li>
                <li>
                  <HashLink>Partner With Us</HashLink>
                </li>
                <li>
                  <Link href="/contact">Contact Us</Link>
                </li>
              </ul>
            </div>
            <div className="footer-col">
              <h4>Contact Us</h4>
              <div className="footer-contact">
                <div className="footer-contact-item">
                  <i className="fas fa-envelope" />
                  <span>
                    <a href={`mailto:${siteConfig.email.support}`}>
                      {siteConfig.email.support}
                    </a>
                  </span>
                </div>
                <div className="footer-contact-item">
                  <i className="fas fa-phone" />
                  <span>+91 98765 43210</span>
                </div>
                <div className="footer-contact-item">
                  <i className="fas fa-map-marker-alt" />
                  <span>
                    Mera Coach HQ,
                    <br />
                    New Delhi, India
                  </span>
                </div>
                <div className="footer-contact-item">
                  <i className="fas fa-clock" />
                  <span>Mon–Sat: 9am – 6pm</span>
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
              <HashLink>Cookie Policy</HashLink>
              <HashLink>Sitemap</HashLink>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
