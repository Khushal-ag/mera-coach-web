"use client";

import {
  isValidElement,
  useEffect,
  useState,
  useSyncExternalStore,
} from "react";

import type { ReactNode } from "react";

import { MenuSelect } from "@/components/ui/menu-select";
import { submitCoachEnquiry } from "@/lib/api/coach";
import { firstApiError, isApiSuccess } from "@/lib/api/normalize";
import { cn } from "@/lib/utils";
import { isValidMobile } from "@/lib/validation";

type Tab = "refer" | "corporate" | "hello";

const SHARE_TEXT =
  "Join me on Mera Coach, India's wellness coaching platform. Register free: ";

function subscribeOrigin(onChange: () => void) {
  window.addEventListener("popstate", onChange);
  return () => window.removeEventListener("popstate", onChange);
}

function readOrigin() {
  return window.location.origin;
}

function readServerOrigin() {
  return "";
}

export function ContactPageView({ coachTypes }: { coachTypes: string[] }) {
  const [tab, setTab] = useState<Tab>("refer");
  const origin = useSyncExternalStore(
    subscribeOrigin,
    readOrigin,
    readServerOrigin,
  );
  const registerUrl = origin ? `${origin}/register` : "";
  const [copied, setCopied] = useState(false);
  const [sending, setSending] = useState<Tab | null>(null);
  const [messages, setMessages] = useState<
    Partial<Record<Tab, { text: string; kind: "error" | "success" }>>
  >({});

  const [refer, setRefer] = useState({
    name: "",
    mobile: "",
    type: "",
    city: "",
    refName: "",
  });
  const [corporate, setCorporate] = useState({
    name: "",
    mobile: "",
    email: "",
    org: "",
    size: "",
    prog: "",
    msg: "",
  });
  const [hello, setHello] = useState({
    name: "",
    mobile: "",
    email: "",
    subject: "",
    msg: "",
  });

  useEffect(() => {
    const current = messages[tab];
    if (current?.kind !== "success") return;
    const timer = window.setTimeout(() => {
      setMessages((prev) => {
        const next = { ...prev };
        delete next[tab];
        return next;
      });
    }, 6000);
    return () => window.clearTimeout(timer);
  }, [messages, tab]);

  function showMessage(type: Tab, text: string, kind: "error" | "success") {
    setMessages((prev) => ({ ...prev, [type]: { text, kind } }));
  }

  async function submitContact(type: Tab) {
    const name =
      type === "refer" ? refer.name.trim()
      : type === "corporate" ? corporate.name.trim()
      : hello.name.trim();
    const mobile =
      type === "refer" ? refer.mobile.trim()
      : type === "corporate" ? corporate.mobile.trim()
      : hello.mobile.trim();
    const email =
      type === "corporate" ? corporate.email.trim()
      : type === "hello" ? hello.email.trim()
      : "";

    if (!name) {
      showMessage(type, "Please enter the name.", "error");
      return;
    }
    if (!isValidMobile(mobile)) {
      showMessage(
        type,
        "Please enter a valid 10-digit mobile number (starting with 6-9).",
        "error",
      );
      return;
    }
    if (type === "corporate" && !email) {
      showMessage(type, "Email is required.", "error");
      return;
    }

    const lookingFor =
      type === "refer" ?
        `[REFERRAL] Category: ${refer.type || "Unknown"} | City: ${refer.city || "?"} | Referred by: ${refer.refName || "Anonymous"}`
      : type === "corporate" ?
        `[CORPORATE] Org: ${corporate.org || "?"} | Size: ${corporate.size || "?"} | Programme: ${corporate.prog || "?"} | ${corporate.msg}`
      : `[HELLO] Subject: ${hello.subject || "General"} | ${hello.msg}`;

    setSending(type);
    try {
      const response = await submitCoachEnquiry({
        coachCode: "MERACOACH",
        clientName: name,
        clientMobile: mobile,
        clientEmail: email,
        lookingFor,
      });
      if (isApiSuccess(response)) {
        showMessage(
          type,
          "✓ Thank you! We will get back to you within 24 hours.",
          "success",
        );
        if (type === "refer") {
          setRefer({ name: "", mobile: "", type: "", city: "", refName: "" });
        } else if (type === "corporate") {
          setCorporate({
            name: "",
            mobile: "",
            email: "",
            org: "",
            size: "",
            prog: "",
            msg: "",
          });
        } else {
          setHello({ name: "", mobile: "", email: "", subject: "", msg: "" });
        }
      } else {
        showMessage(
          type,
          firstApiError(response) || "Something went wrong. Please try again.",
          "error",
        );
      }
    } catch {
      showMessage(type, "Network error. Please try again.", "error");
    } finally {
      setSending(null);
    }
  }

  function copyRegisterLink() {
    const url = `${window.location.origin}/register`;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2500);
    });
  }

  function downloadQR() {
    const src = qrSrc(`${window.location.origin}/register`);
    window.open(src, "_blank", "noopener,noreferrer");
  }

  const shareHref =
    registerUrl ?
      `https://wa.me/?text=${encodeURIComponent(SHARE_TEXT + registerUrl)}`
    : "https://wa.me/?text=";

  return (
    <div className="mc-public">
      <section className="contact-hero">
        <div className="container">
          <div className="section-tag">
            <i className="fas fa-envelope-open-text" /> Get In Touch
          </div>
          <h1 className="contact-hero-title">
            One Platform. Every Wellness Goal.
          </h1>
          <p className="contact-hero-sub">
            Whether you&apos;re a coach ready to grow, a client seeking
            guidance, or a brand looking to partner &mdash; we&apos;d love to
            hear from you.
          </p>
        </div>
      </section>

      <section className="contact-main">
        <div className="container">
          <div className="contact-grid">
            <div className="contact-left">
              <div className="qr-card">
                <div className="qr-card-badge">
                  <i className="fas fa-bolt" /> Quick Register
                </div>
                <h2 className="qr-title">Scan to Join as a Coach</h2>
                <p className="qr-sub">
                  Point your phone camera at the code below to go straight to
                  coach registration, no typing needed.
                </p>
                <div className="qr-code-wrap">
                  <div className="qr-glow" />
                  <div id="qrCode">
                    {registerUrl ?
                      <img
                        src={qrSrc(registerUrl)}
                        width={180}
                        height={180}
                        alt="QR code that opens the registration page"
                      />
                    : <span
                        style={{ display: "block", width: 180, height: 180 }}
                      />
                    }
                  </div>
                </div>
                <div className="qr-url-chip">
                  <i className="fas fa-link" />
                  <span id="qrUrlText">{registerUrl}</span>
                </div>
                <div className="qr-share-label">
                  Share this with a coach you know
                </div>
                <div className="qr-share-row">
                  <a
                    className="qr-share-btn qr-wa"
                    href={shareHref}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <i className="fab fa-whatsapp" /> WhatsApp
                  </a>
                  <button
                    type="button"
                    className="qr-share-btn qr-copy"
                    onClick={copyRegisterLink}
                  >
                    <i
                      className={copied ? "fas fa-check" : "fas fa-copy"}
                      id="copyIcon"
                    />{" "}
                    <span id="copyLabel">
                      {copied ? "Copied!" : "Copy Link"}
                    </span>
                  </button>
                  <button
                    type="button"
                    className="qr-share-btn qr-dl"
                    onClick={downloadQR}
                  >
                    <i className="fas fa-download" /> Save QR
                  </button>
                </div>
              </div>
              <div className="contact-trust-row">
                <div className="contact-trust-chip">
                  <i className="fas fa-check-circle" /> Free to join
                </div>
                <div className="contact-trust-chip">
                  <i className="fas fa-check-circle" /> Setup in 5 mins
                </div>
                <div className="contact-trust-chip">
                  <i className="fas fa-check-circle" /> 500+ coaches
                </div>
              </div>
            </div>

            <div className="contact-right">
              <div className="contact-form-card">
                <div className="contact-tabs">
                  <button
                    type="button"
                    className={cn(
                      "contact-tab",
                      tab === "refer" ? "active" : "",
                    )}
                    onClick={() => setTab("refer")}
                  >
                    <i className="fas fa-user-plus" /> Refer a Coach
                  </button>
                  <button
                    type="button"
                    className={cn(
                      "contact-tab",
                      tab === "corporate" ? "active" : "",
                    )}
                    onClick={() => setTab("corporate")}
                  >
                    <i className="fas fa-building" /> Corporate Wellness
                  </button>
                  <button
                    type="button"
                    className={cn(
                      "contact-tab",
                      tab === "hello" ? "active" : "",
                    )}
                    onClick={() => setTab("hello")}
                  >
                    <i className="fas fa-comment-dots" /> Say Hello
                  </button>
                </div>

                <div
                  id="tab-refer"
                  className={cn(
                    "contact-tab-content",
                    tab === "refer" ? "active" : "",
                  )}
                >
                  <div className="tab-intro">
                    <div
                      className="tab-intro-icon"
                      style={{
                        background: "rgba(192,75,43,0.12)",
                        color: "var(--primary)",
                      }}
                    >
                      <i className="fas fa-user-plus" />
                    </div>
                    <div>
                      <div className="tab-intro-title">
                        Know a great coach? Refer them!
                      </div>
                      <div className="tab-intro-sub">
                        Share their details and we&apos;ll reach out to get them
                        onboard, free of charge.
                      </div>
                    </div>
                  </div>
                  <div className="cf-highlight-box">
                    <i className="fas fa-gift" />
                    Gym trainers, yoga instructors, nutritionists, wellness
                    coaches, anyone who helps people live better belongs on Mera
                    Coach.
                  </div>
                  <div className="cf-grid-2">
                    <Field label="Coach's Name" required>
                      <input
                        type="text"
                        id="r-name"
                        placeholder="Their full name"
                        maxLength={100}
                        value={refer.name}
                        onChange={(event) =>
                          setRefer({ ...refer, name: event.target.value })
                        }
                      />
                    </Field>
                    <Field label="Coach's Mobile" required>
                      <input
                        type="tel"
                        id="r-mobile"
                        placeholder="10-digit number"
                        maxLength={10}
                        value={refer.mobile}
                        onChange={(event) =>
                          setRefer({ ...refer, mobile: event.target.value })
                        }
                      />
                    </Field>
                  </div>
                  <div className="cf-grid-2">
                    <Field label="Coaching Category">
                      <MenuSelect
                        id="r-type"
                        skin="public"
                        className="ui-select"
                        value={refer.type}
                        placeholder="Select (if known)"
                        options={[
                          { value: "", label: "Select (if known)" },
                          ...coachTypes.map((name) => ({
                            value: name,
                            label: name,
                          })),
                        ]}
                        onChange={(event) =>
                          setRefer({ ...refer, type: event.target.value })
                        }
                      />
                    </Field>
                    <Field label="Their City">
                      <input
                        type="text"
                        id="r-city"
                        placeholder="City they operate in"
                        maxLength={100}
                        value={refer.city}
                        onChange={(event) =>
                          setRefer({ ...refer, city: event.target.value })
                        }
                      />
                    </Field>
                  </div>
                  <Field label="Your Name (so we can thank you!)">
                    <input
                      type="text"
                      id="r-refname"
                      placeholder="Your name"
                      maxLength={100}
                      value={refer.refName}
                      onChange={(event) =>
                        setRefer({ ...refer, refName: event.target.value })
                      }
                    />
                  </Field>
                  <FormMessage message={messages.refer} id="refer-msg" />
                  <SubmitButton
                    className="btn btn-primary cf-submit"
                    busy={sending === "refer"}
                    onClick={() => submitContact("refer")}
                    icon="fas fa-paper-plane"
                    label="Submit Referral"
                  />
                  <p className="cf-note">
                    <i className="fas fa-lock" /> The referred coach&apos;s
                    details are used only to onboard them, never sold or shared.
                  </p>
                </div>

                <div
                  id="tab-corporate"
                  className={cn(
                    "contact-tab-content",
                    tab === "corporate" ? "active" : "",
                  )}
                >
                  <div className="tab-intro">
                    <div
                      className="tab-intro-icon"
                      style={{
                        background: "rgba(27,67,50,0.1)",
                        color: "var(--secondary)",
                      }}
                    >
                      <i className="fas fa-building" />
                    </div>
                    <div>
                      <div className="tab-intro-title">
                        Wellness for your team
                      </div>
                      <div className="tab-intro-sub">
                        Invest in your employees&apos; health, we&apos;ll design
                        a custom wellness programme for your organisation.
                      </div>
                    </div>
                  </div>
                  <div
                    className="cf-highlight-box"
                    style={{
                      background: "rgba(27,67,50,0.06)",
                      borderColor: "rgba(27,67,50,0.15)",
                      color: "var(--secondary)",
                    }}
                  >
                    <i className="fas fa-chart-line" />
                    Companies with wellness programmes report 25% lower
                    absenteeism and higher employee satisfaction.
                  </div>
                  <div className="cf-grid-2">
                    <Field label="Contact Person" required>
                      <input
                        type="text"
                        id="co-name"
                        placeholder="Your name"
                        maxLength={100}
                        value={corporate.name}
                        onChange={(event) =>
                          setCorporate({
                            ...corporate,
                            name: event.target.value,
                          })
                        }
                      />
                    </Field>
                    <Field label="Mobile" required>
                      <input
                        type="tel"
                        id="co-mobile"
                        placeholder="10-digit number"
                        maxLength={10}
                        value={corporate.mobile}
                        onChange={(event) =>
                          setCorporate({
                            ...corporate,
                            mobile: event.target.value,
                          })
                        }
                      />
                    </Field>
                  </div>
                  <div className="cf-grid-2">
                    <Field label="Work Email" required>
                      <input
                        type="email"
                        id="co-email"
                        placeholder="you@company.com"
                        value={corporate.email}
                        onChange={(event) =>
                          setCorporate({
                            ...corporate,
                            email: event.target.value,
                          })
                        }
                      />
                    </Field>
                    <Field label="Company / Organisation">
                      <input
                        type="text"
                        id="co-org"
                        placeholder="Company name"
                        maxLength={150}
                        value={corporate.org}
                        onChange={(event) =>
                          setCorporate({
                            ...corporate,
                            org: event.target.value,
                          })
                        }
                      />
                    </Field>
                  </div>
                  <div className="cf-grid-2">
                    <Field label="Team Size">
                      <MenuSelect
                        id="co-size"
                        skin="public"
                        className="ui-select"
                        value={corporate.size}
                        placeholder="Select range"
                        options={[
                          { value: "", label: "Select range" },
                          { value: "1–50 employees", label: "1–50 employees" },
                          {
                            value: "51–200 employees",
                            label: "51–200 employees",
                          },
                          {
                            value: "201–500 employees",
                            label: "201–500 employees",
                          },
                          { value: "500+ employees", label: "500+ employees" },
                        ]}
                        onChange={(event) =>
                          setCorporate({
                            ...corporate,
                            size: event.target.value,
                          })
                        }
                      />
                    </Field>
                    <Field label="Programme Interest">
                      <MenuSelect
                        id="co-prog"
                        skin="public"
                        className="ui-select"
                        value={corporate.prog}
                        placeholder="Select focus"
                        options={[
                          { value: "", label: "Select focus" },
                          {
                            value: "Fitness & Weight Management",
                            label: "Fitness & Weight Management",
                          },
                          {
                            value: "Stress & Mental Wellness",
                            label: "Stress & Mental Wellness",
                          },
                          {
                            value: "Nutrition & Diet",
                            label: "Nutrition & Diet",
                          },
                          {
                            value: "Yoga & Mindfulness",
                            label: "Yoga & Mindfulness",
                          },
                          {
                            value: "Holistic Wellness Package",
                            label: "Holistic Wellness Package",
                          },
                        ]}
                        onChange={(event) =>
                          setCorporate({
                            ...corporate,
                            prog: event.target.value,
                          })
                        }
                      />
                    </Field>
                  </div>
                  <Field label="Anything else you'd like us to know?">
                    <textarea
                      id="co-msg"
                      rows={2}
                      placeholder="Timeline, budget, specific requirements…"
                      maxLength={500}
                      value={corporate.msg}
                      onChange={(event) =>
                        setCorporate({ ...corporate, msg: event.target.value })
                      }
                    />
                  </Field>
                  <FormMessage
                    message={messages.corporate}
                    id="corporate-msg"
                  />
                  <SubmitButton
                    className="btn btn-secondary cf-submit"
                    busy={sending === "corporate"}
                    onClick={() => submitContact("corporate")}
                    icon="fas fa-building"
                    label="Request a Proposal"
                  />
                  <p className="cf-note">
                    <i className="fas fa-lock" /> Your details are private and
                    never shared without consent.
                  </p>
                </div>

                <div
                  id="tab-hello"
                  className={cn(
                    "contact-tab-content",
                    tab === "hello" ? "active" : "",
                  )}
                >
                  <div className="tab-intro">
                    <div
                      className="tab-intro-icon"
                      style={{
                        background: "rgba(212,163,42,0.12)",
                        color: "var(--gold)",
                      }}
                    >
                      <i className="fas fa-comment-dots" />
                    </div>
                    <div>
                      <div className="tab-intro-title">
                        Just want to say hi?
                      </div>
                      <div className="tab-intro-sub">
                        Questions, feedback, media enquiries or anything else,
                        we&apos;re all ears.
                      </div>
                    </div>
                  </div>
                  <div className="cf-grid-2">
                    <Field label="Your Name" required>
                      <input
                        type="text"
                        id="h-name"
                        placeholder="Your name"
                        maxLength={100}
                        value={hello.name}
                        onChange={(event) =>
                          setHello({ ...hello, name: event.target.value })
                        }
                      />
                    </Field>
                    <Field label="Mobile" required>
                      <input
                        type="tel"
                        id="h-mobile"
                        placeholder="10-digit number"
                        maxLength={10}
                        value={hello.mobile}
                        onChange={(event) =>
                          setHello({ ...hello, mobile: event.target.value })
                        }
                      />
                    </Field>
                  </div>
                  <div className="cf-grid-2">
                    <Field label="Email (optional)">
                      <input
                        type="email"
                        id="h-email"
                        placeholder="your@email.com"
                        value={hello.email}
                        onChange={(event) =>
                          setHello({ ...hello, email: event.target.value })
                        }
                      />
                    </Field>
                    <Field label="Subject">
                      <MenuSelect
                        id="h-subject"
                        skin="public"
                        className="ui-select"
                        value={hello.subject}
                        placeholder="Select topic"
                        options={[
                          { value: "", label: "Select topic" },
                          {
                            value: "General Question",
                            label: "General Question",
                          },
                          {
                            value: "Feedback / Suggestion",
                            label: "Feedback / Suggestion",
                          },
                          {
                            value: "Media / Press Enquiry",
                            label: "Media / Press Enquiry",
                          },
                          { value: "Report a Bug", label: "Report a Bug" },
                          { value: "Other", label: "Other" },
                        ]}
                        onChange={(event) =>
                          setHello({ ...hello, subject: event.target.value })
                        }
                      />
                    </Field>
                  </div>
                  <Field label="Message">
                    <textarea
                      id="h-msg"
                      rows={4}
                      placeholder="Tell us what's on your mind…"
                      maxLength={500}
                      value={hello.msg}
                      onChange={(event) =>
                        setHello({ ...hello, msg: event.target.value })
                      }
                    />
                  </Field>
                  <FormMessage message={messages.hello} id="hello-msg" />
                  <SubmitButton
                    className="btn btn-gold cf-submit"
                    busy={sending === "hello"}
                    onClick={() => submitContact("hello")}
                    icon="fas fa-paper-plane"
                    label="Send Message"
                  />
                  <p className="cf-note">
                    <i className="fas fa-lock" /> Your details are private and
                    never shared without consent.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="contact-info-strip">
            <div className="contact-info-item">
              <div className="cii-icon">
                <i className="fab fa-whatsapp" />
              </div>
              <div>
                <div className="cii-label">WhatsApp Us</div>
                <a
                  href="https://wa.me/919999999999"
                  className="cii-value"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  +91 99999 99999
                </a>
              </div>
            </div>
            <div className="contact-info-item">
              <div className="cii-icon">
                <i className="fas fa-envelope" />
              </div>
              <div>
                <div className="cii-label">Email Us</div>
                <a href="mailto:hello@mera-coach.com" className="cii-value">
                  hello@mera-coach.com
                </a>
              </div>
            </div>
            <div className="contact-info-item">
              <div className="cii-icon">
                <i className="fas fa-clock" />
              </div>
              <div>
                <div className="cii-label">Response Time</div>
                <div className="cii-value">Within 24 hours</div>
              </div>
            </div>
            <div className="contact-info-item">
              <div className="cii-icon">
                <i className="fas fa-map-marker-alt" />
              </div>
              <div>
                <div className="cii-label">Based In</div>
                <div className="cii-value">India, serving globally</div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function qrSrc(url: string) {
  return `https://api.qrserver.com/v1/create-qr-code/?size=180x180&color=1b4332&bgcolor=ffffff&data=${encodeURIComponent(url)}`;
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: ReactNode;
}) {
  const childId =
    isValidElement<{ id?: string }>(children) ? children.props.id : undefined;
  return (
    <div className="cf-group">
      <label htmlFor={childId}>
        {label}{" "}
        {required ?
          <span className="cf-req">*</span>
        : null}
      </label>
      {children}
    </div>
  );
}

function FormMessage({
  message,
  id,
}: {
  message?: { text: string; kind: "error" | "success" };
  id: string;
}) {
  if (!message) {
    return <div id={id} className="cf-msg" style={{ display: "none" }} />;
  }
  return (
    <div id={id} className={`cf-msg cf-msg-${message.kind}`}>
      {message.text}
    </div>
  );
}

function SubmitButton({
  className,
  busy,
  onClick,
  icon,
  label,
}: {
  className: string;
  busy: boolean;
  onClick: () => void;
  icon: string;
  label: string;
}) {
  return (
    <button
      type="button"
      className={className}
      onClick={onClick}
      disabled={busy}
    >
      {busy ?
        <>
          <i className="fas fa-spinner fa-spin" /> Sending…
        </>
      : <>
          <i className={icon} /> {label}
        </>
      }
    </button>
  );
}
