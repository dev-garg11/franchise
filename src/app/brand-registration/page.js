"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { 
  CheckCircle2, ChevronRight, Phone, Globe, ShieldCheck, Mail, Lock,
  UploadCloud, FileImage, ShieldAlert, CheckCircle, RefreshCw, Scissors, 
  RotateCw, ZoomIn, Trash2, Download, AlertCircle, Info, Sparkles, Building
} from "lucide-react";
import { clearBrandsCache } from "@/lib/brandsCache";
import { REGISTRATION_INVESTMENT_OPTIONS, getFilteredMaxLimits } from "@/lib/investmentData";
import { BRAND_CATEGORIES, BRAND_SECTORS_MAP, ALL_INDIAN_STATES } from "@/lib/brandConstants";
import { DISTRICTS_BY_STATE } from "@/lib/districtsData";

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

export default function BrandRegistration() {
  const [formData, setFormData] = useState({
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
    password: "",
    phone: "",
    website: "",
    image: "",
  });

  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Upload & preview states
  const [rawFile, setRawFile] = useState(null);
  const [imageMeta, setImageMeta] = useState({
    name: "",
    size: "",
    type: "",
    resolution: "",
    width: 0,
    height: 0,
    url: ""
  });
  const [uploadStatus, setUploadStatus] = useState("idle"); // idle, uploading, success, error
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  const [imageError, setImageError] = useState("");
  const [rotation, setRotation] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [cropGridActive, setCropGridActive] = useState(false);

  const fileInputRef = useRef(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "investment_range") {
      const validMaxOptions = getFilteredMaxLimits(value);
      setFormData((prev) => {
        let maxVal = prev.max_investment_limit;
        if (maxVal && !validMaxOptions.includes(maxVal)) {
          maxVal = value;
        }
        return {
          ...prev,
          investment_range: value,
          max_investment_limit: maxVal,
        };
      });
    } else if (name === "category") {
      const availableSectors = BRAND_SECTORS_MAP[value] || [];
      setFormData((prev) => ({
        ...prev,
        category: value,
        sector: availableSectors[0] || "",
      }));
    } else if (name === "hq") {
      const availableDistricts = DISTRICTS_BY_STATE[value] || [];
      setFormData((prev) => ({
        ...prev,
        hq: value,
        location: availableDistricts[0] || "",
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const processImage = (file, rotationAngle = 0, zoomScale = 1) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        
        // Target canvas dimension (optimizing size)
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
        
        // Handle rotation sizes
        if (rotationAngle === 90 || rotationAngle === 270) {
          canvas.width = height;
          canvas.height = width;
        } else {
          canvas.width = width;
          canvas.height = height;
        }
        
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate((rotationAngle * Math.PI) / 180);
        ctx.scale(zoomScale, zoomScale);
        ctx.drawImage(img, -width / 2, -height / 2, width, height);
        
        // Convert to dataURL
        const base64 = canvas.toDataURL("image/jpeg", 0.85);
        
        setFormData(prev => ({
          ...prev,
          image: base64
        }));
        
        setImageMeta(prev => ({
          ...prev,
          width: canvas.width,
          height: canvas.height,
          resolution: `${canvas.width} × ${canvas.height} px`,
          url: base64
        }));
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFile = (file) => {
    setImageError("");
    setUploadStatus("idle");
    setUploadProgress(0);

    const allowedTypes = ["image/png", "image/jpeg", "image/jpg", "image/webp", "image/svg+xml"];
    if (!allowedTypes.includes(file.type)) {
      setUploadStatus("error");
      setImageError("Unsupported format. Please upload PNG, JPG, JPEG, WEBP, or SVG.");
      return;
    }

    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      setUploadStatus("error");
      setImageError("File is too large. Maximum size allowed is 5 MB.");
      return;
    }

    setRawFile(file);
    const sizeStr = (file.size / (1024 * 1024)).toFixed(2) + " MB";
    setImageMeta({
      name: file.name,
      size: sizeStr,
      type: file.type.split("/")[1].toUpperCase(),
      resolution: "Calculating...",
      width: 0,
      height: 0,
      url: ""
    });

    setUploadStatus("uploading");
    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;
      setUploadProgress(progress);
      if (progress >= 100) {
        clearInterval(interval);
        setUploadStatus("success");
        processImage(file, 0, 1);
      }
    }, 60);
  };

  const removeImage = () => {
    setRawFile(null);
    setUploadStatus("idle");
    setUploadProgress(0);
    setRotation(0);
    setZoom(1);
    setCropGridActive(false);
    setImageMeta({
      name: "",
      size: "",
      type: "",
      resolution: "",
      width: 0,
      height: 0,
      url: ""
    });
    setFormData(prev => ({
      ...prev,
      image: ""
    }));
  };

  const triggerFileSelect = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleZoomChange = (e) => {
    const val = parseFloat(e.target.value);
    setZoom(val);
    if (rawFile) {
      processImage(rawFile, rotation, val);
    }
  };

  const handleRotationClick = () => {
    const nextRotation = (rotation + 90) % 360;
    setRotation(nextRotation);
    if (rawFile) {
      processImage(rawFile, nextRotation, zoom);
    }
  };

  const downloadPreview = () => {
    if (!formData.image) return;
    const link = document.createElement("a");
    link.href = formData.image;
    link.download = `preview-${imageMeta.name || "brand-logo.jpg"}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Validation
    if (
      !formData.name ||
      !formData.company ||
      !formData.email ||
      !formData.password ||
      !formData.phone ||
      !formData.pincode ||
      !formData.investment_range ||
      !formData.max_investment_limit
    ) {
      setError("Please fill in all mandatory fields marked with an asterisk (*).");
      setLoading(false);
      return;
    }

    if (formData.pincode.length !== 6 || !/^\d{6}$/.test(formData.pincode)) {
      setError("Pincode must be exactly 6 digits.");
      setLoading(false);
      return;
    }

    const rangeIndex = INVESTMENT_OPTIONS.indexOf(formData.investment_range);
    const maxIndex = INVESTMENT_OPTIONS.indexOf(formData.max_investment_limit);
    if (maxIndex < rangeIndex) {
      setError("Max Investment Limit cannot be lower than the selected Investment Range.");
      setLoading(false);
      return;
    }

    try {
      const rangeMinVal = mapRangeToNumeric(formData.investment_range, false);
      const rangeMaxVal = mapRangeToNumeric(formData.max_investment_limit, true);

      const payload = {
        ...formData,
        minInvestment: rangeMinVal,
        maxInvestment: rangeMaxVal,
        franchiseFee: Number(formData.franchiseFee) || 50000,
        status: "Pending", // Admin will approve it from dashboard!
      };

      const res = await fetch("/api/brands", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        clearBrandsCache();
        setSubmitted(true);
      } else {
        const data = await res.json();
        setError(data.error || "Something went wrong. Please try again.");
      }
    } catch (err) {
      setError("Network error. Please verify server connection.");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="form-page flex-center" style={{ minHeight: "calc(100vh - 80px)" }}>
        <div className="container" style={{ maxWidth: "600px" }}>
          <div className="form-wrapper success-card">
            <div className="success-icon flex-center">
              <CheckCircle2 size={40} />
            </div>
            <h2>Brand Registration Submitted!</h2>
            <p>
              Your brand <strong>{formData.name}</strong> has been registered. Your listing is currently <strong>Pending Admin Review</strong>.
            </p>
            <div style={{ background: "#f8fafc", padding: "16px", borderRadius: "8px", marginBottom: "30px", fontSize: "14px", color: "var(--text-muted)", textAlign: "left" }}>
              <p style={{ fontWeight: "600", color: "var(--text-dark)", marginBottom: "4px" }}>What's Next?</p>
              <ul style={{ paddingLeft: "20px" }}>
                <li>An administrator will review and approve your brand from the admin dashboard.</li>
                <li>You can log in to your **Brand Owner Panel** using your email and password to track leads and update specifications.</li>
              </ul>
            </div>
            <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
              <Link href="/login" className="btn btn-primary">
                Proceed to Login
              </Link>
              <Link href="/" className="btn btn-outline">
                Back to Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="form-page">
      <div className="container">
        <div className="form-wrapper">
          <div className="form-header">
            <h2>Expand Your Brand Network</h2>
            <p>Fill out the business model specifications below. Registered concepts gain access to over 50,000+ active business investors.</p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginTop: '20px', fontSize: '13px', color: '#94a3b8' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Phone size={14} /> +91-9660025250</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Globe size={14} /> 100% Free Listing</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="form-body">
            {error && <div className="alert alert-danger">{error}</div>}

            <h3 className="form-section-title">1. Business Details</h3>
            <div className="form-grid">
              <div className="form-group">
                <label>Brand Name <span>*</span></label>
                <input
                  type="text"
                  name="name"
                  required
                  placeholder="e.g. Bombay Kulfi"
                  value={formData.name}
                  onChange={handleChange}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label>Parent Company Name <span>*</span></label>
                <input
                  type="text"
                  name="company"
                  required
                  placeholder="e.g. Bombay Kulfi Foods Pvt Ltd"
                  value={formData.company}
                  onChange={handleChange}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label>Brand Category <span>*</span></label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="form-input"
                >
                  {BRAND_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Brand Sector / Sub-Category <span>*</span></label>
                <select
                  name="sector"
                  value={formData.sector}
                  onChange={handleChange}
                  className="form-input"
                >
                  {(BRAND_SECTORS_MAP[formData.category] || ["General"]).map((sec) => (
                    <option key={sec} value={sec}>{sec}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Headquarters State / Region <span>*</span></label>
                <select
                  name="hq"
                  value={formData.hq}
                  onChange={handleChange}
                  className="form-input"
                >
                  {ALL_INDIAN_STATES.map((st) => (
                    <option key={st} value={st}>{st}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>HQ City / District Location <span>*</span></label>
                {DISTRICTS_BY_STATE[formData.hq] ? (
                  <select
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    className="form-input"
                  >
                    {DISTRICTS_BY_STATE[formData.hq].map((dist) => (
                      <option key={dist} value={dist}>{dist}</option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    name="location"
                    placeholder="Enter City / District"
                    value={formData.location}
                    onChange={handleChange}
                    className="form-input"
                  />
                )}
              </div>

              <div className="form-group">
                <label>Pincode <span>*</span></label>
                <input
                  type="text"
                  name="pincode"
                  required
                  placeholder="Enter Pincode"
                  value={formData.pincode}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === "" || (/^\d+$/.test(val) && val.length <= 6)) {
                      handleChange(e);
                    }
                  }}
                  className="form-input"
                />
              </div>

              <div className="form-group form-grid-full">
                <label style={{ fontSize: "14px", fontWeight: "700", marginBottom: "8px", display: "block" }}>Brand Logo / Cover Image (Optional)</label>
                
                <div className="upload-section-wrapper">
                  <div className="upload-grid-container">
                    
                    {/* SECTION 1 — IMAGE UPLOAD */}
                    <div className="upload-card-premium">
                      <div 
                        className={`drop-zone-premium ${dragActive ? "drag-active" : ""}`}
                        onDragEnter={handleDrag}
                        onDragOver={handleDrag}
                        onDragLeave={handleDrag}
                        onDrop={handleDrop}
                        onClick={triggerFileSelect}
                      >
                        <input 
                          type="file"
                          ref={fileInputRef}
                          onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
                          accept=".png,.jpg,.jpeg,.webp,.svg"
                          style={{ display: "none" }}
                        />
                        
                        <div className="upload-icon-container">
                          <UploadCloud size={24} />
                        </div>
                        
                        {uploadStatus === "uploading" ? (
                          <div style={{ width: "100%" }}>
                            <p style={{ fontSize: "13px", fontWeight: "700", color: "var(--text-dark)", marginBottom: "4px" }}>
                              Uploading image... {uploadProgress}%
                            </p>
                            <div className="upload-progress-container">
                              <div className="upload-progress-bar-fill" style={{ width: `${uploadProgress}%` }}></div>
                            </div>
                          </div>
                        ) : (
                          <>
                            <p style={{ fontSize: "13.5px", fontWeight: "700", color: "var(--text-dark)", margin: 0 }}>
                              {dragActive ? "Drop your file here" : "Drag & drop image here or click to browse"}
                            </p>
                            <span style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: "500" }}>
                              Supports PNG, JPG, JPEG, WEBP, SVG up to 5 MB
                            </span>
                          </>
                        )}
                      </div>

                      {/* Recommended details */}
                      <div style={{ display: "flex", justifyContent: "space-between", gap: "12px", borderTop: "1px solid #f1f5f9", paddingTop: "14px" }}>
                        <div style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: "600" }}>
                          <span style={{ color: "var(--text-dark)", fontWeight: "700", display: "block", marginBottom: "2px" }}>Recommended Logo</span>
                          500 × 500 px (1:1)
                        </div>
                        <div style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: "600", textAlign: "right" }}>
                          <span style={{ color: "var(--text-dark)", fontWeight: "700", display: "block", marginBottom: "2px" }}>Recommended Cover</span>
                          1200 × 628 px (1.91:1)
                        </div>
                      </div>

                      {/* Tips Card */}
                      <div className="tips-card-premium">
                        <span className="tips-title">💡 Image Quality Best Practices</span>
                        <div className="tips-grid">
                          <div className="tip-item">
                            <CheckCircle size={12} style={{ color: "var(--success)", flexShrink: 0 }} />
                            High quality image
                          </div>
                          <div className="tip-item">
                            <CheckCircle size={12} style={{ color: "var(--success)", flexShrink: 0 }} />
                            Transparent preferred
                          </div>
                          <div className="tip-item">
                            <CheckCircle size={12} style={{ color: "var(--success)", flexShrink: 0 }} />
                            Avoid blurry images
                          </div>
                          <div className="tip-item">
                            <CheckCircle size={12} style={{ color: "var(--success)", flexShrink: 0 }} />
                            Use brand colors
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* SECTION 2 — LIVE IMAGE PREVIEW */}
                    <div className="preview-card-premium">
                      <div>
                        <span className="tips-title" style={{ marginBottom: "12px" }}>🔴 Live Brand Preview</span>
                        
                        <div className="preview-area-container">
                          {formData.image ? (
                            <>
                              <img 
                                src={formData.image} 
                                alt="Preview" 
                                className="preview-img-tag"
                                style={{ transform: `scale(${zoom})` }}
                              />
                              {cropGridActive && <div className="crop-grid-overlay"></div>}
                            </>
                          ) : (
                            <div style={{ textAlign: "center", color: "var(--text-muted)", padding: "20px" }}>
                              <FileImage size={36} style={{ margin: "0 auto 8px", opacity: 0.4 }} />
                              <p style={{ fontSize: "12px", fontWeight: "600", margin: 0 }}>No image uploaded yet</p>
                              <span style={{ fontSize: "10.5px", opacity: 0.8 }}>Upload a logo to view real-time card previews</span>
                            </div>
                          )}
                        </div>

                        {/* Brand Card Simulation Preview */}
                        {formData.image && (
                          <div className="brand-card-simulation-wrapper" style={{
                            background: "rgba(255, 255, 255, 0.9)",
                            borderRadius: "14px",
                            border: "1px solid #e2e8f0",
                            padding: "10px",
                            display: "flex",
                            gap: "10px",
                            alignItems: "center",
                            position: "absolute",
                            bottom: "20px",
                            left: "50%",
                            transform: "translateX(-50%)",
                            width: "85%",
                            boxShadow: "var(--shadow-md)",
                            backdropFilter: "blur(10px)"
                          }}>
                            <div className="simulation-logo-thumb" style={{
                              width: "36px",
                              height: "36px",
                              borderRadius: "6px",
                              background: "#f1f5f9",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              overflow: "hidden",
                              flexShrink: 0
                            }}>
                              <img src={formData.image} style={{ width: "100%", height: "100%", objectFit: "cover" }} alt="Logo Thumb" />
                            </div>
                            <div style={{ display: "flex", flexDirection: "column", overflow: "hidden" }}>
                              <span style={{ fontSize: "12px", fontWeight: "800", color: "var(--text-dark)", textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}>
                                {formData.name || "Your Brand Name"}
                              </span>
                              <span style={{ fontSize: "10px", color: "var(--primary)", fontWeight: "700" }}>
                                {formData.category}
                              </span>
                            </div>
                            <div style={{ marginLeft: "auto", flexShrink: 0 }}>
                              <ShieldCheck size={16} style={{ color: "var(--success)" }} />
                            </div>
                          </div>
                        )}
                      </div>

                      {formData.image && (
                        <div style={{ borderTop: "1px solid #f1f5f9", paddingTop: "14px" }}>
                          {/* Zoom Slider */}
                          <div className="zoom-slider-container">
                            <ZoomIn size={12} />
                            <input 
                              type="range" 
                              min="1" 
                              max="2.5" 
                              step="0.1" 
                              value={zoom} 
                              onChange={handleZoomChange}
                              className="zoom-slider-input" 
                            />
                            <span>{(zoom * 100).toFixed(0)}%</span>
                          </div>

                          {/* Image Editor Actions */}
                          <div className="image-controls-toolbar">
                            <button type="button" className="control-btn-premium" onClick={handleRotationClick}>
                              <RotateCw size={12} />
                              Rotate
                            </button>
                            <button type="button" className={`control-btn-premium ${cropGridActive ? "active" : ""}`} onClick={() => setCropGridActive(!cropGridActive)}>
                              <Scissors size={12} />
                              {cropGridActive ? "Hide Grid" : "Crop Grid"}
                            </button>
                            <button type="button" className="control-btn-premium" onClick={downloadPreview}>
                              <Download size={12} />
                              Download
                            </button>
                            <button type="button" className="control-btn-premium remove" onClick={removeImage}>
                              <Trash2 size={12} />
                              Remove
                            </button>
                          </div>

                          {/* Metadata Details */}
                          <div className="metadata-list-premium">
                            <div className="metadata-row">
                              <span className="metadata-label">File name</span>
                              <span className="metadata-value" style={{ maxWidth: "120px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                {imageMeta.name}
                              </span>
                            </div>
                            <div className="metadata-row">
                              <span className="metadata-label">Dimensions</span>
                              <span className="metadata-value">{imageMeta.resolution}</span>
                            </div>
                            <div className="metadata-row">
                              <span className="metadata-label">File size</span>
                              <span className="metadata-value">{imageMeta.size}</span>
                            </div>
                            <div className="metadata-row">
                              <span className="metadata-label">Format</span>
                              <span className="metadata-value">{imageMeta.type}</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                  </div>

                  {uploadStatus === "error" && (
                    <div className="error-card-premium">
                      <AlertCircle size={18} style={{ marginTop: "2px", flexShrink: 0 }} />
                      <div>
                        <span className="error-title">Upload Error</span>
                        <p className="error-msg">{imageError}</p>
                      </div>
                    </div>
                  )}

                  {uploadStatus === "success" && (
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "12px" }}>
                      <span className="success-badge-premium">
                        <CheckCircle size={12} />
                        Image looks great! Ready to publish.
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <h3 className="form-section-title">2. Investment & Commercial Details</h3>
            <div className="form-grid">
              <div className="form-group">
                <label>Investment Range <span>*</span></label>
                <select
                  name="investment_range"
                  required
                  value={formData.investment_range}
                  onChange={handleChange}
                  className="form-input"
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
                  {formData.investment_range && (
                    <span style={{ fontSize: "11px", color: "var(--success)", fontWeight: "700", marginLeft: "6px" }}>
                      (≥ {formData.investment_range})
                    </span>
                  )}
                </label>
                <select
                  name="max_investment_limit"
                  required
                  value={formData.max_investment_limit}
                  onChange={handleChange}
                  className="form-input"
                >
                  <option value="" disabled>Select Max Investment Limit</option>
                  {getFilteredMaxLimits(formData.investment_range).map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>One-Time Franchise Fee (INR)</label>
                <input
                  type="number"
                  name="franchiseFee"
                  placeholder="e.g. 250000"
                  value={formData.franchiseFee}
                  onChange={handleChange}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label>Royalty / Commission Fee</label>
                <input
                  type="text"
                  name="royaltyFee"
                  placeholder="e.g. 8% of monthly sales or 0%"
                  value={formData.royaltyFee}
                  onChange={handleChange}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label>Property Area Required (Sq. Ft.)</label>
                <input
                  type="text"
                  name="areaRequired"
                  placeholder="e.g. 200 - 350 Sq. Ft."
                  value={formData.areaRequired}
                  onChange={handleChange}
                  className="form-input"
                />
              </div>
            </div>

            <h3 className="form-section-title">3. Support & Legal</h3>
            <div className="form-grid">
              <div className="form-group">
                <label>Do you provide Training Support?</label>
                <select
                  name="trainingSupport"
                  value={formData.trainingSupport}
                  onChange={handleChange}
                  className="form-input"
                >
                  <option value="Yes">Yes, comprehensive training provided</option>
                  <option value="No">No training support</option>
                </select>
              </div>

              <div className="form-group">
                <label>Do you have a standard Franchise Agreement?</label>
                <select
                  name="agreement"
                  value={formData.agreement}
                  onChange={handleChange}
                  className="form-input"
                >
                  <option value="Yes">Yes, standardized contract (3-5 Years)</option>
                  <option value="No">No, negotiable / custom contract</option>
                </select>
              </div>

              <div className="form-group form-grid-full">
                <label>Business Overview / Description <span>*</span></label>
                <textarea
                  name="description"
                  required
                  rows="4"
                  placeholder="Describe your franchise model, product, margins, and why an investor should choose your brand."
                  value={formData.description}
                  onChange={handleChange}
                  className="form-input"
                ></textarea>
              </div>
            </div>

            <h3 className="form-section-title">4. Owner Credentials & Contact Details</h3>
            <div className="form-grid">
              <div className="form-group">
                <label>Enquiry Email Address (Login Username) <span>*</span></label>
                <input
                  type="email"
                  name="email"
                  required
                  placeholder="franchise@yourbrand.com"
                  value={formData.email}
                  onChange={handleChange}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label>Account Password <span>*</span></label>
                <input
                  type="password"
                  name="password"
                  required
                  placeholder="Set password for brand dashboard"
                  value={formData.password}
                  onChange={handleChange}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label>Mobile Number <span>*</span></label>
                <input
                  type="tel"
                  name="phone"
                  required
                  placeholder="10 digit mobile"
                  value={formData.phone}
                  onChange={handleChange}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label>Official Brand Website URL</label>
                <input
                  type="url"
                  name="website"
                  placeholder="https://www.yourbrand.com"
                  value={formData.website}
                  onChange={handleChange}
                  className="form-input"
                />
              </div>
            </div>

            <div style={{ marginTop: "32px" }}>
              <div className="form-checkbox" style={{ marginBottom: "20px" }}>
                <input type="checkbox" required id="agree" />
                <label htmlFor="agree" style={{ fontSize: "13px", color: "var(--text-muted)" }}>
                  I agree to the <Link href="/terms" style={{ color: "var(--primary)", textDecoration: "underline" }}>terms and conditions</Link> of Franchise Apply.
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary"
                style={{ width: "100%", padding: "14px 28px", fontSize: "16px" }}
              >
                {loading ? "Submitting Application..." : "Submit Brand for Review"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
