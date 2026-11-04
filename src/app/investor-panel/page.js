"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Building, Users, FileText, CheckCircle, HelpCircle, LogOut,
  Home, Search, LayoutDashboard, PlusCircle, User, Briefcase,
  MapPin, IndianRupee, MessageSquare, Send, CheckCircle2,
  ShieldCheck, Trash2, RefreshCw
} from "lucide-react";
import Pagination from "@/components/Pagination";
import { logActivity } from "@/lib/logger";
import { ALL_INDIAN_STATES } from "@/lib/brandConstants";
import { decodeHtmlEntities, cleanBrandPlainText, sanitizeBrandHtml } from "@/lib/brandFormatters";
import { toast, Swal } from "@/lib/swal";

const INVESTMENT_OPTIONS = [
  "Rs. 10,000 - 50,000",
  "Rs. 50,000 - 2 Lakh",
  "Rs. 2 Lakh - 5 Lakh",
  "Rs. 5 Lakh - 10 Lakh",
  "Rs. 10 Lakh - 20 Lakh",
  "Rs. 20 Lakh - 30 Lakh",
  "Rs. 30 Lakh - 50 Lakh",
  "Rs. 50 Lakh - 1 Crore",
  "Rs. 1 Crore - 2 Crore",
  "Rs. 2 Crore - 5 Crore",
  "Above Rs. 5 Crore"
];
const ADMIN_WHATSAPP = (process.env.NEXT_PUBLIC_ADMIN_WHATSAPP || "919815489999").replace(/[^0-9]/g, "");

export default function InvestorPanel({ initialTab = "dashboard" }) {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);
  const [investor, setInvestor] = useState(null);
  const [brands, setBrands] = useState([]);
  const [activeTab, setActiveTab] = useState(initialTab); // dashboard, recommendations, enquiries, consultancy, logs
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  // Investor Logs State
  const [investorLogs, setInvestorLogs] = useState([]);
  const [totalInvestorLogs, setTotalInvestorLogs] = useState(0);
  const [logsLoading, setLogsLoading] = useState(false);
  const [logSearch, setLogSearch] = useState("");
  const [logPage, setLogPage] = useState(1);
  const [logsPerPage, setLogsPerPage] = useState(10);

  // Enquiries Pagination State
  const [enquiriesPage, setEnquiriesPage] = useState(1);
  const [enquiriesPerPage, setEnquiriesPerPage] = useState(10);
  const [leadStatusFilter, setLeadStatusFilter] = useState("All");
  const [leadSort, setLeadSort] = useState("newest");
  const [expandedLeads, setExpandedLeads] = useState({});
  const [matchCategoryFilter, setMatchCategoryFilter] = useState("All");
  const [consultTopic, setConsultTopic] = useState("");

  const fetchInvestorLogs = async () => {
    const email = localStorage.getItem("investorEmail");
    if (!email) return;
    setLogsLoading(true);
    try {
      const query = new URLSearchParams();
      query.set("panel", "investor");
      query.set("userEmail", email);
      query.set("page", logPage);
      query.set("limit", logsPerPage);
      if (logSearch) query.set("search", logSearch);
      const res = await fetch(`/api/logs?${query.toString()}`);
      if (res.ok) {
        const data = await res.json();
        if (data.data) {
          setInvestorLogs(data.data);
          setTotalInvestorLogs(data.total);
        } else {
          setInvestorLogs(data);
          setTotalInvestorLogs(data.length);
        }
      }
    } catch (err) {
      console.error("Failed to fetch investor logs:", err);
    } finally {
      setLogsLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "logs") {
      fetchInvestorLogs();
    }
  }, [activeTab, logPage, logsPerPage, logSearch]);

  const handleClearInvestorLogs = async () => {
    const email = localStorage.getItem("investorEmail");
    const isConfirmed = await Swal.confirm("Are you sure you want to clear your activity history?", "Clear Activity History"); if (!isConfirmed) return;
    try {
      const res = await fetch(`/api/logs?clearAll=true&panel=investor&userEmail=${encodeURIComponent(email)}`, { method: "DELETE" });
      if (res.ok) {
        fetchInvestorLogs();
        toast.success("Activity history cleared successfully!");
      }
    } catch (err) {
      console.error("Failed to clear investor logs:", err);
    }
  };

  // Enquiry state
  const [enquiries, setEnquiries] = useState([]);
  // Recommended brands state
  const [recommendations, setRecommendations] = useState([]);
  const [investorAds, setInvestorAds] = useState([]);

  // Support ticket form
  const [ticketSubject, setTicketSubject] = useState("");
  const [ticketMessage, setTicketMessage] = useState("");
  const [ticketSubmitted, setTicketSubmitted] = useState(false);
  const [ticketError, setTicketError] = useState("");
  const [submittingTicket, setSubmittingTicket] = useState(false);

  // Brand detail modal
  const [selectedBrand, setSelectedBrand] = useState(null);

  // Popup application form state
  const [applyForm, setApplyForm] = useState({ name: "", email: "", phone: "", city: "", budget: "", message: "" });
  const [submittingApply, setSubmittingApply] = useState(false);
  const [applySuccess, setApplySuccess] = useState(false);

  useEffect(() => {
    if (selectedBrand && investor) {
      setApplyForm({
        name: investor.name || localStorage.getItem("investorName") || "",
        email: investor.email || localStorage.getItem("investorEmail") || "",
        phone: investor.phone || "",
        city: investor.preferredLocation || "",
        budget: investor.investment_range || `${formatLakhs(selectedBrand.minInvestment)} - ${formatLakhs(selectedBrand.maxInvestment)}`,
        message: ""
      });
      setApplySuccess(false);
    }
  }, [selectedBrand, investor]);

  useEffect(() => {
    fetch("/api/advertisements")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          const matching = data.filter((a) => a.isActive !== false && a.position === "investor_dashboard");
          setInvestorAds(matching);
        }
      })
      .catch((err) => console.error("Error fetching investor ads:", err));
  }, []);

  useEffect(() => {
    const isLoggedIn = localStorage.getItem("investorLoggedIn");
    const email = localStorage.getItem("investorEmail");

    if (isLoggedIn !== "true" || !email) {
      router.push("/login");
    } else {
      setAuthorized(true);
      setInvestor((current) => current || {
        email,
        name: localStorage.getItem("investorName") || "Investor Profile"
      });
      loadDashboardData(email);
    }
  }, [router]);

  const applyInvestorData = (investorsList, approvedBrands, email) => {
    setBrands(Array.isArray(approvedBrands) ? approvedBrands : []);
    const emailClean = (email || "").trim().toLowerCase();
    const userRecords = (Array.isArray(investorsList) ? investorsList : []).filter((inv) => {
      const invEmail = (inv.email || (inv.user && typeof inv.user === "object" ? inv.user.email : "") || "").trim().toLowerCase();
      return invEmail === emailClean;
    });
    const primaryProfile = userRecords.find(
      (inv) => !inv.comments?.startsWith("Enquiry submitted") && !inv.comments?.startsWith("Interested in") && !inv.brandName && !inv.targetBrand
    ) || userRecords[0];
    setInvestor(primaryProfile || { email: emailClean, name: localStorage.getItem("investorName") || "Investor Profile" });
    const activeEnquiries = userRecords.filter((inv) =>
      inv.brandName || inv.targetBrand || inv.brandId || inv.targetBrandId ||
      (inv.comments && inv.comments.trim().length > 0 && inv.comments !== primaryProfile?.comments) ||
      (inv.id && primaryProfile?.id && inv.id !== primaryProfile.id) ||
      (inv._id && primaryProfile?._id && inv._id !== primaryProfile._id)
    );
    setEnquiries(activeEnquiries);
    if (!primaryProfile) { setRecommendations([]); return; }
    const maxBudget = Number(primaryProfile.budgetMax) || 100000000;
    const minBudget = Number(primaryProfile.budgetMin) || 0;
    const preferredSectors = primaryProfile.industries || [];
    setRecommendations((Array.isArray(approvedBrands) ? approvedBrands : []).filter((brand) => {
      const categoryMatch = preferredSectors.length === 0 || preferredSectors.includes(brand.category);
      const budgetMatch = Number(brand.minInvestment) <= maxBudget && Number(brand.maxInvestment) >= minBudget;
      return categoryMatch && budgetMatch;
    }));
  };

  const loadDashboardData = async (email) => {
    setLoading(true);
    setLoadError("");
    const cacheKey = `investor-panel-data:${(email || "").trim().toLowerCase()}`;
    let controller;
    let hasCachedData = false;
    try {
      const cached = sessionStorage.getItem(cacheKey);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed.investors) && Array.isArray(parsed.brands)) {
          applyInvestorData(parsed.investors, parsed.brands, email);
          hasCachedData = true;
          setLoading(false);
        }
      }
    } catch { /* optional browser cache */ }
    try {
      controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);
      const [investorsRes, brandsRes] = await Promise.all([
        fetch("/api/investors", { signal: controller.signal }),
        fetch("/api/brands?status=Approved", { signal: controller.signal })
      ]);
      clearTimeout(timeoutId);
      if (!investorsRes.ok || !brandsRes.ok) throw new Error("Could not load investor data");
      const [investorsList, approvedBrands] = await Promise.all([investorsRes.json(), brandsRes.json()]);
      applyInvestorData(investorsList, approvedBrands, email);
      try {
        const compactBrands = approvedBrands.map((brand) => ({
          id: brand.id,
          _id: brand._id,
          name: brand.name,
          company: brand.company,
          category: brand.category,
          hq: brand.hq,
          image: brand.image,
          minInvestment: brand.minInvestment,
          maxInvestment: brand.maxInvestment,
          areaRequired: brand.areaRequired,
          status: brand.status
        }));
        sessionStorage.setItem(cacheKey, JSON.stringify({ savedAt: Date.now(), investors: investorsList, brands: compactBrands }));
      } catch { /* optional browser cache */ }
    } catch (error) {
      if (error?.name !== "AbortError") console.error("Failed to load investor data:", error);
      if (!hasCachedData) {
        setInvestor((current) => current || {
          email,
          name: localStorage.getItem("investorName") || "Investor Profile"
        });
        setLoadError("Investor data is taking longer than expected. You can retry without leaving this page.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("investorLoggedIn");
    localStorage.removeItem("investorEmail");
    localStorage.removeItem("investorName");
    router.push("/login");
  };

  const formatLakhs = (val) => {
    if (!val) return "N/A";
    if (val >= 10000000) return `₹${(val / 10000000).toFixed(1)} Cr`;
    if (val >= 100000) return `₹${(val / 100000).toFixed(1)} Lakhs`;
    return `₹${val.toLocaleString("en-IN")}`;
  };

  const leadStatus = (record) => String(record?.status || "Pending").trim() || "Pending";
  const leadCounts = enquiries.reduce((counts, record) => {
    const status = leadStatus(record).toLowerCase();
    counts.total += 1;
    if (status === "pending") counts.pending += 1;
    if (status === "approved") counts.approved += 1;
    if (status === "rejected") counts.rejected += 1;
    return counts;
  }, { total: 0, pending: 0, approved: 0, rejected: 0 });
  const filteredEnquiries = [...enquiries]
    .filter((record) => leadStatusFilter === "All" || leadStatus(record).toLowerCase() === leadStatusFilter.toLowerCase())
    .sort((a, b) => {
      const first = new Date(a.appliedAt || a.createdAt || 0).getTime();
      const second = new Date(b.appliedAt || b.createdAt || 0).getTime();
      return leadSort === "oldest" ? first - second : second - first;
    });
  const matchCategories = recommendations.reduce((groups, brand) => {
    const category = brand.category || "Other";
    groups[category] = (groups[category] || 0) + 1;
    return groups;
  }, {});
  const visibleRecommendations = matchCategoryFilter === "All"
    ? recommendations
    : recommendations.filter((brand) => (brand.category || "Other") === matchCategoryFilter);

  const handleSupportSubmit = async (e) => {
    e.preventDefault();
    if (!ticketSubject || !ticketMessage) return;
    setSubmittingTicket(true);
    setTicketError("");
    try {
      const email = localStorage.getItem("investorEmail") || investor?.email || "";
      const name = localStorage.getItem("investorName") || investor?.name || "Investor";
      const response = await fetch("/api/logs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          panel: "admin",
          action: "CONSULTANCY_QUERY",
          description: `Consultancy query from ${name}: ${ticketSubject} — ${ticketMessage}`,
          userEmail: email,
          userName: name,
          role: "investor",
          targetType: "Consultancy",
          details: { subject: ticketSubject, message: ticketMessage, investorEmail: email }
        })
      });
      if (!response.ok) throw new Error("Unable to send query");
      setTicketSubmitted(true);
      toast.success("Query sent to the Franchise Roots admin team.");
      setTicketSubject("");
      setTicketMessage("");
      setConsultTopic("");
      setTimeout(() => setTicketSubmitted(false), 5000);
    } catch (error) {
      console.error("Consultancy query submission failed:", error);
      setTicketError("Could not send your query. Please try again.");
    } finally {
      setSubmittingTicket(false);
    }
  };

  const handleApplySubmit = async (e) => {
    e.preventDefault();
    if (!selectedBrand) return;

    setSubmittingApply(true);
    try {
      const res = await fetch("/api/investors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: applyForm.name,
          fullName: applyForm.name,
          email: applyForm.email,
          phone: applyForm.phone,
          city: applyForm.city || "Not specified",
          preferredLocation: applyForm.city || "Not specified",
          investment_range: applyForm.budget,
          investmentCapacity: applyForm.budget,
          category: selectedBrand.category || "General",
          brandName: selectedBrand.name,
          targetBrand: selectedBrand.name,
          brandId: selectedBrand.id || selectedBrand._id,
          targetBrandId: selectedBrand.id || selectedBrand._id,
          comments: `Enquiry submitted for Brand: ${selectedBrand.name}. Message: ${applyForm.message || "Applied from Investor Panel"}`,
          notes: `Enquiry submitted for Brand: ${selectedBrand.name}. Message: ${applyForm.message || "Applied from Investor Panel"}`,
          status: "Pending"
        })
      });

      if (res.ok) {
        setApplySuccess(true);
        toast.success(`Application for ${selectedBrand.name} submitted successfully!`);
        const email = localStorage.getItem("investorEmail");
        if (email) {
          loadDashboardData(email);
        }
      } else {
        const errData = await res.json().catch(() => ({}));
        toast.error(errData.error || "Failed to submit application.");
      }
    } catch (err) {
      console.error("Error submitting application:", err);
      toast.error("Failed to submit application. Please try again.");
    } finally {
      setSubmittingApply(false);
    }
  };

  if (!authorized || (!investor && !loadError)) {
    return (
      <div className="flex-center" style={{ minHeight: "100vh", flexDirection: "column", gap: "16px" }}>
        <div className="spinner" style={{ borderTopColor: "var(--primary)" }}></div>
        <p style={{ color: "var(--text-muted)", fontWeight: "500" }}>Loading Investor Account...</p>
      </div>
    );
  }

  if (!investor && loadError) {
    return (
      <div className="investor-load-error investor-load-error-page" role="alert">
        <div className="investor-load-error-icon"><RefreshCw size={22} /></div>
        <h3>Investor account is taking longer than expected</h3>
        <p>{loadError}</p>
        <button className="btn btn-primary" onClick={() => loadDashboardData(localStorage.getItem("investorEmail") || "")}>Retry loading</button>
      </div>
    );
  }

  return (
    <div className="admin-layout investor-shell">
      {/* Sidebar Navigation */}
      <aside className="admin-sidebar" style={{ background: "linear-gradient(180deg, #1e293b 0%, #0f172a 100%)", padding: "0 0 40px 0" }}>
        <div className="admin-sidebar-top" style={{ padding: 0 }}>
          <div style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            width: "100%",
            padding: "20px 16px 16px 16px",
            borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
            marginBottom: "16px",
            background: "transparent"
          }}>
            <Link href="/investor-panel" style={{ display: "block" }}>
              <img
                src="/logo-footer.png"
                alt="Franchise Roots Investor Portal"
                className="sidebar-logo-img"
              />
            </Link>
          </div>

          <div style={{ padding: "0 28px" }}>
            <ul className="admin-nav" style={{ marginTop: 0 }}>
              <li className="admin-nav-item">
                <Link
                  href="/investor-panel"
                  className={`admin-nav-link ${activeTab === "dashboard" ? "active" : ""}`}
                  onClick={() => setActiveTab("dashboard")}
                >
                  <LayoutDashboard size={18} />
                  My Profile Dashboard
                </Link>
              </li>
              <li className="admin-nav-item">
                <Link
                  href="/investor-panel/recommendations"
                  className={`admin-nav-link ${activeTab === "recommendations" ? "active" : ""}`}
                  onClick={() => setActiveTab("recommendations")}
                >
                  <Briefcase size={18} />
                  Matched Opportunities ({recommendations.length})
                </Link>
              </li>
              <li className="admin-nav-item">
                <Link
                  href="/investor-panel/enquiries"
                  className={`admin-nav-link ${activeTab === "enquiries" ? "active" : ""}`}
                  onClick={() => setActiveTab("enquiries")}
                >
                  <FileText size={18} />
                  My Lead Records & Applications ({enquiries.length})
                </Link>
              </li>
              <li className="admin-nav-item">
                <Link
                  href="/investor-panel/consultancy"
                  className={`admin-nav-link ${activeTab === "consultancy" ? "active" : ""}`}
                  onClick={() => setActiveTab("consultancy")}
                >
                  <MessageSquare size={18} />
                  Consultancy Desk
                </Link>
              </li>
              <li className="admin-nav-item">
                <Link
                  href="/investor-panel/logs"
                  className={`admin-nav-link ${activeTab === "logs" ? "active" : ""}`}
                  onClick={() => setActiveTab("logs")}
                >
                  <ShieldCheck size={18} />
                  Activity Logs
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div style={{ padding: "0 24px" }}>
          <hr style={{ border: "0", borderTop: "1px solid var(--dark-border)", marginBottom: "20px" }} />
          <button className="admin-nav-link" onClick={handleLogout} style={{ width: "100%", textAlign: "left" }}>
            <LogOut size={18} />
            Logout Account
          </button>
        </div>
      </aside>

      {/* Main Panel Content */}
      <main className="admin-content">
        <header className="admin-header">
          <div>
            <h1 style={{ fontSize: "28px" }}>
              {activeTab === "dashboard" && <>My Investor <span className="investor-accent">Profile</span></>}
              {activeTab === "recommendations" && <>Curated Matches <span className="investor-accent">For You</span></>}
              {activeTab === "enquiries" && <>My Lead Records <span className="investor-accent">& Applications</span></>}
              {activeTab === "consultancy" && <>Corporate Business <span className="investor-accent">Desk</span></>}
              {activeTab === "logs" && <>Investor Activity <span className="investor-accent">Logs & History</span></>}
            </h1>
            <p style={{ color: "var(--text-muted)", fontSize: "14px", marginTop: "4px" }}>
              {activeTab === "logs" ? "Review all your recent franchise enquiries, advisory requests, and activity logs." : <>Welcome back, <strong>{investor.name}</strong>. Monitor matches and lead records.</>}
            </p>
          </div>

          <Link href="/" className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Home size={16} /> Search Directory
          </Link>
        </header>

        {loading ? (
          <div className="investor-skeleton-view" aria-live="polite" aria-label="Loading investor dashboard">
            <div className="investor-skeleton-hero" />
            <div className="investor-skeleton-grid"><span /><span /><span /></div>
            <div className="investor-skeleton-panel" />
          </div>
        ) : loadError && !investor ? (
          <div className="investor-load-error" role="alert">
            <div className="investor-load-error-icon"><RefreshCw size={22} /></div>
            <h3>Investor account is taking longer than expected</h3>
            <p>{loadError}</p>
            <button className="btn btn-primary" onClick={() => loadDashboardData(localStorage.getItem("investorEmail") || "")}>Retry loading</button>
          </div>
        ) : (
          <>
            {/* Dashboard Tab */}
            {activeTab === "dashboard" && (
              <div className="investor-page-stack investor-dashboard-page">
                <section className="investor-welcome-card">
                  <div className="investor-welcome-copy">
                    <div className="investor-avatar"><User size={32} /></div>
                    <div>
                      <span className="investor-eyebrow">INVESTOR DASHBOARD</span>
                      <h2>{investor.name || "Investor Profile"}</h2>
                      <p>Registered Partner Profile</p>
                      <div className="investor-chip-row">
                        {investor.status && <span className="investor-chip">{investor.status}</span>}
                        {investor.preferredLocation && <span className="investor-chip">{investor.preferredLocation}{investor.pincode ? ` (${investor.pincode})` : ""}</span>}
                        <span className="investor-chip">{investor.industries?.length ? investor.industries.join(", ") : "All categories"}</span>
                      </div>
                    </div>
                  </div>
                  <div className="investor-hero-stats">
                    <div><strong>{recommendations.length}</strong><span>Matching Brands</span></div>
                    <div><strong>{enquiries.length}</strong><span>Active Lead Records</span></div>
                  </div>
                  <span className="investor-orb" aria-hidden="true" />
                </section>

              <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "24px" }}>

                {/* Left Panel: Profile info */}
                <div className="table-container" style={{ padding: "24px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "24px" }}>
                    <div className="flex-center" style={{ width: "64px", height: "64px", borderRadius: "50%", background: "rgba(37,99,235,0.1)", color: "var(--primary)" }}>
                      <User size={32} />
                    </div>
                    <div>
                      <h3 style={{ fontSize: "20px" }}>{investor.name}</h3>
                      <p style={{ color: "var(--text-muted)", fontSize: "14px" }}>Registered Partner Profile</p>
                    </div>
                  </div>

                  <h4 style={{ fontSize: "16px", marginBottom: "12px", borderBottom: "1px solid var(--light-border)", paddingBottom: "6px" }}>Investment Scope</h4>
                  <div className="form-grid" style={{ marginBottom: "24px" }}>
                    <div>
                      <label style={{ fontSize: "12px", color: "var(--text-muted)" }}>Target Location</label>
                      <p style={{ fontWeight: "700", marginTop: "2px" }}>{investor.preferredLocation} {investor.pincode && `(${investor.pincode})`}</p>
                    </div>
                    <div>
                      <label style={{ fontSize: "12px", color: "var(--text-muted)" }}>Budget Limit</label>
                      <p style={{ fontWeight: "700", color: "var(--success)", marginTop: "2px" }}>
                        {investor.investment_range || formatLakhs(investor.budgetMin)} - {investor.max_investment_limit || formatLakhs(investor.budgetMax)}
                      </p>
                    </div>
                    <div>
                      <label style={{ fontSize: "12px", color: "var(--text-muted)" }}>Property Available</label>
                      <p style={{ fontWeight: "700", marginTop: "2px" }}>{investor.propertyAvailable} {investor.propertyArea && `(${investor.propertyArea})`}</p>
                    </div>
                    <div>
                      <label style={{ fontSize: "12px", color: "var(--text-muted)" }}>Experience</label>
                      <p style={{ fontWeight: "700", marginTop: "2px" }}>{investor.experience}</p>
                    </div>
                  </div>

                  <h4 style={{ fontSize: "16px", marginBottom: "12px", borderBottom: "1px solid var(--light-border)", paddingBottom: "6px" }}>Sector Focus</h4>
                  <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "24px" }}>
                    {investor.industries && investor.industries.length > 0 ? (
                      investor.industries.map((ind, index) => (
                        <span key={index} className="status-badge approved" style={{ background: "rgba(37,99,235,0.08)", color: "var(--primary)" }}>
                          {ind}
                        </span>
                      ))
                    ) : (
                      <span className="status-badge approved">All Categories</span>
                    )}
                  </div>

                  {investor.comments && (
                    <div style={{ background: "#f8fafc", padding: "16px", borderRadius: "8px", marginBottom: "16px" }}>
                      <h4 style={{ fontSize: "14px", marginBottom: "6px" }}>Registered Notes</h4>
                      <p style={{ fontSize: "13px", color: "var(--text-muted)", fontStyle: "italic" }}>"{investor.comments}"</p>
                    </div>
                  )}

                  {investor.assignedBrands && investor.assignedBrands.length > 0 && (
                    <div style={{ background: "#eff6ff", border: "1px solid #bfdbfe", padding: "16px", borderRadius: "12px" }}>
                      <h4 style={{ fontSize: "15px", color: "var(--primary)", marginBottom: "12px", fontWeight: "700" }}>
                        Assigned Franchise Brands from Administrator
                      </h4>
                      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                        {investor.assignedBrands.map(brandId => {
                          const brand = brands.find(b => b.id === brandId || b._id === brandId);
                          return brand ? (
                            <div key={brandId} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "white", padding: "10px 14px", borderRadius: "8px", border: "1px solid #dbeafe" }}>
                              <div>
                                <h5 style={{ fontSize: "13px", fontWeight: "700", color: "#1e3a8a" }}>{brand.name}</h5>
                                <p style={{ fontSize: "11px", color: "var(--text-muted)" }}>{brand.category} | {brand.hq}</p>
                              </div>
                              <button
                                className="btn btn-primary"
                                style={{ fontSize: "11px", padding: "4px 8px" }}
                                onClick={() => setSelectedBrand(brand)}
                              >
                                View Details
                              </button>
                            </div>
                          ) : null;
                        })}
                      </div>
                    </div>
                  )}
                </div>

                {/* Right Panel: Short Stats / Quick Actions */}
                <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                  <div className="table-container" style={{ padding: "20px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", textAlign: "center" }}>
                    <div style={{ background: "#f8fafc", padding: "16px", borderRadius: "10px" }}>
                      <h3 style={{ fontSize: "28px", color: "var(--primary)" }}>{recommendations.length}</h3>
                      <p style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "4px" }}>Matching Brands</p>
                    </div>
                    <div style={{ background: "#f8fafc", padding: "16px", borderRadius: "10px" }}>
                      <h3 style={{ fontSize: "28px", color: "var(--secondary)" }}>{enquiries.length}</h3>
                      <p style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "4px" }}>Active Lead Records</p>
                    </div>
                  </div>

                  <div className="table-container" style={{ padding: "20px" }}>
                    <h3 style={{ fontSize: "16px", marginBottom: "12px" }}>Matched Options Summary</h3>
                    <p style={{ fontSize: "13px", color: "var(--text-muted)", marginBottom: "16px" }}>
                      Our matchmaker found <strong>{recommendations.length} franchises</strong> in <strong>{investor.preferredLocation}</strong> fitting your capital constraints.
                    </p>
                    <button className="btn btn-primary" onClick={() => setActiveTab("recommendations")} style={{ width: "100%", fontSize: "13px" }}>
                      Browse Recommended Matches
                    </button>

                    {/* Investor Dashboard Promotional Banners */}
                    {investorAds.length > 0 && (
                      <div style={{ marginTop: "20px", paddingTop: "16px", borderTop: "1px solid var(--light-border)", display: "flex", flexDirection: "column", gap: "16px" }}>
                        {investorAds.map((ad) => (
                          <div
                            key={ad.id || ad._id}
                            style={{
                              overflow: "hidden",
                              borderRadius: "14px",
                              border: "1px solid #bfdbfe",
                              backgroundColor: "#ffffff",
                              boxShadow: "0 4px 14px rgba(37,99,235,0.06)"
                            }}
                          >
                            <div style={{ position: "relative", height: "130px", backgroundColor: "#0f172a" }}>
                              {ad.image && (
                                <img
                                  src={ad.image}
                                  alt={ad.title}
                                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                                />
                              )}
                              <span
                                style={{
                                  position: "absolute",
                                  top: "10px",
                                  left: "10px",
                                  backgroundColor: "rgba(15,23,42,0.85)",
                                  color: "#38bdf8",
                                  fontSize: "10px",
                                  fontWeight: "800",
                                  padding: "3px 8px",
                                  borderRadius: "6px"
                                }}
                              >
                                {ad.badge || "FEATURED"}
                              </span>
                            </div>
                            <div style={{ padding: "14px 16px" }}>
                              <h4 style={{ fontSize: "14px", fontWeight: "800", color: "#0f172a", marginBottom: "4px" }}>
                                {ad.title}
                              </h4>
                              {ad.subtitle && (
                                <p style={{ fontSize: "12px", color: "var(--text-muted)", margin: "0 0 10px 0" }}>
                                  {ad.subtitle}
                                </p>
                              )}
                              <Link
                                href={ad.link || "/investor-panel"}
                                className="btn btn-primary"
                                style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "12px", padding: "6px 12px" }}
                              >
                                Explore Opportunity
                              </Link>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    <button style={{ display: "none" }}>
                    </button>
                  </div>
                </div>
              </div>
              <section className="investor-dashboard-section">
                <div className="investor-section-heading"><h3>Recommended for you</h3><button type="button" onClick={() => setActiveTab("recommendations")}>View all {recommendations.length} →</button></div>
                {recommendations.length === 0 ? <div className="investor-empty-inline">No matched opportunities yet.</div> : <div className="investor-mini-grid">
                  {recommendations.slice(0, 3).map((brand) => (
                    <article className="investor-mini-card" key={brand.id || brand._id}>
                      <div className="investor-mini-logo"><img src={brand.image || "/logo-footer.png"} alt={brand.name || "Brand"} /></div>
                      <h4>{brand.name || "Unnamed Brand"}</h4>
                      <span>{brand.category || "General"}</span>
                      <p>Investment<br /><strong>{brand.investment_range || formatLakhs(brand.minInvestment) || "Not disclosed"}</strong></p>
                      <button type="button" onClick={() => setSelectedBrand(brand)}>View Details →</button>
                    </article>
                  ))}
                </div>}
              </section>
              <section className="investor-dashboard-section investor-lead-preview">
                <div className="investor-section-heading"><h3>My Lead Records & Applications</h3><button type="button" onClick={() => setActiveTab("enquiries")}>View all {enquiries.length} →</button></div>
                {enquiries.length === 0 ? <div className="investor-empty-inline">No lead records found.</div> : enquiries.slice(0, 3).map((record) => (
                  <div className="investor-lead-preview-row" key={record.id || record._id}>
                    <span className={`investor-lead-dot ${leadStatus(record).toLowerCase()}`}><FileText size={14} /></span>
                    <div><strong>{record.brandName || record.targetBrand || "Franchise Lead Record"}</strong><small>{record.category || "General"}</small></div>
                    <span className={`status-badge ${leadStatus(record).toLowerCase()}`}>{leadStatus(record)}</span>
                    <time>{new Date(record.appliedAt || record.createdAt || 0).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</time>
                  </div>
                ))}
              </section>
              </div>
            )}

            {/* Recommendations Tab */}
            {activeTab === "recommendations" && (
              <div className="investor-recommendations-page">
                <section className="investor-match-strip">
                  <div><strong>{recommendations.length} franchises match your profile</strong><span>Based on your location{investor.preferredLocation ? ` (${investor.preferredLocation})` : ""} and your budget.</span></div>
                </section>
                {recommendations.length > 0 && (
                  <div className="investor-filter-row">
                    <div className="investor-filter-chips">
                      <button className={matchCategoryFilter === "All" ? "active" : ""} onClick={() => setMatchCategoryFilter("All")}>All <b>{recommendations.length}</b></button>
                      {Object.entries(matchCategories).filter(([, count]) => count > 0).map(([category, count]) => (
                        <button key={category} className={matchCategoryFilter === category ? "active" : ""} onClick={() => setMatchCategoryFilter(category)}>{category} <b>{count}</b></button>
                      ))}
                    </div>
                  </div>
                )}
                {recommendations.length === 0 ? (
                  <div className="flex-center" style={{ minHeight: "250px", flexDirection: "column", background: "white", borderRadius: "18px", border: "1px dashed var(--light-border)", padding: "40px" }}>
                    <HelpCircle size={48} color="var(--text-muted)" style={{ marginBottom: "16px" }} />
                    <h3 style={{ marginBottom: "8px" }}>No Matches Found</h3>
                    <p style={{ color: "var(--text-muted)", marginBottom: "20px", textAlign: "center", maxWidth: "500px" }}>
                      We couldn't find any approved brands matching your sector filter and budget range. Try widening your preferences in settings or consult a manager.
                    </p>
                    <Link href="/" className="btn btn-primary">Browse Global Directory</Link>
                  </div>
                ) : (
                  <div className="grid-auto">
                    {visibleRecommendations.map((brand) => (
                      <div key={brand.id} className="franchise-card" style={{ background: "white" }}>
                        <div className="franchise-card-image" style={{ height: "130px", background: "#ffffff", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <div className="franchise-badge">{brand.hq}</div>
                          <img
                            src={brand.image || "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&q=80&w=400"}
                            alt={brand.name}
                            style={{ width: "100%", height: "100%", objectFit: "contain", objectPosition: "center" }}
                          />
                        </div>
                        <div className="franchise-card-content" style={{ padding: "16px" }}>
                          <span className="franchise-category">{decodeHtmlEntities(brand.category)}</span>
                          <h3 className="franchise-title" style={{ fontSize: "16px" }}>{decodeHtmlEntities(brand.name)}</h3>

                          <div className="franchise-meta" style={{ margin: "12px 0 16px 0" }}>
                            <div className="meta-item">
                              <span className="meta-label" style={{ fontSize: "10px" }}>Min Investment</span>
                              <span className="meta-value" style={{ fontSize: "13px", color: "var(--primary)" }}>{formatLakhs(brand.minInvestment)}</span>
                            </div>
                            <div className="meta-item">
                              <span className="meta-label" style={{ fontSize: "10px" }}>Space Req.</span>
                              <span className="meta-value" style={{ fontSize: "13px" }}>{brand.areaRequired || "Any"}</span>
                            </div>
                          </div>

                          <button className="btn btn-primary" onClick={() => setSelectedBrand(brand)} style={{ width: "100%", padding: "8px 12px", fontSize: "13px" }}>
                            View Proposal Detail
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Enquiries / Leads Tab */}
            {activeTab === "enquiries" && (
              <div className="table-container">
                <div className="table-header">
                  <h3 style={{ fontSize: "18px" }}>Investor Leads & Applications Log</h3>
                  <p style={{ color: "var(--text-muted)", fontSize: "13px" }}>Tracking enquiries and lead records submitted to brand operators.</p>
                </div>

                <div className="investor-summary-grid">
                  <div><strong>{leadCounts.total}</strong><span>Total records</span></div>
                  <div><strong>{leadCounts.pending}</strong><span>Pending</span></div>
                  <div><strong>{leadCounts.approved}</strong><span>Approved</span></div>
                  <div><strong>{leadCounts.rejected}</strong><span>Rejected</span></div>
                </div>
                <div className="investor-filter-row lead-filters">
                  <div className="investor-filter-chips">
                    {["All", "Pending", "Approved", "Rejected"].map((status) => (
                      <button key={status} className={leadStatusFilter === status ? "active" : ""} onClick={() => { setLeadStatusFilter(status); setEnquiriesPage(1); }}>
                        {status} <b>{status === "All" ? leadCounts.total : leadCounts[status.toLowerCase()]}</b>
                      </button>
                    ))}
                  </div>
                  <select value={leadSort} onChange={(e) => { setLeadSort(e.target.value); setEnquiriesPage(1); }} aria-label="Sort lead records">
                    <option value="newest">Newest first</option>
                    <option value="oldest">Oldest first</option>
                  </select>
                </div>

                {filteredEnquiries.length > 0 && <div className="investor-lead-card-list">
                  {filteredEnquiries.slice((enquiriesPage - 1) * enquiriesPerPage, enquiriesPage * enquiriesPerPage).map((enq) => {
                    let cardBrandName = enq.brandName || enq.targetBrand;
                    if (!cardBrandName && enq.comments) {
                      const match = enq.comments.match(/(?:Enquiry submitted for Brand|Interested in Franchise|Brand):\s*(.*?)(?:\.|$)/i);
                      cardBrandName = match?.[1];
                    }
                    const cardStatus = leadStatus(enq);
                    const cardStatusKey = cardStatus.toLowerCase();
                    return <article className="investor-lead-card" key={`card-${enq.id || enq._id}`}>
                      <div className={`investor-lead-card-icon ${cardStatusKey}`}><FileText size={22} /></div>
                      <div className="investor-lead-card-main">
                        <div className="investor-lead-card-title"><h4>{cardBrandName || "Franchise Lead Record"}</h4><span>{enq.propertyArea || enq.preferredLocation || enq.city || "Target area not provided"}</span><time>{new Date(enq.appliedAt || enq.createdAt || 0).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</time></div>
                        <p>{enq.comments || enq.notes || "Lead record submitted"}</p>
                        {cardStatusKey === "pending" && <div className="lead-progress"><span className="done">✓ Submitted</span><i /><span className="current">… In review</span><i /><span className="future">3 Decision</span></div>}
                        {cardStatusKey === "approved" && <div className="lead-progress"><span className="done">✓ Submitted</span><i /><span className="done">✓ In review</span><i /><span className="done">✓ Decision</span></div>}
                        {cardStatusKey === "rejected" && <div className="lead-progress"><span className="done">✓ Submitted</span><i /><span className="done">✓ In review</span><i /><span className="rejected">× Rejected</span></div>}
                      </div>
                      <span className={`status-badge ${cardStatusKey}`}>{cardStatus}</span>
                    </article>;
                  })}
                </div>}

                {enquiries.length === 0 ? (
                  <div className="flex-center" style={{ padding: "40px", flexDirection: "column", color: "var(--text-muted)" }}>
                    <HelpCircle size={32} style={{ marginBottom: "12px" }} />
                    <p style={{ fontWeight: "500" }}>No investor lead records found for your account.</p>
                    <p style={{ fontSize: "12px", marginTop: "4px" }}>Submit enquiries from homepage opportunities or brand proposals to record leads.</p>
                  </div>
                ) : (
                  <>
                    <table className="admin-table investor-lead-table">
                      <thead>
                        <tr>
                          <th>Brand Details</th>
                          <th>Target Area Size</th>
                          <th>Application Date</th>
                          <th>Notes / Lead Details</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredEnquiries.slice((enquiriesPage - 1) * enquiriesPerPage, enquiriesPage * enquiriesPerPage).map((enq) => {
                          let brandName = enq.brandName || enq.targetBrand;
                          if (!brandName && enq.comments) {
                            const match1 = enq.comments.match(/Enquiry submitted for Brand: (.*?)(?:\.|$)/i);
                            const match2 = enq.comments.match(/Interested in Franchise: (.*?)(?:\.|$)/i);
                            const match3 = enq.comments.match(/Brand: (.*?)(?:\.|$)/i);
                            if (match1) brandName = match1[1];
                            else if (match2) brandName = match2[1];
                            else if (match3) brandName = match3[1];
                          }
                          if (!brandName) brandName = enq.category ? `${enq.category} Franchise` : "Franchise Lead Record";

                          return (
                            <tr key={enq.id || enq._id}>
                              <td style={{ fontWeight: "700" }}>{brandName}</td>
                              <td>{enq.propertyArea || enq.preferredLocation || enq.city || "Not specified"}</td>
                              <td>{new Date(enq.appliedAt || enq.createdAt || Date.now()).toLocaleDateString("en-IN", { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                              <td style={{ fontSize: "12px", color: "var(--text-muted)", maxWidth: "300px" }}>{enq.comments || enq.notes || "Lead record submitted"}</td>
                              <td>
                                <span className={`status-badge ${String(enq.status || "Pending").toLowerCase()}`}>
                                  {enq.status || "Pending"}
                                </span>
                                <div className="lead-progress" aria-label={`Lead status ${enq.status || "Pending"}`}>
                                  <span className="done">✓ Submitted</span><i />
                                  <span className={String(enq.status).toLowerCase() === "pending" ? "current" : "done"}>{String(enq.status).toLowerCase() === "pending" ? "… In review" : "✓ In review"}</span><i />
                                  <span className={String(enq.status).toLowerCase() === "approved" ? "done" : String(enq.status).toLowerCase() === "rejected" ? "rejected" : "future"}>{String(enq.status).toLowerCase() === "approved" ? "✓ Decision" : String(enq.status).toLowerCase() === "rejected" ? "× Decision" : "3 Decision"}</span>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                    <Pagination
                      totalItems={filteredEnquiries.length}
                      itemsPerPage={enquiriesPerPage}
                      currentPage={enquiriesPage}
                      onPageChange={(p) => setEnquiriesPage(p)}
                      onItemsPerPageChange={(size) => { setEnquiriesPerPage(size); setEnquiriesPage(1); }}
                    />
                  </>
                )}
              </div>
            )}

            {/* Consultancy Tab */}
            {activeTab === "consultancy" && (
              <div className="investor-consultancy-page" style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "24px" }}>

                {/* Send Support ticket */}
                <div className="table-container" style={{ padding: "24px" }}>
                  <div className="consult-heading-icon"><MessageSquare size={20} /></div>
                  <h3 style={{ fontSize: "18px", marginBottom: "6px" }}>Connect with a Brand Consultant</h3>
                  <p style={{ color: "var(--text-muted)", fontSize: "13px", marginBottom: "20px" }}>
                    Submit a query regarding lease arrangements, legal reviews, or customized search queries. Our consultant will contact you within 24 hours.
                  </p>

                  <div className="consult-topic-row" aria-label="Consultancy topics">
                    {["Lease arrangements", "Legal review", "Custom search", "Site selection"].map((topic) => (
                      <button type="button" key={topic} className={consultTopic === topic ? "active" : ""} onClick={() => { setConsultTopic(topic); setTicketSubject(topic); }}>
                        {topic}
                      </button>
                    ))}
                  </div>

                  {ticketSubmitted && (
                    <div className="alert flex-center" style={{ background: "rgba(16,185,129,0.08)", color: "var(--success)", border: "1px solid rgba(16,185,129,0.2)", gap: "10px", marginBottom: "20px" }}>
                      <CheckCircle2 size={20} />
                      <p>Query sent to the admin team successfully. They will review it shortly.</p>
                    </div>
                  )}
                  {ticketError && (
                    <div className="alert" role="alert" style={{ background: "rgba(220,38,38,0.08)", color: "#b91c1c", border: "1px solid rgba(220,38,38,0.2)", marginBottom: "20px" }}>
                      {ticketError}
                    </div>
                  )}

                  <form onSubmit={handleSupportSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                    <div className="form-group">
                      <label>Subject / Topic</label>
                      <input
                        type="text"
                        required
                        className="form-input"
                        placeholder="e.g. Need assistance with lease contracts in Pune"
                        value={ticketSubject}
                        onChange={(e) => setTicketSubject(e.target.value)}
                        style={{ background: "#f8fafc" }}
                      />
                    </div>
                    <div className="form-group">
                      <label>Brief Message</label>
                      <textarea
                        required
                        className="form-input"
                        rows="4"
                        placeholder="Describe your query in detail..."
                        value={ticketMessage}
                        onChange={(e) => setTicketMessage(e.target.value)}
                        style={{ background: "#f8fafc" }}
                      ></textarea>
                    </div>
                    <button type="submit" disabled={submittingTicket} className="btn btn-primary" style={{ display: "flex", alignItems: "center", gap: "8px", alignSelf: "flex-start" }}>
                      {submittingTicket ? <><RefreshCw size={14} className="spinning" /> Sending...</> : <><Send size={14} /> Submit Query</>}
                    </button>
                  </form>
                </div>

                {/* FAQ panel */}
                <div className="table-container" style={{ padding: "20px" }}>
                  <h3 style={{ fontSize: "16px", marginBottom: "16px" }}>Investor FAQ Support</h3>

                  <div className="investor-faq-list">
                    <details open><summary>How long does franchise approval take?</summary><p>Once applied, brand operators typically review and contact pre-qualified investors within 3 to 5 business days.</p></details>
                    <details><summary>Do I need space registered beforehand?</summary><p>No, many brands assist in site-selection, market feasibility surveys, and retail architecture setups as part of training.</p></details>
                    <details><summary>What is the franchise fee structure?</summary><p>It is a one-time non-refundable fee paid directly to the company on contract sign-off for brand copyright and recipe usage.</p></details>
                  </div>
                  <div className="consult-contact-card">
                    <strong>Prefer to talk right now?</strong>
                    {ADMIN_WHATSAPP && <a href={`https://wa.me/${ADMIN_WHATSAPP}`} target="_blank" rel="noreferrer">WhatsApp Advisory</a>}
                    {ADMIN_WHATSAPP && <a href={`tel:+${ADMIN_WHATSAPP}`}>+{ADMIN_WHATSAPP}</a>}
                  </div>
                </div>
              </div>
            )}

            {/* Investor Logs View */}
            {activeTab === "logs" && (
              <div className="investor-logs-page">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", flexWrap: "wrap", gap: "16px" }}>
                  <div className="search-box" style={{ width: "320px", margin: 0 }}>
                    <Search size={16} />
                    <input
                      type="text"
                      placeholder="Search activity history..."
                      value={logSearch}
                      onChange={(e) => { setLogSearch(e.target.value); setLogPage(1); }}
                    />
                  </div>
                  <div style={{ display: "flex", gap: "10px" }}>
                    <button
                      onClick={fetchInvestorLogs}
                      className="btn btn-outline"
                      style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px" }}
                    >
                      <RefreshCw size={14} className={logsLoading ? "spinning" : ""} /> Refresh
                    </button>
                    <button
                      onClick={handleClearInvestorLogs}
                      className="btn"
                      style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", background: "var(--danger)", color: "white", border: "none" }}
                    >
                      <Trash2 size={14} /> Clear History
                    </button>
                  </div>
                </div>

                <div className="investor-log-summary">
                  <div><span className="log-summary-icon blue"><ShieldCheck size={17} /></span><strong>{totalInvestorLogs}</strong><small>Total activities</small></div>
                  <div><span className="log-summary-icon green"><CheckCircle size={17} /></span><strong>{investorLogs.filter((item) => /_APPROVED$/i.test(item.action || "")).length}</strong><small>Approvals</small></div>
                  <div><span className="log-summary-icon red"><span>×</span></span><strong>{investorLogs.filter((item) => /_(DECLINED|REJECTED)$/i.test(item.action || "")).length}</strong><small>Declines</small></div>
                </div>

                {logsLoading ? (
                  <div className="flex-center" style={{ minHeight: "200px", flexDirection: "column", gap: "12px" }}>
                    <div className="spinner"></div>
                    <p style={{ color: "var(--text-muted)" }}>Loading investor activity logs...</p>
                  </div>
                ) : (
                  <>
                    <div className="investor-log-timeline">
                      {investorLogs.length === 0 ? <div className="investor-empty-inline">No activity yet</div> : investorLogs.map((logItem) => {
                        const action = String(logItem.action || "ACTIVITY");
                        const isGood = /_APPROVED$/i.test(action);
                        const isBad = /_(DECLINED|REJECTED)$/i.test(action);
                        return <article className="investor-log-event" key={`timeline-${logItem.id || logItem._id}`}>
                          <span className={`investor-log-dot ${isGood ? "good" : isBad ? "bad" : "neutral"}`} />
                          <div className={`investor-log-event-icon ${isGood ? "good" : isBad ? "bad" : "neutral"}`}>{isGood ? <CheckCircle size={17} /> : isBad ? <span>×</span> : <ShieldCheck size={17} />}</div>
                          <div className="investor-log-event-body"><div><code className={isGood ? "good" : isBad ? "bad" : "neutral"}>{action}</code><time>{new Date(logItem.createdAt).toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" })}</time></div><strong>{logItem.description || "Activity recorded"}</strong></div>
                        </article>;
                      })}
                    </div>
                    <div style={{ overflowX: "auto", background: "white", borderRadius: "12px", border: "1px solid var(--border-color)" }}>
                      <table className="admin-table" style={{ margin: 0 }}>
                        <thead>
                          <tr>
                            <th style={{ width: "170px" }}>Timestamp</th>
                            <th style={{ width: "160px" }}>Action</th>
                            <th>Activity Description</th>
                          </tr>
                        </thead>
                        <tbody>
                          {investorLogs.length === 0 ? (
                            <tr>
                              <td colSpan="3" style={{ textAlign: "center", padding: "40px 20px", color: "var(--text-muted)" }}>
                                No activity logs recorded yet.
                              </td>
                            </tr>
                          ) : (
                            investorLogs.map((logItem) => (
                              <tr key={logItem.id || logItem._id}>
                                <td style={{ fontSize: "12px", color: "var(--text-muted)", whiteSpace: "nowrap" }}>
                                  {new Date(logItem.createdAt).toLocaleString("en-IN", {
                                    dateStyle: "medium",
                                    timeStyle: "short"
                                  })}
                                </td>
                                <td>
                                  <span style={{
                                    fontSize: "11px",
                                    fontWeight: "600",
                                    fontFamily: "monospace",
                                    background: "rgba(245, 158, 11, 0.1)",
                                    color: "#f59e0b",
                                    padding: "2px 6px",
                                    borderRadius: "4px"
                                  }}>
                                    {logItem.action}
                                  </span>
                                </td>
                                <td style={{ fontSize: "13px", color: "var(--dark)", fontWeight: "500" }}>
                                  {logItem.description}
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>

                    <Pagination
                      totalItems={totalInvestorLogs}
                      itemsPerPage={logsPerPage}
                      currentPage={logPage}
                      onPageChange={(p) => setLogPage(p)}
                      onItemsPerPageChange={(size) => { setLogsPerPage(size); setLogPage(1); }}
                    />
                  </>
                )}
              </div>
            )}
          </>
        )}
      </main>

      {/* Brand Detail Modal */}
      {selectedBrand && (
        <div className="modal-overlay" onClick={() => setSelectedBrand(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "680px", maxHeight: "90vh", overflowY: "auto" }}>
            <div className="modal-header">
              <h3 style={{ fontSize: "22px" }}>{selectedBrand.name}</h3>
              <button className="close-btn" onClick={() => setSelectedBrand(null)}>×</button>
            </div>
            <div className="modal-body">
              <div style={{ display: 'flex', gap: '20px', marginBottom: '24px' }}>
                <img
                  src={selectedBrand.image || "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&q=80&w=400"}
                  alt={selectedBrand.name}
                  style={{ width: "100px", height: "100px", borderRadius: "10px", objectFit: "contain", objectPosition: "center", background: "#ffffff" }}
                />
                <div>
                  <span className="status-badge approved" style={{ marginBottom: "8px" }}>Verified Concept</span>
                  <p style={{ fontWeight: "700", fontSize: "16px" }}>{selectedBrand.company}</p>
                  <p style={{ color: "var(--text-muted)", fontSize: "13px" }}>Category: <strong>{selectedBrand.category}</strong></p>
                  <p style={{ color: "var(--text-muted)", fontSize: "13px" }}>Headquarters: <strong>{selectedBrand.hq}</strong></p>
                </div>
              </div>

              <div style={{ marginBottom: "24px" }}>
                <h4 style={{ fontSize: "15px", marginBottom: "6px", borderBottom: "1px solid #f1f5f9", paddingBottom: "6px" }}>Business Overview</h4>
                <div
                  className="brand-rich-description fck-content-wrapper"
                  style={{ fontSize: "13.5px", color: "#475569", lineHeight: 1.6 }}
                  dangerouslySetInnerHTML={{ __html: sanitizeBrandHtml(selectedBrand.description, selectedBrand) }}
                />
              </div>

              <div className="form-grid" style={{ marginBottom: "24px", background: "#f8fafc", padding: "16px", borderRadius: "12px", fontSize: "13px" }}>
                <div>
                  <span style={{ color: "var(--text-muted)", display: "block", fontSize: "11px" }}>INVESTMENT LIMITS</span>
                  <strong>{formatLakhs(selectedBrand.minInvestment)} - {formatLakhs(selectedBrand.maxInvestment)}</strong>
                </div>
                <div>
                  <span style={{ color: "var(--text-muted)", display: "block", fontSize: "11px" }}>FRANCHISE FEE</span>
                  <strong>{selectedBrand.franchiseFee ? formatLakhs(selectedBrand.franchiseFee) : "Contact Brand"}</strong>
                </div>
                <div>
                  <span style={{ color: "var(--text-muted)", display: "block", fontSize: "11px" }}>ROYALTY FEE</span>
                  <strong>{selectedBrand.royaltyFee || "0%"}</strong>
                </div>
                <div>
                  <span style={{ color: "var(--text-muted)", display: "block", fontSize: "11px" }}>SPACE REQUIRED</span>
                  <strong>{selectedBrand.areaRequired || "Any"}</strong>
                </div>
              </div>

              {/* Franchise Lead Application Form */}
              <div style={{ background: "#f8fafc", border: "1px solid var(--light-border)", padding: "20px", borderRadius: "14px", marginTop: "24px" }}>
                <h4 style={{ fontSize: "16px", fontWeight: "700", marginBottom: "4px", color: "var(--text-dark)" }}>
                  Submit Franchise Application for {selectedBrand.name}
                </h4>
                <p style={{ fontSize: "12.5px", color: "var(--text-muted)", marginBottom: "16px" }}>
                  Express your interest directly. This will create an active lead record in your dashboard.
                </p>

                {applySuccess ? (
                  <div className="alert flex-center" style={{ background: "rgba(16,185,129,0.08)", color: "var(--success)", border: "1px solid rgba(16,185,129,0.2)", gap: "10px", padding: "14px", borderRadius: "10px" }}>
                    <CheckCircle2 size={20} />
                    <p style={{ fontSize: "13.5px", fontWeight: "600" }}>Application submitted successfully! Track it under "My Lead Records & Applications".</p>
                  </div>
                ) : (
                  <form onSubmit={handleApplySubmit} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    <div className="form-grid" style={{ gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                      <div className="form-group">
                        <label style={{ fontSize: "11.5px" }}>Full Name</label>
                        <input
                          type="text"
                          required
                          className="form-input"
                          value={applyForm.name}
                          onChange={(e) => setApplyForm({ ...applyForm, name: e.target.value })}
                          style={{ background: "#ffffff" }}
                        />
                      </div>
                      <div className="form-group">
                        <label style={{ fontSize: "11.5px" }}>Email Address</label>
                        <input
                          type="email"
                          required
                          className="form-input"
                          value={applyForm.email}
                          onChange={(e) => setApplyForm({ ...applyForm, email: e.target.value })}
                          style={{ background: "#ffffff" }}
                        />
                      </div>
                      <div className="form-group">
                        <label style={{ fontSize: "11.5px" }}>Phone Number</label>
                        <input
                          type="tel"
                          inputMode="numeric"
                          maxLength={10}
                          pattern="[0-9]{10}"
                          required
                          className="form-input"
                          value={applyForm.phone}
                          onChange={(e) => setApplyForm({ ...applyForm, phone: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                          style={{ background: "#ffffff" }}
                        />
                      </div>
                      <div className="form-group">
                        <label style={{ fontSize: "11.5px" }}>Target City / State</label>
                        <select
                          required
                          className="form-input"
                          value={applyForm.city}
                          onChange={(e) => setApplyForm({ ...applyForm, city: e.target.value })}
                          style={{ background: "#ffffff" }}
                        >
                          <option value="">Select Target Location State</option>
                          {applyForm.city && !ALL_INDIAN_STATES.includes(applyForm.city) && (
                            <option value={applyForm.city}>{applyForm.city}</option>
                          )}
                          {ALL_INDIAN_STATES.map((st, i) => (
                            <option key={i} value={st}>{st}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div className="form-group">
                      <label style={{ fontSize: "11.5px" }}>Investment Capacity</label>
                      <select
                        required
                        className="form-input"
                        value={applyForm.budget}
                        onChange={(e) => setApplyForm({ ...applyForm, budget: e.target.value })}
                        style={{ background: "#ffffff" }}
                      >
                        <option value="">Select Investment Capacity</option>
                        {applyForm.budget && !INVESTMENT_OPTIONS.includes(applyForm.budget) && (
                          <option value={applyForm.budget}>{applyForm.budget}</option>
                        )}
                        {INVESTMENT_OPTIONS.map((opt, i) => (
                          <option key={i} value={opt}>{opt}</option>
                        ))}
                      </select>
                    </div>
                    <div className="form-group">
                      <label style={{ fontSize: "11.5px" }}>Message / Location Notes (Optional)</label>
                      <textarea
                        className="form-input"
                        rows="3"
                        placeholder="Add notes about your property location, experience, or launch timeline..."
                        value={applyForm.message}
                        onChange={(e) => setApplyForm({ ...applyForm, message: e.target.value })}
                        style={{ background: "#ffffff" }}
                      ></textarea>
                    </div>
                    <button
                      type="submit"
                      disabled={submittingApply}
                      className="btn btn-primary"
                      style={{ padding: "12px", width: "100%", fontSize: "13.5px", fontWeight: "700" }}
                    >
                      {submittingApply ? "Submitting Application..." : `Submit Application for ${selectedBrand.name}`}
                    </button>
                  </form>
                )}
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setSelectedBrand(null)}>Close Window</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
