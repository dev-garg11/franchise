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

export default function InvestorPanel({ initialTab = "dashboard" }) {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);
  const [investor, setInvestor] = useState(null);
  const [brands, setBrands] = useState([]);
  const [activeTab, setActiveTab] = useState(initialTab); // dashboard, recommendations, enquiries, consultancy, logs
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  // Investor Logs State
  const [investorLogs, setInvestorLogs] = useState([]);
  const [logsLoading, setLogsLoading] = useState(false);
  const [logSearch, setLogSearch] = useState("");
  const [logPage, setLogPage] = useState(1);
  const logsPerPage = 10;

  const fetchInvestorLogs = async () => {
    const email = localStorage.getItem("investorEmail");
    if (!email) return;
    setLogsLoading(true);
    try {
      const query = new URLSearchParams();
      query.set("panel", "investor");
      query.set("userEmail", email);
      if (logSearch) query.set("search", logSearch);
      const res = await fetch(`/api/logs?${query.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setInvestorLogs(data);
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
  }, [activeTab, logSearch]);

  const handleClearInvestorLogs = async () => {
    const email = localStorage.getItem("investorEmail");
    if (!confirm("Are you sure you want to clear your activity history?")) return;
    try {
      const res = await fetch(`/api/logs?clearAll=true&panel=investor&userEmail=${encodeURIComponent(email)}`, { method: "DELETE" });
      if (res.ok) {
        fetchInvestorLogs();
      }
    } catch (err) {
      console.error("Failed to clear investor logs:", err);
    }
  };

  // Enquiry state
  const [enquiries, setEnquiries] = useState([]);
  // Recommended brands state
  const [recommendations, setRecommendations] = useState([]);

  // Support ticket form
  const [ticketSubject, setTicketSubject] = useState("");
  const [ticketMessage, setTicketMessage] = useState("");
  const [ticketSubmitted, setTicketSubmitted] = useState(false);

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
    const isLoggedIn = localStorage.getItem("investorLoggedIn");
    const email = localStorage.getItem("investorEmail");

    if (isLoggedIn !== "true" || !email) {
      router.push("/login");
    } else {
      setAuthorized(true);
      loadDashboardData(email);
    }
  }, [router]);

  const loadDashboardData = async (email) => {
    setLoading(true);
    try {
      // Fetch all investors and brands
      const [investorsRes, brandsRes] = await Promise.all([
        fetch("/api/investors"),
        fetch("/api/brands?status=Approved")
      ]);

      if (investorsRes.ok && brandsRes.ok) {
        const investorsList = await investorsRes.json();
        const approvedBrands = await brandsRes.json();
        setBrands(approvedBrands);

        // Find primary profile for this investor (first instance or seed)
        const emailClean = (email || "").trim().toLowerCase();

        const userRecords = investorsList.filter((inv) => {
          const invEmail = (inv.email || (inv.user && typeof inv.user === "object" ? inv.user.email : "") || "").trim().toLowerCase();
          return invEmail === emailClean;
        });

        const primaryProfile = userRecords.find(
          (inv) => !inv.comments?.startsWith("Enquiry submitted") && !inv.comments?.startsWith("Interested in") && !inv.brandName && !inv.targetBrand
        ) || userRecords[0];

        setInvestor(primaryProfile || { email: emailClean, name: localStorage.getItem("investorName") || "Investor Profile" });

        // Track enquiries & lead records (all submissions for this email with brand details or comments distinct from profile)
        const activeEnquiries = userRecords.filter(
          (inv) =>
            inv.brandName ||
            inv.targetBrand ||
            inv.brandId ||
            inv.targetBrandId ||
            (inv.comments && inv.comments.trim().length > 0 && inv.comments !== primaryProfile?.comments) ||
            (inv.id && primaryProfile?.id && inv.id !== primaryProfile.id) ||
            (inv._id && primaryProfile?._id && inv._id !== primaryProfile._id)
        );
        setEnquiries(activeEnquiries);

        // Run Recommendation Algorithm
        if (primaryProfile) {
          const maxBudget = primaryProfile.budgetMax || 100000000;
          const minBudget = primaryProfile.budgetMin || 0;
          const preferredSectors = primaryProfile.industries || [];
          const targetLoc = primaryProfile.preferredLocation;

          const matches = approvedBrands.filter((brand) => {
            // Match category
            const categoryMatch = preferredSectors.length === 0 || preferredSectors.includes(brand.category);
            // Match budget range (brand min investment should be below/around investor's max budget)
            const budgetMatch = brand.minInvestment <= maxBudget && brand.maxInvestment >= minBudget;

            return categoryMatch && budgetMatch;
          });

          setRecommendations(matches);
        }
      }
    } catch (error) {
      console.error("Failed to load investor data:", error);
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

  const handleSupportSubmit = (e) => {
    e.preventDefault();
    if (!ticketSubject || !ticketMessage) return;
    setTicketSubmitted(true);
    setTicketSubject("");
    setTicketMessage("");
    setTimeout(() => {
      setTicketSubmitted(false);
    }, 4000);
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
        const email = localStorage.getItem("investorEmail");
        if (email) {
          loadDashboardData(email);
        }
      } else {
        const errData = await res.json().catch(() => ({}));
        alert(errData.error || "Failed to submit application.");
      }
    } catch (err) {
      console.error("Error submitting application:", err);
      alert("Failed to submit application. Please try again.");
    } finally {
      setSubmittingApply(false);
    }
  };

  if (!authorized || !investor) {
    return (
      <div className="flex-center" style={{ minHeight: "100vh", flexDirection: "column", gap: "16px" }}>
        <div className="spinner" style={{ borderTopColor: "var(--primary)" }}></div>
        <p style={{ color: "var(--text-muted)", fontWeight: "500" }}>Loading Investor Account...</p>
      </div>
    );
  }

  return (
    <div className="admin-layout">
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
              {activeTab === "dashboard" && "My Investor Profile"}
              {activeTab === "recommendations" && "Curated Matches For You"}
              {activeTab === "enquiries" && "Investor Lead Records & Applications"}
              {activeTab === "consultancy" && "Corporate Business Desk"}
              {activeTab === "logs" && "Investor Activity Logs & History"}
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
          <div className="flex-center" style={{ minHeight: "300px" }}>
            <div className="spinner"></div>
          </div>
        ) : (
          <>
            {/* Dashboard Tab */}
            {activeTab === "dashboard" && (
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
                  </div>
                </div>
              </div>
            )}

            {/* Recommendations Tab */}
            {activeTab === "recommendations" && (
              <>
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
                    {recommendations.map((brand) => (
                      <div key={brand.id} className="franchise-card" style={{ background: "white" }}>
                        <div className="franchise-card-image" style={{ height: "130px" }}>
                          <div className="franchise-badge">{brand.hq}</div>
                          <img
                            src={brand.image || "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&q=80&w=400"}
                            alt={brand.name}
                            style={{ width: "100%", height: "100%", objectFit: "cover" }}
                          />
                        </div>
                        <div className="franchise-card-content" style={{ padding: "16px" }}>
                          <span className="franchise-category">{brand.category}</span>
                          <h3 className="franchise-title" style={{ fontSize: "16px" }}>{brand.name}</h3>

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
              </>
            )}

            {/* Enquiries / Leads Tab */}
            {activeTab === "enquiries" && (
              <div className="table-container">
                <div className="table-header">
                  <h3 style={{ fontSize: "18px" }}>Investor Leads & Applications Log</h3>
                  <p style={{ color: "var(--text-muted)", fontSize: "13px" }}>Tracking enquiries and lead records submitted to brand operators.</p>
                </div>

                {enquiries.length === 0 ? (
                  <div className="flex-center" style={{ padding: "40px", flexDirection: "column", color: "var(--text-muted)" }}>
                    <HelpCircle size={32} style={{ marginBottom: "12px" }} />
                    <p style={{ fontWeight: "500" }}>No investor lead records found for your account.</p>
                    <p style={{ fontSize: "12px", marginTop: "4px" }}>Submit enquiries from homepage opportunities or brand proposals to record leads.</p>
                  </div>
                ) : (
                  <table className="admin-table">
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
                      {enquiries.map((enq) => {
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
                              <span className="status-badge approved" style={{ background: "rgba(16,185,129,0.08)", color: "var(--success)" }}>
                                {enq.status || "Contacted"}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </div>
            )}

            {/* Consultancy Tab */}
            {activeTab === "consultancy" && (
              <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "24px" }}>

                {/* Send Support ticket */}
                <div className="table-container" style={{ padding: "24px" }}>
                  <h3 style={{ fontSize: "18px", marginBottom: "6px" }}>Connect with a Brand Consultant</h3>
                  <p style={{ color: "var(--text-muted)", fontSize: "13px", marginBottom: "20px" }}>
                    Submit a query regarding lease arrangements, legal reviews, or customized search queries. Our consultant will contact you within 24 hours.
                  </p>

                  {ticketSubmitted && (
                    <div className="alert flex-center" style={{ background: "rgba(16,185,129,0.08)", color: "var(--success)", border: "1px solid rgba(16,185,129,0.2)", gap: "10px", marginBottom: "20px" }}>
                      <CheckCircle2 size={20} />
                      <p>Ticket submitted successfully! A representative has been assigned.</p>
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
                    <button type="submit" className="btn btn-primary" style={{ display: "flex", alignItems: "center", gap: "8px", alignSelf: "flex-start" }}>
                      <Send size={14} /> Submit Query
                    </button>
                  </form>
                </div>

                {/* FAQ panel */}
                <div className="table-container" style={{ padding: "20px" }}>
                  <h3 style={{ fontSize: "16px", marginBottom: "16px" }}>Investor FAQ Support</h3>

                  <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                    <div>
                      <h4 style={{ fontSize: "13px", color: "var(--text-dark)", fontWeight: "600" }}>How long does franchise approval take?</h4>
                      <p style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "4px" }}>
                        Once applied, brand operators typically review and contact pre-qualified investors within 3 to 5 business days.
                      </p>
                    </div>
                    <div>
                      <h4 style={{ fontSize: "13px", color: "var(--text-dark)", fontWeight: "600" }}>Do I need space registered beforehand?</h4>
                      <p style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "4px" }}>
                        No, many brands assist in site-selection, market feasibility surveys, and retail architecture setups as part of training.
                      </p>
                    </div>
                    <div>
                      <h4 style={{ fontSize: "13px", color: "var(--text-dark)", fontWeight: "600" }}>What is the franchise fee structure?</h4>
                      <p style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "4px" }}>
                        It is a one-time non-refundable fee paid directly to the company on contract sign-off for brand copyright and recipe usage.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Investor Logs View */}
            {activeTab === "logs" && (
              <div>
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

                {logsLoading ? (
                  <div className="flex-center" style={{ minHeight: "200px", flexDirection: "column", gap: "12px" }}>
                    <div className="spinner"></div>
                    <p style={{ color: "var(--text-muted)" }}>Loading investor activity logs...</p>
                  </div>
                ) : (
                  <>
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
                            investorLogs.slice((logPage - 1) * logsPerPage, logPage * logsPerPage).map((logItem) => (
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
                      totalItems={investorLogs.length}
                      itemsPerPage={logsPerPage}
                      currentPage={logPage}
                      onPageChange={(p) => setLogPage(p)}
                      onItemsPerPageChange={() => {}}
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
                  style={{ width: "100px", height: "100px", borderRadius: "10px", objectFit: "cover" }}
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
                <p style={{ fontSize: "13px", color: "var(--text-muted)" }}>{selectedBrand.description}</p>
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
                          required
                          className="form-input"
                          value={applyForm.phone}
                          onChange={(e) => setApplyForm({ ...applyForm, phone: e.target.value })}
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
