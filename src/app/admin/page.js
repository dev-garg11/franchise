"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Building, Users, FileText, CheckCircle, CheckCircle2, XCircle, Trash2, LogOut,
  Home, Search, LayoutDashboard, ShieldCheck, Mail, Phone, MapPin,
  UploadCloud, Eye, Edit3, Wrench, Megaphone, Image as ImageIcon, RefreshCw, Filter, Clock, UserCheck, X
} from "lucide-react";
import Pagination from "@/components/Pagination";
import { clearBrandsCache } from "@/lib/brandsCache";
import { logActivity } from "@/lib/logger";
import { REGISTRATION_INVESTMENT_OPTIONS, getFilteredMaxLimits } from "@/lib/investmentData";
import { BRAND_CATEGORIES, BRAND_SECTORS_MAP, ALL_INDIAN_STATES } from "@/lib/brandConstants";
import { DISTRICTS_BY_STATE } from "@/lib/districtsData";

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

const stripHtmlTags = (str) => {
  if (!str) return "No description provided.";
  return String(str)
    .replace(/<[^>]*>?/gm, '')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .trim();
};

export default function AdminDashboard({ initialTab = "dashboard" }) {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);
  const [activeTab, setActiveTab] = useState(initialTab); // dashboard, brands, investors, blogs, services, ads, logs

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  // Activity Logs State
  const [logs, setLogs] = useState([]);
  const [logsLoading, setLogsLoading] = useState(false);
  const [logPanelFilter, setLogPanelFilter] = useState("all");
  const [logSearch, setLogSearch] = useState("");
  const [logPage, setLogPage] = useState(1);
  const logsPerPage = 10;

  // Custom Message Action Modal State
  const [customMsgModal, setCustomMsgModal] = useState(null); // { isOpen: boolean, type: string, targetItem: object, extraPayload?: object }
  const [customMessageText, setCustomMessageText] = useState("");
  const [isSubmittingCustomMsg, setIsSubmittingCustomMsg] = useState(false);

  const fetchLogs = async () => {
    setLogsLoading(true);
    try {
      const query = new URLSearchParams();
      if (logPanelFilter && logPanelFilter !== "all") query.set("panel", logPanelFilter);
      if (logSearch) query.set("search", logSearch);
      const res = await fetch(`/api/logs?${query.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setLogs(data);
      }
    } catch (err) {
      console.error("Failed to fetch logs:", err);
    } finally {
      setLogsLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "logs") {
      fetchLogs();
    }
  }, [activeTab, logPanelFilter, logSearch]);

  const handleDeleteLog = async (id) => {
    if (!confirm("Are you sure you want to delete this log entry?")) return;
    try {
      const res = await fetch(`/api/logs?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        setLogs(logs.filter(l => l.id !== id && l._id !== id));
        logActivity({
          panel: "admin",
          action: "LOG_DELETED",
          description: `Deleted audit log entry #${id}`
        });
      }
    } catch (err) {
      console.error("Failed to delete log:", err);
    }
  };

  const handleClearAllLogs = async () => {
    const panelText = logPanelFilter === "all" ? "all panels" : logPanelFilter;
    if (!confirm(`Are you sure you want to clear all logs for ${panelText}? This action cannot be undone.`)) return;
    try {
      const query = logPanelFilter !== "all" ? `?clearAll=true&panel=${logPanelFilter}` : `?clearAll=true`;
      const res = await fetch(`/api/logs${query}`, { method: "DELETE" });
      if (res.ok) {
        fetchLogs();
        logActivity({
          panel: "admin",
          action: "LOGS_CLEARED",
          description: `Cleared activity logs for ${panelText}`
        });
      }
    } catch (err) {
      console.error("Failed to clear logs:", err);
    }
  };

  // Data State
  const [brands, setBrands] = useState([]);
  const [investors, setInvestors] = useState([]);
  const [blogs, setBlogs] = useState([]);
  const [services, setServices] = useState([]);
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Blog Management State
  const [blogModalOpen, setBlogModalOpen] = useState(false);
  const [blogForm, setBlogForm] = useState({ title: "", content: "", image: "" });
  const [editingBlogId, setEditingBlogId] = useState(null);
  const [isSavingBlog, setIsSavingBlog] = useState(false);

  // Services Management State
  const [serviceModalOpen, setServiceModalOpen] = useState(false);
  const [serviceForm, setServiceForm] = useState({ title: "", content: "", image: "" });
  const [editingServiceId, setEditingServiceId] = useState(null);
  const [isSavingService, setIsSavingService] = useState(false);

  // Advertisements Management State
  const [adModalOpen, setAdModalOpen] = useState(false);
  const [adForm, setAdForm] = useState({
    title: "",
    subtitle: "",
    image: "",
    link: "/brand-registration",
    badge: "SPONSORED",
    position: "homepage_banner",
    isActive: true
  });
  const [editingAdId, setEditingAdId] = useState(null);
  const [isSavingAd, setIsSavingAd] = useState(false);

  // Investor Leads Filters State
  const [filterBrand, setFilterBrand] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  // Details Modal state
  const [selectedItem, setSelectedItem] = useState(null);
  const [modalType, setModalType] = useState(""); // brand, investor
  const [selectedInvestorsForBrand, setSelectedInvestorsForBrand] = useState([]);
  const [isSavingAssign, setIsSavingAssign] = useState(false);
  const [assignFilterMode, setAssignFilterMode] = useState("matching"); // "matching" | "all"
  const [assignSearch, setAssignSearch] = useState("");

  // Admin Brand Edit State
  const [editBrandModalOpen, setEditBrandModalOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState(null);
  const [isSavingAdminBrand, setIsSavingAdminBrand] = useState(false);
  const [adminBrandForm, setAdminBrandForm] = useState({
    name: "",
    company: "",
    category: "Food and Beverage",
    sector: "QSR & Fast Food",
    hq: "Delhi NCR",
    location: "New Delhi",
    pincode: "",
    investment_range: "",
    max_investment_limit: "",
    franchiseFee: "",
    royaltyFee: "",
    areaRequired: "",
    description: "",
    email: "",
    phone: "",
    website: "",
    image: "",
    status: "Approved",
    featured: false,
    masterFranchiseAvailable: false,
    masterInvestmentRange: "",
    territoryOffered: "State Level Exclusivity",
    trainingSupport: "Yes",
    agreement: "Yes"
  });

  const handleOpenEditBrand = (brand) => {
    setEditingBrand(brand);
    setAdminBrandForm({
      name: brand.name || "",
      company: brand.company || "",
      category: brand.category || "Food and Beverage",
      sector: brand.sector || "",
      hq: brand.hq || "Delhi NCR",
      location: brand.location || "",
      pincode: brand.pincode || "",
      investment_range: brand.investment_range || "",
      max_investment_limit: brand.max_investment_limit || "",
      franchiseFee: brand.franchiseFee || "",
      royaltyFee: brand.royaltyFee || "",
      areaRequired: brand.areaRequired || "",
      description: brand.description || "",
      email: brand.email || "",
      phone: brand.phone || "",
      website: brand.website || "",
      image: brand.image || "",
      status: brand.status || "Pending",
      featured: brand.featured || false,
      masterFranchiseAvailable: brand.masterFranchiseAvailable || false,
      masterInvestmentRange: brand.masterInvestmentRange || "",
      territoryOffered: brand.territoryOffered || "State Level Exclusivity",
      trainingSupport: brand.trainingSupport || "Yes",
      agreement: brand.agreement || "Yes"
    });
    setEditBrandModalOpen(true);
  };

  const handleAdminInvestmentRangeChange = (val) => {
    const validMaxOptions = getFilteredMaxLimits(val);
    setAdminBrandForm((prev) => {
      let maxVal = prev.max_investment_limit;
      if (maxVal && !validMaxOptions.includes(maxVal)) {
        maxVal = val;
      }
      return {
        ...prev,
        investment_range: val,
        max_investment_limit: maxVal || val,
      };
    });
  };

  const handleAdminImageFileSelect = (e) => {
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
        setAdminBrandForm((prev) => ({ ...prev, image: base64 }));
      };
      img.src = event.target?.result;
    };
    reader.readAsDataURL(file);
  };

  const handleSaveAdminBrand = async (e) => {
    e.preventDefault();
    if (!editingBrand) return;

    const rangeIndex = REGISTRATION_INVESTMENT_OPTIONS.indexOf(adminBrandForm.investment_range);
    const maxIndex = REGISTRATION_INVESTMENT_OPTIONS.indexOf(adminBrandForm.max_investment_limit);
    if (adminBrandForm.investment_range && adminBrandForm.max_investment_limit && maxIndex < rangeIndex) {
      alert("Max Investment Limit cannot be lower than the selected Investment Range.");
      return;
    }

    setIsSavingAdminBrand(true);
    try {
      const brandId = editingBrand.id || editingBrand._id;
      const rangeMinVal = mapRangeToNumeric(adminBrandForm.investment_range, false);
      const rangeMaxVal = mapRangeToNumeric(adminBrandForm.max_investment_limit, true);

      const payload = {
        ...adminBrandForm,
        minInvestment: rangeMinVal || editingBrand.minInvestment || 0,
        maxInvestment: rangeMaxVal || editingBrand.maxInvestment || 0,
      };

      const res = await fetch(`/api/brands/${brandId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        clearBrandsCache();
        fetchData();
        setEditBrandModalOpen(false);
        setEditingBrand(null);
        if (selectedItem && (selectedItem.id === brandId || selectedItem._id === brandId)) {
          setSelectedItem(null);
        }
      } else {
        const data = await res.json();
        alert(data.error || "Failed to update brand.");
      }
    } catch (err) {
      console.error("Failed to save brand edits:", err);
      alert("Error updating brand.");
    } finally {
      setIsSavingAdminBrand(false);
    }
  };

  // Pagination State
  const [brandsPage, setBrandsPage] = useState(1);
  const [brandsPerPage, setBrandsPerPage] = useState(10);
  const [investorsPage, setInvestorsPage] = useState(1);
  const [investorsPerPage, setInvestorsPerPage] = useState(10);
  const [blogsPage, setBlogsPage] = useState(1);
  const [blogsPerPage, setBlogsPerPage] = useState(10);
  const [servicesPage, setServicesPage] = useState(1);
  const [servicesPerPage, setServicesPerPage] = useState(10);
  const [adsPage, setAdsPage] = useState(1);
  const [adsPerPage, setAdsPerPage] = useState(10);

  // Helper function to check if investor's selected sectors match brand category
  const isInvestorSectorMatch = (inv, brand) => {
    if (!brand) return true;
    const normalizeCat = (str) => (!str ? "" : String(str).toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]/g, ""));
    const brandCat = normalizeCat(brand.category || brand.sector || "");
    if (!brandCat) return true;

    // Check investor's selected industries from "Select sectors you are interested in:"
    const industries = Array.isArray(inv.industries) ? inv.industries : [];
    for (const ind of industries) {
      const normInd = normalizeCat(ind);
      if (!normInd) continue;
      if (normInd.includes(brandCat) || brandCat.includes(normInd)) return true;
      if (
        (normInd.includes("food") && brandCat.includes("food")) ||
        (normInd.includes("auto") && brandCat.includes("auto")) ||
        (normInd.includes("health") && (brandCat.includes("health") || brandCat.includes("wellness") || brandCat.includes("beauty"))) ||
        (normInd.includes("beauty") && (brandCat.includes("beauty") || brandCat.includes("wellness") || brandCat.includes("health"))) ||
        (normInd.includes("retail") && brandCat.includes("retail")) ||
        (normInd.includes("education") && brandCat.includes("education")) ||
        (normInd.includes("service") && brandCat.includes("service"))
      ) {
        return true;
      }
    }

    // Check inv.category or inv.interestedCategory
    const invCat = normalizeCat(inv.category || inv.interestedCategory || "");
    if (invCat) {
      if (invCat.includes(brandCat) || brandCat.includes(invCat)) return true;
      if (
        (invCat.includes("food") && brandCat.includes("food")) ||
        (invCat.includes("auto") && brandCat.includes("auto")) ||
        (invCat.includes("health") && (brandCat.includes("health") || brandCat.includes("wellness") || brandCat.includes("beauty"))) ||
        (invCat.includes("beauty") && (brandCat.includes("beauty") || brandCat.includes("wellness") || brandCat.includes("health"))) ||
        (invCat.includes("retail") && brandCat.includes("retail")) ||
        (invCat.includes("education") && brandCat.includes("education")) ||
        (invCat.includes("service") && brandCat.includes("service"))
      ) {
        return true;
      }
    }

    return false;
  };

  // Reset pagination when search or filters change
  useEffect(() => {
    setBrandsPage(1);
    setInvestorsPage(1);
    setBlogsPage(1);
  }, [searchTerm]);

  useEffect(() => {
    setInvestorsPage(1);
  }, [filterBrand, filterCategory, filterStatus]);

  useEffect(() => {
    if (selectedItem && modalType === "brand") {
      const brandId = selectedItem.id || selectedItem._id;
      const attached = investors
        .filter(inv => inv.assignedBrands && (inv.assignedBrands.includes(brandId) || inv.assignedBrands.includes(selectedItem._id)))
        .map(inv => inv.id || inv._id);
      setSelectedInvestorsForBrand(attached);
      setAssignFilterMode("matching");
      setAssignSearch("");
    }
  }, [selectedItem, modalType, investors]);

  const openCustomMsgModal = (type, targetItem, extraPayload = {}) => {
    setCustomMsgModal({
      isOpen: true,
      type,
      targetItem,
      extraPayload
    });
    setCustomMessageText("");
  };

  const handleConfirmCustomMsgAction = async () => {
    if (!customMsgModal) return;
    setIsSubmittingCustomMsg(true);
    const { type, targetItem, extraPayload } = customMsgModal;
    const adminEmail = localStorage.getItem("adminEmail") || "admin@franchiseroots.com";
    const adminName = "Administrator";

    try {
      if (type === "APPROVE_BRAND" || type === "DECLINE_BRAND") {
        const status = type === "APPROVE_BRAND" ? "Approved" : "Declined";
        const brandId = targetItem.id || targetItem._id;
        const res = await fetch(`/api/brands/${brandId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            status,
            customMessage: customMessageText,
            adminEmail,
            adminName
          })
        });
        if (res.ok) {
          clearBrandsCache();
          fetchData();
          fetchLogs();
          if (selectedItem && (selectedItem.id === brandId || selectedItem._id === brandId)) {
            setSelectedItem(null);
          }
        } else {
          alert(`Failed to ${status.toLowerCase()} brand.`);
        }
      } else if (type === "APPROVE_INVESTOR" || type === "DECLINE_INVESTOR") {
        const status = type === "APPROVE_INVESTOR" ? "Approved" : "Rejected";
        const invId = targetItem.id || targetItem._id;
        const res = await fetch(`/api/investors/${invId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            status,
            customMessage: customMessageText,
            adminEmail,
            adminName
          })
        });
        if (res.ok) {
          fetchData();
          fetchLogs();
          if (selectedItem && (selectedItem.id === invId || selectedItem._id === invId)) {
            setSelectedItem(null);
          }
        } else {
          alert(`Failed to ${status === "Approved" ? "approve" : "decline"} investor lead.`);
        }
      } else if (type === "ASSIGN_BRAND") {
        const brandId = targetItem.id || targetItem._id;
        const res = await fetch("/api/investors/assign-brand", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            brandId,
            investorIds: extraPayload.investorIds || [],
            customMessage: customMessageText,
            adminEmail,
            adminName
          })
        });
        if (res.ok) {
          alert("Brand assignment and custom log updated successfully!");
          fetchData();
          fetchLogs();
        } else {
          alert("Failed to save brand assignment.");
        }
      }
    } catch (err) {
      console.error("Action error:", err);
      alert("An error occurred while processing the request.");
    } finally {
      setIsSubmittingCustomMsg(false);
      setCustomMsgModal(null);
      setCustomMessageText("");
    }
  };

  const handleSaveBrandAssignment = async () => {
    if (!selectedItem) return;
    openCustomMsgModal("ASSIGN_BRAND", selectedItem, { investorIds: selectedInvestorsForBrand });
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

  // Fetch all brands, investors, blogs, services, and advertisements
  const fetchData = async () => {
    setLoading(true);
    try {
      const [brandsRes, investorsRes, blogsRes, servicesRes, adsRes] = await Promise.all([
        fetch("/api/brands"),
        fetch("/api/investors"),
        fetch("/api/blogs"),
        fetch("/api/services"),
        fetch("/api/advertisements")
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
      if (servicesRes.ok) {
        const servicesData = await servicesRes.json();
        setServices(servicesData);
      }
      if (adsRes.ok) {
        const adsData = await adsRes.json();
        setAds(adsData);
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
  const handleApprove = (idOrBrand) => {
    const brand = typeof idOrBrand === "object" ? idOrBrand : brands.find(b => b.id === idOrBrand || b._id === idOrBrand) || { id: idOrBrand, name: "Brand" };
    openCustomMsgModal("APPROVE_BRAND", brand);
  };

  // Decline Brand Listing
  const handleDecline = (idOrBrand) => {
    const brand = typeof idOrBrand === "object" ? idOrBrand : brands.find(b => b.id === idOrBrand || b._id === idOrBrand) || { id: idOrBrand, name: "Brand" };
    openCustomMsgModal("DECLINE_BRAND", brand);
  };

  // Delete Brand Listing
  const handleDeleteBrand = async (id) => {
    if (!confirm("Are you sure you want to permanently delete this brand registration?")) return;
    try {
      const res = await fetch(`/api/brands/${id}`, {
        method: "DELETE"
      });
      if (res.ok) {
        clearBrandsCache();
        fetchData();
        fetchLogs();
        if (selectedItem && selectedItem.id === id) setSelectedItem(null);
      }
    } catch (err) {
      console.error("Failed to delete brand:", err);
    }
  };

  // Approve Investor Lead
  const handleApproveInvestor = (idOrInvestor) => {
    const investor = typeof idOrInvestor === "object" ? idOrInvestor : investors.find(i => i.id === idOrInvestor || i._id === idOrInvestor) || { id: idOrInvestor, name: "Investor" };
    openCustomMsgModal("APPROVE_INVESTOR", investor);
  };

  // Decline Investor Lead
  const handleDeclineInvestor = (idOrInvestor) => {
    const investor = typeof idOrInvestor === "object" ? idOrInvestor : investors.find(i => i.id === idOrInvestor || i._id === idOrInvestor) || { id: idOrInvestor, name: "Investor" };
    openCustomMsgModal("DECLINE_INVESTOR", investor);
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

  // Open modal to create a new service
  const handleOpenCreateService = () => {
    setServiceForm({ title: "", content: "", image: "" });
    setEditingServiceId(null);
    setServiceModalOpen(true);
  };

  // Open modal to edit an existing service
  const handleOpenEditService = (service) => {
    setServiceForm({
      title: service.title || "",
      content: service.content || "",
      image: service.image || ""
    });
    setEditingServiceId(service.id || service._id);
    setServiceModalOpen(true);
  };

  // Create or Update service DB record
  const handleSaveService = async (e) => {
    e.preventDefault();
    if (!serviceForm.title || !serviceForm.content) {
      alert("Title and content are required.");
      return;
    }
    setIsSavingService(true);
    try {
      const url = editingServiceId ? `/api/services/${editingServiceId}` : "/api/services";
      const method = editingServiceId ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(serviceForm)
      });
      if (res.ok) {
        alert(editingServiceId ? "Service updated successfully!" : "Service created successfully!");
        setServiceModalOpen(false);
        fetchData();
      } else {
        const errorData = await res.json();
        alert(errorData.error || "Failed to save service.");
      }
    } catch (err) {
      console.error("Failed to save service:", err);
      alert("An error occurred while saving the service.");
    } finally {
      setIsSavingService(false);
    }
  };

  // Delete Service record
  const handleDeleteService = async (id) => {
    if (!confirm("Are you sure you want to permanently delete this service?")) return;
    try {
      const res = await fetch(`/api/services/${id}`, {
        method: "DELETE"
      });
      if (res.ok) {
        fetchData();
      } else {
        alert("Failed to delete service.");
      }
    } catch (err) {
      console.error("Failed to delete service:", err);
    }
  };

  const handleServiceImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      alert("File is too large. Maximum size allowed is 5 MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

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
        setServiceForm(prev => ({
          ...prev,
          image: base64
        }));
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveServiceImage = () => {
    setServiceForm(prev => ({
      ...prev,
      image: ""
    }));
  };

  // Open modal to create a new ad banner
  const handleOpenCreateAd = () => {
    setAdForm({
      title: "",
      subtitle: "",
      image: "",
      link: "/brand-registration",
      badge: "SPONSORED",
      position: "homepage_banner",
      isActive: true
    });
    setEditingAdId(null);
    setAdModalOpen(true);
  };

  // Open modal to edit an existing ad banner
  const handleOpenEditAd = (ad) => {
    setAdForm({
      title: ad.title || "",
      subtitle: ad.subtitle || "",
      image: ad.image || "",
      link: ad.link || "/brand-registration",
      badge: ad.badge || "SPONSORED",
      position: ad.position || "homepage_banner",
      isActive: ad.isActive !== undefined ? ad.isActive : true
    });
    setEditingAdId(ad.id || ad._id);
    setAdModalOpen(true);
  };

  // Create or Update ad banner DB record
  const handleSaveAd = async (e) => {
    e.preventDefault();
    if (!adForm.title || !adForm.image) {
      alert("Title and Image are required.");
      return;
    }
    setIsSavingAd(true);
    try {
      const url = editingAdId ? `/api/advertisements/${editingAdId}` : "/api/advertisements";
      const method = editingAdId ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(adForm)
      });
      if (res.ok) {
        alert(editingAdId ? "Ad Banner updated successfully!" : "Ad Banner created successfully!");
        setAdModalOpen(false);
        fetchData();
      } else {
        const errorData = await res.json();
        alert(errorData.error || "Failed to save ad banner.");
      }
    } catch (err) {
      console.error("Failed to save ad banner:", err);
      alert("An error occurred while saving the ad banner.");
    } finally {
      setIsSavingAd(false);
    }
  };

  // Toggle active status of an ad banner
  const handleToggleAdActive = async (ad) => {
    try {
      const id = ad.id || ad._id;
      const res = await fetch(`/api/advertisements/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !ad.isActive })
      });
      if (res.ok) {
        fetchData();
      }
    } catch (err) {
      console.error("Failed to toggle ad status:", err);
    }
  };

  // Delete Ad record
  const handleDeleteAd = async (id) => {
    if (!confirm("Are you sure you want to permanently delete this ad banner?")) return;
    try {
      const res = await fetch(`/api/advertisements/${id}`, {
        method: "DELETE"
      });
      if (res.ok) {
        fetchData();
      } else {
        alert("Failed to delete ad banner.");
      }
    } catch (err) {
      console.error("Failed to delete ad banner:", err);
    }
  };

  const handleAdImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      alert("File is too large. Maximum size allowed is 5 MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        const maxDim = 1200;
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
        setAdForm(prev => ({
          ...prev,
          image: base64
        }));
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveAdImage = () => {
    setAdForm(prev => ({
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

  // Filtered Lists & Paginated Data Slices
  const filteredBrands = brands.filter(b => {
    const term = (searchTerm || "").toLowerCase();
    if (!term) return true;
    const nameMatch = (b.name || "").toLowerCase().includes(term);
    const companyMatch = (b.company || "").toLowerCase().includes(term);
    const categoryMatch = (b.category || "").toLowerCase().includes(term);
    const emailMatch = (b.email || (b.user && b.user.email) || "").toLowerCase().includes(term);
    return nameMatch || companyMatch || categoryMatch || emailMatch;
  });
  const paginatedBrands = filteredBrands.slice((brandsPage - 1) * brandsPerPage, brandsPage * brandsPerPage);

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
  const paginatedInvestors = filteredInvestors.slice((investorsPage - 1) * investorsPerPage, investorsPage * investorsPerPage);

  const filteredBlogs = blogs.filter(blog => blog.title.toLowerCase().includes(searchTerm.toLowerCase()));
  const paginatedBlogs = filteredBlogs.slice((blogsPage - 1) * blogsPerPage, blogsPage * blogsPerPage);

  const filteredServices = services.filter(service => service.title.toLowerCase().includes(searchTerm.toLowerCase()));
  const paginatedServices = filteredServices.slice((servicesPage - 1) * servicesPerPage, servicesPage * servicesPerPage);

  const filteredAds = ads.filter(ad => ad.title.toLowerCase().includes(searchTerm.toLowerCase()));
  const paginatedAds = filteredAds.slice((adsPage - 1) * adsPerPage, adsPage * adsPerPage);

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
            padding: "20px 16px 16px 16px",
            borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
            marginBottom: "16px",
            background: "transparent"
          }}>
            <Link href="/admin" style={{ display: "block" }}>
              <img
                src="/logo-footer.png"
                alt="Franchise Roots Admin"
                className="sidebar-logo-img"
              />
            </Link>
          </div>

          <div style={{ padding: "0 28px" }}>
            <ul className="admin-nav" style={{ marginTop: 0 }}>
              <li className="admin-nav-item">
                <Link
                  href="/admin"
                  className={`admin-nav-link ${activeTab === "dashboard" ? "active" : ""}`}
                  onClick={() => { setActiveTab("dashboard"); setSearchTerm(""); }}
                >
                  <LayoutDashboard size={18} />
                  Dashboard Overview
                </Link>
              </li>
              <li className="admin-nav-item">
                <Link
                  href="/admin/brands"
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
                </Link>
              </li>
              <li className="admin-nav-item">
                <Link
                  href="/admin/investors"
                  className={`admin-nav-link ${activeTab === "investors" ? "active" : ""}`}
                  onClick={() => { setActiveTab("investors"); setSearchTerm(""); }}
                >
                  <Users size={18} />
                  Investor Leads ({investors.length})
                </Link>
              </li>
              <li className="admin-nav-item">
                <Link
                  href="/admin/blogs"
                  className={`admin-nav-link ${activeTab === "blogs" ? "active" : ""}`}
                  onClick={() => { setActiveTab("blogs"); setSearchTerm(""); }}
                >
                  <FileText size={18} />
                  Manage Blogs ({blogs.length})
                </Link>
              </li>
              <li className="admin-nav-item">
                <Link
                  href="/admin/services"
                  className={`admin-nav-link ${activeTab === "services" ? "active" : ""}`}
                  onClick={() => { setActiveTab("services"); setSearchTerm(""); }}
                >
                  <Wrench size={18} />
                  Manage Services ({services.length})
                </Link>
              </li>
              <li className="admin-nav-item">
                <Link
                  href="/admin/ads"
                  className={`admin-nav-link ${activeTab === "ads" ? "active" : ""}`}
                  onClick={() => { setActiveTab("ads"); setSearchTerm(""); }}
                >
                  <Megaphone size={18} />
                  Manage Ads ({ads.length})
                </Link>
              </li>
              <li className="admin-nav-item">
                <Link
                  href="/admin/logs"
                  className={`admin-nav-link ${activeTab === "logs" ? "active" : ""}`}
                  onClick={() => { setActiveTab("logs"); setSearchTerm(""); }}
                >
                  <ShieldCheck size={18} />
                  Activity & Audit Logs
                </Link>
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
              {activeTab === "services" && "Manage Company Services"}
              {activeTab === "ads" && "Manage Advertising Space"}
              {activeTab === "logs" && "Activity & Audit Logs"}
            </h1>
            <p style={{ color: "var(--text-muted)", fontSize: "14px", marginTop: "4px" }}>
              {activeTab === "blogs" ? "Create, publish, edit, and delete informational blog posts." : activeTab === "services" ? "Create, publish, edit, and delete managed company services." : activeTab === "ads" ? "Create, publish, toggle, and delete promotional ad banners." : activeTab === "logs" ? "Audit and monitor all platform activities, admin operations, brand updates, and investor leads." : "Welcome back, Administrator. Review pending listings submitted by brand owners."}
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

                  <div className="stat-card" style={{ cursor: "pointer" }} onClick={() => setActiveTab("services")}>
                    <div className="stat-icon flex-center" style={{ background: "rgba(14, 165, 233, 0.1)", color: "#0ea5e9" }}>
                      <Wrench size={24} />
                    </div>
                    <div className="stat-info">
                      <h3>{services.length}</h3>
                      <p>Managed Services</p>
                    </div>
                  </div>

                  <div className="stat-card" style={{ cursor: "pointer" }} onClick={() => setActiveTab("ads")}>
                    <div className="stat-icon flex-center" style={{ background: "rgba(245, 158, 11, 0.1)", color: "#f59e0b" }}>
                      <Megaphone size={24} />
                    </div>
                    <div className="stat-info">
                      <h3>{ads.filter(a => a.isActive).length}</h3>
                      <p>Active Ad Banners</p>
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
                            <th style={{ textAlign: "right" }}>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {brands.filter(b => b.status === "Pending").map((b) => (
                            <tr key={b.id}>
                              <td style={{ fontWeight: "600" }}>
                                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                  <img
                                    src={b.image || "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&q=80&w=100"}
                                    alt={b.name}
                                    style={{ width: "36px", height: "36px", borderRadius: "8px", objectFit: "cover", flexShrink: 0, border: "1px solid var(--border-color)" }}
                                  />
                                  <span>{b.name}</span>
                                </div>
                              </td>
                              <td>{b.category}</td>
                              <td>{formatLakhs(b.minInvestment)}</td>
                              <td style={{ whiteSpace: "nowrap", textAlign: "right" }}>
                                <div className="admin-actions-cell" style={{ justifyContent: "flex-end" }}>
                                  <button className="admin-btn admin-btn-approve" onClick={() => handleApprove(b.id)}>
                                    <CheckCircle2 size={13} /> Approve
                                  </button>
                                  <button className="admin-btn admin-btn-decline" onClick={() => handleDecline(b.id)}>
                                    <XCircle size={13} /> Decline
                                  </button>
                                </div>
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
                      paginatedBrands.map((b) => {
                        const attachedCount = investors.filter(inv => inv.assignedBrands && (inv.assignedBrands.includes(b.id) || inv.assignedBrands.includes(b._id))).length;
                        return (
                          <tr key={b.id}>
                            <td>
                               <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                 <img
                                   src={b.image || "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&q=80&w=100"}
                                   alt={b.name}
                                   style={{ width: "40px", height: "40px", borderRadius: "8px", objectFit: "cover", flexShrink: 0, border: "1px solid var(--border-color)" }}
                                 />
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
                            <td style={{ whiteSpace: "nowrap", textAlign: "right" }}>
                              <div className="admin-actions-cell" style={{ justifyContent: "flex-end" }}>
                                <button className="admin-btn admin-btn-details" onClick={() => { setSelectedItem(b); setModalType("brand"); }}>
                                  <Eye size={13} /> Details
                                </button>
                                <button className="admin-btn admin-btn-details" style={{ background: "rgba(99, 102, 241, 0.1)", color: "var(--primary)", borderColor: "rgba(99, 102, 241, 0.2)" }} onClick={() => handleOpenEditBrand(b)}>
                                  <Edit3 size={13} /> Edit
                                </button>
                                {b.status === "Pending" && (
                                  <>
                                    <button className="admin-btn admin-btn-approve" onClick={() => handleApprove(b.id)}>
                                      <CheckCircle2 size={13} /> Approve
                                    </button>
                                    <button className="admin-btn admin-btn-decline" onClick={() => handleDecline(b.id)}>
                                      <XCircle size={13} /> Decline
                                    </button>
                                  </>
                                )}
                                <button className="admin-btn admin-btn-delete" title="Delete Brand" onClick={() => handleDeleteBrand(b.id)}>
                                  <Trash2 size={13} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>

                <Pagination
                  totalItems={filteredBrands.length}
                  itemsPerPage={brandsPerPage}
                  currentPage={brandsPage}
                  onPageChange={(p) => setBrandsPage(p)}
                  onItemsPerPageChange={(size) => { setBrandsPerPage(size); setBrandsPage(1); }}
                />
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
                      paginatedInvestors.map((i) => {
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
                            <td style={{ whiteSpace: "nowrap", textAlign: "right" }} onClick={(e) => e.stopPropagation()}>
                              <div className="admin-actions-cell" style={{ justifyContent: "flex-end" }}>
                                <button className="admin-btn admin-btn-details" onClick={() => { setSelectedItem(i); setModalType("investor"); }}>
                                  <Eye size={13} /> Details
                                </button>
                                {displayStatus === "Pending" && (
                                  <>
                                    <button className="admin-btn admin-btn-approve" onClick={() => handleApproveInvestor(i.id || i._id)}>
                                      <CheckCircle2 size={13} /> Approve
                                    </button>
                                    <button className="admin-btn admin-btn-decline" onClick={() => handleDeclineInvestor(i.id || i._id)}>
                                      <XCircle size={13} /> Decline
                                    </button>
                                  </>
                                )}
                                <button className="admin-btn admin-btn-delete" title="Delete Lead" onClick={() => handleDeleteInvestor(i.id || i._id)}>
                                  <Trash2 size={13} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>

                <Pagination
                  totalItems={filteredInvestors.length}
                  itemsPerPage={investorsPerPage}
                  currentPage={investorsPage}
                  onPageChange={(p) => setInvestorsPage(p)}
                  onItemsPerPageChange={(size) => { setInvestorsPerPage(size); setInvestorsPage(1); }}
                />
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
                    {filteredBlogs.length === 0 ? (
                      <tr>
                        <td colSpan="5" style={{ textAlign: "center", padding: "30px", color: "var(--text-muted)" }}>
                          No blog posts found. Click "Create New Blog" to publish one.
                        </td>
                      </tr>
                    ) : (
                      paginatedBlogs.map((blog) => (
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
                              {(() => {
                                const clean = stripHtmlTags(blog.content || "");
                                return clean.length > 90 ? `${clean.substring(0, 90)}...` : clean;
                              })()}
                            </span>
                          </td>
                          <td style={{ fontSize: "13px", color: "var(--text-muted)" }}>
                            {blog.createdAt ? new Date(blog.createdAt).toLocaleDateString("en-IN", { day: 'numeric', month: 'short', year: 'numeric' }) : "N/A"}
                          </td>
                          <td style={{ whiteSpace: "nowrap", textAlign: "right" }}>
                            <div className="admin-actions-cell" style={{ justifyContent: "flex-end" }}>
                              <button className="admin-btn admin-btn-details" onClick={() => handleOpenEditBlog(blog)}>
                                <Edit3 size={13} /> Edit
                              </button>
                              <button className="admin-btn admin-btn-delete" title="Delete Post" onClick={() => handleDeleteBlog(blog.id || blog._id)}>
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>

                <Pagination
                  totalItems={filteredBlogs.length}
                  itemsPerPage={blogsPerPage}
                  currentPage={blogsPage}
                  onPageChange={(p) => setBlogsPage(p)}
                  onItemsPerPageChange={(size) => { setBlogsPerPage(size); setBlogsPage(1); }}
                />
              </div>
            )}

            {/* Services Tab */}
            {activeTab === "services" && (
              <div className="table-container">
                <div className="table-header">
                  <h3 style={{ fontSize: "18px" }}>Managed Company Services</h3>
                  <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
                    <div className="table-search">
                      <Search size={16} color="var(--text-muted)" />
                      <input
                        type="text"
                        placeholder="Search services by title..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                    <button className="btn btn-primary" onClick={handleOpenCreateService} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <Wrench size={16} /> Create New Service
                    </button>
                  </div>
                </div>

                <table className="admin-table">
                  <thead>
                    <tr>
                      <th style={{ width: "120px" }}>Cover</th>
                      <th>Title</th>
                      <th>Description</th>
                      <th>Date Created</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredServices.length === 0 ? (
                      <tr>
                        <td colSpan="5" style={{ textAlign: "center", padding: "30px", color: "var(--text-muted)" }}>
                          No services found. Click "Create New Service" to add one.
                        </td>
                      </tr>
                    ) : (
                      paginatedServices.map((service) => (
                        <tr key={service.id || service._id}>
                          <td>
                            <img
                              src={service.image || "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&q=80&w=150"}
                              alt={service.title}
                              style={{ width: "80px", height: "50px", borderRadius: "6px", objectFit: "cover", border: "1px solid var(--border-color)" }}
                            />
                          </td>
                          <td>
                            <span style={{ fontWeight: "700" }}>{service.title}</span>
                          </td>
                          <td>
                            <span style={{ color: "var(--text-muted)", fontSize: "13px" }}>
                              {(() => {
                                const clean = stripHtmlTags(service.content || "");
                                return clean.length > 90 ? `${clean.substring(0, 90)}...` : clean;
                              })()}
                            </span>
                          </td>
                          <td style={{ fontSize: "13px", color: "var(--text-muted)" }}>
                            {service.createdAt ? new Date(service.createdAt).toLocaleDateString("en-IN", { day: 'numeric', month: 'short', year: 'numeric' }) : "N/A"}
                          </td>
                          <td style={{ whiteSpace: "nowrap", textAlign: "right" }}>
                            <div className="admin-actions-cell" style={{ justifyContent: "flex-end" }}>
                              <button className="admin-btn admin-btn-details" onClick={() => handleOpenEditService(service)}>
                                <Edit3 size={13} /> Edit
                              </button>
                              <button className="admin-btn admin-btn-delete" title="Delete Service" onClick={() => handleDeleteService(service.id || service._id)}>
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>

                <Pagination
                  totalItems={filteredServices.length}
                  itemsPerPage={servicesPerPage}
                  currentPage={servicesPage}
                  onPageChange={(p) => setServicesPage(p)}
                  onItemsPerPageChange={(size) => { setServicesPerPage(size); setServicesPage(1); }}
                />
              </div>
            )}

            {/* Advertisements Tab */}
            {activeTab === "ads" && (
              <div className="table-container">
                <div className="table-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <h3 style={{ fontSize: "18px" }}>Advertising Space Banners</h3>
                    <p style={{ color: "var(--text-muted)", fontSize: "13px", margin: "2px 0 0 0" }}>
                      Manage promotional ad banners displayed on homepage and brand listings.
                    </p>
                  </div>
                  <button className="btn btn-primary" onClick={handleOpenCreateAd} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <Megaphone size={16} /> Create New Ad Banner
                  </button>
                </div>

                <div className="table-search" style={{ margin: "16px 20px" }}>
                  <Search size={16} color="var(--text-muted)" />
                  <input
                    type="text"
                    placeholder="Search ad banners by title..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Banner Image</th>
                      <th>Title & Subtitle</th>
                      <th>Badge</th>
                      <th>Position</th>
                      <th>Status</th>
                      <th>Destination Link</th>
                      <th style={{ textAlign: "right" }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAds.length === 0 ? (
                      <tr>
                        <td colSpan="7" style={{ textAlign: "center", padding: "30px", color: "var(--text-muted)" }}>
                          No ad banners found. Click "Create New Ad Banner" to add one.
                        </td>
                      </tr>
                    ) : (
                      paginatedAds.map((ad) => (
                        <tr key={ad.id || ad._id}>
                          <td>
                            <img
                              src={ad.image || "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=150"}
                              alt={ad.title}
                              style={{ width: "100px", height: "55px", borderRadius: "8px", objectFit: "cover", border: "1px solid var(--border-color)" }}
                            />
                          </td>
                          <td>
                            <span style={{ fontWeight: "700", display: "block" }}>{ad.title}</span>
                            {ad.subtitle && <span style={{ color: "var(--text-muted)", fontSize: "12px" }}>{ad.subtitle}</span>}
                          </td>
                          <td>
                            <span style={{ background: "#fef3c7", color: "#d97706", fontSize: "11px", fontWeight: "800", padding: "3px 8px", borderRadius: "12px", textTransform: "uppercase" }}>
                              {ad.badge || "SPONSORED"}
                            </span>
                          </td>
                          <td>
                            <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>{ad.position || "homepage_banner"}</span>
                          </td>
                          <td>
                            <button
                              onClick={() => handleToggleAdActive(ad)}
                              style={{
                                border: "none",
                                background: ad.isActive ? "#dcfce7" : "#fee2e2",
                                color: ad.isActive ? "#16a34a" : "#dc2626",
                                fontSize: "11px",
                                fontWeight: "700",
                                padding: "4px 10px",
                                borderRadius: "20px",
                                cursor: "pointer"
                              }}
                            >
                              {ad.isActive ? "ACTIVE" : "INACTIVE"}
                            </button>
                          </td>
                          <td style={{ fontSize: "13px", color: "var(--primary)", fontWeight: "600" }}>
                            {ad.link}
                          </td>
                          <td style={{ whiteSpace: "nowrap", textAlign: "right" }}>
                            <div className="admin-actions-cell" style={{ justifyContent: "flex-end" }}>
                              <button className="admin-btn admin-btn-details" onClick={() => handleOpenEditAd(ad)}>
                                <Edit3 size={13} /> Edit
                              </button>
                              <button className="admin-btn admin-btn-delete" title="Delete Ad Banner" onClick={() => handleDeleteAd(ad.id || ad._id)}>
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>

                <Pagination
                  totalItems={filteredAds.length}
                  itemsPerPage={adsPerPage}
                  currentPage={adsPage}
                  onPageChange={(p) => setAdsPage(p)}
                  onItemsPerPageChange={(size) => { setAdsPerPage(size); setAdsPage(1); }}
                />
              </div>
            )}

            {/* Activity Logs Tab View */}
            {activeTab === "logs" && (
              <div>
                {/* Log Stats Overview */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px", marginBottom: "24px" }}>
                  <div style={{ background: "white", padding: "16px 20px", borderRadius: "12px", border: "1px solid var(--border-color)", display: "flex", alignItems: "center", gap: "14px" }}>
                    <div style={{ width: "42px", height: "42px", borderRadius: "10px", background: "rgba(139, 92, 246, 0.1)", color: "#8b5cf6", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <ShieldCheck size={22} />
                    </div>
                    <div>
                      <div style={{ fontSize: "22px", fontWeight: "700", color: "var(--dark)" }}>{logs.length}</div>
                      <div style={{ fontSize: "12px", color: "var(--text-muted)", fontWeight: "500" }}>Total Audit Logs</div>
                    </div>
                  </div>
                  <div style={{ background: "white", padding: "16px 20px", borderRadius: "12px", border: "1px solid var(--border-color)", display: "flex", alignItems: "center", gap: "14px" }}>
                    <div style={{ width: "42px", height: "42px", borderRadius: "10px", background: "rgba(59, 130, 246, 0.1)", color: "#3b82f6", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Building size={22} />
                    </div>
                    <div>
                      <div style={{ fontSize: "22px", fontWeight: "700", color: "var(--dark)" }}>
                        {logs.filter(l => l.panel === "admin").length}
                      </div>
                      <div style={{ fontSize: "12px", color: "var(--text-muted)", fontWeight: "500" }}>Admin Actions</div>
                    </div>
                  </div>
                  <div style={{ background: "white", padding: "16px 20px", borderRadius: "12px", border: "1px solid var(--border-color)", display: "flex", alignItems: "center", gap: "14px" }}>
                    <div style={{ width: "42px", height: "42px", borderRadius: "10px", background: "rgba(16, 185, 129, 0.1)", color: "#10b981", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Building size={22} />
                    </div>
                    <div>
                      <div style={{ fontSize: "22px", fontWeight: "700", color: "var(--dark)" }}>
                        {logs.filter(l => l.panel === "brand").length}
                      </div>
                      <div style={{ fontSize: "12px", color: "var(--text-muted)", fontWeight: "500" }}>Brand Logs</div>
                    </div>
                  </div>
                  <div style={{ background: "white", padding: "16px 20px", borderRadius: "12px", border: "1px solid var(--border-color)", display: "flex", alignItems: "center", gap: "14px" }}>
                    <div style={{ width: "42px", height: "42px", borderRadius: "10px", background: "rgba(245, 158, 11, 0.1)", color: "#f59e0b", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Users size={22} />
                    </div>
                    <div>
                      <div style={{ fontSize: "22px", fontWeight: "700", color: "var(--dark)" }}>
                        {logs.filter(l => l.panel === "investor").length}
                      </div>
                      <div style={{ fontSize: "12px", color: "var(--text-muted)", fontWeight: "500" }}>Investor Logs</div>
                    </div>
                  </div>
                </div>

                {/* Log Controls & Filter Toolbar */}
                <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: "16px", marginBottom: "20px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px", flex: 1, minWidth: "280px" }}>
                    <div className="search-box" style={{ flex: 1, margin: 0 }}>
                      <Search size={16} />
                      <input
                        type="text"
                        placeholder="Search by action, email, description..."
                        value={logSearch}
                        onChange={(e) => { setLogSearch(e.target.value); setLogPage(1); }}
                      />
                    </div>
                    <select
                      value={logPanelFilter}
                      onChange={(e) => { setLogPanelFilter(e.target.value); setLogPage(1); }}
                      style={{
                        padding: "9px 14px",
                        borderRadius: "8px",
                        border: "1px solid var(--border-color)",
                        fontSize: "13px",
                        background: "white",
                        color: "var(--text-color)",
                        outline: "none",
                        cursor: "pointer"
                      }}
                    >
                      <option value="all">All Panels</option>
                      <option value="admin">Admin Panel</option>
                      <option value="brand">Brand Panel</option>
                      <option value="investor">Investor Panel</option>
                    </select>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <button
                      onClick={fetchLogs}
                      className="btn btn-outline"
                      style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", padding: "8px 14px" }}
                      title="Refresh Logs"
                    >
                      <RefreshCw size={14} className={logsLoading ? "spinning" : ""} /> Refresh
                    </button>
                    <button
                      onClick={handleClearAllLogs}
                      className="btn"
                      style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", padding: "8px 14px", background: "var(--danger)", color: "white", border: "none" }}
                    >
                      <Trash2 size={14} /> Clear Logs
                    </button>
                  </div>
                </div>

                {/* Log Entries Table */}
                {logsLoading ? (
                  <div className="flex-center" style={{ minHeight: "200px", flexDirection: "column", gap: "12px" }}>
                    <div className="spinner"></div>
                    <p style={{ color: "var(--text-muted)" }}>Loading audit records...</p>
                  </div>
                ) : (
                  <>
                    <div style={{ overflowX: "auto", background: "white", borderRadius: "12px", border: "1px solid var(--border-color)" }}>
                      <table className="admin-table" style={{ margin: 0 }}>
                        <thead>
                          <tr>
                            <th style={{ width: "170px" }}>Timestamp</th>
                            <th style={{ width: "100px" }}>Panel</th>
                            <th style={{ width: "170px" }}>Action</th>
                            <th>User / Email</th>
                            <th>Description</th>
                            <th style={{ textAlign: "right", width: "80px" }}>Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {logs.length === 0 ? (
                            <tr>
                              <td colSpan="6" style={{ textAlign: "center", padding: "40px 20px", color: "var(--text-muted)" }}>
                                No log records found matching your filters.
                              </td>
                            </tr>
                          ) : (
                            logs.slice((logPage - 1) * logsPerPage, logPage * logsPerPage).map((logItem) => {
                              const panelBadgeStyle = logItem.panel === "admin"
                                ? { background: "rgba(139, 92, 246, 0.1)", color: "#8b5cf6" }
                                : logItem.panel === "brand"
                                ? { background: "rgba(16, 185, 129, 0.1)", color: "#10b981" }
                                : { background: "rgba(245, 158, 11, 0.1)", color: "#f59e0b" };

                              return (
                                <tr key={logItem.id || logItem._id}>
                                  <td style={{ fontSize: "12px", color: "var(--text-muted)", whiteSpace: "nowrap" }}>
                                    {new Date(logItem.createdAt).toLocaleString("en-IN", {
                                      dateStyle: "medium",
                                      timeStyle: "short"
                                    })}
                                  </td>
                                  <td>
                                    <span style={{
                                      fontSize: "10px",
                                      fontWeight: "700",
                                      textTransform: "uppercase",
                                      padding: "3px 8px",
                                      borderRadius: "4px",
                                      ...panelBadgeStyle
                                    }}>
                                      {logItem.panel}
                                    </span>
                                  </td>
                                  <td>
                                    <span style={{
                                      fontSize: "11px",
                                      fontWeight: "600",
                                      fontFamily: "monospace",
                                      background: "#f1f5f9",
                                      color: "#334155",
                                      padding: "2px 6px",
                                      borderRadius: "4px"
                                    }}>
                                      {logItem.action}
                                    </span>
                                  </td>
                                  <td style={{ fontSize: "13px" }}>
                                    <div style={{ fontWeight: "600", color: "var(--dark)" }}>
                                      {logItem.userName || logItem.userEmail || "System"}
                                    </div>
                                    {logItem.userEmail && (
                                      <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>{logItem.userEmail}</div>
                                    )}
                                  </td>
                                  <td style={{ fontSize: "13px", color: "var(--text-color)" }}>
                                    {logItem.description}
                                  </td>
                                  <td style={{ textAlign: "right" }}>
                                    <button
                                      className="admin-btn admin-btn-delete"
                                      onClick={() => handleDeleteLog(logItem.id || logItem._id)}
                                      title="Delete Log Record"
                                    >
                                      <Trash2 size={13} />
                                    </button>
                                  </td>
                                </tr>
                              );
                            })
                          )}
                        </tbody>
                      </table>
                    </div>

                    <Pagination
                      totalItems={logs.length}
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
                  <p style={{ color: "var(--text-muted)", fontSize: "13px" }}>HQ Location: <strong>{selectedItem.location ? `${selectedItem.location}, ${selectedItem.hq}` : selectedItem.hq} {selectedItem.pincode && `(${selectedItem.pincode})`}</strong></p>
                  <p style={{ color: "var(--text-muted)", fontSize: "13px" }}>Category: <strong>{selectedItem.category}</strong> {selectedItem.sector && `(${selectedItem.sector})`}</p>
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
                  <div>Master Model: <strong>{selectedItem.masterFranchiseAvailable ? `Yes (${selectedItem.territoryOffered || "State Level"})` : "Unit Only"}</strong></div>
                  {selectedItem.masterInvestmentRange && <div>Master Budget: <strong>{selectedItem.masterInvestmentRange}</strong></div>}
                </div>
              </div>

              <div style={{ marginBottom: "20px" }}>
                <h4 style={{ fontSize: "14px", marginBottom: "6px" }}>Overview Description</h4>
                <div
                  style={{ fontSize: "13.5px", color: "var(--text-muted)", lineHeight: "1.6" }}
                  dangerouslySetInnerHTML={{ __html: selectedItem.description || "No description provided." }}
                />
              </div>

              <div style={{ background: "#f8fafc", padding: "16px", borderRadius: "8px" }}>
                <h4 style={{ fontSize: "14px", marginBottom: "8px" }}>Contact Details</h4>
                <p style={{ fontSize: "13px", display: "flex", gap: "6px", alignItems: "center" }}><Mail size={12} /> {selectedItem.email}</p>
                <p style={{ fontSize: "13px", display: "flex", gap: "6px", alignItems: "center", marginTop: "4px" }}><Phone size={12} /> {selectedItem.phone}</p>
                {selectedItem.website && <p style={{ fontSize: "13px", display: "flex", gap: "6px", alignItems: "center", marginTop: "4px" }}><Building size={12} /> {selectedItem.website}</p>}
              </div>

              {/* Assign to Investors section */}
              <div style={{ marginTop: "20px", background: "#ffffff", padding: "18px", borderRadius: "12px", border: "1px solid var(--light-border)", boxShadow: "0 2px 8px rgba(0,0,0,0.03)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px", flexWrap: "wrap", gap: "8px" }}>
                  <div>
                    <h4 style={{ fontSize: "15px", fontWeight: "700", margin: 0, color: "#0f172a" }}>
                      Assign to Investors
                    </h4>
                    <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                      Target Brand Category: <strong style={{ color: "var(--primary)" }}>{selectedItem.category || "General"}</strong>
                    </span>
                  </div>
                  {isSavingAssign && <span style={{ fontSize: "12px", color: "var(--primary)", fontWeight: "600" }}>Saving...</span>}
                </div>

                {/* Filter and Search Bar for Assigning Investors */}
                <div style={{ display: "flex", gap: "10px", marginBottom: "12px", alignItems: "center", flexWrap: "wrap" }}>
                  <div style={{ display: "flex", background: "#f1f5f9", padding: "3px", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
                    <button
                      type="button"
                      onClick={() => setAssignFilterMode("matching")}
                      style={{
                        padding: "5px 12px",
                        fontSize: "12px",
                        fontWeight: "700",
                        borderRadius: "6px",
                        border: "none",
                        cursor: "pointer",
                        background: assignFilterMode === "matching" ? "#2563eb" : "transparent",
                        color: assignFilterMode === "matching" ? "#ffffff" : "#64748b",
                        transition: "all 0.2s ease"
                      }}
                    >
                      Matching Sector ({selectedItem.category || "All"})
                    </button>
                    <button
                      type="button"
                      onClick={() => setAssignFilterMode("all")}
                      style={{
                        padding: "5px 12px",
                        fontSize: "12px",
                        fontWeight: "700",
                        borderRadius: "6px",
                        border: "none",
                        cursor: "pointer",
                        background: assignFilterMode === "all" ? "#2563eb" : "transparent",
                        color: assignFilterMode === "all" ? "#ffffff" : "#64748b",
                        transition: "all 0.2s ease"
                      }}
                    >
                      All Investors ({investors.length})
                    </button>
                  </div>

                  <input
                    type="text"
                    placeholder="Search name, email, sector..."
                    value={assignSearch}
                    onChange={(e) => setAssignSearch(e.target.value)}
                    style={{
                      padding: "6px 12px",
                      fontSize: "12px",
                      borderRadius: "6px",
                      border: "1px solid #cbd5e1",
                      flexGrow: 1,
                      minWidth: "160px"
                    }}
                  />
                </div>

                {/* Investors Checkbox List */}
                {investors.length === 0 ? (
                  <p style={{ fontSize: "12px", color: "var(--text-muted)" }}>No investors registered yet.</p>
                ) : (() => {
                  const displayedAssignInvestors = investors.filter(inv => {
                    const invId = inv.id || inv._id;
                    const isAlreadyAssigned = selectedInvestorsForBrand.includes(invId);
                    const isMatching = isInvestorSectorMatch(inv, selectedItem);
                    const matchesMode = assignFilterMode === "all" || isMatching || isAlreadyAssigned;

                    if (!matchesMode) return false;

                    if (!assignSearch.trim()) return true;
                    const q = assignSearch.toLowerCase();
                    const sectorsText = Array.isArray(inv.industries) ? inv.industries.join(" ").toLowerCase() : (inv.category || "").toLowerCase();
                    return (
                      (inv.name && inv.name.toLowerCase().includes(q)) ||
                      (inv.email && inv.email.toLowerCase().includes(q)) ||
                      sectorsText.includes(q)
                    );
                  });

                  if (displayedAssignInvestors.length === 0) {
                    return (
                      <div style={{ textAlign: "center", padding: "16px", background: "#f8fafc", borderRadius: "8px", border: "1px dashed #cbd5e1" }}>
                        <p style={{ fontSize: "13px", color: "#64748b", margin: "0 0 8px 0" }}>
                          No investors found matching sector <strong>"{selectedItem.category}"</strong>.
                        </p>
                        {assignFilterMode === "matching" && (
                          <button
                            type="button"
                            onClick={() => setAssignFilterMode("all")}
                            style={{ fontSize: "12px", color: "#2563eb", background: "none", border: "none", cursor: "pointer", fontWeight: "700", textDecoration: "underline" }}
                          >
                            Switch to view All Investors ({investors.length})
                          </button>
                        )}
                      </div>
                    );
                  }

                  return (
                    <>
                      <div style={{ maxHeight: "200px", overflowY: "auto", border: "1px solid #e2e8f0", borderRadius: "8px", padding: "8px 12px", background: "white", marginBottom: "12px" }}>
                        {displayedAssignInvestors.map(inv => {
                          const invId = inv.id || inv._id;
                          const isChecked = selectedInvestorsForBrand.includes(invId);
                          const isMatch = isInvestorSectorMatch(inv, selectedItem);
                          const sectorsList = Array.isArray(inv.industries) && inv.industries.length > 0
                            ? inv.industries.join(", ")
                            : (inv.category || inv.interestedCategory || "General");

                          return (
                            <label key={invId} style={{ display: "flex", alignItems: "flex-start", gap: "10px", padding: "8px 0", cursor: "pointer", fontSize: "13px", borderBottom: "1px solid #f1f5f9" }}>
                              <input
                                type="checkbox"
                                checked={isChecked}
                                style={{ marginTop: "3px" }}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedInvestorsForBrand([...selectedInvestorsForBrand, invId]);
                                  } else {
                                    setSelectedInvestorsForBrand(selectedInvestorsForBrand.filter(x => x !== invId));
                                  }
                                }}
                              />
                              <div style={{ flexGrow: 1 }}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "6px" }}>
                                  <div>
                                    <strong style={{ color: "#0f172a" }}>{inv.name}</strong>{" "}
                                    <span style={{ color: "#64748b", fontSize: "12px" }}>({inv.email})</span>
                                  </div>
                                  {isMatch ? (
                                    <span style={{ fontSize: "10px", background: "#dcfce7", color: "#16a34a", padding: "2px 8px", borderRadius: "12px", fontWeight: "700" }}>
                                      ✓ Matching Sector
                                    </span>
                                  ) : (
                                    <span style={{ fontSize: "10px", background: "#f1f5f9", color: "#64748b", padding: "2px 8px", borderRadius: "12px", fontWeight: "600" }}>
                                      Other Sector
                                    </span>
                                  )}
                                </div>
                                <div style={{ fontSize: "11px", color: "#64748b", marginTop: "2px" }}>
                                  <strong>Interested Sectors:</strong> {sectorsList}
                                </div>
                              </div>
                            </label>
                          );
                        })}
                      </div>
                      <button
                        className="btn btn-primary"
                        style={{ width: "100%", fontSize: "13px", padding: "10px", borderRadius: "8px", fontWeight: "700" }}
                        onClick={handleSaveBrandAssignment}
                        disabled={isSavingAssign}
                      >
                        {isSavingAssign ? "Saving Assignment..." : `Save Assignment (${selectedInvestorsForBrand.length} Selected)`}
                      </button>
                    </>
                  );
                })()}
              </div>
            </div>
            <div className="modal-footer" style={{ display: "flex", gap: "10px", justifyContent: "flex-end", flexWrap: "wrap" }}>
              {selectedItem.status === "Pending" && (
                <>
                  <button className="admin-btn admin-btn-approve" style={{ padding: "8px 16px", fontSize: "13px" }} onClick={() => { handleApprove(selectedItem.id); setSelectedItem(null); }}>
                    <CheckCircle2 size={15} /> Approve Brand
                  </button>
                  <button className="admin-btn admin-btn-decline" style={{ padding: "8px 16px", fontSize: "13px" }} onClick={() => { handleDecline(selectedItem.id); setSelectedItem(null); }}>
                    <XCircle size={15} /> Decline Brand
                  </button>
                </>
              )}
              <button className="admin-btn admin-btn-details" style={{ background: "rgba(99, 102, 241, 0.1)", color: "var(--primary)", borderColor: "rgba(99, 102, 241, 0.2)", padding: "8px 16px", fontSize: "13px" }} onClick={() => handleOpenEditBrand(selectedItem)}>
                <Edit3 size={15} /> Edit Brand Specs
              </button>
              <button className="admin-btn admin-btn-delete" style={{ padding: "8px 16px", fontSize: "13px" }} onClick={() => handleDeleteBrand(selectedItem.id)}>
                <Trash2 size={15} /> Delete Listing
              </button>
              <button className="admin-btn admin-btn-details" style={{ padding: "8px 16px", fontSize: "13px" }} onClick={() => setSelectedItem(null)}>
                Close Window
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Admin Edit Brand Modal */}
      {editBrandModalOpen && editingBrand && (
        <div className="modal-overlay" onClick={() => setEditBrandModalOpen(false)}>
          <div className="modal-content" style={{ maxWidth: "800px" }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Edit Brand Specs: {editingBrand.name}</h3>
              <button className="close-btn" onClick={() => setEditBrandModalOpen(false)}>×</button>
            </div>
            <div className="modal-body" style={{ maxHeight: "75vh", overflowY: "auto" }}>
              <form onSubmit={handleSaveAdminBrand}>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Brand Name</label>
                    <input
                      type="text"
                      required
                      className="form-input"
                      value={adminBrandForm.name}
                      onChange={(e) => setAdminBrandForm({ ...adminBrandForm, name: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Parent Company Name</label>
                    <input
                      type="text"
                      required
                      className="form-input"
                      value={adminBrandForm.company}
                      onChange={(e) => setAdminBrandForm({ ...adminBrandForm, company: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Category <span>*</span></label>
                    <select
                      className="form-input"
                      required
                      value={adminBrandForm.category}
                      onChange={(e) => {
                        const newCat = e.target.value;
                        const availableSectors = BRAND_SECTORS_MAP[newCat] || [];
                        setAdminBrandForm((prev) => ({
                          ...prev,
                          category: newCat,
                          sector: availableSectors[0] || "",
                        }));
                      }}
                    >
                      {BRAND_CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Sector / Sub-Category <span>*</span></label>
                    <select
                      className="form-input"
                      value={adminBrandForm.sector}
                      onChange={(e) => setAdminBrandForm({ ...adminBrandForm, sector: e.target.value })}
                    >
                      {(BRAND_SECTORS_MAP[adminBrandForm.category] || [adminBrandForm.sector || "General"]).map((sec) => (
                        <option key={sec} value={sec}>{sec}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>HQ State / Region <span>*</span></label>
                    <select
                      className="form-input"
                      value={adminBrandForm.hq}
                      onChange={(e) => {
                        const newHq = e.target.value;
                        const availableDistricts = DISTRICTS_BY_STATE[newHq] || [];
                        setAdminBrandForm((prev) => ({
                          ...prev,
                          hq: newHq,
                          location: availableDistricts[0] || prev.location || "",
                        }));
                      }}
                    >
                      {ALL_INDIAN_STATES.map((st) => (
                        <option key={st} value={st}>{st}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>HQ City / District Location <span>*</span></label>
                    {DISTRICTS_BY_STATE[adminBrandForm.hq] ? (
                      <select
                        className="form-input"
                        value={adminBrandForm.location}
                        onChange={(e) => setAdminBrandForm({ ...adminBrandForm, location: e.target.value })}
                      >
                        {DISTRICTS_BY_STATE[adminBrandForm.hq].map((dist) => (
                          <option key={dist} value={dist}>{dist}</option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type="text"
                        className="form-input"
                        placeholder="Enter City / District"
                        value={adminBrandForm.location}
                        onChange={(e) => setAdminBrandForm({ ...adminBrandForm, location: e.target.value })}
                      />
                    )}
                  </div>
                  <div className="form-group">
                    <label>Pincode <span>*</span></label>
                    <input
                      type="text"
                      required
                      className="form-input"
                      value={adminBrandForm.pincode}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val === "" || (/^\d+$/.test(val) && val.length <= 6)) {
                          setAdminBrandForm({ ...adminBrandForm, pincode: val });
                        }
                      }}
                    />
                  </div>
                  <div className="form-group">
                    <label>Status</label>
                    <select
                      className="form-input"
                      value={adminBrandForm.status}
                      onChange={(e) => setAdminBrandForm({ ...adminBrandForm, status: e.target.value })}
                    >
                      <option value="Approved">Approved</option>
                      <option value="Pending">Pending</option>
                      <option value="Declined">Declined</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Investment Range <span>*</span></label>
                    <select
                      className="form-input"
                      required
                      value={adminBrandForm.investment_range}
                      onChange={(e) => handleAdminInvestmentRangeChange(e.target.value)}
                    >
                      <option value="" disabled>Select Investment Range</option>
                      {REGISTRATION_INVESTMENT_OPTIONS.map((opt) => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>
                      Max Investment Limit <span>*</span>
                      {adminBrandForm.investment_range && (
                        <span style={{ fontSize: "11px", color: "var(--success)", fontWeight: "700", marginLeft: "6px" }}>
                          (≥ {adminBrandForm.investment_range})
                        </span>
                      )}
                    </label>
                    <select
                      className="form-input"
                      required
                      value={adminBrandForm.max_investment_limit}
                      onChange={(e) => setAdminBrandForm({ ...adminBrandForm, max_investment_limit: e.target.value })}
                    >
                      <option value="" disabled>Select Max Investment Limit</option>
                      {getFilteredMaxLimits(adminBrandForm.investment_range).map((opt) => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Franchise Fee (INR)</label>
                    <input
                      type="number"
                      className="form-input"
                      value={adminBrandForm.franchiseFee}
                      onChange={(e) => setAdminBrandForm({ ...adminBrandForm, franchiseFee: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Royalty Fee</label>
                    <input
                      type="text"
                      className="form-input"
                      value={adminBrandForm.royaltyFee}
                      onChange={(e) => setAdminBrandForm({ ...adminBrandForm, royaltyFee: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Space Required (Sq. Ft.)</label>
                    <input
                      type="text"
                      className="form-input"
                      value={adminBrandForm.areaRequired}
                      onChange={(e) => setAdminBrandForm({ ...adminBrandForm, areaRequired: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Training Support</label>
                    <select
                      className="form-input"
                      value={adminBrandForm.trainingSupport}
                      onChange={(e) => setAdminBrandForm({ ...adminBrandForm, trainingSupport: e.target.value })}
                    >
                      <option value="Yes">Yes, comprehensive training provided</option>
                      <option value="No">No training support</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Standard Franchise Agreement?</label>
                    <select
                      className="form-input"
                      value={adminBrandForm.agreement}
                      onChange={(e) => setAdminBrandForm({ ...adminBrandForm, agreement: e.target.value })}
                    >
                      <option value="Yes">Yes, standardized contract (3-5 Years)</option>
                      <option value="No">No, negotiable / custom contract</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Featured Listing?</label>
                    <select
                      className="form-input"
                      value={adminBrandForm.featured ? "true" : "false"}
                      onChange={(e) => setAdminBrandForm({ ...adminBrandForm, featured: e.target.value === "true" })}
                    >
                      <option value="true">Yes, Highlight as Featured</option>
                      <option value="false">No, Standard Listing</option>
                    </select>
                  </div>

                  {/* Master Franchise Rights */}
                  <div className="form-group form-grid-full" style={{ background: "#f8fafc", padding: "16px", borderRadius: "12px", border: "1px solid var(--border-color)", margin: "10px 0" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: adminBrandForm.masterFranchiseAvailable ? "12px" : "0" }}>
                      <input
                        type="checkbox"
                        id="adminMasterFranchiseAvailable"
                        checked={adminBrandForm.masterFranchiseAvailable}
                        onChange={(e) => setAdminBrandForm({ ...adminBrandForm, masterFranchiseAvailable: e.target.checked })}
                        style={{ width: "18px", height: "18px", accentColor: "var(--primary)", cursor: "pointer" }}
                      />
                      <label htmlFor="adminMasterFranchiseAvailable" style={{ fontSize: "14.5px", fontWeight: "700", cursor: "pointer", margin: 0 }}>
                        👑 Offer Master Franchise / Regional Exclusivity Rights?
                      </label>
                    </div>

                    {adminBrandForm.masterFranchiseAvailable && (
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginTop: "12px" }}>
                        <div>
                          <label style={{ fontSize: "12px", fontWeight: "700", display: "block", marginBottom: "4px" }}>Est. Master Investment Range</label>
                          <select
                            className="form-input"
                            value={adminBrandForm.masterInvestmentRange}
                            onChange={(e) => setAdminBrandForm({ ...adminBrandForm, masterInvestmentRange: e.target.value })}
                          >
                            <option value="Rs. 15 Lakhs - 25 Lakhs">Rs. 15 Lakhs - 25 Lakhs</option>
                            <option value="Rs. 25 Lakhs - 50 Lakhs">Rs. 25 Lakhs - 50 Lakhs</option>
                            <option value="Rs. 50 Lakhs - 1 Crore">Rs. 50 Lakhs - 1 Crore</option>
                            <option value="Rs. 1 Crore - 2 Crores">Rs. 1 Crore - 2 Crores</option>
                            <option value="Above Rs. 2 Crores">Above Rs. 2 Crores</option>
                          </select>
                        </div>

                        <div>
                          <label style={{ fontSize: "12px", fontWeight: "700", display: "block", marginBottom: "4px" }}>Territory Rights Offered</label>
                          <select
                            className="form-input"
                            value={adminBrandForm.territoryOffered}
                            onChange={(e) => setAdminBrandForm({ ...adminBrandForm, territoryOffered: e.target.value })}
                          >
                            <option value="State Level Exclusivity">State Level Exclusivity</option>
                            <option value="Multi-District Zone">Multi-District Zone</option>
                            <option value="Metropolitan Area">Metropolitan Area</option>
                            <option value="Pan India Rights">Pan India Rights</option>
                          </select>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="form-group">
                    <label>Contact Phone</label>
                    <input
                      type="tel"
                      className="form-input"
                      value={adminBrandForm.phone}
                      onChange={(e) => setAdminBrandForm({ ...adminBrandForm, phone: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Official Email</label>
                    <input
                      type="email"
                      className="form-input"
                      value={adminBrandForm.email}
                      onChange={(e) => setAdminBrandForm({ ...adminBrandForm, email: e.target.value })}
                    />
                  </div>
                  <div className="form-group form-grid-full">
                    <label>Official Website URL</label>
                    <input
                      type="url"
                      className="form-input"
                      value={adminBrandForm.website}
                      onChange={(e) => setAdminBrandForm({ ...adminBrandForm, website: e.target.value })}
                    />
                  </div>
                  <div className="form-group form-grid-full">
                    <label style={{ fontSize: "14px", fontWeight: "700", display: "block", marginBottom: "8px" }}>
                      Brand Logo / Cover Image
                    </label>

                    {adminBrandForm.image ? (
                      <div style={{ display: "flex", alignItems: "center", gap: "16px", padding: "12px", background: "#f8fafc", borderRadius: "10px", border: "1px solid var(--border-color)", marginBottom: "12px" }}>
                        <img
                          src={adminBrandForm.image}
                          alt="Brand Preview"
                          style={{ width: "80px", height: "80px", borderRadius: "8px", objectFit: "cover", border: "1px solid #cbd5e1" }}
                        />
                        <div>
                          <span style={{ fontSize: "13px", fontWeight: "600", display: "block", color: "#0f172a", marginBottom: "4px" }}>
                            Current Brand Image
                          </span>
                          <div style={{ display: "flex", gap: "8px" }}>
                            <label className="btn btn-outline" style={{ fontSize: "12px", padding: "4px 10px", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "4px" }}>
                              <UploadCloud size={13} /> Replace Image
                              <input
                                type="file"
                                accept="image/*"
                                style={{ display: "none" }}
                                onChange={handleAdminImageFileSelect}
                              />
                            </label>
                            <button
                              type="button"
                              className="btn btn-outline"
                              style={{ fontSize: "12px", padding: "4px 10px", color: "var(--danger)", borderColor: "var(--danger)" }}
                              onClick={() => setAdminBrandForm((prev) => ({ ...prev, image: "" }))}
                            >
                              Remove Image
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div style={{ border: "2px dashed #cbd5e1", borderRadius: "10px", padding: "20px", textAlign: "center", background: "#f8fafc", marginBottom: "12px" }}>
                        <UploadCloud size={32} color="var(--primary)" style={{ marginBottom: "8px" }} />
                        <p style={{ fontSize: "13px", fontWeight: "600", color: "#334155", margin: "0 0 4px 0" }}>
                          Upload Brand Logo or Cover Photo
                        </p>
                        <p style={{ fontSize: "12px", color: "#64748b", margin: "0 0 12px 0" }}>
                          PNG, JPG, WEBP up to 5MB (Auto-compressed)
                        </p>
                        <label className="btn btn-primary" style={{ fontSize: "13px", padding: "8px 16px", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "6px" }}>
                          <UploadCloud size={15} /> Choose Image File
                          <input
                            type="file"
                            accept="image/*"
                            style={{ display: "none" }}
                            onChange={handleAdminImageFileSelect}
                          />
                        </label>
                      </div>
                    )}

                    <div style={{ marginTop: "6px" }}>
                      <label style={{ fontSize: "12px", color: "var(--text-muted)", display: "block", marginBottom: "4px" }}>Or enter Image URL:</label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="https://example.com/brand-logo.jpg"
                        value={adminBrandForm.image}
                        onChange={(e) => setAdminBrandForm({ ...adminBrandForm, image: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="form-group form-grid-full">
                    <label>Business Description</label>
                    <textarea
                      rows="4"
                      className="form-input"
                      value={adminBrandForm.description}
                      onChange={(e) => setAdminBrandForm({ ...adminBrandForm, description: e.target.value })}
                    ></textarea>
                  </div>
                </div>

                <div className="modal-footer" style={{ marginTop: "20px", display: "flex", gap: "10px", justifyContent: "flex-end" }}>
                  <button
                    type="button"
                    className="btn btn-outline"
                    onClick={() => setEditBrandModalOpen(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={isSavingAdminBrand}
                  >
                    {isSavingAdminBrand ? "Saving Changes..." : "Save Brand Changes"}
                  </button>
                </div>
              </form>
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
            <div className="modal-footer" style={{ display: "flex", gap: "10px", justifyContent: "flex-end", flexWrap: "wrap" }}>
              {(selectedItem.status || "Pending") === "Pending" && (
                <>
                  <button className="admin-btn admin-btn-approve" style={{ padding: "8px 16px", fontSize: "13px" }} onClick={() => handleApproveInvestor(selectedItem.id || selectedItem._id)}>
                    <CheckCircle2 size={15} /> Approve Lead
                  </button>
                  <button className="admin-btn admin-btn-decline" style={{ padding: "8px 16px", fontSize: "13px" }} onClick={() => handleDeclineInvestor(selectedItem.id || selectedItem._id)}>
                    <XCircle size={15} /> Decline Lead
                  </button>
                </>
              )}
              <button className="admin-btn admin-btn-delete" style={{ padding: "8px 16px", fontSize: "13px" }} onClick={() => handleDeleteInvestor(selectedItem.id || selectedItem._id)}>
                <Trash2 size={15} /> Delete Lead
              </button>
              <button className="admin-btn admin-btn-details" style={{ padding: "8px 16px", fontSize: "13px" }} onClick={() => setSelectedItem(null)}>
                Close Window
              </button>
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
                          background: "var(--danger)",
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

      {/* Create/Edit Service Modal */}
      {serviceModalOpen && (
        <div className="modal-overlay" onClick={() => setServiceModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "600px" }}>
            <div className="modal-header">
              <h3>{editingServiceId ? "Edit Service" : "Create New Service"}</h3>
              <button className="close-btn" onClick={() => setServiceModalOpen(false)}>×</button>
            </div>
            <form onSubmit={handleSaveService}>
              <div className="modal-body" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <div className="form-group">
                  <label htmlFor="service-title" style={{ fontWeight: 700, color: "var(--text-dark)", fontSize: "13.5px" }}>Service Title <span style={{ color: "var(--danger)" }}>*</span></label>
                  <input
                    id="service-title"
                    type="text"
                    className="form-input"
                    placeholder="Enter service title (e.g. Franchise Consulting)..."
                    value={serviceForm.title}
                    onChange={(e) => setServiceForm({ ...serviceForm, title: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label style={{ fontWeight: 700, color: "var(--text-dark)", fontSize: "13.5px" }}>Cover Image</label>

                  {serviceForm.image ? (
                    <div style={{ position: "relative", border: "1px solid var(--border-color)", borderRadius: "8px", overflow: "hidden", background: "#f8fafc" }}>
                      <img
                        src={serviceForm.image}
                        alt="Preview"
                        style={{ width: "100%", maxHeight: "200px", objectFit: "cover" }}
                      />
                      <button
                        type="button"
                        onClick={handleRemoveServiceImage}
                        style={{
                          position: "absolute",
                          top: "10px",
                          right: "10px",
                          background: "var(--danger)",
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
                        onChange={handleServiceImageUpload}
                        accept=".png,.jpg,.jpeg,.webp,.svg"
                        style={{ display: "none" }}
                      />
                    </label>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="service-content" style={{ fontWeight: 700, color: "var(--text-dark)", fontSize: "13.5px" }}>Service Description / Details <span style={{ color: "var(--danger)" }}>*</span></label>
                  <textarea
                    id="service-content"
                    className="form-input"
                    placeholder="Describe what this service offers..."
                    rows={6}
                    value={serviceForm.content}
                    onChange={(e) => setServiceForm({ ...serviceForm, content: e.target.value })}
                    style={{ resize: "vertical", minHeight: "140px", fontFamily: "inherit" }}
                    required
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setServiceModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={isSavingService}>
                  {isSavingService ? "Saving Service..." : (editingServiceId ? "Save Changes" : "Create Service")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create / Edit Advertisement Modal */}
      {adModalOpen && (
        <div className="modal-overlay" onClick={() => setAdModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "650px", width: "90%" }}>
            <div className="modal-header">
              <h3>{editingAdId ? "Edit Advertising Banner" : "Create New Ad Banner"}</h3>
              <button className="close-btn" onClick={() => setAdModalOpen(false)}>×</button>
            </div>
            <form onSubmit={handleSaveAd}>
              <div className="modal-body" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <div className="form-group">
                  <label htmlFor="ad-title" style={{ fontWeight: 700, color: "var(--text-dark)", fontSize: "13.5px" }}>Banner Main Title <span style={{ color: "var(--danger)" }}>*</span></label>
                  <input
                    id="ad-title"
                    type="text"
                    className="form-input"
                    placeholder="e.g. Promote Your Brand to 50,000+ Verified Investors"
                    value={adForm.title}
                    onChange={(e) => setAdForm({ ...adForm, title: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="ad-subtitle" style={{ fontWeight: 700, color: "var(--text-dark)", fontSize: "13.5px" }}>Subtitle / Tagline</label>
                  <input
                    id="ad-subtitle"
                    type="text"
                    className="form-input"
                    placeholder="e.g. Expand your franchise presence nationwide with premium advertising."
                    value={adForm.subtitle}
                    onChange={(e) => setAdForm({ ...adForm, subtitle: e.target.value })}
                  />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                  <div className="form-group">
                    <label htmlFor="ad-badge" style={{ fontWeight: 700, color: "var(--text-dark)", fontSize: "13.5px" }}>Badge Text</label>
                    <input
                      id="ad-badge"
                      type="text"
                      className="form-input"
                      placeholder="e.g. SPONSORED, EXCLUSIVE OFFER"
                      value={adForm.badge}
                      onChange={(e) => setAdForm({ ...adForm, badge: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="ad-link" style={{ fontWeight: 700, color: "var(--text-dark)", fontSize: "13.5px" }}>Destination URL / Link</label>
                    <input
                      id="ad-link"
                      type="text"
                      className="form-input"
                      placeholder="e.g. /brand-registration or https://..."
                      value={adForm.link}
                      onChange={(e) => setAdForm({ ...adForm, link: e.target.value })}
                    />
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                  <div className="form-group">
                    <label htmlFor="ad-position" style={{ fontWeight: 700, color: "var(--text-dark)", fontSize: "13.5px" }}>Placement Position</label>
                    <select
                      id="ad-position"
                      className="form-input"
                      value={adForm.position}
                      onChange={(e) => setAdForm({ ...adForm, position: e.target.value })}
                    >
                      <option value="homepage_banner">Homepage Main Banner</option>
                      <option value="homepage_middle">Homepage Middle Section</option>
                      <option value="brands_sidebar">Brands Page Sidebar</option>
                    </select>
                  </div>
                  <div className="form-group" style={{ display: "flex", alignItems: "center", paddingTop: "24px" }}>
                    <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", fontWeight: "700", color: "var(--text-dark)" }}>
                      <input
                        type="checkbox"
                        checked={adForm.isActive}
                        onChange={(e) => setAdForm({ ...adForm, isActive: e.target.checked })}
                        style={{ width: "18px", height: "18px", accentColor: "var(--primary)" }}
                      />
                      Active & Displaying
                    </label>
                  </div>
                </div>

                {/* Banner Image Upload & Preview */}
                <div className="form-group">
                  <label style={{ fontWeight: 700, color: "var(--text-dark)", fontSize: "13.5px", marginBottom: "8px", display: "block" }}>
                    Ad Banner Image <span style={{ color: "var(--danger)" }}>*</span>
                  </label>
                  {adForm.image ? (
                    <div style={{ position: "relative", width: "100%", height: "160px", borderRadius: "10px", overflow: "hidden", border: "1px solid var(--border-color)" }}>
                      <img src={adForm.image} alt="Ad Preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      <button
                        type="button"
                        onClick={handleRemoveAdImage}
                        style={{
                          position: "absolute", top: "10px", right: "10px",
                          background: "rgba(0,0,0,0.7)", color: "white",
                          border: "none", borderRadius: "50%", width: "32px", height: "32px",
                          cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center"
                        }}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ) : (
                    <label style={{
                      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                      padding: "24px", border: "2px dashed var(--border-color)", borderRadius: "10px", cursor: "pointer",
                      background: "#f8fafc", textAlign: "center"
                    }}>
                      <UploadCloud size={32} style={{ color: "var(--text-muted)", marginBottom: "8px" }} />
                      <span style={{ fontSize: "14px", fontWeight: "700", color: "var(--text-dark)" }}>Click to upload ad banner image</span>
                      <span style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "2px" }}>PNG, JPG, WEBP up to 5 MB</span>
                      <input type="file" onChange={handleAdImageUpload} accept=".png,.jpg,.jpeg,.webp" style={{ display: "none" }} />
                    </label>
                  )}
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setAdModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={isSavingAd}>
                  {isSavingAd ? "Saving Ad..." : (editingAdId ? "Save Changes" : "Create Ad Banner")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Custom Message Action Modal */}
      {customMsgModal && customMsgModal.isOpen && (
        <div className="modal-overlay" onClick={() => !isSubmittingCustomMsg && setCustomMsgModal(null)} style={{ zIndex: 1100 }}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "520px", borderRadius: "16px", padding: "24px", background: "white", boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", borderBottom: "1px solid #f1f5f9", paddingBottom: "12px" }}>
              <h3 style={{ margin: 0, fontSize: "18px", fontWeight: "700", color: "#0f172a", display: "flex", alignItems: "center", gap: "8px" }}>
                {customMsgModal.type === "APPROVE_BRAND" && <><CheckCircle2 style={{ color: "#10b981" }} size={20} /> Approve Brand Listing</>}
                {customMsgModal.type === "DECLINE_BRAND" && <><XCircle style={{ color: "#ef4444" }} size={20} /> Decline Brand Listing</>}
                {customMsgModal.type === "APPROVE_INVESTOR" && <><CheckCircle2 style={{ color: "#10b981" }} size={20} /> Approve Investor Lead</>}
                {customMsgModal.type === "DECLINE_INVESTOR" && <><XCircle style={{ color: "#ef4444" }} size={20} /> Decline Investor Lead</>}
                {customMsgModal.type === "ASSIGN_BRAND" && <><UserCheck style={{ color: "#4f46e5" }} size={20} /> Update Brand Assignment</>}
              </h3>
              <button
                onClick={() => !isSubmittingCustomMsg && setCustomMsgModal(null)}
                style={{ background: "none", border: "none", cursor: "pointer", color: "#64748b", padding: "4px" }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ marginBottom: "20px" }}>
              <p style={{ fontSize: "14px", color: "#334155", marginBottom: "12px", lineHeight: "1.5" }}>
                Target: <strong>{customMsgModal.targetItem?.name || customMsgModal.targetItem?.title || "Item"}</strong>
              </p>

              <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#475569", marginBottom: "6px" }}>
                Custom Message / Admin Note (Optional):
              </label>
              <textarea
                rows={4}
                value={customMessageText}
                onChange={(e) => setCustomMessageText(e.target.value)}
                placeholder={
                  customMsgModal.type.includes("DECLINE")
                    ? "Provide reason for declining (e.g. Incomplete details, invalid contact info, policy mismatch)..."
                    : customMsgModal.type.includes("ASSIGN")
                    ? "Add a note regarding this investor assignment for audit logs and email notification..."
                    : "Add custom note or welcome message for this approval..."
                }
                style={{
                  width: "100%",
                  borderRadius: "8px",
                  border: "1px solid #cbd5e1",
                  padding: "10px 12px",
                  fontSize: "13px",
                  color: "#0f172a",
                  outline: "none",
                  resize: "vertical",
                  fontFamily: "inherit"
                }}
              />
              <p style={{ fontSize: "11px", color: "#94a3b8", marginTop: "4px" }}>
                This custom message will be saved into the audit log and included in email notifications.
              </p>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
              <button
                className="admin-btn admin-btn-details"
                onClick={() => setCustomMsgModal(null)}
                disabled={isSubmittingCustomMsg}
                style={{ padding: "8px 16px", fontSize: "13px" }}
              >
                Cancel
              </button>
              <button
                className={`admin-btn ${customMsgModal.type.includes("DECLINE") ? "admin-btn-decline" : "admin-btn-approve"}`}
                onClick={handleConfirmCustomMsgAction}
                disabled={isSubmittingCustomMsg}
                style={{ padding: "8px 20px", fontSize: "13px", fontWeight: "700" }}
              >
                {isSubmittingCustomMsg ? "Processing..." : "Confirm & Save to Log"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
