"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Building, Users, FileText, CheckCircle, XCircle, Trash2, LogOut,
  Home, Search, LayoutDashboard, ShieldCheck, Mail, Phone, MapPin,
  UploadCloud
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
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Blog Management State
  const [blogModalOpen, setBlogModalOpen] = useState(false);
  const [blogForm, setBlogForm] = useState({ title: "", content: "", image: "" });
  const [editingBlogId, setEditingBlogId] = useState(null);
  const [isSavingBlog, setIsSavingBlog] = useState(false);

  // Investor Leads Filters State
  const [filterBrand, setFilterBrand] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

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

  // Fetch all brands, investors, and blogs
  const fetchData = async () => {
    setLoading(true);
    try {
      const [brandsRes, investorsRes, blogsRes] = await Promise.all([
        fetch("/api/brands"),
        fetch("/api/investors"),
        fetch("/api/blogs")
      ]);

      if (brandsRes.ok) {
        const brandsData = await brandsRes.json();
        setBrands(brandsData);
      }
      if (investorsRes.ok) {
        const investorsData = await investorsRes.json();
        setInvestors(investorsData);
      }
      if (blogsRes.ok) {
        const blogsData = await blogsRes.json();
        setBlogs(blogsData);
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

  // Approve Investor Lead
  const handleApproveInvestor = async (id) => {
    try {
      const res = await fetch(`/api/investors/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "Approved" })
      });
      if (res.ok) {
        fetchData();
        setSelectedItem(null);
      }
    } catch (err) {
      console.error("Failed to approve investor lead:", err);
    }
  };

  // Decline Investor Lead
  const handleDeclineInvestor = async (id) => {
    try {
      const res = await fetch(`/api/investors/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "Rejected" })
      });
      if (res.ok) {
        fetchData();
        setSelectedItem(null);
      }
    } catch (err) {
      console.error("Failed to decline investor lead:", err);
    }
  };

  // Delete Investor Lead
  const handleDeleteInvestor = async (id) => {
    if (!confirm("Are you sure you want to permanently delete this investor lead?")) return;
    try {
      const res = await fetch(`/api/investors/${id}`, {
        method: "DELETE"
      });
      if (res.ok) {
        fetchData();
        setSelectedItem(null);
      }
    } catch (err) {
      console.error("Failed to delete investor lead:", err);
    }
  };

  // Open modal to create a new blog
  const handleOpenCreateBlog = () => {
    setBlogForm({ title: "", content: "", image: "" });
    setEditingBlogId(null);
    setBlogModalOpen(true);
  };

  // Open modal to edit an existing blog
  const handleOpenEditBlog = (blog) => {
    setBlogForm({
      title: blog.title || "",
      content: blog.content || "",
      image: blog.image || ""
    });
    setEditingBlogId(blog.id || blog._id);
    setBlogModalOpen(true);
  };

  // Create or Update blog DB record
  const handleSaveBlog = async (e) => {
    e.preventDefault();
    if (!blogForm.title || !blogForm.content) {
      alert("Title and content are required.");
      return;
    }
    setIsSavingBlog(true);
    try {
      const url = editingBlogId ? `/api/blogs/${editingBlogId}` : "/api/blogs";
      const method = editingBlogId ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(blogForm)
      });
      if (res.ok) {
        alert(editingBlogId ? "Blog updated successfully!" : "Blog created successfully!");
        setBlogModalOpen(false);
        fetchData();
      } else {
        const errorData = await res.json();
        alert(errorData.error || "Failed to save blog post.");
      }
    } catch (err) {
      console.error("Failed to save blog:", err);
      alert("An error occurred while saving the blog.");
    } finally {
      setIsSavingBlog(false);
    }
  };

  // Delete Blog record
  const handleDeleteBlog = async (id) => {
    if (!confirm("Are you sure you want to permanently delete this blog post?")) return;
    try {
      const res = await fetch(`/api/blogs/${id}`, {
        method: "DELETE"
      });
      if (res.ok) {
        fetchData();
      } else {
        alert("Failed to delete blog post.");
      }
    } catch (err) {
      console.error("Failed to delete blog:", err);
    }
  };

  const handleBlogImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check size limit: e.g. 5MB
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      alert("File is too large. Maximum size allowed is 5 MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      // Create an image to resize it (optional, but good for saving DB space)
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        // Resize to 800px width limit or similar
        const maxDim = 800;
        let width = img.width;
        let height = img.height;
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);

        const base64 = canvas.toDataURL("image/jpeg", 0.85);
        setBlogForm(prev => ({
          ...prev,
          image: base64
        }));
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveBlogImage = () => {
    setBlogForm(prev => ({
      ...prev,
      image: ""
    }));
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

  const filteredInvestors = investors.filter(i => {
    // 1. Search by name, email, phone or target location
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = !searchTerm ? true : (
      (i.name && i.name.toLowerCase().includes(searchLower)) ||
      (i.email && i.email.toLowerCase().includes(searchLower)) ||
      (i.phone && i.phone.includes(searchTerm)) ||
      (i.preferredLocation && i.preferredLocation.toLowerCase().includes(searchLower))
    );

    // 2. Filter by Brand (both assignedBrands array or applied brandId/brandName if saved as application)
    const matchesBrand = !filterBrand ? true : (
      (i.brandId && i.brandId === filterBrand) ||
      (i.brandName && i.brandName.toLowerCase().includes(filterBrand.toLowerCase())) ||
      (i.assignedBrands && i.assignedBrands.includes(filterBrand))
    );

    // 3. Filter by Category
    const matchesCategory = !filterCategory ? true : (
      (i.category && i.category.toLowerCase() === filterCategory.toLowerCase()) ||
      (i.industries && i.industries.some(ind => ind.toLowerCase() === filterCategory.toLowerCase()))
    );

    // 4. Filter by Status
    const displayStatus = i.status || "Pending";
    const matchesStatus = !filterStatus ? true : (
      displayStatus.toLowerCase() === filterStatus.toLowerCase()
    );

    return matchesSearch && matchesBrand && matchesCategory && matchesStatus;
  });

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
                  height: "150px",
                  width: "auto",
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
              <li className="admin-nav-item">
                <div
                  className={`admin-nav-link ${activeTab === "blogs" ? "active" : ""}`}
                  onClick={() => { setActiveTab("blogs"); setSearchTerm(""); }}
                >
                  <FileText size={18} />
                  Manage Blogs ({blogs.length})
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
              {activeTab === "blogs" && "Manage Blog Articles"}
            </h1>
            <p style={{ color: "var(--text-muted)", fontSize: "14px", marginTop: "4px" }}>
              {activeTab === "blogs" ? "Create, publish, edit, and delete informational blog posts." : "Welcome back, Administrator. Review pending listings submitted by brand owners."}
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
                <section className="stats-grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}>
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

                  <div className="stat-card" style={{ cursor: "pointer" }} onClick={() => setActiveTab("blogs")}>
                    <div className="stat-icon flex-center" style={{ background: "rgba(99, 102, 241, 0.1)", color: "var(--primary)" }}>
                      <FileText size={24} />
                    </div>
                    <div className="stat-info">
                      <h3>{blogs.length}</h3>
                      <p>Total Blog Posts</p>
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

                {/* Filter Bar */}
                <div className="filter-bar" style={{
                  display: "flex",
                  gap: "16px",
                  padding: "16px 24px",
                  background: "#f8fafc",
                  borderBottom: "1px solid var(--light-border)",
                  alignItems: "center",
                  flexWrap: "wrap"
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px" }}>
                    <span style={{ fontWeight: "600", color: "var(--text-muted)" }}>Brand:</span>
                    <select
                      value={filterBrand}
                      onChange={(e) => setFilterBrand(e.target.value)}
                      style={{ padding: "6px 12px", borderRadius: "6px", border: "1px solid var(--light-border)", fontSize: "13px", background: "white", minWidth: "150px" }}
                    >
                      <option value="">All Brands</option>
                      {brands.map(b => (
                        <option key={b.id || b._id} value={b.id || b._id}>{b.name}</option>
                      ))}
                    </select>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px" }}>
                    <span style={{ fontWeight: "600", color: "var(--text-muted)" }}>Category:</span>
                    <select
                      value={filterCategory}
                      onChange={(e) => setFilterCategory(e.target.value)}
                      style={{ padding: "6px 12px", borderRadius: "6px", border: "1px solid var(--light-border)", fontSize: "13px", background: "white", minWidth: "150px" }}
                    >
                      <option value="">All Categories</option>
                      <option value="Food and Beverage">Food & Beverage</option>
                      <option value="Retail">Retail</option>
                      <option value="Education">Education</option>
                      <option value="Automobiles">Automobiles</option>
                      <option value="Health and Wellness">Health & Wellness</option>
                      <option value="Business Services">Business Services</option>
                    </select>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px" }}>
                    <span style={{ fontWeight: "600", color: "var(--text-muted)" }}>Status:</span>
                    <select
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                      style={{ padding: "6px 12px", borderRadius: "6px", border: "1px solid var(--light-border)", fontSize: "13px", background: "white", minWidth: "120px" }}
                    >
                      <option value="">All Statuses</option>
                      <option value="Pending">Pending</option>
                      <option value="Approved">Approved</option>
                      <option value="Rejected">Rejected</option>
                    </select>
                  </div>

                  {(filterBrand || filterCategory || filterStatus) && (
                    <button
                      onClick={() => { setFilterBrand(""); setFilterCategory(""); setFilterStatus(""); }}
                      style={{
                        padding: "6px 14px",
                        fontSize: "13px",
                        fontWeight: "600",
                        background: "none",
                        border: "1px solid var(--primary)",
                        color: "var(--primary)",
                        borderRadius: "6px",
                        cursor: "pointer"
                      }}
                    >
                      Clear Filters
                    </button>
                  )}
                </div>

                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Investor Name</th>
                      <th>Contact Info</th>
                      <th>Applied Brand</th>
                      <th>Category</th>
                      <th>Budget Range</th>
                      <th>Location Target</th>
                      <th>Status</th>
                      <th>Applied Date</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredInvestors.length === 0 ? (
                      <tr>
                        <td colSpan="9" style={{ textAlign: "center", padding: "30px", color: "var(--text-muted)" }}>
                          No investor profiles match queries.
                        </td>
                      </tr>
                    ) : (
                      filteredInvestors.map((i) => {
                        // Resolve brand connection
                        let displayBrandName = "General Lead";
                        let targetBrand = null;
                        if (i.brandId) {
                          targetBrand = brands.find(b => b.id === i.brandId || b._id === i.brandId);
                          displayBrandName = i.brandName || (targetBrand ? targetBrand.name : "Unknown Brand");
                        } else if (i.assignedBrands && i.assignedBrands.length > 0) {
                          const firstBrandId = i.assignedBrands[0];
                          targetBrand = brands.find(b => b.id === firstBrandId || b._id === firstBrandId);
                          displayBrandName = targetBrand ? targetBrand.name : "General Lead";
                        }

                        const displayCategory = i.category || (i.industries && i.industries.length > 0 ? i.industries[0] : "General");
                        const displayStatus = i.status || "Pending";
                        const statusClass = displayStatus.toLowerCase() === "rejected" ? "declined" : displayStatus.toLowerCase();
                        const displayDate = i.appliedAt || i.createdAt;

                        return (
                          <tr key={i.id || i._id} style={{ cursor: "pointer" }} onClick={() => { setSelectedItem(i); setModalType("investor"); }}>
                            <td style={{ fontWeight: "700" }}>
                              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                                <span>{i.name}</span>
                                {isNew(displayDate) && (
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
                            <td>
                              {targetBrand ? (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedItem(targetBrand);
                                    setModalType("brand");
                                  }}
                                  style={{
                                    background: "none",
                                    border: "none",
                                    color: "var(--primary)",
                                    textDecoration: "underline",
                                    fontWeight: "600",
                                    cursor: "pointer",
                                    padding: 0,
                                    textAlign: "left"
                                  }}
                                >
                                  {displayBrandName}
                                </button>
                              ) : (
                                <span style={{ color: "var(--text-muted)" }}>{displayBrandName}</span>
                              )}
                            </td>
                            <td>{displayCategory}</td>
                            <td style={{ fontWeight: "600", color: "var(--success)" }}>
                              {formatLakhs(i.budgetMin)} - {formatLakhs(i.budgetMax)}
                            </td>
                            <td>{i.preferredLocation}</td>
                            <td>
                              <span className={`status-badge ${statusClass}`}>
                                {displayStatus}
                              </span>
                            </td>
                            <td style={{ fontSize: "13px", color: "var(--text-muted)" }}>
                              {displayDate ? new Date(displayDate).toLocaleDateString("en-IN", { day: 'numeric', month: 'short', year: 'numeric' }) : "N/A"}
                            </td>
                            <td onClick={(e) => e.stopPropagation()}>
                              <button className="action-btn view" onClick={() => { setSelectedItem(i); setModalType("investor"); }}>
                                Details
                              </button>
                              {displayStatus === "Pending" && (
                                <>
                                  <button className="action-btn approve" onClick={() => handleApproveInvestor(i.id || i._id)}>Approve</button>
                                  <button className="action-btn reject" style={{ background: "none", color: "var(--error)", border: "1px solid var(--error)" }} onClick={() => handleDeclineInvestor(i.id || i._id)}>Decline</button>
                                </>
                              )}
                              <button className="action-btn reject" style={{ background: "none", color: "var(--error)", border: "1px solid var(--error)", marginLeft: "4px" }} onClick={() => handleDeleteInvestor(i.id || i._id)}>
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

            {/* Blogs Tab */}
            {activeTab === "blogs" && (
              <div className="table-container">
                <div className="table-header">
                  <h3 style={{ fontSize: "18px" }}>Blog Posts Directory</h3>
                  <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
                    <div className="table-search">
                      <Search size={16} color="var(--text-muted)" />
                      <input
                        type="text"
                        placeholder="Search blogs by title..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                    <button className="btn btn-primary" onClick={handleOpenCreateBlog} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <FileText size={16} /> Create New Blog
                    </button>
                  </div>
                </div>

                <table className="admin-table">
                  <thead>
                    <tr>
                      <th style={{ width: "120px" }}>Cover</th>
                      <th>Title</th>
                      <th>Snippet</th>
                      <th>Date Published</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {blogs
                      .filter(blog => blog.title.toLowerCase().includes(searchTerm.toLowerCase()))
                      .length === 0 ? (
                      <tr>
                        <td colSpan="5" style={{ textAlign: "center", padding: "30px", color: "var(--text-muted)" }}>
                          No blog posts found. Click "Create New Blog" to publish one.
                        </td>
                      </tr>
                    ) : (
                      blogs
                        .filter(blog => blog.title.toLowerCase().includes(searchTerm.toLowerCase()))
                        .map((blog) => (
                          <tr key={blog.id || blog._id}>
                            <td>
                              <img
                                src={blog.image || "https://images.unsplash.com/photo-1546074177-ffedd79d494d?auto=format&fit=crop&q=80&w=150"}
                                alt={blog.title}
                                style={{ width: "80px", height: "50px", borderRadius: "6px", objectFit: "cover", border: "1px solid var(--border-color)" }}
                              />
                            </td>
                            <td>
                              <span style={{ fontWeight: "700" }}>{blog.title}</span>
                            </td>
                            <td>
                              <span style={{ color: "var(--text-muted)", fontSize: "13px" }}>
                                {blog.content && blog.content.length > 90 ? `${blog.content.substring(0, 90)}...` : blog.content}
                              </span>
                            </td>
                            <td style={{ fontSize: "13px", color: "var(--text-muted)" }}>
                              {blog.createdAt ? new Date(blog.createdAt).toLocaleDateString("en-IN", { day: 'numeric', month: 'short', year: 'numeric' }) : "N/A"}
                            </td>
                            <td>
                              <button className="action-btn view" onClick={() => handleOpenEditBlog(blog)}>
                                Edit Post
                              </button>
                              <button className="action-btn reject" style={{ background: "none", color: "var(--error)", border: "1px solid var(--error)" }} onClick={() => handleDeleteBlog(blog.id || blog._id)}>
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

              {/* Attached Brands / Applied Brand */}
              {(selectedItem.brandId || selectedItem.brandName) ? (
                <div style={{ background: "#f8fafc", padding: "16px", borderRadius: "8px", marginBottom: "20px" }}>
                  <h4 style={{ fontSize: "14px", marginBottom: "8px" }}>Applied Franchise Brand</h4>
                  <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                    <span className="status-badge approved" style={{ background: "rgba(37,99,235,0.08)", color: "var(--primary)", border: "1px solid rgba(37,99,235,0.2)" }}>
                      {selectedItem.brandName || "Applied Brand"}
                    </span>
                    <span style={{ fontSize: "13px", color: "var(--text-muted)" }}>
                      Category: {selectedItem.category || "General"}
                    </span>
                  </div>
                </div>
              ) : (
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
              )}

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
              {(selectedItem.status || "Pending") === "Pending" && (
                <>
                  <button className="btn btn-primary" onClick={() => handleApproveInvestor(selectedItem.id || selectedItem._id)}>Approve Lead</button>
                  <button className="btn btn-outline" style={{ background: "var(--error)", color: "white", borderColor: "transparent" }} onClick={() => handleDeclineInvestor(selectedItem.id || selectedItem._id)}>Decline Lead</button>
                </>
              )}
              <button className="btn btn-outline" style={{ background: "var(--error)", color: "white", borderColor: "transparent" }} onClick={() => handleDeleteInvestor(selectedItem.id || selectedItem._id)}>Delete Lead</button>
              <button className="btn btn-outline" onClick={() => setSelectedItem(null)}>Close Window</button>
            </div>
          </div>
        </div>
      )}

      {/* Create/Edit Blog Modal */}
      {blogModalOpen && (
        <div className="modal-overlay" onClick={() => setBlogModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "600px" }}>
            <div className="modal-header">
              <h3>{editingBlogId ? "Edit Blog Post" : "Create New Blog Post"}</h3>
              <button className="close-btn" onClick={() => setBlogModalOpen(false)}>×</button>
            </div>
            <form onSubmit={handleSaveBlog}>
              <div className="modal-body" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <div className="form-group">
                  <label htmlFor="blog-title" style={{ fontWeight: 700, color: "var(--text-dark)", fontSize: "13.5px" }}>Blog Title <span style={{ color: "var(--danger)" }}>*</span></label>
                  <input
                    id="blog-title"
                    type="text"
                    className="form-input"
                    placeholder="Enter catchy title..."
                    value={blogForm.title}
                    onChange={(e) => setBlogForm({ ...blogForm, title: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label style={{ fontWeight: 700, color: "var(--text-dark)", fontSize: "13.5px" }}>Cover Image</label>

                  {blogForm.image ? (
                    <div style={{ position: "relative", border: "1px solid var(--border-color)", borderRadius: "8px", overflow: "hidden", background: "#f8fafc" }}>
                      <img
                        src={blogForm.image}
                        alt="Preview"
                        style={{ width: "100%", maxHeight: "200px", objectFit: "cover" }}
                      />
                      <button
                        type="button"
                        onClick={handleRemoveBlogImage}
                        style={{
                          position: "absolute",
                          top: "10px",
                          right: "10px",
                          background: "var(--error)",
                          color: "white",
                          border: "none",
                          borderRadius: "50%",
                          width: "32px",
                          height: "32px",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
                          fontSize: "12px",
                          fontWeight: "800"
                        }}
                        title="Remove Image"
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    <label style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      border: "2px dashed var(--border-color)",
                      borderRadius: "8px",
                      padding: "30px",
                      cursor: "pointer",
                      background: "#f8fafc",
                      textAlign: "center",
                      transition: "all 0.2s ease"
                    }} className="blog-upload-dropzone">
                      <UploadCloud size={32} style={{ color: "var(--text-muted)", marginBottom: "8px" }} />
                      <span style={{ fontSize: "14px", fontWeight: "700", color: "var(--text-dark)" }}>Click to upload cover image</span>
                      <span style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "2px" }}>PNG, JPG, JPEG, WEBP or SVG up to 5 MB</span>
                      <input
                        type="file"
                        onChange={handleBlogImageUpload}
                        accept=".png,.jpg,.jpeg,.webp,.svg"
                        style={{ display: "none" }}
                      />
                    </label>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="blog-content" style={{ fontWeight: 700, color: "var(--text-dark)", fontSize: "13.5px" }}>Blog Content <span style={{ color: "var(--danger)" }}>*</span></label>
                  <textarea
                    id="blog-content"
                    className="form-input"
                    placeholder="Write detailed article here..."
                    rows={8}
                    value={blogForm.content}
                    onChange={(e) => setBlogForm({ ...blogForm, content: e.target.value })}
                    style={{ resize: "vertical", minHeight: "150px", fontFamily: "inherit" }}
                    required
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setBlogModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={isSavingBlog}>
                  {isSavingBlog ? "Saving Post..." : (editingBlogId ? "Save Changes" : "Publish Post")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
