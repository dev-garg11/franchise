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
        body: JSON.stringify({ identifier: loginIdentifier, password: loginPassword })
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
            window.location.href = "/admin/dashboard";
          } else if (user.role === "investor") {
            localStorage.setItem("investorLoggedIn", "true");
            localStorage.setItem("investorEmail", user.email);
            localStorage.setItem("investorName", user.name);
            window.location.href = "/investor/dashboard";
          } else {
            localStorage.setItem("brandLoggedIn", "true");
            localStorage.setItem("brandEmail", user.email);
            localStorage.setItem("brandId", user.id);
            localStorage.setItem("brandName", user.name);
            window.location.href = "/brand-owner/dashboard";
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
              body: JSON.stringify({ identifier: regEmail, password: regPassword })
            });

            if (loginRes.ok) {
              const loginResult = await loginRes.json();
              const { user } = loginResult;

              if (user.role === "admin") {
                localStorage.setItem("adminLoggedIn", "true");
                window.location.href = "/admin/dashboard";
              } else if (user.role === "investor") {
                localStorage.setItem("investorLoggedIn", "true");
                localStorage.setItem("investorEmail", user.email);
                localStorage.setItem("investorName", user.name);
                window.location.href = "/investor/dashboard";
              } else {
                localStorage.setItem("brandLoggedIn", "true");
                localStorage.setItem("brandEmail", user.email);
                localStorage.setItem("brandId", user.id);
                localStorage.setItem("brandName", user.name);
                window.location.href = "/brand-owner/dashboard";
              }
            } else {
              setActiveTab("login");
              setLoading(false);
            }
          } catch (err) {
            setActiveTab("login");
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
          maxWidth: "460px",
          backgroundColor: "#ffffff",
          borderRadius: "12px",
          border: "1px solid #E5E7EB",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
          padding: "36px 32px",
          position: "relative",
          display: "flex",
          flexDirection: "column",
          gap: "24px",
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
        <div style={{ textAlign: "center", marginBottom: "8px" }}>
          <img 
            src="/logo.jpg" 
            alt="Franchise Roots" 
            style={{ 
              height: "54px", 
              width: "auto", 
              objectFit: "contain" 
            }} 
          />
        </div>

        {/* Tabs Headers */}
        <div 
          style={{ 
            display: "flex", 
            borderBottom: "2px solid #E5E7EB",
            position: "relative",
            marginBottom: "4px"
          }}
        >
          <button
            onClick={() => { setActiveTab("login"); setError(""); setSuccess(""); }}
            style={{
              flex: 1,
              padding: "12px",
              textAlign: "center",
              fontWeight: "700",
              fontSize: "15px",
              letterSpacing: "0.5px",
              color: activeTab === "login" ? "#8B0000" : "#6B7280",
              background: "none",
              border: "none",
              cursor: "pointer",
              position: "relative",
              transition: "color 0.2s"
            }}
          >
            LOGIN
            {activeTab === "login" && (
              <div 
                style={{ 
                  position: "absolute", 
                  bottom: "-2px", 
                  left: 0, 
                  right: 0, 
                  height: "2px", 
                  backgroundColor: "#8B0000" 
                }} 
              />
            )}
          </button>
          <button
            onClick={() => { setActiveTab("register"); setError(""); setSuccess(""); }}
            style={{
              flex: 1,
              padding: "12px",
              textAlign: "center",
              fontWeight: "700",
              fontSize: "15px",
              letterSpacing: "0.5px",
              color: activeTab === "register" ? "#8B0000" : "#6B7280",
              background: "none",
              border: "none",
              cursor: "pointer",
              position: "relative",
              transition: "color 0.2s"
            }}
          >
            REGISTER
            {activeTab === "register" && (
              <div 
                style={{ 
                  position: "absolute", 
                  bottom: "-2px", 
                  left: 0, 
                  right: 0, 
                  height: "2px", 
                  backgroundColor: "#8B0000" 
                }} 
              />
            )}
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
                    border: "1px solid #D1D5DB",
                    borderRadius: "8px",
                    padding: "10px 12px 10px 38px",
                    fontSize: "14px",
                    color: "#1F2937",
                    outline: "none"
                  }}
                  placeholder="Enter email or mobile number"
                  value={loginIdentifier}
                  onChange={(e) => setLoginIdentifier(e.target.value)}
                  onFocus={(e) => e.target.style.borderColor = "#8B0000"}
                  onBlur={(e) => e.target.style.borderColor = "#D1D5DB"}
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
                    border: "1px solid #D1D5DB",
                    borderRadius: "8px",
                    padding: "10px 36px 10px 38px",
                    fontSize: "14px",
                    color: "#1F2937",
                    outline: "none"
                  }}
                  placeholder="Enter password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  onFocus={(e) => e.target.style.borderColor = "#8B0000"}
                  onBlur={(e) => e.target.style.borderColor = "#D1D5DB"}
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

            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "13.5px", marginTop: "2px" }}>
              <label style={{ display: "flex", alignItems: "center", gap: "8px", color: "#4B5563", cursor: "pointer", userSelect: "none" }}>
                <input
                  type="checkbox"
                  disabled={loading}
                  style={{
                    width: "15px",
                    height: "15px",
                    accentColor: "#8B0000",
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
                  color: "#8B0000", 
                  textDecoration: "none", 
                  fontWeight: "600"
                }}
              >
                Forgot Password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%",
                background: "#8B0000",
                color: "#ffffff",
                border: "none",
                borderRadius: "8px",
                padding: "12px",
                fontSize: "14.5px",
                fontWeight: "700",
                cursor: "pointer",
                transition: "all 0.2s",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                boxShadow: "0 2px 4px rgba(139, 0, 0, 0.15)",
                marginTop: "8px"
              }}
              onMouseEnter={(e) => e.target.style.background = "#a30000"}
              onMouseLeave={(e) => e.target.style.background = "#8B0000"}
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Signing In...
                </>
              ) : (
                "Sign In"
              )}
            </button>
          </form>
        ) : (
          /* REGISTER TAB WITH TWO CLICKABLE CARDS AND INFORMATIONAL SECTION */
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {/* Card 1: Register Your Brand */}
            <Link
              href="/brand-registration"
              onClick={onClose}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                width: "100%",
                minHeight: "84px",
                backgroundColor: "#ffffff",
                border: "1px solid #D1D5DB",
                borderRadius: "10px",
                padding: "16px 20px",
                textDecoration: "none",
                cursor: "pointer",
                transition: "all 0.3s ease-in-out",
                boxShadow: "0 2px 4px rgba(0, 0, 0, 0.02)"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "scale(1.02)";
                e.currentTarget.style.borderColor = "#8B0000";
                e.currentTarget.style.boxShadow = "0 8px 16px rgba(139, 0, 0, 0.08)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "none";
                e.currentTarget.style.borderColor = "#D1D5DB";
                e.currentTarget.style.boxShadow = "0 2px 4px rgba(0, 0, 0, 0.02)";
              }}
            >
              <div style={{ display: "flex", flexDirection: "column", gap: "4px", paddingRight: "16px", textAlign: "left" }}>
                <span style={{ fontSize: "16px", fontWeight: "700", color: "#1F2937" }}>
                  Register Your Brand
                </span>
                <span style={{ fontSize: "12px", color: "#6B7280", lineHeight: "1.4" }}>
                  Promote and Grow Your Business with Franchise Roots
                </span>
              </div>
              <ChevronRight size={20} style={{ color: "#8B0000", flexShrink: 0 }} />
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
                minHeight: "84px",
                backgroundColor: "#ffffff",
                border: "1px solid #D1D5DB",
                borderRadius: "10px",
                padding: "16px 20px",
                textDecoration: "none",
                cursor: "pointer",
                transition: "all 0.3s ease-in-out",
                boxShadow: "0 2px 4px rgba(0, 0, 0, 0.02)"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "scale(1.02)";
                e.currentTarget.style.borderColor = "#8B0000";
                e.currentTarget.style.boxShadow = "0 8px 16px rgba(139, 0, 0, 0.08)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "none";
                e.currentTarget.style.borderColor = "#D1D5DB";
                e.currentTarget.style.boxShadow = "0 2px 4px rgba(0, 0, 0, 0.02)";
              }}
            >
              <div style={{ display: "flex", flexDirection: "column", gap: "4px", paddingRight: "16px", textAlign: "left" }}>
                <span style={{ fontSize: "16px", fontWeight: "700", color: "#1F2937" }}>
                  Start A Business
                </span>
                <span style={{ fontSize: "12px", color: "#6B7280", lineHeight: "1.4" }}>
                  Become an Investor and Explore Franchise Opportunities
                </span>
              </div>
              <ChevronRight size={20} style={{ color: "#8B0000", flexShrink: 0 }} />
            </Link>

            {/* Divider */}
            <hr style={{ border: 0, borderTop: "1px solid #E5E7EB", margin: "16px 0 8px 0" }} />

            {/* Why Register Checklist */}
            <div style={{ display: "flex", flexDirection: "column", gap: "16px", textAlign: "left" }}>
              <h3 style={{ fontSize: "22px", fontWeight: "700", color: "#1F2937", margin: 0 }}>
                Why Register with Franchise Roots?
              </h3>
              <p style={{ fontSize: "15px", color: "#6B7280", lineHeight: "1.5", margin: 0 }}>
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
                    <CheckCircle size={18} style={{ color: "#10B981", flexShrink: 0, marginTop: "2px" }} />
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
                    color: "#8B0000",
                    fontWeight: "700",
                    border: "none",
                    background: "none",
                    cursor: "pointer",
                    textDecoration: "underline",
                    padding: 0,
                    fontSize: "14.5px"
                  }}
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
              cursor: "pointer"
            }}
            onMouseEnter={(e) => e.target.style.color = "#1F2937"}
            onMouseLeave={(e) => e.target.style.color = "#6B7280"}
          >
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );
}
