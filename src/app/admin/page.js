"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  Building, Users, FileText, CheckCircle, XCircle, Trash2, LogOut, 
  Home, Search, LayoutDashboard, ShieldCheck, Mail, Phone, MapPin 
} from "lucide-react";

export default function AdminDashboard() {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);
  const [activeTab, setActiveTab] = useState("dashboard"); // dashboard, brands, investors

  // Data State
  const [brands, setBrands] = useState([]);
  const [investors, setInvestors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Details Modal state
  const [selectedItem, setSelectedItem] = useState(null);
  const [modalType, setModalType] = useState(""); // brand, investor

  // Auth Guard
  useEffect(() => {
    const isLoggedIn = localStorage.getItem("adminLoggedIn");
    if (isLoggedIn !== "true") {
      router.push("/login");
    } else {
      setAuthorized(true);
      fetchData();
    }
  }, [router]);

  // Fetch all brands and investors
  const fetchData = async () => {
    setLoading(true);
    try {
      const [brandsRes, investorsRes] = await Promise.all([
        fetch("/api/brands"),
        fetch("/api/investors")
      ]);

      if (brandsRes.ok) {
        const brandsData = await brandsRes.json();
        setBrands(brandsData);
      }
      if (investorsRes.ok) {
        const investorsData = await investorsRes.json();
        setInvestors(investorsData);
      }
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("adminLoggedIn");
    router.push("/login");
  };

  // Approve Brand Listing
  const handleApprove = async (id) => {
    try {
      const res = await fetch(`/api/brands/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "Approved" })
      });
      if (res.ok) {
        fetchData();
      }
    } catch (err) {
      console.error("Failed to approve brand:", err);
    }
  };

  // Decline Brand Listing
  const handleDecline = async (id) => {
    try {
      const res = await fetch(`/api/brands/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "Declined" })
      });
      if (res.ok) {
        fetchData();
      }
    } catch (err) {
      console.error("Failed to decline brand:", err);
    }
  };

  // Delete Brand Listing
  const handleDeleteBrand = async (id) => {
    if (!confirm("Are you sure you want to permanently delete this brand registration?")) return;
    try {
      const res = await fetch(`/api/brands/${id}`, {
        method: "DELETE"
      });
      if (res.ok) {
        fetchData();
        if (selectedItem && selectedItem.id === id) setSelectedItem(null);
      }
    } catch (err) {
      console.error("Failed to delete brand:", err);
    }
  };

  // Formatting helpers
  const formatLakhs = (val) => {
    if (!val) return "N/A";
    if (val >= 10000000) return `₹${(val / 10000000).toFixed(1)} Cr`;
    if (val >= 100000) return `₹${(val / 100000).toFixed(1)} Lakhs`;
    return `₹${val.toLocaleString("en-IN")}`;
  };

  if (!authorized) {
    return (
      <div className="flex-center" style={{ minHeight: "100vh", flexDirection: "column", gap: "16px" }}>
        <div className="spinner" style={{ borderTopColor: "var(--primary)" }}></div>
        <p style={{ color: "var(--text-muted)", fontWeight: "500" }}>Verifying Authorization status...</p>
      </div>
    );
  }

  // Counts
  const totalBrandsCount = brands.length;
  const pendingBrandsCount = brands.filter(b => b.status === "Pending").length;
  const totalInvestorsCount = investors.length;

  // Filtered Lists
  const filteredBrands = brands.filter(b => 
    b.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredInvestors = investors.filter(i => 
    i.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    i.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    i.preferredLocation.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="admin-layout">
      {/* Sidebar Navigation */}
      <aside className="admin-sidebar">
        <div className="admin-sidebar-top">
          <Link href="/" className="logo" style={{ display: "inline-flex" }}>
            <span className="logo-icon">F</span>
            <span style={{ color: "white" }}>Franchise</span><span style={{ color: "var(--secondary)" }}>Apply</span>
          </Link>

          <ul className="admin-nav">
            <li className="admin-nav-item">
              <div 
                className={`admin-nav-link ${activeTab === "dashboard" ? "active" : ""}`}
                onClick={() => { setActiveTab("dashboard"); setSearchTerm(""); }}
              >
                <LayoutDashboard size={18} />
                Dashboard Overview
              </div>
            </li>
            <li className="admin-nav-item">
              <div 
                className={`admin-nav-link ${activeTab === "brands" ? "active" : ""}`}
                onClick={() => { setActiveTab("brands"); setSearchTerm(""); }}
              >
                <Building size={18} />
                Manage Brands ({brands.length})
                {pendingBrandsCount > 0 && (
                  <span style={{ background: "var(--secondary)", color: "white", padding: "2px 6px", borderRadius: "50%", fontSize: "10px", marginLeft: "auto" }}>
                    {pendingBrandsCount}
                  </span>
                )}
              </div>
            </li>
            <li className="admin-nav-item">
              <div 
                className={`admin-nav-link ${activeTab === "investors" ? "active" : ""}`}
                onClick={() => { setActiveTab("investors"); setSearchTerm(""); }}
              >
                <Users size={18} />
                Investor Leads ({investors.length})
              </div>
            </li>
          </ul>
        </div>

        <div style={{ padding: "0 24px" }}>
          <hr style={{ border: "0", borderTop: "1px solid var(--dark-border)", marginBottom: "20px" }} />
          <button className="admin-nav-link" onClick={handleLogout} style={{ width: "100%", textAlign: "left" }}>
            <LogOut size={18} />
            Logout Session
          </button>
        </div>
      </aside>

      {/* Main Panel Content */}
      <main className="admin-content">
        <header className="admin-header">
          <div>
            <h1 style={{ fontSize: "28px" }}>
              {activeTab === "dashboard" && "Dashboard Overview"}
              {activeTab === "brands" && "Manage Franchise Brands"}
              {activeTab === "investors" && "Investor Registration Leads"}
            </h1>
            <p style={{ color: "var(--text-muted)", fontSize: "14px", marginTop: "4px" }}>
              Welcome back, Administrator. Review pending listings submitted by brand owners.
            </p>
          </div>

          <Link href="/" className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Home size={16} /> View Portal
          </Link>
        </header>

        {loading ? (
          <div className="flex-center" style={{ minHeight: "300px", flexDirection: "column", gap: "16px" }}>
            <div className="spinner" style={{ borderTopColor: "var(--primary)" }}></div>
            <p style={{ color: "var(--text-muted)" }}>Loading records...</p>
          </div>
        ) : (
          <>
            {/* Overview Stats Grid */}
            {activeTab === "dashboard" && (
              <>
                <section className="stats-grid">
                  <div className="stat-card">
                    <div className="stat-icon flex-center">
                      <Building size={24} />
                    </div>
                    <div className="stat-info">
                      <h3>{totalBrandsCount}</h3>
                      <p>Total Registered Brands</p>
                    </div>
                  </div>

                  <div className="stat-card">
                    <div className="stat-icon flex-center" style={{ background: "rgba(245, 158, 11, 0.1)", color: "var(--warning)" }}>
                      <FileText size={24} />
                    </div>
                    <div className="stat-info">
                      <h3>{pendingBrandsCount}</h3>
                      <p>Pending Approvals Queue</p>
                    </div>
                  </div>

                  <div className="stat-card">
                    <div className="stat-icon flex-center" style={{ background: "rgba(16, 185, 129, 0.1)", color: "var(--success)" }}>
                      <Users size={24} />
                    </div>
                    <div className="stat-info">
                      <h3>{totalInvestorsCount}</h3>
                      <p>Registered Investor Leads</p>
                    </div>
                  </div>
                </section>

                {/* Dashboard Panels */}
                <div style={{ display: "grid", gridTemplateColumns: "1.3fr 1fr", gap: "24px" }}>
                  
                  {/* Left: Pending Brands Queue */}
                  <div className="table-container">
                    <div className="table-header">
                      <h3 style={{ fontSize: "18px" }}>Pending Approvals Queue</h3>
                      <button className="btn btn-outline" style={{ fontSize: "12px", padding: "6px 12px" }} onClick={() => setActiveTab("brands")}>
                        View All Brands
                      </button>
                    </div>
                    
                    {brands.filter(b => b.status === "Pending").length === 0 ? (
                      <div className="flex-center" style={{ padding: "40px", flexDirection: "column", color: "var(--text-muted)" }}>
                        <CheckCircle size={32} color="var(--success)" style={{ marginBottom: "12px" }} />
                        <p style={{ fontWeight: "500" }}>All brand listings processed!</p>
                      </div>
                    ) : (
                      <table className="admin-table">
                        <thead>
                          <tr>
                            <th>Brand Name</th>
                            <th>Category</th>
                            <th>Investment</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {brands.filter(b => b.status === "Pending").map((b) => (
                            <tr key={b.id}>
                              <td style={{ fontWeight: "600" }}>{b.name}</td>
                              <td>{b.category}</td>
                              <td>{formatLakhs(b.minInvestment)}</td>
                              <td>
                                <button className="action-btn approve" onClick={() => handleApprove(b.id)}>Approve</button>
                                <button className="action-btn reject" style={{ background: "none", color: "var(--error)", border: "1px solid var(--error)" }} onClick={() => handleDecline(b.id)}>Decline</button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>

                  {/* Right: Recent Investor Leads */}
                  <div className="table-container">
                    <div className="table-header">
                      <h3 style={{ fontSize: "18px" }}>Recent Investor Enquiries</h3>
                      <button className="btn btn-outline" style={{ fontSize: "12px", padding: "6px 12px" }} onClick={() => setActiveTab("investors")}>
                        View All Leads
                      </button>
                    </div>

                    {investors.length === 0 ? (
                      <div className="flex-center" style={{ padding: "40px", color: "var(--text-muted)" }}>
                        <p>No enquiries registered yet.</p>
                      </div>
                    ) : (
                      <div style={{ padding: "16px", display: "flex", flexDirection: "column", gap: "12px" }}>
                        {investors.slice(-4).reverse().map((lead) => (
                          <div 
                            key={lead.id} 
                            style={{ background: "#f8fafc", border: "1px solid var(--light-border)", padding: "14px", borderRadius: "8px", cursor: "pointer" }}
                            onClick={() => { setSelectedItem(lead); setModalType("investor"); }}
                          >
                            <div style={{ display: "flex", justifyBetween: "space-between", alignItems: "center", marginBottom: "4px" }}>
                              <h4 style={{ fontSize: "14px", fontWeight: "600" }}>{lead.name}</h4>
                              <span style={{ fontSize: "11px", color: "var(--text-muted)", marginLeft: "auto" }}>
                                {new Date(lead.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                            <p style={{ fontSize: "12px", color: "var(--text-muted)" }}>Prefers: <strong>{lead.preferredLocation}</strong> | Budget Max: <strong>{formatLakhs(lead.budgetMax)}</strong></p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}

            {/* Brands Tab */}
            {activeTab === "brands" && (
              <div className="table-container">
                <div className="table-header">
                  <h3 style={{ fontSize: "18px" }}>Brand Directory List</h3>
                  <div className="table-search">
                    <Search size={16} color="var(--text-muted)" />
                    <input
                      type="text"
                      placeholder="Search brands, parent company..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>

                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Brand</th>
                      <th>Category</th>
                      <th>Investment Min-Max</th>
                      <th>HQ</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredBrands.length === 0 ? (
                      <tr>
                        <td colSpan="6" style={{ textAlign: "center", padding: "30px", color: "var(--text-muted)" }}>
                          No brands match search queries.
                        </td>
                      </tr>
                    ) : (
                      filteredBrands.map((b) => (
                        <tr key={b.id}>
                          <td>
                            <div>
                              <div style={{ fontWeight: "700" }}>{b.name}</div>
                              <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>{b.company}</div>
                            </div>
                          </td>
                          <td>{b.category}</td>
                          <td style={{ fontWeight: "600" }}>
                            {formatLakhs(b.minInvestment)} - {formatLakhs(b.maxInvestment)}
                          </td>
                          <td>{b.hq}</td>
                          <td>
                            <span className={`status-badge ${b.status.toLowerCase()}`}>
                              {b.status}
                            </span>
                          </td>
                          <td>
                            <button className="action-btn view" onClick={() => { setSelectedItem(b); setModalType("brand"); }}>
                              Details
                            </button>
                            {b.status === "Pending" && (
                              <>
                                <button className="action-btn approve" onClick={() => handleApprove(b.id)}>Approve</button>
                                <button className="action-btn reject" style={{ background: "none", color: "var(--error)", border: "1px solid var(--error)" }} onClick={() => handleDecline(b.id)}>Decline</button>
                              </>
                            )}
                            <button className="action-btn reject" style={{ background: "none", color: "var(--error)", border: "1px solid var(--error)", marginLeft: "4px" }} onClick={() => handleDeleteBrand(b.id)}>
                              <Trash2 size={14} />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {/* Investors Tab */}
            {activeTab === "investors" && (
              <div className="table-container">
                <div className="table-header">
                  <h3 style={{ fontSize: "18px" }}>Investor Profiles & Leads</h3>
                  <div className="table-search">
                    <Search size={16} color="var(--text-muted)" />
                    <input
                      type="text"
                      placeholder="Search investors, email..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>

                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Investor Name</th>
                      <th>Contact Info</th>
                      <th>Budget Range</th>
                      <th>Location Target</th>
                      <th>Sectors</th>
                      <th>Property Available</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredInvestors.length === 0 ? (
                      <tr>
                        <td colSpan="6" style={{ textAlign: "center", padding: "30px", color: "var(--text-muted)" }}>
                          No investor profiles match queries.
                        </td>
                      </tr>
                    ) : (
                      filteredInvestors.map((i) => (
                        <tr key={i.id} style={{ cursor: "pointer" }} onClick={() => { setSelectedItem(i); setModalType("investor"); }}>
                          <td style={{ fontWeight: "700" }}>{i.name}</td>
                          <td>
                            <div>
                              <div>{i.email}</div>
                              <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>{i.phone}</div>
                            </div>
                          </td>
                          <td style={{ fontWeight: "600", color: "var(--success)" }}>
                            {formatLakhs(i.budgetMin)} - {formatLakhs(i.budgetMax)}
                          </td>
                          <td>{i.preferredLocation}</td>
                          <td>
                            {i.industries && i.industries.length > 0 
                              ? i.industries.join(", ") 
                              : "Any Industry"}
                          </td>
                          <td>
                            <span style={{ fontWeight: "500", color: i.propertyAvailable === "Yes" ? "var(--success)" : "var(--text-muted)" }}>
                              {i.propertyAvailable} {i.propertyArea && `(${i.propertyArea})`}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </main>

      {/* Details Modals */}
      {selectedItem && modalType === "brand" && (
        <div className="modal-overlay" onClick={() => setSelectedItem(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Brand Profile: {selectedItem.name}</h3>
              <button className="close-btn" onClick={() => setSelectedItem(null)}>×</button>
            </div>
            <div className="modal-body">
              <div style={{ display: 'flex', gap: '20px', marginBottom: '24px' }}>
                <img 
                  src={selectedItem.image || "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&q=80&w=400"} 
                  alt={selectedItem.name}
                  style={{ width: "80px", height: "80px", borderRadius: "8px", objectFit: "cover" }}
                />
                <div>
                  <h4 style={{ fontSize: "16px", fontWeight: "700" }}>{selectedItem.company}</h4>
                  <p style={{ color: "var(--text-muted)", fontSize: "13px" }}>HQ State: <strong>{selectedItem.hq}</strong></p>
                  <p style={{ color: "var(--text-muted)", fontSize: "13px" }}>Category: <strong>{selectedItem.category}</strong></p>
                  <span className={`status-badge ${selectedItem.status.toLowerCase()}`} style={{ marginTop: "4px" }}>
                    Status: {selectedItem.status}
                  </span>
                </div>
              </div>

              <div style={{ background: "#f8fafc", padding: "16px", borderRadius: "8px", marginBottom: "20px" }}>
                <h4 style={{ fontSize: "14px", marginBottom: "8px" }}>Investment Metrics</h4>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", fontSize: "13px" }}>
                  <div>Budget Required: <strong>{formatLakhs(selectedItem.minInvestment)} - {formatLakhs(selectedItem.maxInvestment)}</strong></div>
                  <div>Franchise Fee: <strong>{selectedItem.franchiseFee ? formatLakhs(selectedItem.franchiseFee) : "N/A"}</strong></div>
                  <div>Royalty: <strong>{selectedItem.royaltyFee || "0%"}</strong></div>
                  <div>Space Required: <strong>{selectedItem.areaRequired || "Any Area"}</strong></div>
                </div>
              </div>

              <div style={{ marginBottom: "20px" }}>
                <h4 style={{ fontSize: "14px", marginBottom: "6px" }}>Overview Description</h4>
                <p style={{ fontSize: "13px", color: "var(--text-muted)" }}>{selectedItem.description}</p>
              </div>

              <div style={{ background: "#f8fafc", padding: "16px", borderRadius: "8px" }}>
                <h4 style={{ fontSize: "14px", marginBottom: "8px" }}>Contact Details</h4>
                <p style={{ fontSize: "13px", display: "flex", gap: "6px", alignItems: "center" }}><Mail size={12} /> {selectedItem.email}</p>
                <p style={{ fontSize: "13px", display: "flex", gap: "6px", alignItems: "center", marginTop: "4px" }}><Phone size={12} /> {selectedItem.phone}</p>
                {selectedItem.website && <p style={{ fontSize: "13px", display: "flex", gap: "6px", alignItems: "center", marginTop: "4px" }}><Building size={12} /> {selectedItem.website}</p>}
              </div>
            </div>
            <div className="modal-footer">
              {selectedItem.status === "Pending" && (
                <>
                  <button className="btn btn-primary" onClick={() => { handleApprove(selectedItem.id); setSelectedItem(null); }}>Approve Brand</button>
                  <button className="btn btn-outline" style={{ background: "var(--error)", color: "white", borderColor: "transparent" }} onClick={() => { handleDecline(selectedItem.id); setSelectedItem(null); }}>Decline Brand</button>
                </>
              )}
              <button className="btn btn-outline" style={{ background: "var(--error)", color: "white", borderColor: "transparent" }} onClick={() => handleDeleteBrand(selectedItem.id)}>Delete Listing</button>
              <button className="btn btn-outline" onClick={() => setSelectedItem(null)}>Close Window</button>
            </div>
          </div>
        </div>
      )}

      {selectedItem && modalType === "investor" && (
        <div className="modal-overlay" onClick={() => setSelectedItem(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Investor Lead: {selectedItem.name}</h3>
              <button className="close-btn" onClick={() => setSelectedItem(null)}>×</button>
            </div>
            <div className="modal-body">
              <div style={{ background: "#f8fafc", padding: "16px", borderRadius: "8px", marginBottom: "20px" }}>
                <h4 style={{ fontSize: "14px", marginBottom: "8px" }}>Contact Profiles</h4>
                <p style={{ fontSize: "13px", display: "flex", gap: "6px", alignItems: "center" }}><Mail size={12} /> {selectedItem.email}</p>
                <p style={{ fontSize: "13px", display: "flex", gap: "6px", alignItems: "center", marginTop: "4px" }}><Phone size={12} /> {selectedItem.phone}</p>
                <p style={{ fontSize: "13px", display: "flex", gap: "6px", alignItems: "center", marginTop: "4px" }}><MapPin size={12} /> Target: {selectedItem.preferredLocation}</p>
              </div>

              <div style={{ background: "#f8fafc", padding: "16px", borderRadius: "8px", marginBottom: "20px" }}>
                <h4 style={{ fontSize: "14px", marginBottom: "8px" }}>Investment Capacity</h4>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", fontSize: "13px" }}>
                  <div>Budget Range: <strong>{formatLakhs(selectedItem.budgetMin)} - {formatLakhs(selectedItem.budgetMax)}</strong></div>
                  <div>Sectors Interested: <strong>{selectedItem.industries && selectedItem.industries.length > 0 ? selectedItem.industries.join(", ") : "Any"}</strong></div>
                  <div>Property Available: <strong>{selectedItem.propertyAvailable}</strong></div>
                  <div>Property Size: <strong>{selectedItem.propertyArea || "N/A"}</strong></div>
                  <div>Prior Experience: <strong>{selectedItem.experience}</strong></div>
                </div>
              </div>

              {selectedItem.comments && (
                <div>
                  <h4 style={{ fontSize: "14px", marginBottom: "6px" }}>Enquiry Details / Message</h4>
                  <p style={{ fontSize: "13px", background: "#fffbeb", border: "1px solid #fef3c7", padding: "12px", borderRadius: "8px", color: "#b45309" }}>
                    {selectedItem.comments}
                  </p>
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setSelectedItem(null)}>Close Window</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
