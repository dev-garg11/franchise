"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Lock, Mail, Eye, EyeOff, Loader2, X, User, Phone, Briefcase, ChevronDown, ChevronRight, CheckCircle } from "lucide-react";

export default function AuthModal({ isOpen, onClose, initialTab = "login" }) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState(initialTab);
  const modalRef = useRef(null);

  // Login Form States
  const [loginIdentifier, setLoginIdentifier] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [otpDestination, setOtpDestination] = useState("");

  // Register Form States
  const [regName, setRegName] = useState("");
  const [regCompany, setRegCompany] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regMobile, setRegMobile] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regConfirmPassword, setRegConfirmPassword] = useState("");
  const [regRole, setRegRole] = useState("brand_owner"); // brand_owner or investor
  const [showRegPassword, setShowRegPassword] = useState(false);

  // Status states
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
      setError("");
      setSuccess("");
      setOtpSent(false);
      setOtpCode("");
      setOtpDestination("");

      const remembered = localStorage.getItem("rememberedUser");
      if (remembered) {
        setLoginIdentifier(remembered);
        setRememberMe(true);
      }
    }
  }, [isOpen, initialTab]);

  // Click outside to close modal
  useEffect(() => {
    function handleClickOutside(event) {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose();
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  const handleRequestOtp = async () => {
    if (!loginIdentifier.trim()) {
      setError("Please enter your Email or Mobile number first.");
      return;
    }
    setLoading(true);
    setError("");
    setSuccess("");
    setOtpCode("");
    try {
      const res = await fetch("/api/auth/request-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier: loginIdentifier.trim() })
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const detail = data.details && process.env.NODE_ENV !== "production" ? ` (${data.details})` : "";
        throw new Error(`${data.error || data.message || "Unable to send OTP."}${detail}`);
      }
      setOtpSent(true);
      setOtpDestination(data.destination || "your registered email");
      setSuccess(`OTP sent to ${data.destination || "your Gmail"}. Please check your inbox and enter the 6-digit code.`);
    } catch (err) {
      setError(err.message || "Unable to send OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!/^\d{6}$/.test(otpCode)) {
      setError("Please enter the 6-digit OTP.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier: loginIdentifier.trim(), code: otpCode })
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.user) {
        const detail = data.details && process.env.NODE_ENV !== "production" ? ` (${data.details})` : "";
        throw new Error(`${data.error || data.message || "Invalid or expired OTP."}${detail}`);
      }
      const { user } = data;
      if (rememberMe) localStorage.setItem("rememberedUser", loginIdentifier.trim());
      if (user.role === "admin") {
        localStorage.setItem("adminLoggedIn", "true");
        localStorage.setItem("adminUsername", user.username || "admin");
        window.location.href = "/admin";
      } else if (user.role === "investor") {
        localStorage.setItem("investorLoggedIn", "true");
        localStorage.setItem("investorEmail", user.email || "");
        localStorage.setItem("investorName", user.name || "Investor");
        localStorage.setItem("investorPhone", user.phone || "");
        localStorage.setItem("investorId", user.id || "");
        window.location.href = "/investor-panel";
      } else {
        localStorage.setItem("brandLoggedIn", "true");
        localStorage.setItem("brandEmail", user.email || "");
        localStorage.setItem("brandId", user.id || "");
        localStorage.setItem("brandName", user.name || "Brand Owner");
        window.location.href = "/brand-panel";
      }
    } catch (err) {
      setError(err.message || "Unable to verify OTP. Please try again.");
      setLoading(false);
    }
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    if (!loginIdentifier.trim()) {
      setError("Please enter your Email or Mobile number.");
      setLoading(false);
      return;
    }
    if (!loginPassword) {
      setError("Please enter your password.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier: loginIdentifier.trim(), password: loginPassword })
      });

      if (res.ok) {
        const result = await res.json();
        const { user } = result;

        setSuccess("Signed in successfully! Redirecting...");

        if (rememberMe) {
          localStorage.setItem("rememberedUser", loginIdentifier);
        } else {
          localStorage.removeItem("rememberedUser");
        }

        setTimeout(() => {
          // Store auth flags in localStorage for current user state
          if (user.role === "admin") {
            localStorage.setItem("adminLoggedIn", "true");
            localStorage.setItem("adminUsername", user.username || "admin");
            window.location.href = "/admin";
          } else if (user.role === "investor") {
            localStorage.setItem("investorLoggedIn", "true");
            localStorage.setItem("investorEmail", user.email);
            localStorage.setItem("investorName", user.name);
            localStorage.setItem("investorPhone", user.phone || "");
            localStorage.setItem("investorId", user.id || "");
            window.location.href = "/investor-panel";
          } else {
            localStorage.setItem("brandLoggedIn", "true");
            localStorage.setItem("brandEmail", user.email);
            localStorage.setItem("brandId", user.id);
            localStorage.setItem("brandName", user.name);
            window.location.href = "/brand-panel";
          }
        }, 1000);
      } else {
        const data = await res.json();
        setError(data.error || "Invalid credentials. Please verify your Email/Mobile and Password.");
        setLoading(false);
      }
    } catch (err) {
      setError("Failed to connect to authentication server. Please try again.");
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    if (!regName.trim()) {
      setError("Please enter your Full Name.");
      setLoading(false);
      return;
    }
    if (!regEmail.trim()) {
      setError("Please enter your Email Address.");
      setLoading(false);
      return;
    }
    if (!regMobile.trim()) {
      setError("Please enter your Mobile Number.");
      setLoading(false);
      return;
    }
    if (!regPassword) {
      setError("Please enter your password.");
      setLoading(false);
      return;
    }
    if (regPassword.length < 8) {
      setError("Password must be at least 8 characters long.");
      setLoading(false);
      return;
    }
    if (regPassword !== regConfirmPassword) {
      setError("Passwords do not match.");
      setLoading(false);
      return;
    }

    try {
      const endpoint = regRole === "brand_owner" ? "/api/brands" : "/api/investors";
      const payload = {
        name: regName,
        companyName: regCompany,
        company: regCompany || regName,
        pincode: "110001",
        investment_range: "Rs. 5 Lakh - 10 Lakh",
        max_investment_limit: "Rs. 20 Lakh - 30 Lakh",
        category: "General",
        status: regRole === "brand_owner" ? "Pending" : "Approved",
        email: regEmail,
        phone: regMobile,
        password: regPassword
      };

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setSuccess("Account successfully registered! Logging you in...");

        setTimeout(async () => {
          try {
            const loginRes = await fetch("/api/login", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ identifier: regEmail.trim(), password: regPassword })
            });

            if (loginRes.ok) {
              const loginResult = await loginRes.json();
              const { user } = loginResult;

              if (user.role === "admin") {
                localStorage.setItem("adminLoggedIn", "true");
                window.location.href = "/admin";
              } else if (user.role === "investor") {
                localStorage.setItem("investorLoggedIn", "true");
                localStorage.setItem("investorEmail", user.email);
                localStorage.setItem("investorName", user.name);
                localStorage.setItem("investorPhone", user.phone || "");
                localStorage.setItem("investorId", user.id || "");
                window.location.href = "/investor-panel";
              } else {
                localStorage.setItem("brandLoggedIn", "true");
                localStorage.setItem("brandEmail", user.email);
                localStorage.setItem("brandId", user.id);
                localStorage.setItem("brandName", user.name);
                window.location.href = "/brand-panel";
              }
            } else {
              const loginError = await loginRes.json().catch(() => ({}));
              setActiveTab("login");
              setLoginIdentifier(regEmail.trim());
              setLoginPassword("");
              setError(loginError.error || "Account created, but automatic sign-in failed. Please sign in with your new password.");
              setLoading(false);
            }
          } catch (err) {
            setActiveTab("login");
            setLoginIdentifier(regEmail.trim());
            setLoginPassword("");
            setError("Account created, but automatic sign-in could not connect. Please sign in again.");
            setLoading(false);
          }
        }, 1000);
      } else {
        const data = await res.json();
        setError(data.error || "Registration failed. Check if email or mobile number is already registered.");
        setLoading(false);
      }
    } catch (err) {
      setError("Connection issue. Please try again later.");
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="modal-overlay"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "rgba(15, 23, 42, 0.7)",
        backdropFilter: "blur(6px)",
        WebkitBackdropFilter: "blur(6px)",
        padding: "20px",
        zIndex: 99999,
        fontFamily: "'Inter', sans-serif"
      }}
    >
      <div
        ref={modalRef}
        className="modal-card"
        style={{
          width: "100%",
          maxWidth: "680px",
          backgroundColor: "#ffffff",
          borderRadius: "20px",
          border: "1px solid #E5E7EB",
          boxShadow: "0 25px 60px -12px rgba(15, 23, 42, 0.35)",
          padding: "32px 38px",
          position: "relative",
          display: "flex",
          flexDirection: "column",
          gap: "18px",
          maxHeight: "calc(100vh - 40px)",
          overflowY: "auto"
        }}
      >

        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: "16px",
            right: "16px",
            color: "#9CA3AF",
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: "4px",
            borderRadius: "50%",
            transition: "all 0.2s",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "#F3F4F6";
            e.currentTarget.style.color = "#4B5563";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "transparent";
            e.currentTarget.style.color = "#9CA3AF";
          }}
        >
          <X size={20} />
        </button>

        {/* Logo Container */}
        <div style={{ textAlign: "center", padding: "6px 0 2px 0", display: "flex", justifyContent: "center" }}>
          <img
            src="/WhatsApp_Image_2026-07-16_at_4.40.00_PM__2_-removebg-preview.png"
            alt="Franchise Roots"
            className="auth-modal-logo-img"
            style={{
              height: "75px",
              width: "auto",
              objectFit: "contain",
              filter: "drop-shadow(0 2px 8px rgba(0, 0, 0, 0.08))"
            }}
          />
        </div>



        {/* Top Header Text (Below Logo) */}
        <div style={{ textAlign: "center", marginBottom: "0px" }}>
          <h2 style={{ fontSize: "19px", fontWeight: "800", color: "var(--text-dark, #0F172A)", margin: "0 0 4px 0", letterSpacing: "-0.02em" }}>
            Begin Your Journey
          </h2>
          <p style={{ fontSize: "12.5px", color: "var(--text-muted, #64748B)", margin: 0, fontWeight: "500" }}>
            Connect with India's Premier Franchise Network
          </p>
        </div>

        {/* Modern Segmented Pill Tabs */}
        <div
          style={{
            display: "flex",
            backgroundColor: "#F1F5F9",
            borderRadius: "14px",
            padding: "5px",
            position: "relative",
            marginBottom: "8px",
            border: "1px solid #E2E8F0"
          }}
        >
          <button
            type="button"
            onClick={() => { setActiveTab("login"); setError(""); setSuccess(""); }}
            style={{
              flex: 1,
              padding: "10px 16px",
              textAlign: "center",
              fontWeight: "700",
              fontSize: "14px",
              letterSpacing: "0.4px",
              color: activeTab === "login" ? "#ffffff" : "#64748B",
              backgroundColor: activeTab === "login" ? "#2563EB" : "transparent",
              borderRadius: "10px",
              border: "none",
              cursor: "pointer",
              transition: "all 0.25s cubic-bezier(0.16, 1, 0.3, 1)",
              boxShadow: activeTab === "login" ? "0 4px 14px rgba(37, 99, 235, 0.35)" : "none"
            }}
          >
            LOGIN
          </button>
          <button
            type="button"
            onClick={() => { setActiveTab("register"); setError(""); setSuccess(""); }}
            style={{
              flex: 1,
              padding: "10px 16px",
              textAlign: "center",
              fontWeight: "700",
              fontSize: "14px",
              letterSpacing: "0.4px",
              color: activeTab === "register" ? "#ffffff" : "#64748B",
              backgroundColor: activeTab === "register" ? "#2563EB" : "transparent",
              borderRadius: "10px",
              border: "none",
              cursor: "pointer",
              transition: "all 0.25s cubic-bezier(0.16, 1, 0.3, 1)",
              boxShadow: activeTab === "register" ? "0 4px 14px rgba(37, 99, 235, 0.35)" : "none"
            }}
          >
            REGISTER
          </button>
        </div>

        {/* Alert Notifications */}
        {error && (
          <div
            style={{
              backgroundColor: "#FEF2F2",
              border: "1px solid #FCA5A5",
              color: "#B91C1C",
              fontSize: "13.5px",
              padding: "10px 14px",
              borderRadius: "8px",
              textAlign: "center",
              lineHeight: "1.4"
            }}
          >
            {error}
          </div>
        )}

        {success && (
          <div
            style={{
              backgroundColor: "#F0FDF4",
              border: "1px solid #86EFAC",
              color: "#15803D",
              fontSize: "13.5px",
              padding: "10px 14px",
              borderRadius: "8px",
              textAlign: "center",
              lineHeight: "1.4"
            }}
          >
            {success}
          </div>
        )}

        {/* Forms Area */}
        {activeTab === "login" ? (
          /* LOGIN FORM */
          <form onSubmit={handleLoginSubmit} style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <label style={{ fontSize: "12px", fontWeight: "600", color: "#374151" }}>
                Email / Mobile / Username
              </label>
              <div style={{ position: "relative" }}>
                <span style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#9CA3AF" }}>
                  <Mail size={16} />
                </span>
                <input
                  type="text"
                  required
                  disabled={loading}
                  style={{
                    width: "100%",
                    border: "1.5px solid #D1D5DB",
                    borderRadius: "8px",
                    padding: "12px 12px 12px 38px",
                    fontSize: "14.5px",
                    color: "var(--text-dark, #1F2937)",
                    backgroundColor: "#F8FAFC",
                    outline: "none",
                    transition: "all 0.2s ease-in-out"
                  }}
                  placeholder="Enter email or mobile number"
                  value={loginIdentifier}
                  onChange={(e) => setLoginIdentifier(e.target.value)}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = "var(--primary)";
                    e.currentTarget.style.backgroundColor = "#ffffff";
                    e.currentTarget.style.boxShadow = "0 0 0 4px var(--primary-glow, rgba(13, 23, 60, 0.12))";
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = "#D1D5DB";
                    e.currentTarget.style.backgroundColor = "#F8FAFC";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                />
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <label style={{ fontSize: "12px", fontWeight: "600", color: "#374151" }}>
                Password
              </label>
              <div style={{ position: "relative" }}>
                <span style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#9CA3AF" }}>
                  <Lock size={16} />
                </span>
                <input
                  type={showLoginPassword ? "text" : "password"}
                  required
                  disabled={loading}
                  style={{
                    width: "100%",
                    border: "1.5px solid #D1D5DB",
                    borderRadius: "8px",
                    padding: "12px 36px 12px 38px",
                    fontSize: "14.5px",
                    color: "var(--text-dark, #1F2937)",
                    backgroundColor: "#F8FAFC",
                    outline: "none",
                    transition: "all 0.2s ease-in-out"
                  }}
                  placeholder="Enter password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = "var(--primary)";
                    e.currentTarget.style.backgroundColor = "#ffffff";
                    e.currentTarget.style.boxShadow = "0 0 0 4px var(--primary-glow, rgba(13, 23, 60, 0.12))";
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = "#D1D5DB";
                    e.currentTarget.style.backgroundColor = "#F8FAFC";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowLoginPassword(!showLoginPassword)}
                  style={{
                    position: "absolute",
                    right: "12px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    color: "#9CA3AF",
                    cursor: "pointer",
                    padding: 0,
                    display: "flex",
                    alignItems: "center"
                  }}
                >
                  {showLoginPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div style={{ marginTop: "-8px" }}>
              <button
                type="button"
                disabled={loading}
                onClick={handleRequestOtp}
                style={{
                  border: "none",
                  background: "transparent",
                  color: "#4F46E5",
                  fontSize: "13px",
                  fontWeight: "700",
                  padding: 0,
                  cursor: loading ? "not-allowed" : "pointer"
                }}
              >
                {otpSent ? "Resend OTP" : "Login with OTP"}
              </button>
              {otpSent && (
                <div style={{ display: "flex", gap: "8px", marginTop: "10px" }}>
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    value={otpCode}
                    disabled={loading}
                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    placeholder="Enter 6-digit OTP"
                    aria-label="6-digit login OTP"
                    style={{
                      flex: 1,
                      border: "1.5px solid #C7D2FE",
                      borderRadius: "8px",
                      padding: "10px 12px",
                      fontSize: "14px",
                      letterSpacing: "3px",
                      outline: "none"
                    }}
                  />
                  <button
                    type="button"
                    disabled={loading || otpCode.length !== 6}
                    onClick={handleVerifyOtp}
                    style={{
                      border: "none",
                      borderRadius: "8px",
                      padding: "0 14px",
                      background: otpCode.length === 6 ? "#10B981" : "#CBD5E1",
                      color: "#fff",
                      fontWeight: "700",
                      cursor: otpCode.length === 6 ? "pointer" : "not-allowed"
                    }}
                  >
                    Verify
                  </button>
                </div>
              )}
              {otpSent && (
                <p style={{ margin: "6px 0 0", color: "#475569", fontSize: "12px", lineHeight: "1.4" }}>
                  Check your Gmail inbox or spam folder for your 6-digit verification code.
                </p>
              )}
            </div>

            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "13.5px", marginTop: "2px" }}>
              <label style={{ display: "flex", alignItems: "center", gap: "8px", color: "#4B5563", cursor: "pointer", userSelect: "none" }}>
                <input
                  type="checkbox"
                  disabled={loading}
                  style={{
                    width: "15px",
                    height: "15px",
                    accentColor: "var(--primary)",
                    cursor: "pointer"
                  }}
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                Remember me
              </label>
              <Link
                href="/forgot-password"
                style={{
                  color: "var(--primary)",
                  textDecoration: "none",
                  fontWeight: "600",
                  transition: "color 0.2s ease-in-out"
                }}
                onMouseEnter={(e) => e.currentTarget.style.color = "var(--secondary)"}
                onMouseLeave={(e) => e.currentTarget.style.color = "var(--primary)"}
              >
                Forgot Password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%",
                background: "linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)",
                color: "#ffffff",
                border: "none",
                borderRadius: "var(--radius-sm, 8px)",
                padding: "12px",
                fontSize: "14.5px",
                fontWeight: "700",
                cursor: "pointer",
                transition: "all 0.2s ease-in-out",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                boxShadow: "0 4px 14px rgba(13, 23, 60, 0.15)",
                marginTop: "8px"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "linear-gradient(135deg, #1D4ED8 0%, #1E40AF 100%)";
                e.currentTarget.style.boxShadow = "0 8px 24px rgba(37, 99, 235, 0.35)";
                e.currentTarget.style.transform = "translateY(-1px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)";
                e.currentTarget.style.boxShadow = "0 4px 14px rgba(13, 23, 60, 0.15)";
                e.currentTarget.style.transform = "none";
              }}
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Signing In Securely...
                </>
              ) : (
                "Sign In"
              )}
            </button>
          </form>
        ) : (
          /* REGISTER TAB WITH TWO CLICKABLE CARDS AND INFORMATIONAL SECTION */
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            {/* 2-Column Action Cards */}
            <div className="modal-register-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>

              {/* Card 1: Register Your Brand */}
              <Link
                href="/brand-registration"
                onClick={onClose}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  width: "100%",
                  minHeight: "90px",
                  backgroundColor: "#F8FAFC",
                  border: "1.5px solid var(--border-color, #D1D5DB)",
                  borderRadius: "var(--radius-md, 14px)",
                  padding: "16px 20px",
                  textDecoration: "none",
                  cursor: "pointer",
                  transition: "all 0.3s ease-in-out",
                  boxShadow: "var(--shadow-sm, 0 2px 4px rgba(0, 0, 0, 0.02))"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.borderColor = "var(--primary)";
                  e.currentTarget.style.backgroundColor = "#ffffff";
                  e.currentTarget.style.boxShadow = "var(--shadow-md, 0 8px 16px rgba(13, 23, 60, 0.08))";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "none";
                  e.currentTarget.style.borderColor = "var(--border-color, #D1D5DB)";
                  e.currentTarget.style.backgroundColor = "#F8FAFC";
                  e.currentTarget.style.boxShadow = "var(--shadow-sm, 0 2px 4px rgba(0, 0, 0, 0.02))";
                }}
              >
                <div style={{ display: "flex", flexDirection: "column", gap: "4px", paddingRight: "10px", textAlign: "left" }}>
                  <span style={{ fontSize: "15px", fontWeight: "800", color: "var(--text-dark, #1F2937)" }}>
                    Register Your Brand
                  </span>
                  <span style={{ fontSize: "12px", color: "var(--text-muted, #6B7280)", lineHeight: "1.4" }}>
                    Promote & grow your brand with Franchise Roots
                  </span>
                </div>
                <ChevronRight size={20} style={{ color: "var(--primary)", flexShrink: 0 }} />
              </Link>

              {/* Card 2: Start A Business */}
              <Link
                href="/investor-registration"
                onClick={onClose}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  width: "100%",
                  minHeight: "90px",
                  backgroundColor: "#F8FAFC",
                  border: "1.5px solid var(--border-color, #D1D5DB)",
                  borderRadius: "var(--radius-md, 14px)",
                  padding: "16px 20px",
                  textDecoration: "none",
                  cursor: "pointer",
                  transition: "all 0.3s ease-in-out",
                  boxShadow: "var(--shadow-sm, 0 2px 4px rgba(0, 0, 0, 0.02))"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.borderColor = "var(--primary)";
                  e.currentTarget.style.backgroundColor = "#ffffff";
                  e.currentTarget.style.boxShadow = "var(--shadow-md, 0 8px 16px rgba(13, 23, 60, 0.08))";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "none";
                  e.currentTarget.style.borderColor = "var(--border-color, #D1D5DB)";
                  e.currentTarget.style.backgroundColor = "#F8FAFC";
                  e.currentTarget.style.boxShadow = "var(--shadow-sm, 0 2px 4px rgba(0, 0, 0, 0.02))";
                }}
              >
                <div style={{ display: "flex", flexDirection: "column", gap: "4px", paddingRight: "10px", textAlign: "left" }}>
                  <span style={{ fontSize: "15px", fontWeight: "800", color: "var(--text-dark, #1F2937)" }}>
                    Start A Business
                  </span>
                  <span style={{ fontSize: "12px", color: "var(--text-muted, #6B7280)", lineHeight: "1.4" }}>
                    Explore verified high-ROI franchise concepts
                  </span>
                </div>
                <ChevronRight size={20} style={{ color: "var(--primary)", flexShrink: 0 }} />
              </Link>
            </div>


            {/* Divider */}
            <hr style={{ border: 0, borderTop: "1px solid #E5E7EB", margin: "16px 0 8px 0" }} />

            {/* Why Register Checklist */}
            <div style={{ display: "flex", flexDirection: "column", gap: "16px", textAlign: "left" }}>
              <h3 style={{ fontSize: "22px", fontWeight: "700", color: "var(--text-dark, #1F2937)", margin: 0 }}>
                Why Register with Franchise Roots?
              </h3>
              <p style={{ fontSize: "15px", color: "var(--text-muted, #6B7280)", lineHeight: "1.5", margin: 0 }}>
                Join India's trusted franchise ecosystem and connect with thousands of verified business opportunities. Register today to grow your brand or start your entrepreneurial journey with expert support.
              </p>

              <ul style={{ listStyleType: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "16px" }}>
                {[
                  "Promote your brand to genuine franchise investors across India.",
                  "Discover verified franchise and investment opportunities.",
                  "Receive qualified business enquiries directly from interested investors.",
                  "Get access to a dedicated dashboard to manage your profile and leads.",
                  "Increase your brand visibility with a professional business listing.",
                  "Secure registration with encrypted passwords and role-based account protection.",
                  "Expert guidance from the Franchise Roots business consulting team."
                ].map((benefit, idx) => (
                  <li key={idx} style={{ display: "flex", alignItems: "flex-start", gap: "12px", fontSize: "14.5px", color: "#4B5563", lineHeight: "1.4" }}>
                    <CheckCircle size={18} style={{ color: "var(--secondary, #10B981)", flexShrink: 0, marginTop: "2px" }} />
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Divider */}
            <hr style={{ border: 0, borderTop: "1px solid #E5E7EB", margin: "16px 0 8px 0" }} />

            {/* Bottom Login Switch Note */}
            <div style={{ textAlign: "center" }}>
              <span style={{ fontSize: "14.5px", color: "#4B5563" }}>
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={() => { setActiveTab("login"); setError(""); setSuccess(""); }}
                  style={{
                    color: "var(--primary)",
                    fontWeight: "700",
                    border: "none",
                    background: "none",
                    cursor: "pointer",
                    textDecoration: "underline",
                    padding: 0,
                    fontSize: "14.5px",
                    transition: "color 0.2s ease-in-out"
                  }}
                  onMouseEnter={(e) => e.target.style.color = "var(--secondary)"}
                  onMouseLeave={(e) => e.target.style.color = "var(--primary)"}
                >
                  Login Here
                </button>
              </span>
            </div>
          </div>
        )}

        <div style={{ textAlign: "center", marginTop: "12px" }}>
          <button
            onClick={onClose}
            style={{
              fontSize: "14px",
              color: "#6B7280",
              textDecoration: "underline",
              border: "none",
              background: "none",
              cursor: "pointer",
              transition: "color 0.2s ease-in-out"
            }}
            onMouseEnter={(e) => e.target.style.color = "var(--primary)"}
            onMouseLeave={(e) => e.target.style.color = "#6B7280"}
          >
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );
}
