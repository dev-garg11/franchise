"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  Building, Users, FileText, CheckCircle, HelpCircle, LogOut, 
  Home, Search, LayoutDashboard, PlusCircle, User, Briefcase, 
  MapPin, IndianRupee, MessageSquare, Send, CheckCircle2 
} from "lucide-react";

export default function InvestorPanel() {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);
  const [investor, setInvestor] = useState(null);
  const [brands, setBrands] = useState([]);
  const [activeTab, setActiveTab] = useState("dashboard"); // dashboard, recommendations, enquiries, consultancy
  const [loading, setLoading] = useState(true);

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
        const primaryProfile = investorsList.find(
          (inv) => inv.email.toLowerCase() === email.toLowerCase() && !inv.comments?.startsWith("Enquiry submitted")
        ) || investorsList.find((inv) => inv.email.toLowerCase() === email.toLowerCase());

        setInvestor(primaryProfile);

        // Track enquiries (records containing "Enquiry submitted for Brand" under comments matching this email)
        const activeEnquiries = investorsList.filter(
          (inv) => inv.email.toLowerCase() === email.toLowerCase() && inv.comments?.startsWith("Enquiry submitted")
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
            // Match location (HQ or general option)
            const locationMatch = !targetLoc || brand.hq === targetLoc || true; // Broad recommendation

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
      <aside className="admin-sidebar" style={{ background: "linear-gradient(180deg, #1e293b 0%, #0f172a 100%)" }}>
        <div className="admin-sidebar-top">
          <Link href="/" className="logo" style={{ display: "inline-flex" }}>
            <span className="logo-icon" style={{ background: "var(--secondary)" }}>I</span>
            <span style={{ color: "white" }}>Investor</span><span style={{ color: "var(--secondary)" }}>Panel</span>
          </Link>

          <ul className="admin-nav">
            <li className="admin-nav-item">
              <div 
                className={`admin-nav-link ${activeTab === "dashboard" ? "active" : ""}`}
                onClick={() => setActiveTab("dashboard")}
              >
                <LayoutDashboard size={18} />
                My Profile Dashboard
              </div>
            </li>
            <li className="admin-nav-item">
              <div 
                className={`admin-nav-link ${activeTab === "recommendations" ? "active" : ""}`}
                onClick={() => setActiveTab("recommendations")}
              >
                <Briefcase size={18} />
                Matched Opportunities ({recommendations.length})
              </div>
            </li>
            <li className="admin-nav-item">
              <div 
                className={`admin-nav-link ${activeTab === "enquiries" ? "active" : ""}`}
                onClick={() => setActiveTab("enquiries")}
              >
                <FileText size={18} />
                My Active Applications ({enquiries.length})
              </div>
            </li>
            <li className="admin-nav-item">
              <div 
                className={`admin-nav-link ${activeTab === "consultancy" ? "active" : ""}`}
                onClick={() => setActiveTab("consultancy")}
              >
                <MessageSquare size={18} />
                Consultancy Desk
              </div>
            </li>
          </ul>
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
              {activeTab === "enquiries" && "Franchise Applications log"}
              {activeTab === "consultancy" && "Corporate Business Desk"}
            </h1>
            <p style={{ color: "var(--text-muted)", fontSize: "14px", marginTop: "4px" }}>
              Welcome back, <strong>{investor.name}</strong>. Monitor matches and submit applications.
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
                      <p style={{ fontWeight: "700", marginTop: "2px" }}>{investor.preferredLocation}</p>
                    </div>
                    <div>
                      <label style={{ fontSize: "12px", color: "var(--text-muted)" }}>Budget Limit</label>
                      <p style={{ fontWeight: "700", color: "var(--success)", marginTop: "2px" }}>
                        {formatLakhs(investor.budgetMin)} - {formatLakhs(investor.budgetMax)}
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
                    <div style={{ background: "#f8fafc", padding: "16px", borderRadius: "8px" }}>
                      <h4 style={{ fontSize: "14px", marginBottom: "6px" }}>Registered Notes</h4>
                      <p style={{ fontSize: "13px", color: "var(--text-muted)", fontStyle: "italic" }}>"{investor.comments}"</p>
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
                      <p style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "4px" }}>Active Applications</p>
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

            {/* Enquiries Tab */}
            {activeTab === "enquiries" && (
              <div className="table-container">
                <div className="table-header">
                  <h3 style={{ fontSize: "18px" }}>Submitted Proposals</h3>
                  <p style={{ color: "var(--text-muted)", fontSize: "13px" }}>Tracking enquiries sent directly to brand operators.</p>
                </div>

                {enquiries.length === 0 ? (
                  <div className="flex-center" style={{ padding: "40px", flexDirection: "column", color: "var(--text-muted)" }}>
                    <HelpCircle size={32} style={{ marginBottom: "12px" }} />
                    <p style={{ fontWeight: "500" }}>You haven't applied for any franchise proposals yet.</p>
                    <p style={{ fontSize: "12px", marginTop: "4px" }}>Apply directly from homepage opportunities or recommended matches.</p>
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
                        // Extract brand name from comment "Enquiry submitted for Brand: [BrandName]"
                        const match = enq.comments?.match(/Enquiry submitted for Brand: (.*?)\./);
                        const brandName = match ? match[1] : "Franchise Concept";
                        
                        return (
                          <tr key={enq.id}>
                            <td style={{ fontWeight: "700" }}>{brandName}</td>
                            <td>{enq.propertyArea || "Not specified"}</td>
                            <td>{new Date(enq.createdAt).toLocaleDateString()}</td>
                            <td style={{ fontSize: "12px", color: "var(--text-muted)" }}>{enq.comments}</td>
                            <td>
                              <span className="status-badge approved" style={{ background: "rgba(16,185,129,0.08)", color: "var(--success)" }}>
                                Contacted
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
          </>
        )}
      </main>

      {/* Brand Detail Modal */}
      {selectedBrand && (
        <div className="modal-overlay" onClick={() => setSelectedBrand(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
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

              <div style={{ background: "#eff6ff", border: "1px solid #bfdbfe", padding: "16px", borderRadius: "10px", display: "flex", flexDirection: "column", gap: "6px" }}>
                <h4 style={{ fontSize: "14px", color: "var(--primary)" }}>Direct Brand Coordination Desk</h4>
                <p style={{ fontSize: "12px", color: "#1e3a8a" }}>For agreements, royalty models, and local operations support, you can reach out directly:</p>
                <div style={{ display: "flex", gap: "16px", marginTop: "6px", fontSize: "12px" }}>
                  <span>Email: <strong>{selectedBrand.email}</strong></span>
                  <span>Phone: <strong>{selectedBrand.phone}</strong></span>
                </div>
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
