"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";

import type { FormEvent } from "react";

import { useAuth } from "@/components/auth-provider";
import { siteConfig } from "@/config/site";
import { useMounted } from "@/hooks/use-mounted";
import { loginCoach } from "@/lib/api/auth";

function safeNextPath(raw: string | null): string {
  if (!raw) return "/dashboard";
  if (!raw.startsWith("/") || raw.startsWith("//")) return "/dashboard";
  return raw;
}

export function LoginForm() {
  const { session, ready, setSession } = useAuth();
  const mounted = useMounted();
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = safeNextPath(searchParams.get("next"));
  const [showPassword, setShowPassword] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!mounted || !ready || !session) return;
    router.replace(nextPath);
  }, [mounted, ready, session, router, nextPath]);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const userName = String(formData.get("userName") ?? "").trim();
    const password = String(formData.get("password") ?? "");
    if (!userName || !password) {
      setError("Please enter your email and password.");
      return;
    }

    setSending(true);
    setError("");
    try {
      const result = await loginCoach({ userName, password });
      if (!result.session) {
        setSending(false);
        setError(result.error ?? "Login failed. Please try again.");
        return;
      }
      setSession(result.session);
    } catch {
      setSending(false);
      setError(
        "Unable to reach the server. Please check your connection and try again.",
      );
    }
  }

  return (
    <div className="mc-public">
      <div className="lg-page">
        <div className="lg-wrap">
          <div className="lg-panel-left">
            <div className="lg-blob lg-blob-1" />
            <div className="lg-blob lg-blob-2" />
            <div className="lg-blob lg-blob-3" />
            <div className="lg-panel-inner">
              <a href="/" className="lg-brand">
                <div className="lg-brand-icon">
                  <Image
                    src={siteConfig.brand.logoMark}
                    alt=""
                    width={38}
                    height={38}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "contain",
                    }}
                  />
                </div>
                <div className="lg-brand-text">
                  <span>Mera Coach</span>
                  <span>Wellness Platform</span>
                </div>
              </a>
              <div className="lg-headline">
                <h2>
                  India&apos;s #1
                  <br />
                  Coaching <em>Platform</em>
                </h2>
                <p>
                  Connect with certified fitness, nutrition and wellness coaches
                  and transform your health with science-backed, personalised
                  guidance.
                </p>
              </div>
              <div className="lg-trust-row">
                <div className="lg-trust-item">
                  <strong>
                    500<span>+</span>
                  </strong>
                  <span>Verified Coaches</span>
                </div>
                <div className="lg-trust-div" />
                <div className="lg-trust-item">
                  <strong>
                    10K<span>+</span>
                  </strong>
                  <span>Happy Clients</span>
                </div>
                <div className="lg-trust-div" />
                <div className="lg-trust-item">
                  <strong>
                    4.8<span>★</span>
                  </strong>
                  <span>Platform Rating</span>
                </div>
              </div>
              <div className="lg-testi">
                <div className="lg-testi-quote">
                  <i className="fas fa-quote-left" />
                </div>
                <p>
                  &quot;Mera Coach completely changed how I approach my health.
                  My coach was available, knowledgeable and the plan was perfect
                  for my Indian lifestyle. 12 kg down in 4 months!&quot;
                </p>
                <div className="lg-testi-author">
                  <img
                    src="https://randomuser.me/api/portraits/women/44.jpg"
                    alt="Priya Sharma"
                  />
                  <div>
                    <strong>Priya Sharma</strong>
                    <span>
                      <i className="fas fa-map-marker-alt" /> Delhi
                      &nbsp;&bull;&nbsp; Client since 2024
                    </span>
                  </div>
                  <div className="lg-testi-stars">
                    <i className="fas fa-star" />
                    <i className="fas fa-star" />
                    <i className="fas fa-star" />
                    <i className="fas fa-star" />
                    <i className="fas fa-star" />
                  </div>
                </div>
              </div>
              <div className="lg-badges">
                <div className="lg-badge">
                  <i className="fas fa-shield-alt" /> 100% Secure
                </div>
                <div className="lg-badge">
                  <i className="fas fa-lock" /> SSL Encrypted
                </div>
                <div className="lg-badge">
                  <i className="fas fa-user-shield" /> Privacy Safe
                </div>
              </div>
            </div>
          </div>

          <div className="lg-panel-right">
            <div className="lg-form-wrap">
              <div className="lg-form-head">
                <div className="lg-form-icon">
                  <i className="fas fa-user-circle" />
                </div>
                <h1>Welcome Back</h1>
                <p>
                  Sign in to your Mera Coach account to continue your wellness
                  journey.
                </p>
              </div>

              <div
                className="lg-alert lg-alert-error"
                id="lgError"
                style={{ display: error ? "flex" : "none" }}
              >
                <i className="fas fa-exclamation-circle" />
                <span id="lgErrorMsg">{error}</span>
              </div>

              <form className="lg-form" id="loginForm" onSubmit={onSubmit}>
                <div className="lg-field">
                  <label htmlFor="lgUsername">
                    <i className="fas fa-user" /> Email Address
                  </label>
                  <div className="lg-input-wrap">
                    <input
                      type="text"
                      id="lgUsername"
                      name="userName"
                      placeholder="Enter your email address"
                      autoComplete="username"
                      required
                    />
                    <span className="lg-input-icon">
                      <i className="fas fa-envelope" />
                    </span>
                  </div>
                </div>
                <div className="lg-field">
                  <label htmlFor="lgPassword">
                    <i className="fas fa-lock" /> Password
                  </label>
                  <div className="lg-input-wrap">
                    <input
                      type={showPassword ? "text" : "password"}
                      id="lgPassword"
                      name="password"
                      placeholder="Enter your password"
                      autoComplete="current-password"
                      required
                    />
                    <button
                      type="button"
                      className="lg-eye-btn"
                      id="lgEyeBtn"
                      onClick={() => setShowPassword((value) => !value)}
                      title="Show/hide password"
                    >
                      <i
                        className={
                          showPassword ? "fas fa-eye-slash" : "fas fa-eye"
                        }
                        id="lgEyeIcon"
                      />
                    </button>
                  </div>
                </div>
                <div className="lg-row">
                  <a
                    href="/forgot-password"
                    className="lg-forgot"
                    style={{ marginLeft: "auto" }}
                  >
                    Forgot password?
                  </a>
                </div>
                <button
                  type="submit"
                  className="lg-submit-btn"
                  id="lgSubmitBtn"
                  disabled={sending}
                >
                  {sending ?
                    <span className="lg-btn-loader">
                      <i className="fas fa-spinner fa-spin" /> Signing in...
                    </span>
                  : <span className="lg-btn-text">
                      <i className="fas fa-sign-in-alt" /> Sign In
                    </span>
                  }
                </button>
              </form>

              <p className="lg-register-link">
                New to Mera Coach?{" "}
                <a href="/register">
                  Create a free account <i className="fas fa-arrow-right" />
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
