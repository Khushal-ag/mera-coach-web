"use client";

import { useState } from "react";
import Image from "next/image";

import type { MouseEvent } from "react";

import { siteConfig } from "@/config/site";

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
    if (!/^\d{10}$/.test(trimmedMobile)) {
      setMessage("Enter a valid 10-digit mobile number.");
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
                Your Wellness Journey,
                <br />
                Now in Your Pocket
              </h2>
              <p className="app-promo-desc">
                The Mera Coach app lets you find verified coaches, track your
                fitness goals, log BMI, and chat with your coach — all from your
                phone. Available soon on Android &amp; iOS.
              </p>
              <ul className="app-promo-features">
                <li>
                  <i className="fas fa-check-circle" /> Book &amp; manage
                  sessions on the go
                </li>
                <li>
                  <i className="fas fa-check-circle" /> Real-time chat with your
                  coach
                </li>
                <li>
                  <i className="fas fa-check-circle" /> Track BMI, weight &amp;
                  progress
                </li>
                <li>
                  <i className="fas fa-check-circle" /> Get personalised workout
                  &amp; diet plans
                </li>
                <li>
                  <i className="fas fa-check-circle" /> Instant notifications
                  &amp; reminders
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
                <i className="fas fa-clock" /> Launching soon —{" "}
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
              <div className="app-phone-wrap">
                <div className="app-phone-frame">
                  <div className="app-screens-track">
                    <div className="app-screen">
                      <div className="app-screen-hdr">
                        <div className="app-s-logo">
                          <Image
                            src={siteConfig.brand.logoMark}
                            alt=""
                            width={14}
                            height={14}
                            style={{
                              width: 14,
                              height: 14,
                              objectFit: "contain",
                            }}
                          />{" "}
                          Mera Coach
                        </div>
                        <div className="app-s-bell">
                          <i className="fas fa-bell" />
                          <span className="app-s-dot" />
                        </div>
                      </div>
                      <div className="app-dash-card">
                        <div className="app-dash-greet">
                          Good morning, Rahul! 👋
                        </div>
                        <div className="app-dash-stats">
                          <div className="app-dash-stat">
                            <span className="app-dash-val">22.4</span>
                            <span className="app-dash-lbl">BMI</span>
                          </div>
                          <div className="app-dash-stat">
                            <span className="app-dash-val">
                              68<small>kg</small>
                            </span>
                            <span className="app-dash-lbl">Weight</span>
                          </div>
                          <div className="app-dash-stat">
                            <span className="app-dash-val">7</span>
                            <span className="app-dash-lbl">Sessions</span>
                          </div>
                        </div>
                      </div>
                      <div className="app-s-lbl">Weekly Goals</div>
                      <div className="app-progress-bar">
                        <div className="app-progress-fill" />
                      </div>
                      <div className="app-prog-row">
                        <span>Workout</span>
                        <span>75%</span>
                      </div>
                      <div className="app-progress-bar">
                        <div className="app-progress-fill-2" />
                      </div>
                      <div className="app-prog-row">
                        <span>Nutrition</span>
                        <span>58%</span>
                      </div>
                      <div className="app-s-lbl">Next Session</div>
                      <div className="app-coach-row">
                        <div className="app-coach-av">
                          <i className="fas fa-user" />
                        </div>
                        <div className="app-coach-det">
                          <div className="app-coach-n">Priya Sharma</div>
                          <div className="app-coach-t">
                            Today, 6:00 PM · Nutrition
                          </div>
                        </div>
                        <button type="button" className="app-book-btn">
                          Join
                        </button>
                      </div>
                    </div>
                    <div className="app-screen">
                      <div className="app-screen-hdr">
                        <div className="app-s-logo">
                          <Image
                            src={siteConfig.brand.logoMark}
                            alt=""
                            width={14}
                            height={14}
                            style={{
                              width: 14,
                              height: 14,
                              objectFit: "contain",
                            }}
                          />{" "}
                          Mera Coach
                        </div>
                        <div className="app-s-bell">
                          <i className="fas fa-bell" />
                        </div>
                      </div>
                      <div className="app-find-title">Find Your Coach</div>
                      <div className="app-search-bar">
                        <i className="fas fa-search" />
                        <span>Search by goal or name…</span>
                      </div>
                      <div className="app-filter-row">
                        <div className="app-filter-chip active">All</div>
                        <div className="app-filter-chip">Fitness</div>
                        <div className="app-filter-chip">Yoga</div>
                        <div className="app-filter-chip">Diet</div>
                      </div>
                      <div className="app-coach-row">
                        <div className="app-coach-av">
                          <i className="fas fa-user" />
                        </div>
                        <div className="app-coach-det">
                          <div className="app-coach-n">Priya Sharma</div>
                          <div className="app-coach-t">Nutrition · Delhi</div>
                          <div className="app-coach-r">★★★★★ 4.9</div>
                        </div>
                        <button type="button" className="app-book-btn">
                          Book
                        </button>
                      </div>
                      <div className="app-coach-row">
                        <div className="app-coach-av app-coach-av-2">
                          <i className="fas fa-user" />
                        </div>
                        <div className="app-coach-det">
                          <div className="app-coach-n">Arjun Mehta</div>
                          <div className="app-coach-t">Fitness · Mumbai</div>
                          <div className="app-coach-r">★★★★★ 4.8</div>
                        </div>
                        <button type="button" className="app-book-btn">
                          Book
                        </button>
                      </div>
                      <div className="app-coach-row">
                        <div className="app-coach-av app-coach-av-3">
                          <i className="fas fa-user" />
                        </div>
                        <div className="app-coach-det">
                          <div className="app-coach-n">Sneha Iyer</div>
                          <div className="app-coach-t">Yoga · Bangalore</div>
                          <div className="app-coach-r">★★★★☆ 4.7</div>
                        </div>
                        <button type="button" className="app-book-btn">
                          Book
                        </button>
                      </div>
                    </div>
                    <div className="app-screen">
                      <div className="app-screen-hdr">
                        <div className="app-s-logo">
                          <Image
                            src={siteConfig.brand.logoMark}
                            alt=""
                            width={14}
                            height={14}
                            style={{
                              width: 14,
                              height: 14,
                              objectFit: "contain",
                            }}
                          />{" "}
                          Mera Coach
                        </div>
                        <div className="app-s-bell">
                          <i className="fas fa-bell" />
                        </div>
                      </div>
                      <div className="app-chat-header">
                        <div className="app-chat-av">
                          <i className="fas fa-user" />
                        </div>
                        <div>
                          <div className="app-chat-name">Priya Sharma</div>
                          <div className="app-chat-status">
                            <i
                              className="fas fa-circle"
                              style={{ fontSize: 6 }}
                            />{" "}
                            Online
                          </div>
                        </div>
                      </div>
                      <div className="app-msg app-msg-in">
                        Hi Rahul! How was today&apos;s workout? 💪
                      </div>
                      <div className="app-msg-time">10:32 AM</div>
                      <div className="app-msg app-msg-out">
                        Completed all sets! Feeling great 🙌
                      </div>
                      <div className="app-msg app-msg-in">
                        Amazing! Don&apos;t forget your protein shake within 30
                        min.
                      </div>
                      <div className="app-msg-time">10:35 AM</div>
                      <div className="app-msg app-msg-out">
                        Will do! What&apos;s in tomorrow&apos;s plan?
                      </div>
                      <div className="app-typing">
                        <span />
                        <span />
                        <span />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="app-phone-glow" />
              </div>
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
