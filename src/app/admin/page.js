"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  Building, Users, FileText, CheckCircle, XCircle, Trash2, LogOut, 
  Home, Search, LayoutDashboard, ShieldCheck, Mail, Phone, MapPin 
} from "lucide-react";

const isNew = (dateString) => {
  if (!dateString) return false;
  const createdDate = new Date(dateString);
  const diffTime = Math.abs(new Date() - createdDate);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays <= 3; // within last 3 days
};

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
  const [selectedInvestorsForBrand, setSelectedInvestorsForBrand] = useState([]);
  const [isSavingAssign, setIsSavingAssign] = useState(false);

  useEffect(() => {
    if (selectedItem && modalType === "brand") {
      const brandId = selectedItem.id || selectedItem._id;
      const attached = investors
        .filter(inv => inv.assignedBrands && (inv.assignedBrands.includes(brandId) || inv.assignedBrands.includes(selectedItem._id)))
        .map(inv => inv.id || inv._id);
      setSelectedInvestorsForBrand(attached);
    }
  }, [selectedItem, modalType, investors]);

  const handleSaveBrandAssignment = async () => {
    const brandId = selectedItem.id || selectedItem._id;
    setIsSavingAssign(true);
    try {
      const res = await fetch("/api/investors/assign-brand", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          brandId,
          investorIds: selectedInvestorsForBrand
        })
      });
      if (res.ok) {
        alert("Brand assignment updated successfully!");
        fetchData();
      } else {
        alert("Failed to save assignment.");
      }
    } catch (err) {
      console.error(err);
      alert("Error saving brand assignment.");
    } finally {
      setIsSavingAssign(false);
    }
  };

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
      <aside className="admin-sidebar" style={{ padding: "0 0 40px 0" }}>
        <div className="admin-sidebar-top" style={{ padding: 0 }}>
          <div style={{ 
            display: "flex", 
            justifyContent: "center", 
            alignItems: "center", 
            width: "100%", 
            padding: "10px 20px 18px 20px", 
            borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
            marginBottom: "16px",
            background: "transparent"
          }}>
            <Link href="/admin/dashboard" style={{ display: "block" }}>
              <img 
                src="/logo-footer.png" 
                alt="Franchise Roots" 
                style={{ 
                  width: "180px", 
                  height: "auto", 
                  objectFit: "contain",
                  display: "block",
                  margin: "0 auto",
                  background: "transparent"
                }} 
              />
            </Link>
          </div>

          <div style={{ padding: "0 28px" }}>
            <ul className="admin-nav" style={{ marginTop: 0 }}>
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
                      <th>Date Registered</th>
                      <th>Status</th>
                      <th>Attached Investors</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredBrands.length === 0 ? (
                      <tr>
                        <td colSpan="8" style={{ textAlign: "center", padding: "30px", color: "var(--text-muted)" }}>
                          No brands match search queries.
                        </td>
                      </tr>
                    ) : (
                      filteredBrands.map((b) => {
                        const attachedCount = investors.filter(inv => inv.assignedBrands && (inv.assignedBrands.includes(b.id) || inv.assignedBrands.includes(b._id))).length;
                        return (
                          <tr key={b.id}>
                            <td>
                              <div>
                                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                                  <span style={{ fontWeight: "700" }}>{b.name}</span>
                                  {isNew(b.createdAt) && (
                                    <span style={{
                                      background: "var(--primary)",
                                      color: "white",
                                      fontSize: "10px",
                                      fontWeight: "800",
                                      padding: "2px 6px",
                                      borderRadius: "4px",
                                      textTransform: "uppercase",
                                      letterSpacing: "0.05em"
                                    }}>NEW</span>
                                  )}
                                </div>
                                <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>{b.company}</div>
                              </div>
                            </td>
                            <td>{b.category}</td>
                            <td style={{ fontWeight: "600" }}>
                              {b.investment_range || formatLakhs(b.minInvestment)} - {b.max_investment_limit || formatLakhs(b.maxInvestment)}
                            </td>
                            <td>{b.hq} {b.pincode && `(${b.pincode})`}</td>
                            <td style={{ fontSize: "13px", color: "var(--text-muted)" }}>
                              {b.createdAt ? new Date(b.createdAt).toLocaleDateString("en-IN", { day: 'numeric', month: 'short', year: 'numeric' }) : "N/A"}
                            </td>
                            <td>
                              <span className={`status-badge ${b.status.toLowerCase()}`}>
                                {b.status}
                              </span>
                            </td>
                            <td>
                              <span style={{ fontWeight: "600", color: attachedCount > 0 ? "var(--primary)" : "var(--text-muted)" }}>
                                {attachedCount} {attachedCount === 1 ? "Investor" : "Investors"}
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
                        );
                      })
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
                      <th>Date Registered</th>
                      <th>Attached Brands</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredInvestors.length === 0 ? (
                      <tr>
                        <td colSpan="8" style={{ textAlign: "center", padding: "30px", color: "var(--text-muted)" }}>
                          No investor profiles match queries.
                        </td>
                      </tr>
                    ) : (
                      filteredInvestors.map((i) => (
                        <tr key={i.id} style={{ cursor: "pointer" }} onClick={() => { setSelectedItem(i); setModalType("investor"); }}>
                          <td style={{ fontWeight: "700" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                              <span>{i.name}</span>
                              {isNew(i.createdAt) && (
                                <span style={{
                                  background: "var(--primary)",
                                  color: "white",
                                  fontSize: "10px",
                                  fontWeight: "800",
                                  padding: "2px 6px",
                                  borderRadius: "4px",
                                  textTransform: "uppercase",
                                  letterSpacing: "0.05em"
                                }}>NEW</span>
                              )}
                            </div>
                          </td>
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
                          <td style={{ fontSize: "13px", color: "var(--text-muted)" }}>
                            {i.createdAt ? new Date(i.createdAt).toLocaleDateString("en-IN", { day: 'numeric', month: 'short', year: 'numeric' }) : "N/A"}
                          </td>
                          <td>
                            {i.assignedBrands && i.assignedBrands.length > 0 ? (
                              <div style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>
                                {i.assignedBrands.map(brandId => {
                                  const brand = brands.find(b => b.id === brandId || b._id === brandId);
                                  return brand ? (
                                    <span key={brandId} className="status-badge approved" style={{ background: "rgba(37,99,235,0.08)", color: "var(--primary)", fontSize: "11px", whiteSpace: "nowrap" }}>
                                      {brand.name}
                                    </span>
                                  ) : null;
                                })}
                              </div>
                            ) : (
                              <span style={{ color: "var(--text-muted)", fontSize: "12px" }}>None</span>
                            )}
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
                  <p style={{ color: "var(--text-muted)", fontSize: "13px" }}>HQ State: <strong>{selectedItem.hq} {selectedItem.pincode && `(${selectedItem.pincode})`}</strong></p>
                  <p style={{ color: "var(--text-muted)", fontSize: "13px" }}>Category: <strong>{selectedItem.category}</strong></p>
                  <span className={`status-badge ${selectedItem.status.toLowerCase()}`} style={{ marginTop: "4px" }}>
                    Status: {selectedItem.status}
                  </span>
                </div>
              </div>

              <div style={{ background: "#f8fafc", padding: "16px", borderRadius: "8px", marginBottom: "20px" }}>
                <h4 style={{ fontSize: "14px", marginBottom: "8px" }}>Investment Metrics</h4>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", fontSize: "13px" }}>
                  <div>Budget Required: <strong>{selectedItem.investment_range || formatLakhs(selectedItem.minInvestment)} - {selectedItem.max_investment_limit || formatLakhs(selectedItem.maxInvestment)}</strong></div>
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

              {/* Assign to Investors section */}
              <div style={{ marginTop: "20px", background: "#f8fafc", padding: "16px", borderRadius: "8px", border: "1px solid var(--light-border)" }}>
                <h4 style={{ fontSize: "14px", marginBottom: "12px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span>Assign to Investors</span>
                  {isSavingAssign && <span style={{ fontSize: "12px", color: "var(--primary)" }}>Saving...</span>}
                </h4>
                {investors.length === 0 ? (
                  <p style={{ fontSize: "12px", color: "var(--text-muted)" }}>No investors registered yet.</p>
                ) : (
                  <>
                    <div style={{ maxHeight: "150px", overflowY: "auto", border: "1px solid var(--light-border)", borderRadius: "6px", padding: "8px", background: "white", marginBottom: "12px" }}>
                      {investors.map(inv => {
                        const invId = inv.id || inv._id;
                        const isChecked = selectedInvestorsForBrand.includes(invId);
                        return (
                          <label key={invId} style={{ display: "flex", alignItems: "center", gap: "8px", padding: "6px 0", cursor: "pointer", fontSize: "13px", borderBottom: "1px solid #f1f5f9" }}>
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedInvestorsForBrand([...selectedInvestorsForBrand, invId]);
                                } else {
                                  setSelectedInvestorsForBrand(selectedInvestorsForBrand.filter(x => x !== invId));
                                }
                              }}
                            />
                            <div>
                              <strong>{inv.name}</strong> <span style={{ color: "var(--text-muted)", fontSize: "11px" }}>({inv.email})</span>
                            </div>
                          </label>
                        );
                      })}
                    </div>
                    <button 
                      className="btn btn-primary" 
                      style={{ width: "100%", fontSize: "13px", padding: "8px" }}
                      onClick={handleSaveBrandAssignment}
                      disabled={isSavingAssign}
                    >
                      Save Assignment to Selected Investors
                    </button>
                  </>
                )}
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
                <p style={{ fontSize: "13px", display: "flex", gap: "6px", alignItems: "center", marginTop: "4px" }}>
                  <MapPin size={12} /> Target: {selectedItem.preferredLocation} {selectedItem.pincode && `(Pincode: ${selectedItem.pincode})`}
                </p>
              </div>

              <div style={{ background: "#f8fafc", padding: "16px", borderRadius: "8px", marginBottom: "20px" }}>
                <h4 style={{ fontSize: "14px", marginBottom: "8px" }}>Investment Capacity</h4>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", fontSize: "13px" }}>
                  <div style={{ gridColumn: "span 2" }}>
                    Budget Range: <strong>{selectedItem.investment_range || formatLakhs(selectedItem.budgetMin)} - {selectedItem.max_investment_limit || formatLakhs(selectedItem.budgetMax)}</strong>
                  </div>
                  <div>Sectors Interested: <strong>{selectedItem.industries && selectedItem.industries.length > 0 ? selectedItem.industries.join(", ") : "Any"}</strong></div>
                  <div>Property Available: <strong>{selectedItem.propertyAvailable}</strong></div>
                  <div>Property Size: <strong>{selectedItem.propertyArea || "N/A"}</strong></div>
                  <div>Prior Experience: <strong>{selectedItem.experience}</strong></div>
                </div>
              </div>

              {/* Attached Brands */}
              <div style={{ background: "#f8fafc", padding: "16px", borderRadius: "8px", marginBottom: "20px" }}>
                <h4 style={{ fontSize: "14px", marginBottom: "8px" }}>Attached Franchise Brands</h4>
                {selectedItem.assignedBrands && selectedItem.assignedBrands.length > 0 ? (
                  <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                    {selectedItem.assignedBrands.map(brandId => {
                      const brand = brands.find(b => b.id === brandId || b._id === brandId);
                      return brand ? (
                        <span key={brandId} className="status-badge approved" style={{ background: "rgba(16,185,129,0.08)", color: "var(--success)", border: "1px solid rgba(16,185,129,0.2)" }}>
                          {brand.name}
                        </span>
                      ) : null;
                    })}
                  </div>
                ) : (
                  <p style={{ fontSize: "13px", color: "var(--text-muted)" }}>No brands attached yet.</p>
                )}
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
