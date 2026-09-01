"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Building, Users, FileText, CheckCircle2, XCircle, LogOut,
  Home, Edit3, Eye, LayoutDashboard, Mail, Phone, MapPin,
  IndianRupee, PlusCircle, Globe, Award, Sparkles, CheckSquare
} from "lucide-react";
import { clearBrandsCache } from "@/lib/brandsCache";
import { BRAND_CATEGORIES, BRAND_SECTORS_MAP, ALL_INDIAN_STATES } from "@/lib/brandConstants";
import { DISTRICTS_BY_STATE } from "@/lib/districtsData";
import { getFilteredMaxLimits } from "@/lib/investmentData";

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

const mapRangeToNumeric = (rangeStr, isMax = false) => {
  if (!rangeStr) return 0;
  if (rangeStr === "Rs. 10,000 - 50,000") return isMax ? 50000 : 10000;
  if (rangeStr === "Rs. 50,000 - 2 Lakh") return isMax ? 200000 : 50000;
  if (rangeStr === "Rs. 2 Lakh - 5 Lakh") return isMax ? 500000 : 200000;
  if (rangeStr === "Rs. 5 Lakh - 10 Lakh") return isMax ? 1000000 : 500000;
  if (rangeStr === "Rs. 10 Lakh - 20 Lakh") return isMax ? 2000000 : 1000000;
  if (rangeStr === "Rs. 20 Lakh - 30 Lakh") return isMax ? 3000000 : 2000000;
  if (rangeStr === "Rs. 30 Lakh - 50 Lakh") return isMax ? 5000000 : 3000000;
  if (rangeStr === "Rs. 50 Lakh - 1 Crore") return isMax ? 10000000 : 5000000;
  if (rangeStr === "Rs. 1 Crore - 2 Crore") return isMax ? 20000000 : 10000000;
  if (rangeStr === "Rs. 2 Crore - 5 Crore") return isMax ? 50000000 : 20000000;
  if (rangeStr === "Above Rs. 5 Crore") return isMax ? 999999999 : 50000000;
  return 0;
};

const isNew = (dateString) => {
  if (!dateString) return false;
  const createdDate = new Date(dateString);
  const diffTime = Math.abs(new Date() - createdDate);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays <= 3; // within last 3 days
};

export default function BrandPanel() {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);
  const [brand, setBrand] = useState(null);
  const [leads, setLeads] = useState([]);
  const [activeTab, setActiveTab] = useState("dashboard"); // dashboard, edit-brand, leads
  const [loading, setLoading] = useState(true);

  // Form Edit State
  const [formFields, setFormFields] = useState({
    name: "",
    company: "",
    category: "Food and Beverage",
    sector: "QSR & Fast Food",
    hq: "Delhi NCR",
    location: "New Delhi",
    pincode: "",
    investment_range: "",
    max_investment_limit: "",
    minInvestment: "",
    maxInvestment: "",
    franchiseFee: "",
    royaltyFee: "",
    areaRequired: "",
    trainingSupport: "Yes",
    agreement: "Yes",
    description: "",
    email: "",
    phone: "",
    website: "",
    image: "",
  });

  const [updateLoading, setUpdateLoading] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState("");
  const [updateError, setUpdateError] = useState("");

  useEffect(() => {
    const isLoggedIn = localStorage.getItem("brandLoggedIn");
    const email = localStorage.getItem("brandEmail");

    if (isLoggedIn !== "true" || !email) {
      router.push("/login");
    } else {
      setAuthorized(true);
      loadBrandData(email);
    }
  }, [router]);

  const loadBrandData = async (email) => {
    setLoading(true);
    try {
      const [brandsRes, investorsRes] = await Promise.all([
        fetch("/api/brands"),
        fetch("/api/investors")
      ]);

      if (brandsRes.ok && investorsRes.ok) {
        const brandsList = await brandsRes.json();
        const investorsList = await investorsRes.json();

        // Find brand matching owner's email safely
        const ownerEmailClean = (email || "").toLowerCase().trim();
        const userBrand = brandsList.find((b) => {
          const brandEmail = (b.email || (b.user && b.user.email) || "").toLowerCase().trim();
          return brandEmail && brandEmail === ownerEmailClean;
        });
        setBrand(userBrand);

        if (userBrand) {
          // Prefill form
          setFormFields({
            name: userBrand.name || "",
            company: userBrand.company || "",
            category: userBrand.category || "Food and Beverage",
            sector: userBrand.sector || (BRAND_SECTORS_MAP[userBrand.category] ? BRAND_SECTORS_MAP[userBrand.category][0] : ""),
            hq: userBrand.hq || "Delhi NCR",
            location: userBrand.location || "",
            pincode: userBrand.pincode || "",
            investment_range: userBrand.investment_range || "",
            max_investment_limit: userBrand.max_investment_limit || "",
            minInvestment: userBrand.minInvestment || "",
            maxInvestment: userBrand.maxInvestment || "",
            franchiseFee: userBrand.franchiseFee || "",
            royaltyFee: userBrand.royaltyFee || "",
            areaRequired: userBrand.areaRequired || "",
            trainingSupport: userBrand.trainingSupport || "Yes",
            agreement: userBrand.agreement || "Yes",
            description: userBrand.description || "",
            email: userBrand.email || "",
            phone: userBrand.phone || "",
            website: userBrand.website || "",
            image: userBrand.image || "",
          });

          // Fetch leads (investor submissions referencing this brand name in the comments)
          const brandNameLower = (userBrand.name || "").toLowerCase();
          const companyLower = (userBrand.company || "").toLowerCase();
          const matchedLeads = investorsList.filter((inv) => {
            const comments = (inv.comments || "").toLowerCase();
            return (
              (brandNameLower && comments.includes(`brand: ${brandNameLower}`)) ||
              (companyLower && comments.includes(`brand: ${companyLower}`))
            );
          });
          setLeads(matchedLeads);
        }
      }
    } catch (err) {
      console.error("Failed to load brand data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("brandLoggedIn");
    localStorage.removeItem("brandEmail");
    localStorage.removeItem("brandId");
    localStorage.removeItem("brandName");
    router.push("/login");
  };

  // Submit Listing Update (which triggers Pending Status for Admin Approval!)
  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    setUpdateLoading(true);
    setUpdateSuccess("");
    setUpdateError("");

    try {
      const email = localStorage.getItem("brandEmail");

      if (
        !formFields.name ||
        !formFields.company ||
        !formFields.pincode ||
        !formFields.investment_range ||
        !formFields.max_investment_limit
      ) {
        setUpdateSuccess("");
        setUpdateError("Please fill in all mandatory fields.");
        setUpdateLoading(false);
        return;
      }

      if (formFields.pincode.length !== 6 || !/^\d{6}$/.test(formFields.pincode)) {
        setUpdateSuccess("");
        setUpdateError("Pincode must be exactly 6 digits.");
        setUpdateLoading(false);
        return;
      }

      const rangeIndex = INVESTMENT_OPTIONS.indexOf(formFields.investment_range);
      const maxIndex = INVESTMENT_OPTIONS.indexOf(formFields.max_investment_limit);
      if (maxIndex < rangeIndex) {
        setUpdateSuccess("");
        setUpdateError("Max Investment Limit cannot be lower than the selected Investment Range.");
        setUpdateLoading(false);
        return;
      }

      const rangeMinVal = mapRangeToNumeric(formFields.investment_range, false);
      const rangeMaxVal = mapRangeToNumeric(formFields.max_investment_limit, true);

      const payload = {
        ...formFields,
        minInvestment: rangeMinVal,
        maxInvestment: rangeMaxVal,
        franchiseFee: Number(formFields.franchiseFee) || 50000,
        status: "Pending", // Trigger Pending status for admin approval!
      };

      let res;
      if (brand) {
        // Update existing listing safely
        const brandId = brand.id || brand._id;
        res = await fetch(`/api/brands/${brandId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        // Add new listing on behalf of owner
        res = await fetch("/api/brands", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      if (res.ok) {
        setUpdateError("");
        setUpdateSuccess("Brand listing updated successfully! Your updates are now Under Review by our admin team.");
        clearBrandsCache();
        try {
          await loadBrandData(email);
        } catch (e) {
          console.error("Failed to reload brand data after update:", e);
        }
      } else {
        let errorMsg = "Failed to update listing.";
        try {
          const data = await res.json();
          errorMsg = data.error || errorMsg;
        } catch (e) {
          // If response body is not JSON
        }
        setUpdateSuccess("");
        setUpdateError(errorMsg);
      }
    } catch (err) {
      console.error("Update listing exception:", err);
      setUpdateSuccess("");
      setUpdateError("Server error while updating listing.");
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleImageFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      alert("Please select a valid image file (PNG, JPG, WEBP).");
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;
        const maxDim = 1200;
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
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);
        const base64 = canvas.toDataURL("image/jpeg", 0.85);
        setFormFields((prev) => ({ ...prev, image: base64 }));
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

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
        <p style={{ color: "var(--text-muted)", fontWeight: "500" }}>Loading Account Panel...</p>
      </div>
    );
  }

  return (
    <div className="admin-layout">
      {/* Sidebar Navigation */}
      <aside className="admin-sidebar" style={{ background: "linear-gradient(180deg, #1e3a8a 0%, #0f172a 100%)", padding: "0 0 40px 0" }}>
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
            <Link href="/brand-panel" style={{ display: "block" }}>
              <img
                src="/logo-footer.png"
                alt="Franchise Roots Brand Portal"
                className="sidebar-logo-img"
              />
            </Link>
          </div>

          <div style={{ padding: "0 28px" }}>
            <ul className="admin-nav" style={{ marginTop: 0 }}>
              <li className="admin-nav-item">
                <div
                  className={`admin-nav-link ${activeTab === "dashboard" ? "active" : ""}`}
                  onClick={() => setActiveTab("dashboard")}
                >
                  <LayoutDashboard size={18} />
                  Overview Dashboard
                </div>
              </li>
              <li className="admin-nav-item">
                <div
                  className={`admin-nav-link ${activeTab === "edit-brand" ? "active" : ""}`}
                  onClick={() => setActiveTab("edit-brand")}
                >
                  <PlusCircle size={18} />
                  {brand ? "Edit Brand Listing" : "Add Brand Listing"}
                </div>
              </li>
              <li className="admin-nav-item">
                <div
                  className={`admin-nav-link ${activeTab === "leads" ? "active" : ""}`}
                  onClick={() => setActiveTab("leads")}
                >
                  <Users size={18} />
                  Investor Leads ({leads.length})
                </div>
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
              {activeTab === "dashboard" && "Brand Overview Dashboard"}
              {activeTab === "edit-brand" && (brand ? "Edit Directory Listing" : "Add Brand Directory Listing")}
              {activeTab === "leads" && "Franchise Leads Directory"}
            </h1>
            <p style={{ color: "var(--text-muted)", fontSize: "14px", marginTop: "4px" }}>
              Manage your brand specifications. Admin approval is required for directory publication.
            </p>
          </div>

          <Link href="/" className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Home size={16} /> Search Portal
          </Link>
        </header>

        {loading ? (
          <div className="flex-center" style={{ minHeight: "300px" }}>
            <div className="spinner"></div>
          </div>
        ) : (
          <>
            {/* Overview Dashboard Tab */}
            {activeTab === "dashboard" && (
              <div style={{ display: "grid", gridTemplateColumns: "1.3fr 1fr", gap: "24px" }}>

                {/* Left: Brand specs overview */}
                <div className="table-container" style={{ padding: "24px" }}>
                  {brand ? (
                    <>
                      <div style={{ display: "flex", gap: "20px", marginBottom: "24px", alignItems: "center" }}>
                        <img
                          src={brand.image || "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&q=80&w=400"}
                          alt={brand.name}
                          style={{ width: "80px", height: "80px", borderRadius: "10px", objectFit: "cover" }}
                        />
                        <div>
                          <h3 style={{ fontSize: "20px" }}>{brand.name}</h3>
                          <p style={{ color: "var(--text-muted)", fontSize: "14px" }}>{brand.company}</p>
                          <div style={{ display: "flex", gap: "8px", marginTop: "6px" }}>
                            <span className={`status-badge ${brand.status.toLowerCase()}`}>
                              Status: {brand.status}
                            </span>
                            {brand.featured && (
                              <span className="status-badge approved" style={{ background: "rgba(245, 158, 11, 0.08)", color: "var(--warning)" }}>
                                <Sparkles size={10} style={{ marginRight: "4px", display: "inline" }} /> Featured
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div style={{ background: "#f8fafc", padding: "16px", borderRadius: "8px", marginBottom: "20px" }}>
                        <h4 style={{ fontSize: "14px", marginBottom: "8px" }}>Directory Configuration</h4>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", fontSize: "13px" }}>
                          <div>Category: <strong>{brand.category}</strong> {brand.sector && `(${brand.sector})`}</div>
                          <div>Investment: <strong>{brand.investment_range || formatLakhs(brand.minInvestment)} - {brand.max_investment_limit || formatLakhs(brand.maxInvestment)}</strong></div>
                          <div>Franchise Fee: <strong>{formatLakhs(brand.franchiseFee)}</strong></div>
                          <div>Royalty Fee: <strong>{brand.royaltyFee || "0%"}</strong></div>
                          <div>Space Required: <strong>{brand.areaRequired || "N/A"}</strong></div>
                          <div>HQ Location: <strong>{brand.location ? `${brand.location}, ${brand.hq}` : brand.hq} {brand.pincode && `(${brand.pincode})`}</strong></div>
                        </div>
                      </div>

                      <p style={{ fontSize: "13px", color: "var(--text-muted)" }}>
                        <strong>Description:</strong> {brand.description}
                      </p>
                    </>
                  ) : (
                    <div className="flex-center" style={{ padding: "40px", flexDirection: "column", textAlign: "center" }}>
                      <Building size={48} color="var(--text-muted)" style={{ marginBottom: "16px" }} />
                      <h3>No Listing Registered</h3>
                      <p style={{ color: "var(--text-muted)", marginBottom: "20px", maxWidth: "400px" }}>
                        You haven't listed your brand directory details yet. Add your brand listing details to get published.
                      </p>
                      <button className="btn btn-primary" onClick={() => setActiveTab("edit-brand")}>
                        <PlusCircle size={16} /> Add Listing Now
                      </button>
                    </div>
                  )}
                </div>

                {/* Right: Metrics & actions */}
                <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                  <div className="table-container" style={{ padding: "20px", textAlign: "center" }}>
                    <Users size={32} color="var(--primary)" style={{ marginBottom: "8px" }} />
                    <h3 style={{ fontSize: "28px" }}>{leads.length}</h3>
                    <p style={{ fontSize: "12px", color: "var(--text-muted)" }}>Total Leads Received</p>
                    <button className="btn btn-outline" style={{ marginTop: "16px", width: "100%", fontSize: "12px" }} onClick={() => setActiveTab("leads")}>
                      View Leads Grid
                    </button>
                  </div>

                  <div className="table-container" style={{ padding: "20px" }}>
                    <h4 style={{ fontSize: "14px", marginBottom: "8px" }}>Listing Status Support</h4>
                    {brand && brand.status === "Pending" ? (
                      <div style={{ background: "rgba(245, 158, 11, 0.08)", border: "1px solid rgba(245, 158, 11, 0.2)", padding: "12px", borderRadius: "8px", fontSize: "12px", color: "#b45309" }}>
                        <p style={{ fontWeight: "700" }}>Review Pending</p>
                        <p style={{ marginTop: "4px" }}>An administrator needs to approve your brand. Log in to the Admin Panel (admin / admin123) to approve your listing.</p>
                      </div>
                    ) : brand && brand.status === "Approved" ? (
                      <div style={{ background: "rgba(16, 185, 129, 0.08)", border: "1px solid rgba(16, 185, 129, 0.2)", padding: "12px", borderRadius: "8px", fontSize: "12px", color: "var(--success)" }}>
                        <p style={{ fontWeight: "700" }}>Active & Published</p>
                        <p style={{ marginTop: "4px" }}>Your brand is visible on the search homepage directory. Any changes made to your specs will trigger a re-review.</p>
                      </div>
                    ) : (
                      <p style={{ fontSize: "13px", color: "var(--text-muted)" }}>List details to see status audits.</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Manage/Edit Brand Tab */}
            {activeTab === "edit-brand" && (
              <div className="table-container" style={{ padding: "24px" }}>
                <h3 style={{ fontSize: "18px", marginBottom: "6px" }}>
                  {brand ? "Modify Specifications" : "Register Brand Listing Parameters"}
                </h3>
                <p style={{ color: "var(--text-muted)", fontSize: "13px", marginBottom: "24px" }}>
                  Updating details changes status to **Pending Approval**. The listing is hidden from the directory until approved by an Admin.
                </p>

                {updateSuccess && <div className="alert alert-info" style={{ background: "rgba(16, 185, 129, 0.08)", color: "var(--success)", borderColor: "rgba(16, 185, 129, 0.2)" }}>{updateSuccess}</div>}
                {updateError && <div className="alert alert-danger">{updateError}</div>}

                <form onSubmit={handleUpdateSubmit}>
                  <div className="form-grid">
                    <div className="form-group">
                      <label>Brand Name</label>
                      <input
                        type="text"
                        required
                        className="form-input"
                        placeholder="e.g. EduQuantum"
                        value={formFields.name}
                        onChange={(e) => setFormFields({ ...formFields, name: e.target.value })}
                        style={{ background: "#f8fafc" }}
                      />
                    </div>
                    <div className="form-group">
                      <label>Parent Company Name</label>
                      <input
                        type="text"
                        required
                        className="form-input"
                        placeholder="e.g. EduQuantum learning systems"
                        value={formFields.company}
                        onChange={(e) => setFormFields({ ...formFields, company: e.target.value })}
                        style={{ background: "#f8fafc" }}
                      />
                    </div>

                    <div className="form-group">
                      <label>Category</label>
                      <select
                        className="form-input"
                        value={formFields.category}
                        onChange={(e) => {
                          const newCat = e.target.value;
                          const sectors = BRAND_SECTORS_MAP[newCat] || [];
                          setFormFields({
                            ...formFields,
                            category: newCat,
                            sector: sectors[0] || ""
                          });
                        }}
                        style={{ background: "#f8fafc" }}
                      >
                        {BRAND_CATEGORIES.map((cat) => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>

                    <div className="form-group">
                      <label>Brand Sector / Sub-Category</label>
                      <select
                        className="form-input"
                        value={formFields.sector}
                        onChange={(e) => setFormFields({ ...formFields, sector: e.target.value })}
                        style={{ background: "#f8fafc" }}
                      >
                        {(BRAND_SECTORS_MAP[formFields.category] || ["General"]).map((sec) => (
                          <option key={sec} value={sec}>{sec}</option>
                        ))}
                      </select>
                    </div>

                    <div className="form-group">
                      <label>Headquarters State / Region</label>
                      <select
                        className="form-input"
                        value={formFields.hq}
                        onChange={(e) => {
                          const newSt = e.target.value;
                          const districts = DISTRICTS_BY_STATE[newSt] || [];
                          setFormFields({
                            ...formFields,
                            hq: newSt,
                            location: districts[0] || ""
                          });
                        }}
                        style={{ background: "#f8fafc" }}
                      >
                        {ALL_INDIAN_STATES.map((st) => (
                          <option key={st} value={st}>{st}</option>
                        ))}
                      </select>
                    </div>

                    <div className="form-group">
                      <label>HQ City / District Location</label>
                      {DISTRICTS_BY_STATE[formFields.hq] ? (
                        <select
                          className="form-input"
                          value={formFields.location}
                          onChange={(e) => setFormFields({ ...formFields, location: e.target.value })}
                          style={{ background: "#f8fafc" }}
                        >
                          {DISTRICTS_BY_STATE[formFields.hq].map((dist) => (
                            <option key={dist} value={dist}>{dist}</option>
                          ))}
                        </select>
                      ) : (
                        <input
                          type="text"
                          className="form-input"
                          placeholder="Enter City / District"
                          value={formFields.location}
                          onChange={(e) => setFormFields({ ...formFields, location: e.target.value })}
                          style={{ background: "#f8fafc" }}
                        />
                      )}
                    </div>

                    <div className="form-group">
                      <label>Pincode <span>*</span></label>
                      <input
                        type="text"
                        required
                        className="form-input"
                        placeholder="Enter Pincode"
                        value={formFields.pincode}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (val === "" || (/^\d+$/.test(val) && val.length <= 6)) {
                            setFormFields({ ...formFields, pincode: val });
                          }
                        }}
                        style={{ background: "#f8fafc" }}
                      />
                    </div>

                    <div className="form-group">
                      <label>Investment Range <span>*</span></label>
                      <select
                        className="form-input"
                        required
                        value={formFields.investment_range}
                        onChange={(e) => setFormFields({ ...formFields, investment_range: e.target.value })}
                        style={{ background: "#f8fafc" }}
                      >
                        <option value="" disabled>Select Investment Range</option>
                        {INVESTMENT_OPTIONS.map((opt) => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    </div>

                    <div className="form-group">
                      <label>
                        Max Investment Limit <span>*</span>
                        {formFields.investment_range && (
                          <span style={{ fontSize: "11px", color: "var(--success)", fontWeight: "700", marginLeft: "6px" }}>
                            (≥ {formFields.investment_range})
                          </span>
                        )}
                      </label>
                      <select
                        className="form-input"
                        required
                        value={formFields.max_investment_limit}
                        onChange={(e) => setFormFields({ ...formFields, max_investment_limit: e.target.value })}
                        style={{ background: "#f8fafc" }}
                      >
                        <option value="" disabled>Select Max Investment Limit</option>
                        {getFilteredMaxLimits(formFields.investment_range).map((opt) => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    </div>

                    <div className="form-group">
                      <label>One-Time Franchise Fee (INR)</label>
                      <input
                        type="number"
                        className="form-input"
                        placeholder="e.g. 100000"
                        value={formFields.franchiseFee}
                        onChange={(e) => setFormFields({ ...formFields, franchiseFee: e.target.value })}
                        style={{ background: "#f8fafc" }}
                      />
                    </div>

                    <div className="form-group">
                      <label>Royalty / Commission</label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="e.g. 10% or 0%"
                        value={formFields.royaltyFee}
                        onChange={(e) => setFormFields({ ...formFields, royaltyFee: e.target.value })}
                        style={{ background: "#f8fafc" }}
                      />
                    </div>

                    <div className="form-group">
                      <label>Space Requirement (Sq. Ft.)</label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="e.g. 300 - 500 Sq. Ft."
                        value={formFields.areaRequired}
                        onChange={(e) => setFormFields({ ...formFields, areaRequired: e.target.value })}
                        style={{ background: "#f8fafc" }}
                      />
                    </div>

                    <div className="form-group form-grid-full" style={{ background: "#f8fafc", padding: "16px", borderRadius: "12px", border: "1px solid var(--border-color)" }}>
                      <label style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px", fontWeight: "700" }}>
                        <span>Brand Cover / Logo Image</span>
                        <span style={{ fontSize: "12px", color: "var(--primary)", fontWeight: "600" }}>Upload File or Paste Image URL</span>
                      </label>

                      <div style={{ display: "flex", gap: "14px", alignItems: "center", flexWrap: "wrap", marginBottom: "10px" }}>
                        {formFields.image ? (
                          <img
                            src={formFields.image}
                            alt="Cover Preview"
                            style={{ width: "70px", height: "70px", borderRadius: "10px", objectFit: "cover", border: "2px solid var(--primary)" }}
                          />
                        ) : (
                          <div style={{ width: "70px", height: "70px", borderRadius: "10px", background: "#e2e8f0", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", color: "#64748b", textAlign: "center" }}>
                            No Image
                          </div>
                        )}
                        <div>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageFileSelect}
                            style={{ fontSize: "13px" }}
                          />
                          <p style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "4px" }}>Max recommended size: 1200x1200px (JPG, PNG, WEBP)</p>
                        </div>
                      </div>

                      <input
                        type="text"
                        className="form-input"
                        placeholder="Or paste image URL (https://... or data:image/...)"
                        value={formFields.image}
                        onChange={(e) => setFormFields({ ...formFields, image: e.target.value })}
                        style={{ background: "#ffffff" }}
                      />
                    </div>

                    <div className="form-group form-grid-full">
                      <label>Business Description Summary</label>
                      <textarea
                        required
                        className="form-input"
                        rows="3"
                        placeholder="Describe your menus, margins, and support structure..."
                        value={formFields.description}
                        onChange={(e) => setFormFields({ ...formFields, description: e.target.value })}
                        style={{ background: "#f8fafc" }}
                      ></textarea>
                    </div>

                    <div className="form-group">
                      <label>Mobile Contact</label>
                      <input
                        type="tel"
                        required
                        className="form-input"
                        placeholder="Phone number"
                        value={formFields.phone}
                        onChange={(e) => setFormFields({ ...formFields, phone: e.target.value })}
                        style={{ background: "#f8fafc" }}
                      />
                    </div>

                    <div className="form-group">
                      <label>Brand Official Website</label>
                      <input
                        type="url"
                        className="form-input"
                        placeholder="https://brand.com"
                        value={formFields.website}
                        onChange={(e) => setFormFields({ ...formFields, website: e.target.value })}
                        style={{ background: "#f8fafc" }}
                      />
                    </div>
                  </div>

                  <button type="submit" className="btn btn-primary" style={{ width: "100%", padding: "14px", marginTop: "24px" }} disabled={updateLoading}>
                    {updateLoading ? "Saving Listing..." : brand ? "Update Listing (Triggers Admin Approval)" : "Add Listing & Submit for Approval"}
                  </button>
                </form>
              </div>
            )}

            {/* Leads Tab */}
            {activeTab === "leads" && (
              <div className="table-container">
                <div className="table-header">
                  <h3 style={{ fontSize: "18px" }}>Enquiry Lead Inboxes</h3>
                  <p style={{ color: "var(--text-muted)", fontSize: "13px" }}>These investors submitted enquiries specifically for your brand.</p>
                </div>

                {leads.length === 0 ? (
                  <div className="flex-center" style={{ padding: "40px", flexDirection: "column", color: "var(--text-muted)", textAlign: "center" }}>
                    <Users size={32} style={{ marginBottom: "12px" }} />
                    <p style={{ fontWeight: "500" }}>No leads received yet.</p>
                    <p style={{ fontSize: "12px", marginTop: "4px" }}>Enquiries from the homepage modal directory will populate here instantly.</p>
                  </div>
                ) : (
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Investor Name</th>
                        <th>Contact Email</th>
                        <th>Phone Number</th>
                        <th>Property Available</th>
                        <th>Preferred Location</th>
                        <th>Date Received</th>
                        <th>Message Details</th>
                      </tr>
                    </thead>
                    <tbody>
                      {leads.map((l) => (
                        <tr key={l.id}>
                          <td style={{ fontWeight: "700" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                              <span>{l.name}</span>
                              {isNew(l.createdAt) && (
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
                          <td>{l.email}</td>
                          <td>{l.phone}</td>
                          <td>{l.propertyAvailable} {l.propertyArea && `(${l.propertyArea})`}</td>
                          <td>{l.preferredLocation}</td>
                          <td style={{ fontSize: "13px", color: "var(--text-muted)" }}>
                            {l.createdAt ? new Date(l.createdAt).toLocaleDateString("en-IN", { day: 'numeric', month: 'short', year: 'numeric' }) : "N/A"}
                          </td>
                          <td style={{ fontSize: "12px", color: "var(--text-muted)", maxWidth: "250px" }}>{l.comments}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
