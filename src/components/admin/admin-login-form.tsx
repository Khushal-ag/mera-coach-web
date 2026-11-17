"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";

import type { FormEvent } from "react";

import { siteConfig } from "@/config/site";
import { useAdminSession } from "@/hooks/use-admin-session";
import { useMounted } from "@/hooks/use-mounted";
import { loginAdmin } from "@/lib/api/admin";

function safeNextPath(raw: string | null): string {
  if (!raw) return siteConfig.links.adminCoaches;
  if (!raw.startsWith("/admin") || raw.startsWith("//")) {
    return siteConfig.links.adminCoaches;
  }
  if (raw === "/admin" || raw.startsWith("/admin?")) {
    return siteConfig.links.adminCoaches;
  }
  return raw;
}

export function AdminLoginForm() {
  const { session, ready, setSession } = useAdminSession();
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
      setError("Please enter username and password.");
      return;
    }

    setSending(true);
    setError("");
    try {
      const result = await loginAdmin({ userName, password });
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
      {/* Admin routes skip SiteHeader; tighten lg-page’s navbar padding. */}
      <div className="lg-page min-h-dvh !items-center !pt-10 !pb-10 max-[820px]:!pt-8 max-[500px]:!pt-6">
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
                  <span>Admin</span>
                </div>
              </a>
              <div className="lg-headline">
                <h2>
                  Platform
                  <br />
                  ops <em>console</em>
                </h2>
                <p>
                  Review coach health, manage profile recommendations, and keep
                  the marketplace running — same brand tools coaches and clients
                  already trust.
                </p>
              </div>
              <div className="lg-trust-row">
                <div className="lg-trust-item">
                  <strong>
                    <i className="fas fa-chart-bar" aria-hidden />
                  </strong>
                  <span>Coach stats</span>
                </div>
                <div className="lg-trust-div" />
                <div className="lg-trust-item">
                  <strong>
                    <i className="fas fa-thumbs-up" aria-hidden />
                  </strong>
                  <span>Creatives</span>
                </div>
                <div className="lg-trust-div" />
                <div className="lg-trust-item">
                  <strong>
                    <i className="fas fa-shield-alt" aria-hidden />
                  </strong>
                  <span>Staff only</span>
                </div>
              </div>
              <div className="lg-badges">
                <div className="lg-badge">
                  <i className="fas fa-lock" /> Secure session
                </div>
                <div className="lg-badge">
                  <i className="fas fa-user-shield" /> Ops access
                </div>
              </div>
            </div>
          </div>

          <div className="lg-panel-right">
            <div className="lg-form-wrap">
              <div className="lg-form-head">
                <div className="lg-form-icon">
                  <i className="fas fa-shield-alt" />
                </div>
                <h1>Admin sign in</h1>
                <p>
                  Platform ops only. Coach accounts use{" "}
                  <a href={siteConfig.links.coachLogin}>Coach Login</a>.
                </p>
              </div>

              <div
                className="lg-alert lg-alert-error"
                style={{ display: error ? "flex" : "none" }}
                role={error ? "alert" : undefined}
              >
                <i className="fas fa-exclamation-circle" />
                <span>{error}</span>
              </div>

              <form className="lg-form" onSubmit={onSubmit} noValidate>
                <div className="lg-field">
                  <label htmlFor="adminUser">
                    <i className="fas fa-user" /> Username
                  </label>
                  <div className="lg-input-wrap">
                    <input
                      id="adminUser"
                      name="userName"
                      type="text"
                      autoComplete="username"
                      placeholder="Username"
                      disabled={sending}
                      required
                    />
                    <span className="lg-input-icon">
                      <i className="fas fa-user" />
                    </span>
                  </div>
                </div>
                <div className="lg-field">
                  <label htmlFor="adminPass">
                    <i className="fas fa-lock" /> Password
                  </label>
                  <div className="lg-input-wrap">
                    <input
                      id="adminPass"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
                      placeholder="Enter your password"
                      disabled={sending}
                      required
                    />
                    <button
                      type="button"
                      className="lg-eye-btn"
                      onClick={() => setShowPassword((v) => !v)}
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                    >
                      <i
                        className={
                          showPassword ? "fas fa-eye-slash" : "fas fa-eye"
                        }
                      />
                    </button>
                  </div>
                </div>
                <button
                  type="submit"
                  className="lg-submit-btn"
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
                Looking for the coach app?{" "}
                <a href={siteConfig.links.coachLogin}>
                  Coach login <i className="fas fa-arrow-right" />
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
