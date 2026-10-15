"use client";

import { useState } from "react";

import type { MouseEvent } from "react";

import { AppPhoneDemo } from "@/components/home/app-phone-demo";
import { isValidMobile } from "@/lib/validation";

export function HomeAppPromo() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [message, setMessage] = useState("");
  const [tone, setTone] = useState<"success" | "error" | "">("");

  function openNotify(event: MouseEvent) {
    event.preventDefault();
    setOpen(true);
  }

  function submit() {
    const trimmedName = name.trim();
    const trimmedMobile = mobile.trim();
    if (!trimmedName) {
      setMessage("Please enter your name.");
      setTone("error");
      return;
    }
    if (!isValidMobile(trimmedMobile)) {
      setMessage(
        "Please enter a valid 10-digit mobile number (starting with 6-9).",
      );
      setTone("error");
      return;
    }
    setMessage("You're on the list! We'll notify you when the app launches.");
    setTone("success");
    setName("");
    setMobile("");
  }

  return (
    <>
      <section className="app-promo">
        <div className="container">
          <div className="app-promo-grid">
            <div className="app-promo-content">
              <div className="section-tag app-promo-tag">
                <i className="fas fa-mobile-alt" /> Mobile App
              </div>
              <h2 className="app-promo-title">
                Run Your Coaching
                <br />
                From Your Phone
              </h2>
              <p className="app-promo-desc">
                The Mera Coach app is built for coaches. Add a client in
                minutes, calculate BMI, build a diet plan and share a PDF
                report, all from your phone. Coming soon to Android and iOS.
              </p>
              <ul className="app-promo-features">
                <li>
                  <i className="fas fa-check-circle" /> Add clients and track
                  every check-up
                </li>
                <li>
                  <i className="fas fa-check-circle" /> BMI and personalised
                  diet plans in minutes
                </li>
                <li>
                  <i className="fas fa-check-circle" /> Share branded PDF
                  reports with clients
                </li>
                <li>
                  <i className="fas fa-check-circle" /> Catch leads from your
                  public profile
                </li>
                <li>
                  <i className="fas fa-check-circle" /> Manage packages, events
                  and your profile
                </li>
              </ul>
              <div className="app-promo-badges">
                <a
                  href="#app-notify"
                  className="app-badge app-badge-play"
                  onClick={openNotify}
                >
                  <i className="fab fa-google-play" />
                  <span>
                    <span className="app-badge-sub">Get it on</span>
                    <span className="app-badge-name">Google Play</span>
                  </span>
                </a>
                <a
                  href="#app-notify"
                  className="app-badge app-badge-apple"
                  onClick={openNotify}
                >
                  <i className="fab fa-apple" />
                  <span>
                    <span className="app-badge-sub">Download on the</span>
                    <span className="app-badge-name">App Store</span>
                  </span>
                </a>
              </div>
              <p className="app-promo-coming">
                <i className="fas fa-clock" /> Launching soon.{" "}
                <a
                  href="#app-notify"
                  onClick={openNotify}
                  className="app-notify-link"
                >
                  Notify me when it&apos;s live
                </a>
              </p>
            </div>
            <div className="app-promo-visual">
              <AppPhoneDemo />
            </div>
          </div>
        </div>
      </section>

      <div
        className={open ? "app-notify-overlay active" : "app-notify-overlay"}
        id="appNotifyModal"
        onClick={(event) => {
          if (event.target === event.currentTarget) setOpen(false);
        }}
      >
        <div className="app-notify-box">
          <button
            type="button"
            className="app-notify-close"
            aria-label="Close"
            onClick={() => setOpen(false)}
          >
            <i className="fas fa-times" />
          </button>
          <div className="app-notify-icon">
            <i className="fas fa-mobile-alt" />
          </div>
          <h3>Notify Me When the App Launches</h3>
          <p>
            Be the first to know when the Mera Coach app goes live on Play Store
            &amp; App Store.
          </p>
          <div className="app-notify-form">
            <input
              type="text"
              placeholder="Your name"
              className="app-notify-input"
              aria-label="Your name"
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
            <input
              type="tel"
              placeholder="Mobile number"
              className="app-notify-input"
              aria-label="Mobile number"
              value={mobile}
              onChange={(event) => setMobile(event.target.value)}
            />
            <button type="button" className="app-notify-btn" onClick={submit}>
              <i className="fas fa-bell" /> Notify Me
            </button>
          </div>
          {message ?
            <div className={`app-notify-msg ${tone}`}>{message}</div>
          : null}
        </div>
      </div>
    </>
  );
}
