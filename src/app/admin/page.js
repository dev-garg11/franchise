"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Building, Users, FileText, CheckCircle, CheckCircle2, XCircle, Trash2, LogOut,
  Home, Search, LayoutDashboard, ShieldCheck, Mail, Phone, MapPin,
  UploadCloud, Eye, Edit3, Wrench, Megaphone, Image as ImageIcon, RefreshCw, Filter, Clock, UserCheck, X, Menu
} from "lucide-react";
import AdminSidebar from "@/components/admin/AdminSidebar";
import DashboardTab from "@/components/admin/DashboardTab";
import BrandsTab from "@/components/admin/BrandsTab";
import InvestorsTab from "@/components/admin/InvestorsTab";
import BlogsTab from "@/components/admin/BlogsTab";
import AdsTab from "@/components/admin/AdsTab";
import LogsTab from "@/components/admin/LogsTab";
import ServicesTab from "@/components/admin/ServicesTab";
import SeoTab from "@/components/admin/SeoTab";
import SeoEditModal from "@/components/admin/SeoEditModal";
import SkeletonLoader from "@/components/admin/SkeletonLoader";
import Pagination from "@/components/Pagination";
import { clearBrandsCache } from "@/lib/brandsCache";
import { getAdminCache, setAdminCache, invalidateAdminCache } from "@/lib/adminCache";
import { logActivity } from "@/lib/logger";
import { REGISTRATION_INVESTMENT_OPTIONS, getFilteredMaxLimits } from "@/lib/investmentData";
import { BRAND_CATEGORIES, BRAND_SECTORS_MAP, ALL_INDIAN_STATES } from "@/lib/brandConstants";
import { DISTRICTS_BY_STATE } from "@/lib/districtsData";
import { decodeHtmlEntities, cleanBrandPlainText, sanitizeBrandHtml } from "@/lib/brandFormatters";
import { generateBrandSeoData } from "@/lib/brandSeoGenerator";
import { validateArea, validateBrandName, validateImageUrl } from "@/lib/seo/validate";
import { toast, Swal } from "@/lib/swal";

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
  return cleanBrandPlainText(str, {}, 250);
};

const ADMIN_OVERVIEW_CACHE_KEY = "admin_overview_v3";

const getListPayload = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (payload && !payload.error && Array.isArray(payload.data)) return payload.data;
  return null;
};

async function fetchAdminJson(url, attempts = 3) {
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    try {
      const response = await Promise.race([
        fetch(url, { cache: "no-store" }),
        new Promise((_, reject) => window.setTimeout(() => {
          const timeoutError = new Error("Request timed out");
          timeoutError.name = "TimeoutError";
          reject(timeoutError);
        }, 20000))
      ]);
      if (response.ok) {
        return await response.json();
      }
    } catch (error) {
      if (attempt === attempts - 1 && error?.name !== "TimeoutError") {
        console.warn(`Admin request failed: ${url}`, error?.message || error);
      }
    }
    await new Promise((resolve) => window.setTimeout(resolve, 700 * (attempt + 1)));
  }
  return null;
}

async function fetchAdminJsonWithTimeout(url, timeoutMs = 12000) {
  try {
    const response = await Promise.race([
      fetch(url, { cache: "no-store" }),
      new Promise((_, reject) => window.setTimeout(() => {
        const timeoutError = new Error("Request timed out");
        timeoutError.name = "TimeoutError";
        reject(timeoutError);
      }, timeoutMs))
    ]);
    if (!response.ok) return null;
    return await response.json();
  } catch (error) {
    if (error?.name !== "TimeoutError") {
      console.warn(`Admin request failed: ${url}`, error?.message || error);
    }
    return null;
  }
}

export default function AdminDashboard({ initialTab = "dashboard" }) {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);
  const [activeTab, setActiveTab] = useState(initialTab); // dashboard, brands, investors, blogs, services, ads, logs
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [brandStatusFilter, setBrandStatusFilter] = useState("all");
  const [brandCategoryFilter, setBrandCategoryFilter] = useState("");
  const [brandStateFilter, setBrandStateFilter] = useState("");
  const [brandSortOrder, setBrandSortOrder] = useState("newest");
  const [investorSortOrder, setInvestorSortOrder] = useState("newest");
  const [blogStatusFilter, setBlogStatusFilter] = useState("all");
  const [blogSortOrder, setBlogSortOrder] = useState("newest");
  const [adPositionFilter, setAdPositionFilter] = useState("all");
  const [adStatusFilter, setAdStatusFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");


  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    setSearchTerm("");
    setMobileSidebarOpen(false);
    const hrefMap = {
      dashboard: "/admin",
      brands: "/admin/brands",
      investors: "/admin/investors",
      blogs: "/admin/blogs",
      services: "/admin/services",
      ads: "/admin/ads",
      logs: "/admin/logs",
      seo: "/admin/seo"
    };
    if (hrefMap[tabId] && typeof window !== "undefined") {
      window.history.pushState(null, "", hrefMap[tabId]);
    }
  };

  useEffect(() => {
    const handlePopState = () => {
      if (typeof window === "undefined") return;
      const path = window.location.pathname.replace(/\/+$/, "") || "/admin";
      const pathMap = {
        "/admin": "dashboard",
        "/admin/brands": "brands",
        "/admin/investors": "investors",
        "/admin/blogs": "blogs",
        "/admin/services": "services",
        "/admin/ads": "ads",
        "/admin/logs": "logs",
        "/admin/seo": "seo"
      };
      const matchedTab = pathMap[path];
      if (matchedTab) {
        setActiveTab(matchedTab);
        setSearchTerm("");
        setMobileSidebarOpen(false);
      }
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  // Activity Logs State
  const [logs, setLogs] = useState([]);
  const [totalLogs, setTotalLogs] = useState(0);
  const [allLogsCount, setAllLogsCount] = useState({ admin: 0, brand: 0, investor: 0 });
  const [logsLoading, setLogsLoading] = useState(true);
  const [logPanelFilter, setLogPanelFilter] = useState("all");
  const [logSearch, setLogSearch] = useState("");
  const [logPage, setLogPage] = useState(1);
  const [logsPerPage, setLogsPerPage] = useState(10);

    // SEO & AI Optimization Engine State
  const [seoBrands, setSeoBrands] = useState([]);
  const [seoLoading, setSeoLoading] = useState(false);
  const [selectedSeoBrandId, setSelectedSeoBrandId] = useState(null);
  const [isSeoModalOpen, setIsSeoModalOpen] = useState(false);
  const [isSeoSaving, setIsSeoSaving] = useState(false);
  const [regeneratingSeoId, setRegeneratingSeoId] = useState(null);
  const [isBatchGeneratingSeo, setIsBatchGeneratingSeo] = useState(false);

  const fetchSeoTab = async () => {
    setSeoLoading(true);
    try {
      const res = await fetchAdminJsonWithTimeout("/api/admin/seo");
      if (res && res.success && Array.isArray(res.brands)) {
        setSeoBrands(res.brands);
      }
    } catch (err) {
      console.error("Failed to fetch SEO tab brands:", err);
    } finally {
      setSeoLoading(false);
    }
  };

  const handleOpenSeoModal = (brandId) => {
    setSelectedSeoBrandId(brandId);
    setIsSeoModalOpen(true);
  };

  const handleSaveSeo = async ({ brandId, seoData, faqs, schemaData, seoStatus }) => {
    setIsSeoSaving(true);
    try {
      const res = await fetch(`/api/admin/seo/${brandId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ seoData, faqs, schemaData, seoStatus })
      });
      const data = await res.json();
      if (data.success) {
        const score = data.brand?.seoData?.rankMathScore;
        toast.success(`SEO saved successfully — live score: ${Number.isFinite(score) ? score : 0}/100`);
        setIsSeoModalOpen(false);
        fetchSeoTab();
      } else {
        toast.error(data.error || "Failed to save SEO strategy");
      }
    } catch (err) {
      console.error("Error saving SEO:", err);
      toast.error("Network error while saving SEO strategy");
    } finally {
      setIsSeoSaving(false);
    }
  };

  const handleRegenerateSeo = async (brandId) => {
    setRegeneratingSeoId(brandId);
    try {
      const res = await fetch(`/api/admin/seo/${brandId}`, {
        method: "POST"
      });
      const data = await res.json();
      if (data.success) {
        toast.success(data.message || "SEO generated successfully!");
        fetchSeoTab();
        return data;
      } else {
        toast.error(data.error || "Failed to generate SEO");
      }
    } catch (err) {
      console.error("Error regenerating SEO:", err);
      toast.error("Network error during AI SEO generation");
    } finally {
      setRegeneratingSeoId(null);
    }
    return null;
  };

  const handleBatchGenerateSeo = async () => {
    const isConfirmed = await Swal.confirm(
      "Are you sure you want to run AI SEO optimization for all brands? This will update Rank Math metadata, 850+ words pillar guides, and Schema.org markup.",
      "Batch AI SEO Optimization"
    );
    if (!isConfirmed) return;

    setIsBatchGeneratingSeo(true);
    try {
      const res = await fetch("/api/admin/seo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "batch-generate" })
      });
      const data = await res.json();
      if (data.success) {
        toast.success(data.message || "Batch SEO generation complete!");
        fetchSeoTab();
      } else {
        toast.error(data.error || "Batch generation failed");
      }
    } catch (err) {
      console.error("Batch SEO error:", err);
      toast.error("Network error during batch SEO generation");
    } finally {
      setIsBatchGeneratingSeo(false);
    }
  };

  // Custom Message Action Modal State
  const [customMsgModal, setCustomMsgModal] = useState(null); // { isOpen: boolean, type: string, targetItem: object, extraPayload?: object }
  const [customMessageText, setCustomMessageText] = useState("");
  const [investmentAmount, setInvestmentAmount] = useState("");
  const [investedBrandId, setInvestedBrandId] = useState("");
  const [investedBrandName, setInvestedBrandName] = useState("");
  const [isSubmittingCustomMsg, setIsSubmittingCustomMsg] = useState(false);

  const fetchLogs = async ({ dashboard = false } = {}) => {
    const requestPage = dashboard ? 1 : logPage;
    const requestLimit = dashboard ? 10 : logsPerPage;
    const cacheKey = dashboard
      ? "admin_logs_dashboard"
      : `admin_logs_${requestPage}_${requestLimit}_${logPanelFilter}_${logSearch}`;
    const cached = getAdminCache(cacheKey);
    if (cached) {
      setLogs(cached.logs);
      setTotalLogs(cached.total);
      if (cached.allLogsCount) setAllLogsCount(cached.allLogsCount);
    } else if (logs.length === 0) {
      setLogsLoading(true);
    }
    try {
      const query = new URLSearchParams();
      query.set("page", requestPage);
      query.set("limit", requestLimit);
      if (!dashboard && logPanelFilter && logPanelFilter !== "all") query.set("panel", logPanelFilter);
      if (!dashboard && logSearch) query.set("search", logSearch);

      const [data, allData] = await Promise.all([
        fetchAdminJsonWithTimeout(`/api/logs?${query.toString()}`),
        dashboard ? Promise.resolve(null) : fetchAdminJsonWithTimeout(`/api/logs?limit=1000`)
      ]);

      let logsList = [];
      let totalCount = 0;
      if (data) {
        if (data.data) {
          logsList = data.data;
          totalCount = data.total;
        } else {
          logsList = data;
          totalCount = data.length;
        }
        setLogs(logsList);
        setTotalLogs(totalCount);
      }

      let counts = allLogsCount;
      if (allData) {
        const fullList = Array.isArray(allData) ? allData : (allData.data || []);
        counts = {
          admin: fullList.filter(l => (l.panel || "").toLowerCase() === "admin").length,
          brand: fullList.filter(l => (l.panel || "").toLowerCase() === "brand").length,
          investor: fullList.filter(l => (l.panel || "").toLowerCase() === "investor").length
        };
        setAllLogsCount(counts);
      }

      if (data) {
        setAdminCache(cacheKey, { logs: logsList, total: totalCount, allLogsCount: counts });
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
    } else if (activeTab === "dashboard") {
      fetchLogs({ dashboard: true });
    }
  }, [activeTab, logPage, logsPerPage, logPanelFilter, logSearch]);

  const handleDeleteLog = async (id) => {
    const isConfirmed = await Swal.confirm("Are you sure you want to delete this audit log entry?", "Delete Log Entry");
    if (!isConfirmed) return;
    try {
      const res = await fetch(`/api/logs?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        invalidateAdminCache("admin_logs");
        setLogs(logs.filter(l => l.id !== id && l._id !== id)); toast.success("Audit log entry deleted!");
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
    const isConfirmed = await Swal.confirm(`Are you sure you want to clear all logs for ${panelText}? This action cannot be undone.`, "Clear Activity Logs"); if (!isConfirmed) return;
    try {
      const query = logPanelFilter !== "all" ? `?clearAll=true&panel=${logPanelFilter}` : `?clearAll=true`;
      const res = await fetch(`/api/logs${query}`, { method: "DELETE" });
      if (res.ok) {
        invalidateAdminCache("admin_logs");
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
  const [totalBrands, setTotalBrands] = useState(0);
  const [pendingBrandsCount, setPendingBrandsCount] = useState(0);
  const [investors, setInvestors] = useState([]);
  const [allInvestors, setAllInvestors] = useState([]);
  const [totalInvestors, setTotalInvestors] = useState(0);
  const investorAssignPool = (allInvestors && allInvestors.length > 0) ? allInvestors : (investors || []);
  const [blogs, setBlogs] = useState([]);
  const [totalBlogs, setTotalBlogs] = useState(0);
  const [services, setServices] = useState([]);
  const [totalServices, setTotalServices] = useState(0);
  const [ads, setAds] = useState([]);
  const [totalAds, setTotalAds] = useState(0);
  const [allBrandsForSelect, setAllBrandsForSelect] = useState([]);
  const [loading, setLoading] = useState(true);


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
    mediaType: "image",
    textColor: "#ffffff",
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

  const handleAdminImageFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file (PNG, JPG, WEBP).");
      return;
    }
    try {
      toast.info("Uploading image...");
      const formData = new FormData();
      formData.append("file", file);
      formData.append("slug", adminBrandForm.name || "brand");

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (res.ok && data.url) {
        setAdminBrandForm((prev) => ({ ...prev, image: data.url }));
        toast.success("Image uploaded successfully!");
      } else {
        toast.error(data.error || "Failed to upload image.");
      }
    } catch (err) {
      console.error("Upload error:", err);
      toast.error("Network error while uploading image.");
    }
  };

  const handleSaveAdminBrand = async (e) => {
    e.preventDefault();
    if (!editingBrand) return;

    // Phase 1 Validation
    const nameVal = validateBrandName(adminBrandForm.name);
    if (!nameVal.isValid) {
      toast.warning(nameVal.reason || "Invalid brand name. Test/dummy names cannot be approved.");
      return;
    }

    let sanitizedArea = adminBrandForm.areaRequired;
    if (adminBrandForm.areaRequired && String(adminBrandForm.areaRequired).trim()) {
      const areaVal = validateArea(adminBrandForm.areaRequired);
      if (!areaVal.isValid) {
        toast.warning(`Invalid Area: ${areaVal.reason}. Must be between 50 and 50,000 sq ft.`);
        return;
      }
      sanitizedArea = areaVal.value;
    } else {
      sanitizedArea = null;
    }

    if (adminBrandForm.image && String(adminBrandForm.image).trim()) {
      const imgVal = validateImageUrl(adminBrandForm.image);
      if (!imgVal.isValid) {
        toast.warning(`Invalid Image: ${imgVal.reason}`);
        return;
      }
    }

    const rangeIndex = REGISTRATION_INVESTMENT_OPTIONS.indexOf(adminBrandForm.investment_range);
    const maxIndex = REGISTRATION_INVESTMENT_OPTIONS.indexOf(adminBrandForm.max_investment_limit);
    if (adminBrandForm.investment_range && adminBrandForm.max_investment_limit && maxIndex < rangeIndex) {
      toast.warning("Max Investment Limit cannot be lower than the selected Investment Range.");
      return;
    }

    setIsSavingAdminBrand(true);
    try {
      const brandId = editingBrand.id || editingBrand._id;
      const rangeMinVal = mapRangeToNumeric(adminBrandForm.investment_range, false);
      const rangeMaxVal = mapRangeToNumeric(adminBrandForm.max_investment_limit, true);

      const payload = {
        ...adminBrandForm,
        areaRequired: sanitizedArea,
        minInvestment: rangeMinVal || editingBrand.minInvestment || 0,
        maxInvestment: rangeMaxVal || editingBrand.maxInvestment || 0,
      };

      const res = await fetch(`/api/brands/${brandId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        toast.success("Brand updated successfully!");
        clearBrandsCache();
        invalidateAdminCache("admin_brands");
        invalidateAdminCache(ADMIN_OVERVIEW_CACHE_KEY);
        fetchData();
        if (activeTab === "brands") fetchBrandsTab();
        setEditBrandModalOpen(false);
        setEditingBrand(null);
        if (selectedItem && (selectedItem.id === brandId || selectedItem._id === brandId)) {
          setSelectedItem(null);
        }
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to update brand.");
      }
    } catch (err) {
      console.error("Failed to save brand edits:", err);
      toast.error("Error updating brand.");
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

  // Tab AJAX Fetchers
  const fetchBrandsTab = async () => {
    const cacheKey = `admin_brands_${brandsPage}_${brandsPerPage}_${searchTerm}_${brandStatusFilter}_${brandCategoryFilter}_${brandStateFilter}_${brandSortOrder}`;
    const cached = getAdminCache(cacheKey);
    if (cached) {
      setTotalBrands(cached.total);
      setBrands(cached.brands);
    }
    try {
      const query = new URLSearchParams();
      if (brandStatusFilter && brandStatusFilter !== "all") query.set("status", brandStatusFilter);
      if (searchTerm) query.set("search", searchTerm);
      const res = await fetch(`/api/brands?${query.toString()}`);
      if (res.ok) {
        const result = await res.json();
        let list = Array.isArray(result) ? result : (result.data || []);
        if (brandCategoryFilter) {
          list = list.filter(b => (b.category || "").toLowerCase() === brandCategoryFilter.toLowerCase());
        }
        if (brandStateFilter) {
          list = list.filter(b => 
            (b.hq || "").toLowerCase().includes(brandStateFilter.toLowerCase()) || 
            (b.location || "").toLowerCase().includes(brandStateFilter.toLowerCase())
          );
        }
        if (brandSortOrder === "oldest") {
          list = [...list].sort((a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0));
        } else {
          list = [...list].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
        }
        setTotalBrands(list.length);
        const start = (brandsPage - 1) * brandsPerPage;
        const pageSlice = list.slice(start, start + brandsPerPage);
        setBrands(pageSlice);
        setAdminCache(cacheKey, { total: list.length, brands: pageSlice });
      }
    } catch (err) {
      console.error("Failed to fetch brands tab:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchInvestorsTab = async () => {
    const cacheKey = `admin_investors_${investorsPage}_${investorsPerPage}_${searchTerm}_${filterBrand}_${filterCategory}_${filterStatus}_${investorSortOrder}`;
    const cached = getAdminCache(cacheKey);
    if (cached) {
      setInvestors(cached.investors);
      setTotalInvestors(cached.total);
    }
    try {
      const query = new URLSearchParams();
      query.set("page", investorsPage);
      query.set("limit", investorsPerPage);
      if (searchTerm) query.set("search", searchTerm);
      if (filterBrand && filterBrand.toLowerCase() !== "all" && filterBrand.toLowerCase() !== "brand: all") query.set("brand", filterBrand);
      if (filterCategory && filterCategory.toLowerCase() !== "all" && filterCategory.toLowerCase() !== "category: all") query.set("category", filterCategory);
      if (filterStatus && filterStatus.toLowerCase() !== "all") query.set("status", filterStatus);
      const res = await Promise.race([
        fetch(`/api/investors?${query.toString()}`, { cache: "no-store" }),
        new Promise((_, reject) => window.setTimeout(() => {
          const timeoutError = new Error("Investor data request timed out");
          timeoutError.name = "TimeoutError";
          reject(timeoutError);
        }, 20000))
      ]);
      if (res.ok) {
        const result = await res.json();
        let list = result.data || result;
        if (investorSortOrder === "oldest") {
          list = [...list].sort((a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0));
        } else {
          list = [...list].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
        }
        const total = result.total || (Array.isArray(list) ? list.length : 0);
        setInvestors(list);
        setTotalInvestors(total);
        setAdminCache(cacheKey, { total, investors: list });
      }
    } catch (err) {
      // A navigation, hot reload or temporary API disconnect should not open
      // the Next.js error overlay. Cached data remains visible when available.
      if (err?.name !== "AbortError" && err?.name !== "TimeoutError") {
        console.warn("Investor data temporarily unavailable:", err?.message || err);
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchBlogsTab = async () => {
    const cacheKey = `admin_blogs_${blogsPage}_${blogsPerPage}_${searchTerm}_${blogStatusFilter}_${blogSortOrder}`;
    const cached = getAdminCache(cacheKey);
    if (cached) {
      setTotalBlogs(cached.total);
      setBlogs(cached.blogs);
    }
    try {
      const query = new URLSearchParams();
      if (searchTerm) query.set("search", searchTerm);
      const res = await fetch(`/api/blogs?${query.toString()}`);
      if (res.ok) {
        const result = await res.json();
        let list = Array.isArray(result) ? result : (result.data || []);
        if (blogStatusFilter && blogStatusFilter !== "all") {
          if (blogStatusFilter === "Published") list = list.filter(b => b.status === "Published" || !b.status);
          if (blogStatusFilter === "Drafts") list = list.filter(b => b.status === "Draft");
        }
        if (blogSortOrder === "oldest") {
          list = [...list].sort((a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0));
        } else {
          list = [...list].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
        }
        setTotalBlogs(list.length);
        const start = (blogsPage - 1) * blogsPerPage;
        const pageSlice = list.slice(start, start + blogsPerPage);
        setBlogs(pageSlice);
        setAdminCache(cacheKey, { total: list.length, blogs: pageSlice });
      }
    } catch (err) {
      console.error("Failed to fetch blogs tab:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchServicesTab = async () => {
    const cacheKey = `admin_services_${servicesPage}_${servicesPerPage}_${searchTerm}`;
    const cached = getAdminCache(cacheKey);
    if (cached) {
      setServices(cached.services);
      setTotalServices(cached.total);
    }
    try {
      const query = new URLSearchParams();
      query.set("page", servicesPage);
      query.set("limit", servicesPerPage);
      if (searchTerm) query.set("search", searchTerm);
      const res = await fetch(`/api/services?${query.toString()}`);
      if (res.ok) {
        const result = await res.json();
        const list = result.data || result;
        const total = result.total !== undefined ? result.total : (Array.isArray(list) ? list.length : 0);
        setServices(list);
        setTotalServices(total);
        setAdminCache(cacheKey, { total, services: list });
      }
    } catch (err) {
      console.error("Failed to fetch services tab:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAdsTab = async () => {
    const cacheKey = `admin_ads_${adsPage}_${adsPerPage}_${searchTerm}_${adPositionFilter}_${adStatusFilter}`;
    const cached = getAdminCache(cacheKey);
    if (cached) {
      setTotalAds(cached.total);
      setAds(cached.ads);
    }
    try {
      const query = new URLSearchParams();
      if (searchTerm) query.set("search", searchTerm);
      const res = await fetch(`/api/advertisements?${query.toString()}`);
      if (res.ok) {
        const result = await res.json();
        let list = Array.isArray(result) ? result : (result.data || []);
        if (adPositionFilter && adPositionFilter !== "all") {
          list = list.filter(a => adPositionFilter === "brand_sidebar" ? (a.position === "brand_sidebar" || a.position === "brands_sidebar") : a.position === adPositionFilter);
        }
        if (adStatusFilter && adStatusFilter !== "all") {
          if (adStatusFilter === "active") list = list.filter(a => a.isActive !== false);
          if (adStatusFilter === "paused") list = list.filter(a => a.isActive === false);
        }
        setTotalAds(list.length);
        const start = (adsPage - 1) * adsPerPage;
        const pageSlice = list.slice(start, start + adsPerPage);
        setAds(pageSlice);
        setAdminCache(cacheKey, { total: list.length, ads: pageSlice });
      }
    } catch (err) {
      console.error("Failed to fetch ads tab:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setBrandsPage(1);
    setInvestorsPage(1);
    setBlogsPage(1);
    setServicesPage(1);
    setAdsPage(1);
    setLogPage(1);
  }, [
    searchTerm,
    filterBrand,
    filterCategory,
    filterStatus,
    logPanelFilter,
    logSearch,
    brandStatusFilter,
    brandCategoryFilter,
    brandStateFilter,
    brandSortOrder,
    investorSortOrder,
    blogStatusFilter,
    blogSortOrder,
    adPositionFilter,
    adStatusFilter
  ]);

  useEffect(() => {
    if (authorized && activeTab === "brands") fetchBrandsTab();
  }, [authorized, activeTab, brandsPage, brandsPerPage, searchTerm, brandStatusFilter, brandCategoryFilter, brandStateFilter, brandSortOrder]);

  useEffect(() => {
    if (authorized && activeTab === "investors") fetchInvestorsTab();
  }, [authorized, activeTab, investorsPage, investorsPerPage, searchTerm, filterBrand, filterCategory, filterStatus, investorSortOrder]);

  // Investor deep-links load all brand names needed by the Brand filter
  useEffect(() => {
    if (!authorized || activeTab !== "investors" || allBrandsForSelect.length > 0) return;
    let cancelled = false;
    fetchAdminJson("/api/brands").then((payload) => {
      if (cancelled) return;
      const list = getListPayload(payload) || [];
      setAllBrandsForSelect(list.filter((brand) => {
        const status = String(brand.status || "Approved").toLowerCase();
        return status !== "declined" && status !== "rejected";
      }));
    });
    return () => { cancelled = true; };
  }, [authorized, activeTab, allBrandsForSelect.length]);

  useEffect(() => {
    if (authorized && activeTab === "blogs") fetchBlogsTab();
  }, [authorized, activeTab, blogsPage, blogsPerPage, searchTerm, blogStatusFilter, blogSortOrder]);

  useEffect(() => {
    if (authorized && activeTab === "services") fetchServicesTab();
  }, [authorized, activeTab, servicesPage, servicesPerPage, searchTerm]);

  useEffect(() => {
    if (authorized && activeTab === "ads") fetchAdsTab();
  }, [authorized, activeTab, adsPage, adsPerPage, searchTerm, adPositionFilter, adStatusFilter]);

    useEffect(() => {
    if (authorized && activeTab === "seo") fetchSeoTab();
  }, [authorized, activeTab]);

  const applyOverviewData = (data) => {
    if (!data) return;
    const { brandsData, investorsData, blogsData, servicesData, adsData } = data;

    const brandsList = getListPayload(brandsData);
    const investorsList = getListPayload(investorsData);
    const blogsList = getListPayload(blogsData);
    const servicesList = getListPayload(servicesData);
    const adsList = getListPayload(adsData);

    if (brandsList) {
      const list = brandsList;
      setAllBrandsForSelect(list);
      setTotalBrands(list.length);
      setPendingBrandsCount(list.filter(b => b.status === "Pending").length);
      if (activeTab === "dashboard") {
        setBrands(list.slice(0, 10));
      }
    }
    if (investorsList) {
      const list = investorsList;
      setAllInvestors(list);
      setTotalInvestors(list.length);
      if (activeTab === "dashboard") {
        setInvestors(list.slice(0, 10));
      }
    }
    if (blogsList) {
      const list = blogsList;
      setTotalBlogs(list.length);
      if (activeTab === "dashboard") {
        setBlogs(list.slice(0, 10));
      }
    }
    if (servicesList) {
      const list = servicesList;
      setTotalServices(list.length);
      if (activeTab === "dashboard") {
        setServices(list.slice(0, 10));
      }
    }
    if (adsList) {
      const list = adsList;
      setTotalAds(list.length);
      if (activeTab === "dashboard") {
        setAds(list.slice(0, 10));
      }
    }
  };

  const fetchData = async () => {
    const cachedOverview = getAdminCache(ADMIN_OVERVIEW_CACHE_KEY);
    if (cachedOverview) {
      applyOverviewData(cachedOverview);
    }
    if (!cachedOverview && activeTab === "dashboard") {
      setLoading(true);
    }
    try {
      const [brandsData, investorsData, blogsData, servicesData, adsData] = await Promise.all([
        fetchAdminJsonWithTimeout("/api/brands", 15000),
        fetchAdminJsonWithTimeout("/api/investors", 15000),
        fetchAdminJsonWithTimeout("/api/blogs", 15000),
        fetchAdminJsonWithTimeout("/api/services", 15000),
        fetchAdminJsonWithTimeout("/api/advertisements", 15000)
      ]);

      const overviewPayload = { brandsData, investorsData, blogsData, servicesData, adsData };
      const hasCompleteOverview = [brandsData, investorsData, blogsData, servicesData, adsData]
        .every((payload) => getListPayload(payload) !== null);
      if (hasCompleteOverview) {
        setAdminCache(ADMIN_OVERVIEW_CACHE_KEY, overviewPayload);
      }
      applyOverviewData(overviewPayload);
    } catch (error) {
      console.error("Error loading overview data:", error);
    } finally {
      setLoading(false);
    }
  };

  const initialFetchDoneRef = useRef(false);
  useEffect(() => {
    if (authorized) {
      const cached = getAdminCache(ADMIN_OVERVIEW_CACHE_KEY);
      if (cached) {
        applyOverviewData(cached);
        setLoading(false);
      }
      if (!initialFetchDoneRef.current) {
        initialFetchDoneRef.current = true;
        fetchData();
      } else if (activeTab === "dashboard" && !getAdminCache(ADMIN_OVERVIEW_CACHE_KEY)) {
        fetchData();
      }
    }
  }, [activeTab, authorized]);

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
      const loadInvestorsPool = async () => {
        if (allInvestors.length === 0) {
          try {
            const res = await fetch("/api/investors", { cache: "no-store" });
            if (res.ok) {
              const data = await res.json();
              const list = Array.isArray(data) ? data : (data.data || []);
              if (Array.isArray(list) && list.length > 0) {
                setAllInvestors(list);
                setTotalInvestors(list.length);
              }
            }
          } catch (e) {
            console.warn("Could not load full investors pool for brand modal:", e);
          }
        }
      };
      loadInvestorsPool();

      const pool = allInvestors.length > 0 ? allInvestors : investors;
      const brandId = selectedItem.id || selectedItem._id;
      const attached = pool
        .filter(inv => inv.assignedBrands && (inv.assignedBrands.includes(brandId) || inv.assignedBrands.includes(selectedItem._id)))
        .map(inv => inv.id || inv._id);
      setSelectedInvestorsForBrand(attached);
      setAssignFilterMode("matching");
      setAssignSearch("");
    }
  }, [selectedItem, modalType, allInvestors.length, investors]);

  const openCustomMsgModal = (type, targetItem, extraPayload = {}) => {
    setCustomMsgModal({
      isOpen: true,
      type,
      targetItem,
      extraPayload
    });
    setCustomMessageText(targetItem?.investmentNotes || "");
    if (type === "MARK_INVESTED" && targetItem) {
      let initBrandId = targetItem.brandId || "";
      let initBrandName = targetItem.brandName || "";
      if (!initBrandId && Array.isArray(targetItem.assignedBrands) && targetItem.assignedBrands.length > 0) {
        initBrandId = targetItem.assignedBrands[0];
      }
      if (initBrandId && !initBrandName) {
        const found = (allBrandsForSelect || []).find(b => String(b.id || b._id) === String(initBrandId));
        if (found) initBrandName = found.name;
      }
      setInvestedBrandId(initBrandId);
      setInvestedBrandName(initBrandName);
    } else {
      setInvestedBrandId("");
      setInvestedBrandName("");
    }
    setInvestmentAmount(targetItem?.investmentAmount ? String(targetItem.investmentAmount) : "");
  };

  const handleConfirmCustomMsgAction = async () => {
    if (!customMsgModal) return;
    setIsSubmittingCustomMsg(true);
    const { type, targetItem, extraPayload } = customMsgModal;
    const adminEmail = localStorage.getItem("adminEmail") || "admin@franchiseroots.com";
    const adminName = "Administrator";

    if (type === "MARK_INVESTED") {
      const amount = Number(String(investmentAmount).replace(/[^0-9.]/g, ""));
      if (!Number.isFinite(amount) || amount <= 0) {
        toast.error("Enter a valid investment amount.");
        setIsSubmittingCustomMsg(false);
        return;
      }
    }

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
          invalidateAdminCache("admin_brands");
          invalidateAdminCache(ADMIN_OVERVIEW_CACHE_KEY);
          fetchData();
          if (activeTab === "brands") fetchBrandsTab(); toast.success(`Brand ${status.toLowerCase()} successfully!`);
          fetchLogs();
          if (selectedItem && (selectedItem.id === brandId || selectedItem._id === brandId)) {
            setSelectedItem(null);
          }
        } else {
          toast.error(`Failed to ${status.toLowerCase()} brand.`);
        }
      } else if (type === "APPROVE_INVESTOR" || type === "DECLINE_INVESTOR") {
        const status = type === "APPROVE_INVESTOR" ? "Approved" : "Rejected";
        const invId = targetItem._id || targetItem.id;
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
          invalidateAdminCache("admin_investors");
          invalidateAdminCache(ADMIN_OVERVIEW_CACHE_KEY);
          fetchData();
          if (activeTab === "investors") fetchInvestorsTab(); toast.success(`Investor lead ${status.toLowerCase()} successfully!`);
          fetchLogs();
          if (selectedItem && (selectedItem.id === invId || selectedItem._id === invId)) {
            setSelectedItem(null);
          }
        } else {
          toast.error(`Failed to ${status === "Approved" ? "approve" : "decline"} investor lead.`);
        }
      } else if (type === "MARK_INVESTED") {
        const invId = targetItem._id || targetItem.id;
        const amount = Number(String(investmentAmount).replace(/[^0-9.]/g, ""));
        const res = await fetch(`/api/investors/${invId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            investmentStatus: "Invested",
            investmentAmount: amount,
            investmentDate: new Date().toISOString(),
            investmentNotes: customMessageText,
            ...(investedBrandId ? { brandId: investedBrandId, brandName: investedBrandName } : {}),
            adminEmail,
            adminName
          })
        });
        if (res.ok) {
          invalidateAdminCache("admin_investors");
          invalidateAdminCache("admin_brands");
          invalidateAdminCache(ADMIN_OVERVIEW_CACHE_KEY);
          fetchData();
          if (activeTab === "investors") fetchInvestorsTab();
          if (activeTab === "brands") fetchBrandsTab();
          fetchLogs();
          setCustomMsgModal(null);
          toast.success("Investment marked successfully.");
          setInvestors(prev => (prev || []).map(inv => {
            const isMatch = (inv._id && (inv._id === invId || inv._id === targetItem._id)) ||
                            (inv.id && (inv.id === invId || inv.id === targetItem.id));
            if (isMatch) {
              return {
                ...inv,
                investmentStatus: "Invested",
                investmentAmount: amount,
                ...(investedBrandId ? { brandId: investedBrandId, brandName: investedBrandName } : {})
              };
            }
            return inv;
          }));
        } else {
          const errData = await res.json().catch(() => ({}));
          toast.error(errData.error || "Failed to save investment.");
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
          toast.success("Brand assignment and custom log updated successfully!");
          invalidateAdminCache("admin_investors");
          invalidateAdminCache("admin_brands");
          invalidateAdminCache(ADMIN_OVERVIEW_CACHE_KEY);
          fetchData();
          if (activeTab === "investors") fetchInvestorsTab();
          if (activeTab === "brands") fetchBrandsTab();
          fetchLogs();
        } else {
          toast.error("Failed to save brand assignment.");
        }
      }
    } catch (err) {
      console.error("Action error:", err);
      alert("An error occurred while processing the request.");
    } finally {
      setIsSubmittingCustomMsg(false);
      setCustomMsgModal(null);
      setCustomMessageText("");
      setInvestedBrandId("");
      setInvestedBrandName("");
      setInvestmentAmount("");
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
    }
  }, [router]);


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
    const isConfirmed = await Swal.confirm("Are you sure you want to permanently delete this brand registration?", "Delete Brand Registration"); if (!isConfirmed) return;
    try {
      const res = await fetch(`/api/brands/${id}`, {
        method: "DELETE"
      });
      if (res.ok) {
        clearBrandsCache();
        invalidateAdminCache("admin_brands");
        invalidateAdminCache(ADMIN_OVERVIEW_CACHE_KEY);
        fetchData();
        if (activeTab === "brands") fetchBrandsTab();
        fetchLogs();
        if (selectedItem && selectedItem.id === id) setSelectedItem(null); toast.success("Brand registration deleted successfully!");
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
    const isConfirmed = await Swal.confirm("Are you sure you want to permanently delete this investor lead?", "Delete Investor Lead"); if (!isConfirmed) return;
    try {
      const res = await fetch(`/api/investors/${id}`, {
        method: "DELETE"
      });
      if (res.ok) {
        invalidateAdminCache("admin_investors");
        invalidateAdminCache(ADMIN_OVERVIEW_CACHE_KEY);
        fetchData();
        if (activeTab === "investors") fetchInvestorsTab(); toast.success("Investor lead deleted successfully!");
        fetchLogs();
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
      toast.warning("Title and content are required.");
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
        toast.success(editingBlogId ? "Blog updated successfully!" : "Blog created successfully!");
        setBlogModalOpen(false);
        invalidateAdminCache("admin_blogs");
        invalidateAdminCache(ADMIN_OVERVIEW_CACHE_KEY);
        fetchData();
        if (activeTab === "blogs") fetchBlogsTab();
      } else {
        const errorData = await res.json();
        toast.error(errorData.error || "Failed to save blog post.");
      }
    } catch (err) {
      console.error("Failed to save blog:", err);
      toast.error("An error occurred while saving the blog.");
    } finally {
      setIsSavingBlog(false);
    }
  };

  // Delete Blog record
  const handleDeleteBlog = async (id) => {
    const isConfirmed = await Swal.confirm("Are you sure you want to permanently delete this blog post?", "Delete Blog Post"); if (!isConfirmed) return;
    try {
      const res = await fetch(`/api/blogs/${id}`, {
        method: "DELETE"
      });
      if (res.ok) {
        invalidateAdminCache("admin_blogs");
        invalidateAdminCache(ADMIN_OVERVIEW_CACHE_KEY);
        fetchData();
        if (activeTab === "blogs") fetchBlogsTab();
      } else {
        toast.error("Failed to delete blog post.");
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
      toast.error("File is too large. Maximum size allowed is 5 MB.");
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
      toast.warning("Title and content are required.");
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
        toast.success(editingServiceId ? "Service updated successfully!" : "Service created successfully!");
        setServiceModalOpen(false);
        invalidateAdminCache("admin_services");
        invalidateAdminCache(ADMIN_OVERVIEW_CACHE_KEY);
        fetchData();
        if (activeTab === "services") fetchServicesTab();
      } else {
        const errorData = await res.json();
        toast.error(errorData.error || "Failed to save service.");
      }
    } catch (err) {
      console.error("Failed to save service:", err);
      toast.error("An error occurred while saving the service.");
    } finally {
      setIsSavingService(false);
    }
  };

  // Delete Service record
  const handleDeleteService = async (id) => {
    const isConfirmed = await Swal.confirm("Are you sure you want to permanently delete this service?", "Delete Service"); if (!isConfirmed) return;
    try {
      const res = await fetch(`/api/services/${id}`, {
        method: "DELETE"
      });
      if (res.ok) {
        invalidateAdminCache("admin_services");
        invalidateAdminCache(ADMIN_OVERVIEW_CACHE_KEY);
        fetchData();
        if (activeTab === "services") fetchServicesTab();
      } else {
        toast.error("Failed to delete service.");
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
      toast.error("File is too large. Maximum size allowed is 5 MB.");
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
      mediaType: "image",
      textColor: "#ffffff",
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
      mediaType: ad.mediaType === "video" ? "video" : "image",
      textColor: /^#[0-9a-f]{6}$/i.test(String(ad.textColor || "")) ? ad.textColor : "#ffffff",
      link: ad.link || "/brand-registration",
      badge: ad.badge || "SPONSORED",
      position: ad.position || "homepage_banner",
      isActive: ad.isActive !== undefined ? ad.isActive : true
    });
    setEditingAdId(ad.id || ad._id);
    setAdModalOpen(true);
  };

  const refreshAdsAfterMutation = async () => {
    invalidateAdminCache("admin_ads");
    invalidateAdminCache(ADMIN_OVERVIEW_CACHE_KEY);
    await fetchData();
    if (activeTab === "ads") await fetchAdsTab();
  };

  // Create or Update ad banner DB record
  const handleSaveAd = async (e) => {
    e.preventDefault();
    const normalizedAd = {
      ...adForm,
      title: adForm.title.trim(),
      subtitle: adForm.subtitle.trim(),
      link: adForm.link.trim() || "/brand-registration",
      badge: adForm.badge.trim() || "SPONSORED",
      mediaType: adForm.mediaType === "video" ? "video" : "image",
      textColor: /^#[0-9a-f]{6}$/i.test(String(adForm.textColor || "")) ? adForm.textColor : "#ffffff"
    };
    if (!normalizedAd.title || !normalizedAd.image) {
      toast.warning("Title and Image are required.");
      return;
    }
    setIsSavingAd(true);
    try {
      const url = editingAdId ? `/api/advertisements/${editingAdId}` : "/api/advertisements";
      const method = editingAdId ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(normalizedAd)
      });
      if (res.ok) {
        toast.success(editingAdId ? "Ad Banner updated successfully!" : "Ad Banner created successfully!");
        setAdModalOpen(false);
        await refreshAdsAfterMutation();
      } else {
        const errorData = await res.json();
        toast.error(errorData.error || "Failed to save ad banner.");
      }
    } catch (err) {
      console.error("Failed to save ad banner:", err);
      toast.error("An error occurred while saving the ad banner.");
    } finally {
      setIsSavingAd(false);
    }
  };

  // Toggle active status of an ad banner
  const handleToggleAdActive = async (ad) => {
    const id = ad.id || ad._id;
    const nextIsActive = ad.isActive === false;
    const previousAds = ads;
    setAds((currentAds) => currentAds.map((item) => (
      (item.id || item._id) === id ? { ...item, isActive: nextIsActive } : item
    )));
    try {
      const res = await fetch(`/api/advertisements/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: nextIsActive })
      });
      if (res.ok) {
        await refreshAdsAfterMutation();
      } else {
        setAds(previousAds);
        toast.error("Failed to update ad status.");
      }
    } catch (err) {
      setAds(previousAds);
      console.error("Failed to toggle ad status:", err);
      toast.error("Failed to update ad status.");
    }
  };

  // Delete Ad record
  const handleDeleteAd = async (id) => {
    const isConfirmed = await Swal.confirm("Are you sure you want to permanently delete this ad banner?", "Delete Ad Banner"); if (!isConfirmed) return;
    try {
      const res = await fetch(`/api/advertisements/${id}`, {
        method: "DELETE"
      });
      if (res.ok) {
        toast.success("Ad banner deleted successfully!");
        await refreshAdsAfterMutation();
      } else {
        toast.error("Failed to delete ad banner.");
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
      toast.error("File is too large. Maximum size allowed is 5 MB.");
      return;
    }

    if (file.type.startsWith("video/")) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setAdForm((prev) => ({ ...prev, image: event.target.result, mediaType: "video" }));
      };
      reader.readAsDataURL(file);
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
  const totalBrandsCount = totalBrands;
  const totalInvestorsCount = totalInvestors;

  // Status-tab counts must describe the currently active search/category/location
  // scope, not the unfiltered overview totals.
  const brandFilterScope = (allBrandsForSelect.length > 0 ? allBrandsForSelect : brands).filter((brand) => {
    const term = searchTerm.trim().toLowerCase();
    const matchesSearch = !term || [brand.name, brand.company, brand.category, brand.email]
      .filter(Boolean)
      .some((value) => String(value).toLowerCase().includes(term));
    const matchesCategory = !brandCategoryFilter || (brand.category || "").toLowerCase() === brandCategoryFilter.toLowerCase();
    const stateTerm = brandStateFilter.toLowerCase();
    const matchesState = !stateTerm || (brand.hq || "").toLowerCase().includes(stateTerm) || (brand.location || "").toLowerCase().includes(stateTerm);
    return matchesSearch && matchesCategory && matchesState;
  });
  const brandScopeCounts = {
    all: brandFilterScope.length,
    approved: brandFilterScope.filter((brand) => brand.status === "Approved").length,
    pending: brandFilterScope.filter((brand) => brand.status === "Pending").length,
    declined: brandFilterScope.filter((brand) => brand.status === "Declined" || brand.status === "Rejected").length
  };

  const investorFilterScope = (allInvestors.length > 0 ? allInvestors : investors).filter((investor) => {
    const term = searchTerm.trim().toLowerCase();
    const matchesSearch = !term || [investor.name, investor.email, investor.phone, investor.preferredLocation]
      .filter(Boolean)
      .some((value) => String(value).toLowerCase().includes(term));
    const cleanBrand = (filterBrand || "").trim().toLowerCase();
    const isBrandAll = !cleanBrand || cleanBrand === "all" || cleanBrand === "brand: all";
    const isGeneralOnly = cleanBrand === "general" || cleanBrand === "no-brand";
    let matchesBrand = true;
    if (isGeneralOnly) {
      matchesBrand = !investor.brandName && !investor.brandId && (!investor.assignedBrands || investor.assignedBrands.length === 0);
    } else if (!isBrandAll) {
      const iBrandName = (investor.brandName || investor.targetBrand || "").toLowerCase();
      const iBrandId = String(investor.brandId || investor.targetBrandId || "").toLowerCase();
      const isAssigned = Array.isArray(investor.assignedBrands) && (
        investor.assignedBrands.some(ab => String(ab).toLowerCase() === cleanBrand || String(ab).toLowerCase().includes(cleanBrand) || cleanBrand.includes(String(ab).toLowerCase()))
      );
      matchesBrand = isAssigned || (iBrandId && (iBrandId === cleanBrand || cleanBrand.includes(iBrandId) || iBrandId.includes(cleanBrand))) || (iBrandName && (iBrandName.includes(cleanBrand) || cleanBrand.includes(iBrandName))) || ((investor.comments || "").toLowerCase().includes(cleanBrand));
    }
    const cleanCat = (filterCategory || "").trim().toLowerCase();
    const isCatAll = !cleanCat || cleanCat === "all" || cleanCat === "category: all";
    let matchesCategory = true;
    if (!isCatAll) {
      const iCat = (investor.category || "").toLowerCase();
      const iInds = Array.isArray(investor.industries) ? investor.industries.map(ind => String(ind).toLowerCase()) : [];
      matchesCategory = (iCat && (iCat === cleanCat || iCat.includes(cleanCat) || cleanCat.includes(iCat))) || iInds.some(ind => ind && (ind === cleanCat || ind.includes(cleanCat) || cleanCat.includes(ind)));
    }
    return matchesSearch && matchesBrand && matchesCategory;
  });
  const investorScopeCounts = {
    all: investorFilterScope.length,
    pending: investorFilterScope.filter((investor) => (investor.status || "Pending") === "Pending").length,
    approved: investorFilterScope.filter((investor) => investor.status === "Approved").length,
    rejected: investorFilterScope.filter((investor) => investor.status === "Declined" || investor.status === "Rejected").length
  };

  // Paginated Data Slices (fetched server-side via AJAX)
  const paginatedBrands = brands;
  const paginatedInvestors = investors;
  const paginatedBlogs = blogs;
  const paginatedServices = services;
  const paginatedAds = ads;

  return (
    <div
      className="admin-redesign-layout"
      style={{
        display: "flex",
        minHeight: "100vh",
        backgroundColor: "#f1f5ff",
        fontFamily: "'Inter', sans-serif"
      }}
    >
      {/* 1. Dedicated Reusable Admin Sidebar with live badge counts and mobile drawer */}
      <AdminSidebar
        activeTab={activeTab}
        onTabChange={handleTabChange}
        counts={{
          totalBrands,
          pendingBrandsCount: allBrandsForSelect.filter(b => b.status === "Pending").length || pendingBrandsCount,
          totalInvestors,
          totalBlogs,
          totalServices,
          totalAds
        }}
        adminName="Administrator"
        onLogout={handleLogout}
        mobileOpen={mobileSidebarOpen}
        onMobileClose={() => setMobileSidebarOpen(false)}
      />

      {/* 2. Main Viewport */}
      <div
        className="admin-main-viewport"
        style={{
          flexGrow: 1,
          minWidth: 0,
          marginLeft: "270px",
          width: "calc(100% - 270px)",
          padding: "32px 36px",
          display: "flex",
          flexDirection: "column",
          gap: "24px",
          minHeight: "100vh"
        }}
      >
        {/* Mobile Header Bar (< 900px) */}
        <div
          className="admin-mobile-top-bar"
          style={{
            display: "none",
            alignItems: "center",
            justifyContent: "space-between",
            backgroundColor: "#1d4ed8",
            color: "#ffffff",
            padding: "12px 18px",
            borderRadius: "14px",
            marginBottom: "8px"
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <button
              type="button"
              onClick={() => setMobileSidebarOpen(true)}
              aria-label="Open Admin Menu"
              style={{
                background: "rgba(255, 255, 255, 0.15)",
                border: "none",
                color: "#ffffff",
                padding: "8px",
                borderRadius: "8px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}
            >
              <Menu size={20} />
            </button>
            <div style={{ display: "flex", flexDirection: "column", lineHeight: 1 }}>
              <span style={{ fontWeight: "900", fontSize: "14px", letterSpacing: "0.05em" }}>FRANCHISE ROOTS</span>
              <span style={{ fontSize: "9px", opacity: 0.8, textTransform: "uppercase" }}>Admin Panel</span>
            </div>
          </div>
          <span style={{ fontSize: "12px", background: "rgba(255,255,255,0.2)", padding: "4px 10px", borderRadius: "12px", fontWeight: "600", textTransform: "capitalize" }}>
            {activeTab}
          </span>
        </div>

        {/* Dynamic Tab Views */}
        {activeTab === "dashboard" && (
          <DashboardTab
            brands={allBrandsForSelect.length > 0 ? allBrandsForSelect : brands}
            investors={investors}
            allInvestors={allInvestors}
            blogs={blogs}
            services={services}
            ads={ads}
            logs={logs}
            loading={loading}
            onTabChange={handleTabChange}
            onApproveBrand={handleApprove}
            onDeclineBrand={handleDecline}
            onOpenBlogModal={handleOpenCreateBlog}
            onOpenServiceModal={handleOpenCreateService}
            onOpenAdModal={handleOpenCreateAd}
          />
        )}

        {activeTab === "brands" && (
          <BrandsTab
            brands={brands}
            allBrands={allBrandsForSelect}
            totalBrands={totalBrands}
            allCount={brandScopeCounts.all}
            pendingCount={brandScopeCounts.pending}
            approvedCount={brandScopeCounts.approved}
            declinedCount={brandScopeCounts.declined}
            searchTerm={searchTerm}
            onSearchChange={(val) => setSearchTerm(val)}
            onClearSearch={() => setSearchTerm("")}
            statusFilter={brandStatusFilter}
            onStatusFilterChange={(val) => { setBrandStatusFilter(val); setBrandsPage(1); }}
            categoryFilter={brandCategoryFilter}
            onCategoryFilterChange={(val) => { setBrandCategoryFilter(val); setBrandsPage(1); }}
            stateFilter={brandStateFilter}
            onStateFilterChange={(val) => { setBrandStateFilter(val); setBrandsPage(1); }}
            sortOrder={brandSortOrder}
            onSortOrderChange={(val) => { setBrandSortOrder(val); setBrandsPage(1); }}
            currentPage={brandsPage}
            itemsPerPage={brandsPerPage}
            onPageChange={(p) => setBrandsPage(p)}
            onPerPageChange={(size) => { setBrandsPerPage(size); setBrandsPage(1); }}
            onViewDetails={(brand) => { setSelectedItem(brand); setModalType("brand"); }}
            onEditBrand={handleOpenEditBrand}
            onApproveBrand={handleApprove}
            onDeclineBrand={handleDecline}
            onOpenAddBrand={() => window.open("/brand-registration", "_blank")}
            loading={loading}
          />
        )}

        {activeTab === "investors" && (
          <InvestorsTab
            investors={investors}
            allInvestors={allInvestors}
            totalInvestors={totalInvestors}
            allCount={investorScopeCounts.all}
            pendingCount={investorScopeCounts.pending}
            approvedCount={investorScopeCounts.approved}
            rejectedCount={investorScopeCounts.rejected}
            allBrands={allBrandsForSelect}
            searchTerm={searchTerm}
            onSearchChange={(val) => setSearchTerm(val)}
            onClearSearch={() => setSearchTerm("")}
            statusFilter={filterStatus || "all"}
            onStatusFilterChange={(val) => { setFilterStatus(val === "all" ? "" : val); setInvestorsPage(1); }}
            brandFilter={filterBrand}
            onBrandFilterChange={(val) => { setFilterBrand(val); setInvestorsPage(1); }}
            categoryFilter={filterCategory}
            onCategoryFilterChange={(val) => { setFilterCategory(val); setInvestorsPage(1); }}
            sortOrder={investorSortOrder}
            onSortOrderChange={(val) => { setInvestorSortOrder(val); setInvestorsPage(1); }}
            currentPage={investorsPage}
            itemsPerPage={investorsPerPage}
            onPageChange={(p) => setInvestorsPage(p)}
            onPerPageChange={(size) => { setInvestorsPerPage(size); setInvestorsPage(1); }}
            onViewDetails={(lead) => { setSelectedItem(lead); setModalType("investor"); }}
            onApproveInvestor={handleApproveInvestor}
            onDeclineInvestor={handleDeclineInvestor}
            onMarkInvested={(investor) => openCustomMsgModal("MARK_INVESTED", investor)}
            loading={loading}
          />
        )}

        {activeTab === "blogs" && (
          <BlogsTab
            blogs={blogs}
            totalBlogs={totalBlogs}
            searchTerm={searchTerm}
            onSearchChange={(val) => setSearchTerm(val)}
            onClearSearch={() => setSearchTerm("")}
            statusFilter={blogStatusFilter}
            onStatusFilterChange={(val) => { setBlogStatusFilter(val); setBlogsPage(1); }}
            sortOrder={blogSortOrder}
            onSortOrderChange={(val) => { setBlogSortOrder(val); setBlogsPage(1); }}
            currentPage={blogsPage}
            itemsPerPage={blogsPerPage}
            onPageChange={(p) => setBlogsPage(p)}
            onPerPageChange={(size) => { setBlogsPerPage(size); setBlogsPage(1); }}
            onOpenCreateBlog={handleOpenCreateBlog}
            onEditBlog={handleOpenEditBlog}
            onDeleteBlog={handleDeleteBlog}
            loading={loading}
          />
        )}

        {activeTab === "ads" && (
          <AdsTab
            ads={ads}
            totalAds={totalAds}
            searchTerm={searchTerm}
            onSearchChange={(val) => setSearchTerm(val)}
            onClearSearch={() => setSearchTerm("")}
            positionFilter={adPositionFilter}
            onPositionFilterChange={(val) => { setAdPositionFilter(val); setAdsPage(1); }}
            statusFilter={adStatusFilter}
            onStatusFilterChange={(val) => { setAdStatusFilter(val); setAdsPage(1); }}
            currentPage={adsPage}
            itemsPerPage={adsPerPage}
            onPageChange={(p) => setAdsPage(p)}
            onPerPageChange={(size) => { setAdsPerPage(size); setAdsPage(1); }}
            onOpenCreateAd={handleOpenCreateAd}
            onEditAd={handleOpenEditAd}
            onToggleAdActive={handleToggleAdActive}
            onDeleteAd={handleDeleteAd}
            loading={loading}
          />
        )}

        {activeTab === "logs" && (
          <LogsTab
            logs={logs}
            totalLogs={totalLogs}
            panelCounts={allLogsCount}
            searchTerm={logSearch}
            onSearchChange={(val) => setLogSearch(val)}
            onClearSearch={() => setLogSearch("")}
            panelFilter={logPanelFilter}
            onPanelFilterChange={(val) => { setLogPanelFilter(val); setLogPage(1); }}
            currentPage={logPage}
            itemsPerPage={logsPerPage}
            onPageChange={(p) => setLogPage(p)}
            onPerPageChange={(size) => { setLogsPerPage(size); setLogPage(1); }}
            onRefreshLogs={fetchLogs}
            onDeleteLog={handleDeleteLog}
            onClearAllLogs={handleClearAllLogs}
            loading={logsLoading}
          />
        )}

        
        {activeTab === "seo" && (
          <SeoTab
            brands={seoBrands}
            loading={seoLoading}
            onRefresh={fetchSeoTab}
            onOpenEditModal={handleOpenSeoModal}
            onRegenerateSeo={handleRegenerateSeo}
            onBatchGenerate={handleBatchGenerateSeo}
            regeneratingId={regeneratingSeoId}
            batchProcessing={isBatchGeneratingSeo}
          />
        )}
        {activeTab === "services" && (
          <ServicesTab
            services={services}
            totalServices={totalServices}
            searchTerm={searchTerm}
            onSearchChange={(val) => setSearchTerm(val)}
            onClearSearch={() => setSearchTerm("")}
            currentPage={servicesPage}
            itemsPerPage={servicesPerPage}
            onPageChange={(p) => setServicesPage(p)}
            onPerPageChange={(size) => { setServicesPerPage(size); setServicesPage(1); }}
            onOpenCreateService={handleOpenCreateService}
            onEditService={handleOpenEditService}
            onDeleteService={handleDeleteService}
            loading={loading}
          />
        )}
      </div>

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
                  style={{ width: "80px", height: "80px", borderRadius: "8px", objectFit: "contain", objectPosition: "center", display: "block", backgroundColor: "#ffffff" }}
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
                  <div>Total Inquiries: <strong>{selectedItem.investorsCount || 0}</strong></div>
                  <div>Approved Leads: <strong>{selectedItem.approvedLeadsCount || 0}</strong></div>
                  <div>Deals Closed: <strong>{selectedItem.investedInvestorsCount || 0}</strong></div>
                </div>
              </div>

              <div style={{ marginBottom: "20px" }}>
                <h4 style={{ fontSize: "14px", marginBottom: "6px" }}>Overview Description</h4>
                <div
                  className="brand-rich-description fck-content-wrapper"
                  style={{ fontSize: "13.5px", color: "var(--text-muted)", lineHeight: "1.6" }}
                  dangerouslySetInnerHTML={{ __html: sanitizeBrandHtml(selectedItem.description, selectedItem) }}
                />
              </div>

              <div style={{ background: "#f8fafc", padding: "16px", borderRadius: "8px" }}>
                <h4 style={{ fontSize: "14px", marginBottom: "8px" }}>Contact Details</h4>
                <p style={{ fontSize: "13px", display: "flex", gap: "6px", alignItems: "center" }}><Mail size={12} /> {selectedItem.email}</p>
                <p style={{ fontSize: "13px", display: "flex", gap: "6px", alignItems: "center", marginTop: "4px" }}><Phone size={12} /> {selectedItem.phone}</p>
                {selectedItem.website && <p style={{ fontSize: "13px", display: "flex", gap: "6px", alignItems: "center", marginTop: "4px" }}><Building size={12} /> {selectedItem.website}</p>}
              </div>

              {/* SEO, GEO & AEO Live Status Card */}
              {(() => {
                const autoSeo = (!selectedItem.seoData?.seoTitle || !selectedItem.faqs?.length)
                  ? generateBrandSeoData(selectedItem)
                  : { seoData: selectedItem.seoData, faqs: selectedItem.faqs };
                const seoData = selectedItem.seoData?.seoTitle ? selectedItem.seoData : autoSeo.seoData;
                const faqs = selectedItem.faqs?.length ? selectedItem.faqs : autoSeo.faqs;

                return (
                  <div style={{ marginTop: "20px", background: "linear-gradient(135deg, #f0fdf4 0%, #ffffff 100%)", padding: "18px", borderRadius: "12px", border: "1px solid #bbf7d0", boxShadow: "0 2px 8px rgba(0,0,0,0.02)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px", flexWrap: "wrap", gap: "8px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <span style={{ display: "inline-block", width: "10px", height: "10px", borderRadius: "50%", background: "#16a34a" }} />
                        <h4 style={{ fontSize: "15px", fontWeight: "800", margin: 0, color: "#166534" }}>
                          SEO, GEO & AEO Live Status
                        </h4>
                      </div>
                      <span style={{ fontSize: "11px", fontWeight: "700", background: "#dcfce7", color: "#15803d", padding: "3px 10px", borderRadius: "9999px" }}>
                        ✓ Automated & Schema Validated
                      </span>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: "10px", fontSize: "13px" }}>
                      <div style={{ padding: "8px 12px", background: "#ffffff", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
                        <span style={{ fontSize: "11px", fontWeight: "700", color: "#64748b", display: "block" }}>🎯 TARGET FOCUS KEYWORD</span>
                        <strong style={{ color: "#0f172a", fontSize: "13.5px" }}>{seoData.focusKeyword || `${selectedItem.name.toLowerCase()} franchise`}</strong>
                      </div>

                      <div style={{ padding: "8px 12px", background: "#ffffff", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
                        <span style={{ fontSize: "11px", fontWeight: "700", color: "#64748b", display: "block" }}>🏷️ GOOGLE META TITLE</span>
                        <span style={{ color: "#1e293b", fontWeight: "600" }}>{seoData.seoTitle || `${selectedItem.name} Franchise in India - Cost, Profit & ROI (2026)`}</span>
                      </div>

                      <div style={{ padding: "8px 12px", background: "#ffffff", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
                        <span style={{ fontSize: "11px", fontWeight: "700", color: "#64748b", display: "block" }}>🤖 AEO FACT CITATION (PERPLEXITY & AI OVERVIEWS)</span>
                        <p style={{ margin: "4px 0 0 0", color: "#475569", lineHeight: "1.5", fontSize: "12.5px" }}>{seoData.aeoContent || "Automated entity citation generated with verified budget and specifications."}</p>
                      </div>

                      <div style={{ padding: "8px 12px", background: "#ffffff", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <span style={{ fontSize: "11px", fontWeight: "700", color: "#64748b" }}>❓ FAQPAGE SCHEMA QUESTIONS</span>
                          <span style={{ fontSize: "11px", fontWeight: "700", color: "#2563eb" }}>{faqs.length} Active FAQs</span>
                        </div>
                        <ul style={{ margin: "6px 0 0 0", paddingLeft: "18px", color: "#475569", fontSize: "12px", lineHeight: "1.6" }}>
                          {faqs.slice(0, 3).map((f, i) => (
                            <li key={i}>{f.question}</li>
                          ))}
                          {faqs.length > 3 && <li style={{ color: "#2563eb", fontWeight: "600" }}>+ {faqs.length - 3} more questions live on brand page</li>}
                        </ul>
                      </div>
                    </div>
                  </div>
                );
              })()}

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
                      All Investors ({investorAssignPool.length})
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
                {investorAssignPool.length === 0 ? (
                  <p style={{ fontSize: "12px", color: "var(--text-muted)" }}>No investors registered yet.</p>
                ) : (() => {
                  const displayedAssignInvestors = investorAssignPool.filter(inv => {
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
                            Switch to view All Investors ({investorAssignPool.length})
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
                      placeholder="e.g. 500 - 1,500 sq ft"
                      value={adminBrandForm.areaRequired || ""}
                      onChange={(e) => setAdminBrandForm({ ...adminBrandForm, areaRequired: e.target.value })}
                    />
                    <small style={{ fontSize: "11px", color: "var(--text-muted)", display: "block", marginTop: "4px" }}>
                      Unit: sq ft. Allowed range: 50 to 50,000 sq ft. Leave blank if not applicable.
                    </small>
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
                      inputMode="numeric"
                      maxLength={10}
                      pattern="[0-9]{10}"
                      className="form-input"
                      value={adminBrandForm.phone}
                      onChange={(e) => setAdminBrandForm({ ...adminBrandForm, phone: e.target.value.replace(/\D/g, '').slice(0, 10) })}
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
                          style={{ width: "80px", height: "80px", borderRadius: "8px", objectFit: "contain", objectPosition: "center", display: "block", backgroundColor: "#ffffff", border: "1px solid #cbd5e1" }}
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
              {selectedItem.investmentStatus && selectedItem.investmentStatus !== "Not Started" && (
                <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", padding: "14px 16px", borderRadius: "8px", marginBottom: "20px" }}>
                  <h4 style={{ fontSize: "14px", marginBottom: "6px", color: "#166534" }}>Investment Completion Details</h4>
                  <div style={{ fontSize: "13px", color: "#15803d", display: "flex", flexDirection: "column", gap: "4px" }}>
                    <div>Status: <strong>{selectedItem.investmentStatus}</strong></div>
                    {selectedItem.brandName && <div>Finalized Franchise: <strong>{selectedItem.brandName}</strong></div>}
                    {Number(selectedItem.investmentAmount) > 0 && <div>Amount: <strong>₹{Number(selectedItem.investmentAmount).toLocaleString("en-IN")}</strong></div>}
                    {selectedItem.investmentNotes && <div style={{ fontSize: "12px", color: "#4b5563", marginTop: "4px" }}>Note: {selectedItem.investmentNotes}</div>}
                  </div>
                </div>
              )}

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
              {selectedItem.status === "Approved" && (
                <button
                  className="admin-btn admin-btn-approve"
                  style={{ padding: "8px 16px", fontSize: "13px", backgroundColor: "#7c3aed" }}
                  onClick={() => {
                    openCustomMsgModal("MARK_INVESTED", selectedItem);
                    setSelectedItem(null);
                  }}
                >
                  <CheckCircle2 size={15} /> {selectedItem.investmentStatus === "Invested" ? "Edit Deal" : "Mark Invested"}
                </button>
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
                        style={{ width: "100%", maxHeight: "200px", objectFit: "contain", objectPosition: "center", display: "block", backgroundColor: "#ffffff" }}
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
                        style={{ width: "100%", maxHeight: "200px", objectFit: "contain", objectPosition: "center", display: "block", backgroundColor: "#ffffff" }}
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
                    <label htmlFor="ad-media-type" style={{ fontWeight: 700, color: "var(--text-dark)", fontSize: "13.5px" }}>Banner Media Type</label>
                    <select
                      id="ad-media-type"
                      className="form-input"
                      value={adForm.mediaType}
                      onChange={(e) => setAdForm({ ...adForm, mediaType: e.target.value, image: e.target.value === adForm.mediaType ? adForm.image : "" })}
                    >
                      <option value="image">Image Banner</option>
                      <option value="video">Video Banner</option>
                    </select>
                    <small style={{ color: "var(--text-muted)", display: "block", marginTop: "5px" }}>Upload an image or a muted looping video below.</small>
                  </div>
                  <div className="form-group">
                    <label htmlFor="ad-text-color" style={{ fontWeight: 700, color: "var(--text-dark)", fontSize: "13.5px" }}>Banner Text Colour</label>
                    <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                      <input
                        id="ad-text-color"
                        type="color"
                        value={adForm.textColor}
                        onChange={(e) => setAdForm({ ...adForm, textColor: e.target.value })}
                        style={{ width: "48px", height: "42px", padding: "3px", cursor: "pointer" }}
                        aria-label="Choose banner text colour"
                      />
                      <input
                        type="text"
                        className="form-input"
                        value={adForm.textColor}
                        onChange={(e) => setAdForm({ ...adForm, textColor: e.target.value })}
                        pattern="^#[0-9A-Fa-f]{6}$"
                        maxLength={7}
                        aria-label="Banner text colour hex value"
                      />
                    </div>
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
                        <option value="homepage_banner">Homepage Banner + Partner Spotlight</option>
                      <option value="brand_sidebar">Brand Details Sidebar</option>
                      <option value="investor_dashboard">Investor Dashboard</option>
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
                    Ad Banner {adForm.mediaType === "video" ? "Video" : "Image"} <span style={{ color: "var(--danger)" }}>*</span>
                  </label>
                  {adForm.image ? (
                    <div style={{ position: "relative", width: "100%", height: "160px", borderRadius: "10px", overflow: "hidden", border: "1px solid var(--border-color)" }}>
                      {adForm.mediaType === "video" ? (
                        <video src={adForm.image} aria-label="Ad video preview" muted loop autoPlay playsInline style={{ width: "100%", height: "100%", objectFit: "contain", display: "block", backgroundColor: "#0f172a" }} />
                      ) : (
                        <img src={adForm.image} alt="Ad Preview" style={{ width: "100%", height: "100%", objectFit: "contain", objectPosition: "center", display: "block", backgroundColor: "#ffffff" }} />
                      )}
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
                      <span style={{ fontSize: "14px", fontWeight: "700", color: "var(--text-dark)" }}>Click to upload ad banner {adForm.mediaType === "video" ? "video" : "image"}</span>
                      <span style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "2px" }}>PNG, JPG, WEBP or MP4 up to 5 MB</span>
                      <input type="file" onChange={handleAdImageUpload} accept={adForm.mediaType === "video" ? "video/mp4,video/webm,video/quicktime" : ".png,.jpg,.jpeg,.webp"} style={{ display: "none" }} />
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
                {customMsgModal.type === "MARK_INVESTED" && <><CheckCircle2 style={{ color: "#7c3aed" }} size={20} /> Mark Investment Complete</>}
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

              {customMsgModal.type === "MARK_INVESTED" && (
                <>
                  <div style={{ marginBottom: "14px" }}>
                    <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#475569", marginBottom: "6px" }}>
                      Finalized Franchise Brand
                    </label>
                    <select
                      value={investedBrandId}
                      onChange={(e) => {
                        const selId = e.target.value;
                        setInvestedBrandId(selId);
                        const match = (allBrandsForSelect || []).find(b => String(b.id || b._id) === String(selId));
                        setInvestedBrandName(match ? match.name : "");
                      }}
                      style={{ width: "100%", borderRadius: "8px", border: "1px solid #cbd5e1", padding: "10px 12px", fontSize: "13px", color: "#0f172a", outline: "none", backgroundColor: "#fff" }}
                    >
                      <option value="">-- Select Finalized Franchise Brand --</option>
                      {(allBrandsForSelect || []).map((b) => (
                        <option key={b.id || b._id} value={b.id || b._id}>
                          {b.name} ({b.category || "Franchise"})
                        </option>
                      ))}
                    </select>
                    <p style={{ fontSize: "11px", color: "#64748b", margin: "4px 0 0" }}>
                      Select which franchise brand was finalized for this investor lead.
                    </p>
                  </div>
                <div style={{ marginBottom: "14px" }}>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#475569", marginBottom: "6px" }}>
                    Investment Amount (₹) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={investmentAmount}
                    onChange={(e) => setInvestmentAmount(e.target.value)}
                    placeholder="e.g. 500000"
                    style={{ width: "100%", borderRadius: "8px", border: "1px solid #cbd5e1", padding: "10px 12px", fontSize: "13px", color: "#0f172a", outline: "none" }}
                  />
                </div>
              </>
            )}
            {false && (<div>
              <input
                placeholder="e.g. 500000"
                    style={{ width: "100%", borderRadius: "8px", border: "1px solid #cbd5e1", padding: "10px 12px", fontSize: "13px", color: "#0f172a", outline: "none" }}
                  />
                </div>
              )}

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
                {isSubmittingCustomMsg ? "Processing..." : customMsgModal.type === "MARK_INVESTED" ? "Mark as Invested" : "Confirm & Save to Log"}
              </button>
            </div>
          </div>
        </div>
      )}
    
      <SeoEditModal
        isOpen={isSeoModalOpen}
        onClose={() => setIsSeoModalOpen(false)}
        brandId={selectedSeoBrandId}
        onSave={handleSaveSeo}
        onRegenerate={handleRegenerateSeo}
        saving={isSeoSaving}
        regenerating={regeneratingSeoId === selectedSeoBrandId}
      />
    </div>
  );
}
