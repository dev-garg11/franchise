"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Lock, User, ShieldCheck, Mail, LogIn, Users, Building } from "lucide-react";

export default function Login() {
  const router = useRouter();
  const [role, setRole] = useState("admin"); // admin, investor, brand
  const [username, setUsername] = useState(""); // for admin
  const [email, setEmail] = useState(""); // for investor/brand
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Check if already logged in
    if (localStorage.getItem("adminLoggedIn") === "true") {
      router.push("/admin");
    } else if (localStorage.getItem("investorLoggedIn") === "true") {
      router.push("/investor-panel");
    } else if (localStorage.getItem("brandLoggedIn") === "true") {
      router.push("/brand-panel");
    }
  }, [router]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (role === "admin") {
      // Mock Admin Auth
      setTimeout(() => {
        if (username === "admin" && password === "admin123") {
          localStorage.setItem("adminLoggedIn", "true");
          router.push("/admin");
        } else {
          setError("Invalid admin username or password. Please use the test credentials.");
          setLoading(false);
        }
      }, 600);
    } else if (role === "investor") {
      // Investor Auth
      try {
        const res = await fetch("/api/investors");
        if (res.ok) {
          const investors = await res.json();
          const matched = investors.find(
            (inv) => inv.email.toLowerCase() === email.toLowerCase() && inv.password === password
          );

          if (matched) {
            localStorage.setItem("investorLoggedIn", "true");
            localStorage.setItem("investorEmail", matched.email);
            localStorage.setItem("investorName", matched.name);
            router.push("/investor-panel");
          } else {
            setError("Invalid investor email or password. You can use the seeded sandbox account.");
            setLoading(false);
          }
        } else {
          setError("Database error. Please try again.");
          setLoading(false);
        }
      } catch (err) {
        setError("Network error. Please try again.");
        setLoading(false);
      }
    } else {
      // Brand Owner Auth
      try {
        const res = await fetch("/api/brands");
        if (res.ok) {
          const brandsList = await res.json();
          const matched = brandsList.find(
            (b) => b.email.toLowerCase() === email.toLowerCase() && b.password === password
          );

          if (matched) {
            localStorage.setItem("brandLoggedIn", "true");
            localStorage.setItem("brandEmail", matched.email);
            localStorage.setItem("brandId", matched.id);
            localStorage.setItem("brandName", matched.name);
            router.push("/brand-panel");
          } else {
            setError("Invalid brand owner email or password. You can use the seeded sandbox account.");
            setLoading(false);
          }
        } else {
          setError("Database error. Please try again.");
          setLoading(false);
        }
      } catch (err) {
        setError("Network error. Please try again.");
        setLoading(false);
      }
    }
  };

  return (
    <div className="login-page">
      <div className="login-card" style={{ maxWidth: "450px" }}>
        <div className="login-header">
          <Link href="/" className="logo" style={{ marginBottom: "16px", display: "inline-flex" }}>
            <span className="logo-icon">F</span>
            Franchise<span>Apply</span>
          </Link>
          <h2>Franchise Apply Login</h2>
          <p>Please enter credentials to gain entry to your account dashboard.</p>
        </div>

        {/* Role Switcher Tabs */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "6px", marginBottom: "24px", background: "#f1f5f9", padding: "4px", borderRadius: "8px" }}>
          <button 
            type="button" 
            className={`btn`} 
            style={{ 
              background: role === "admin" ? "var(--primary)" : "transparent",
              color: role === "admin" ? "white" : "var(--text-dark)",
              boxShadow: "none",
              padding: "8px 4px",
              fontSize: "12px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "4px"
            }}
            onClick={() => { setRole("admin"); setError(""); }}
          >
            <ShieldCheck size={14} /> Admin
          </button>
          <button 
            type="button" 
            className={`btn`} 
            style={{ 
              background: role === "investor" ? "var(--primary)" : "transparent",
              color: role === "investor" ? "white" : "var(--text-dark)",
              boxShadow: "none",
              padding: "8px 4px",
              fontSize: "12px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "4px"
            }}
            onClick={() => { setRole("investor"); setError(""); }}
          >
            <Users size={14} /> Investor
          </button>
          <button 
            type="button" 
            className={`btn`} 
            style={{ 
              background: role === "brand" ? "var(--primary)" : "transparent",
              color: role === "brand" ? "white" : "var(--text-dark)",
              boxShadow: "none",
              padding: "8px 4px",
              fontSize: "12px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "4px"
            }}
            onClick={() => { setRole("brand"); setError(""); }}
          >
            <Building size={14} /> Brand Owner
          </button>
        </div>

        {error && <div className="alert alert-danger">{error}</div>}

        {/* Sandbox Credentials Note */}
        <div className="alert alert-info" style={{ marginBottom: "20px", flexDirection: "column", alignItems: "flex-start", gap: "6px" }}>
          <p style={{ fontWeight: "700", marginBottom: "4px" }}>Test Credentials ({role === "admin" ? "Admin" : role === "investor" ? "Investor" : "Brand Owner"}):</p>
          {role === "admin" && (
            <>
              <p>Username: <strong style={{ color: "var(--primary)" }}>admin</strong></p>
              <p>Password: <strong style={{ color: "var(--primary)" }}>admin123</strong></p>
            </>
          )}
          {role === "investor" && (
            <>
              <p>Email: <strong style={{ color: "var(--primary)" }}>investor@example.com</strong></p>
              <p>Password: <strong style={{ color: "var(--primary)" }}>password123</strong></p>
            </>
          )}
          {role === "brand" && (
            <>
              <p>Email: <strong style={{ color: "var(--primary)" }}>brand@example.com</strong></p>
              <p>Password: <strong style={{ color: "var(--primary)" }}>password123</strong></p>
              <p style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "4px" }}>Or sign up a new brand on the Register Brand page to log in instantly!</p>
            </>
          )}
        </div>

        <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {role === "admin" ? (
            <div className="form-group">
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <User size={14} /> Username
              </label>
              <input
                type="text"
                required
                className="form-input"
                placeholder="Enter admin username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
          ) : (
            <div className="form-group">
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Mail size={14} /> Email Address
              </label>
              <input
                type="email"
                required
                className="form-input"
                placeholder="Enter email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          )}

          <div className="form-group">
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Lock size={14} /> Password
            </label>
            <input
              type="password"
              required
              className="form-input"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: "100%", padding: "12px", marginTop: "10px" }} disabled={loading}>
            {loading ? <div className="spinner" style={{ margin: "0 auto" }}></div> : "Sign In"}
          </button>
        </form>

        <div style={{ textAlign: "center", marginTop: "24px" }}>
          <Link href="/" style={{ fontSize: "14px", color: "var(--text-muted)", textDecoration: "underline" }}>
            Back to Customer Directory
          </Link>
        </div>
      </div>
    </div>
  );
}
