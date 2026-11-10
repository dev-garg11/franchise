"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LogIn, PlusCircle, Shield, User, LogOut, Building, Menu, X,
  Bell, Search, ChevronDown, Sparkles, HelpCircle, Layers, Star,
  Trash2, CheckCircle, ArrowRight, Clock, ArrowUp, Crown, MessageCircle
} from "lucide-react";
import { getApprovedBrands } from "@/lib/brandsCache";
import { decodeHtmlEntities } from "@/lib/brandFormatters";

const DEFAULT_NOTIFICATIONS = [
  {
    id: "notif-1",
    title: "Brand Approved",
    message: "Doctor Garage has been approved by the administrator.",
    time: "2 hours ago",
    category: "system",
    read: false,
  },
  {
    id: "notif-2",
    title: "New Franchise Added",
    message: "Bombay Kulfi has launched a new model under 5L.",
    time: "5 hours ago",
    category: "opportunity",
    read: false,
  },
  {
    id: "notif-3",
    title: "Application Submitted",
    message: "Your franchise application for Jaaz Bathware has been sent.",
    time: "1 day ago",
    category: "application",
    read: true,
  },
  {
    id: "notif-4",
    title: "Profile Updated",
    message: "Your investor verification profile is now complete.",
    time: "2 days ago",
    category: "profile",
    read: true,
  },
];

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();

  // Auth state
  const [isAdmin, setIsAdmin] = useState(false);
  const [isInvestor, setIsInvestor] = useState(false);
  const [isBrand, setIsBrand] = useState(false);
  const [investorName, setInvestorName] = useState("");
  const [brandName, setBrandName] = useState("");

  // Layout States
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(false);

  // Search States
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [allBrands, setAllBrands] = useState([]);
  const [filteredBrands, setFilteredBrands] = useState([]);
  const [searchHistory, setSearchHistory] = useState([]);
  const [loadingSearch, setLoadingSearch] = useState(false);

  // Notification States
  const [notificationDropdownOpen, setNotificationDropdownOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);

  // User Profile Dropdown
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  // Button Loading States
  const [loadingAddBrand, setLoadingAddBrand] = useState(false);
  const [loadingLogin, setLoadingLogin] = useState(false);

  // Scroll Metrics
  const [showScrollTop, setShowScrollTop] = useState(false);

  // Mouse Glow Position
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  // Refs for closing on click outside
  const notificationRef = useRef(null);
  const userDropdownRef = useRef(null);
  const solutionsDropdownRef = useRef(null);
  const dropdownTimeoutRef = useRef(null);
  const searchInputRef = useRef(null);
  const progressBarRef = useRef(null);
  const mobileMenuButtonRef = useRef(null);
  const mobileNavRef = useRef(null);
  const wasMobileMenuOpen = useRef(false);

  // Sync auth, notifications, history on render/pathname change
  useEffect(() => {
    const syncAuth = () => {
      try {
        const adminAuth = typeof window !== "undefined" ? localStorage.getItem("adminLoggedIn") : null;
        const investorAuth = typeof window !== "undefined" ? localStorage.getItem("investorLoggedIn") : null;
        const brandAuth = typeof window !== "undefined" ? localStorage.getItem("brandLoggedIn") : null;

        const invName = typeof window !== "undefined" ? localStorage.getItem("investorName") : null;
        const brName = typeof window !== "undefined" ? localStorage.getItem("brandName") : null;

        setIsAdmin(adminAuth === "true");
        setIsInvestor(investorAuth === "true");
        setIsBrand(brandAuth === "true");

        setInvestorName(invName || "Investor");
        setBrandName(brName || "Brand Owner");
      } catch (e) {}
    };

    syncAuth();
    try {
      const storedNotifs = localStorage.getItem("userNotifications");
      if (storedNotifs) {
        // Notifications are intentionally hydrated from localStorage on mount.
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setNotifications(JSON.parse(storedNotifs));
      } else {
        localStorage.setItem("userNotifications", JSON.stringify(DEFAULT_NOTIFICATIONS));
        setNotifications(DEFAULT_NOTIFICATIONS);
      }
    } catch (e) {}

    try {
      const storedHistory = localStorage.getItem("recentSearches");
      if (storedHistory) {
        setSearchHistory(JSON.parse(storedHistory));
      }
    } catch (e) {}

    window.addEventListener("storage", syncAuth);
    window.addEventListener("auth-state-changed", syncAuth);
    return () => {
      window.removeEventListener("storage", syncAuth);
      window.removeEventListener("auth-state-changed", syncAuth);
    };
  }, [pathname]);

  // Sync navbar state and progress without a React render on every scroll frame.
  useEffect(() => {
    let frame = 0;
    const handleScroll = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(() => {
        frame = 0;
        const scrollY = window.scrollY;
        setIsScrolled(scrollY > 24);
        setShowScrollTop(scrollY > 300);
        const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
        const progress = totalHeight > 0 ? Math.min(1, Math.max(0, scrollY / totalHeight)) : 0;
        progressBarRef.current?.style.setProperty("transform", `scaleX(${progress})`);
      });
    };

    const handleMouseMove = (e) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("mousemove", handleMouseMove);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("mousemove", handleMouseMove);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  // Keyboard Shortcuts Ctrl+K and ESC
  useEffect(() => {
    const body = document.body;
    if (mobileMenuOpen) {
      body.style.overflow = "hidden";
      window.setTimeout(() => mobileNavRef.current?.querySelector("a, button")?.focus(), 0);
    } else {
      body.style.overflow = "";
      if (wasMobileMenuOpen.current) mobileMenuButtonRef.current?.focus();
    }
    wasMobileMenuOpen.current = mobileMenuOpen;
    return () => { body.style.overflow = ""; };
  }, [mobileMenuOpen]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setSearchModalOpen(prev => !prev);
      }
      if (e.key === "Escape") {
        setSearchModalOpen(false);
        setActiveDropdown(false);
        setMobileMenuOpen(false);
      }
      if (mobileMenuOpen && e.key === "Tab" && mobileNavRef.current) {
        const focusable = [...mobileNavRef.current.querySelectorAll("a, button")].filter((element) => !element.disabled);
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [mobileMenuOpen]);

  // Click Outside logic
  useEffect(() => {
    function handleClickOutside(event) {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setNotificationDropdownOpen(false);
      }
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target)) {
        setUserDropdownOpen(false);
      }
      if (solutionsDropdownRef.current && !solutionsDropdownRef.current.contains(event.target)) {
        setActiveDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close solutions dropdown on route navigation
  useEffect(() => {
    setActiveDropdown(false);
    if (dropdownTimeoutRef.current) {
      clearTimeout(dropdownTimeoutRef.current);
      dropdownTimeoutRef.current = null;
    }
  }, [pathname]);

  const handleDropdownMouseEnter = () => {
    if (dropdownTimeoutRef.current) {
      clearTimeout(dropdownTimeoutRef.current);
      dropdownTimeoutRef.current = null;
    }
    setActiveDropdown(true);
  };

  const handleDropdownMouseLeave = () => {
    if (dropdownTimeoutRef.current) {
      clearTimeout(dropdownTimeoutRef.current);
    }
    dropdownTimeoutRef.current = setTimeout(() => {
      setActiveDropdown(false);
    }, 280);
  };

  const handleDropdownToggle = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (dropdownTimeoutRef.current) {
      clearTimeout(dropdownTimeoutRef.current);
      dropdownTimeoutRef.current = null;
    }
    setActiveDropdown((prev) => !prev);
  };

  // Fetch approved brands for search if search modal is opened
  useEffect(() => {
    if (searchModalOpen && allBrands.length === 0) {
      const fetchBrands = async () => {
        try {
          setLoadingSearch(true);
          const data = await getApprovedBrands();
          if (Array.isArray(data)) {
            setAllBrands(data);
          }
        } catch (err) {
          console.error(err);
        } finally {
          setLoadingSearch(false);
        }
      };
      fetchBrands();
    }
    if (searchModalOpen) {
      setTimeout(() => {
        if (searchInputRef.current) searchInputRef.current.focus();
      }, 100);
    }
  }, [searchModalOpen, allBrands]);

  // Handle live query filtering
  useEffect(() => {
    queueMicrotask(() => {
      if (!searchQuery) {
        setFilteredBrands([]);
        return;
      }
      const query = searchQuery.toLowerCase();
      const results = allBrands.filter(
        b => b.name.toLowerCase().includes(query) ||
          b.company.toLowerCase().includes(query) ||
          b.category.toLowerCase().includes(query) ||
          b.description.toLowerCase().includes(query)
      );
      setFilteredBrands(results);
    });
  }, [searchQuery, allBrands]);

  const handleLogout = () => {
    localStorage.removeItem("adminLoggedIn");
    localStorage.removeItem("investorLoggedIn");
    localStorage.removeItem("brandLoggedIn");
    localStorage.removeItem("investorEmail");
    localStorage.removeItem("investorName");
    localStorage.removeItem("brandEmail");
    localStorage.removeItem("brandId");
    localStorage.removeItem("brandName");

    setIsAdmin(false);
    setIsInvestor(false);
    setIsBrand(false);
    setMobileMenuOpen(false);
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("auth-state-changed"));
    }
    router.push("/");
  };

  // Add search term to history helper
  const addQueryToHistory = (query) => {
    if (!query || query.trim() === "") return;
    const cleanQuery = query.trim();
    let history = [...searchHistory];
    history = history.filter(h => h !== cleanQuery);
    history.unshift(cleanQuery);
    history = history.slice(0, 5); // Max 5 items
    setSearchHistory(history);
    localStorage.setItem("recentSearches", JSON.stringify(history));
  };

  const handleSearchSubmit = (e) => {
    if (e) e.preventDefault();
    if (searchQuery.trim()) {
      addQueryToHistory(searchQuery);
      setSearchModalOpen(false);
      router.push(`/brands?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleRecentSearchClick = (term) => {
    setSearchQuery(term);
    addQueryToHistory(term);
    setSearchModalOpen(false);
    router.push(`/brands?search=${encodeURIComponent(term)}`);
  };

  const handleResultClick = (brand) => {
    addQueryToHistory(brand.name);
    setSearchModalOpen(false);
    router.push(`/brands?search=${encodeURIComponent(brand.name)}`);
  };

  const clearSearchHistory = () => {
    setSearchHistory([]);
    localStorage.removeItem("recentSearches");
  };

  // Notification actions
  const markAllNotificationsRead = () => {
    const updated = notifications.map(n => ({ ...n, read: true }));
    setNotifications(updated);
    localStorage.setItem("userNotifications", JSON.stringify(updated));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
    localStorage.setItem("userNotifications", JSON.stringify([]));
  };

  const handleNotificationClick = (notif) => {
    const updated = notifications.map(n => n.id === notif.id ? { ...n, read: true } : n);
    setNotifications(updated);
    localStorage.setItem("userNotifications", JSON.stringify(updated));
    setNotificationDropdownOpen(false);

    // Direct link depending on notification
    if (isAdmin) router.push("/admin");
    else if (isInvestor) router.push("/investor-panel");
    else if (isBrand) router.push("/brand-panel");
    else window.dispatchEvent(new CustomEvent("open-auth-modal", { detail: { tab: "login" } }));
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <>
      {/* Interactive Mouse Glow Orbs */}
      <div className="mouse-glow-trail" style={{ left: `${mousePos.x}px`, top: `${mousePos.y}px` }}></div>

      {/* Header Container */}
      <header className={`header ${isScrolled ? "shrink" : ""}`} style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 10000,
        width: '100%',
        backgroundColor: '#ffffff',
        transition: 'var(--transition-normal)'
      }}>
        <div className="progress-bar-container" aria-hidden="true">
          <div ref={progressBarRef} className="progress-bar"></div>
        </div>
        <div className="container header-container" style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'relative'
        }}>
          {/* Logo */}
          <Link href="/" style={{ display: 'flex', alignItems: 'center', transition: 'all 0.3s ease', textDecoration: 'none' }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/WhatsApp_Image_2026-07-16_at_4.40.00_PM__2_-removebg-preview.png"
              alt="Franchise Roots"
              className="header-logo-img"
              style={{
                height: isScrolled ? '42px' : '54px',
                width: 'auto',
                transition: 'all 0.3s ease',
                objectFit: 'contain',
                filter: 'drop-shadow(0 2px 6px rgba(0, 0, 0, 0.08))'
              }}
            />
          </Link>

          <button
            type="button"
            className="mobile-search-toggle"
            onClick={() => setSearchModalOpen(true)}
            aria-label="Search opportunities"
          >
            <Search size={18} aria-hidden="true" />
          </button>

          {/* Mobile Hamburger Button */}
          <button
            ref={mobileMenuButtonRef}
            className="mobile-menu-toggle flex-center"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Open menu"
            aria-expanded={mobileMenuOpen}
            aria-controls="site-navigation"
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>

          {mobileMenuOpen && <button type="button" className="mobile-menu-overlay" aria-label="Close menu" onClick={() => setMobileMenuOpen(false)} />}

          {/* Navigation container */}
          <nav ref={mobileNavRef} id="site-navigation" className={`nav-container ${mobileMenuOpen ? "open" : ""}`}>
            <button type="button" className="mobile-drawer-close" onClick={() => setMobileMenuOpen(false)} aria-label="Close menu">
              <X size={20} aria-hidden="true" />
            </button>
            <ul className="nav-links">
              <li>
                <Link href="/" className={`nav-link ${pathname === "/" ? "active" : ""}`} onClick={() => setMobileMenuOpen(false)}>
                  Home
                </Link>
              </li>
              {/* Mega Dropdown / Solutions menu */}
              <li
                ref={solutionsDropdownRef}
                onMouseEnter={handleDropdownMouseEnter}
                onMouseLeave={handleDropdownMouseLeave}
                style={{ position: 'relative' }}
              >
                <button
                  type="button"
                  onClick={handleDropdownToggle}
                  onKeyDown={(event) => {
                    if (event.key === "Escape") setActiveDropdown(false);
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      setActiveDropdown((prev) => !prev);
                    }
                  }}
                  aria-expanded={activeDropdown}
                  aria-controls="solutions-dropdown"
                  aria-haspopup="menu"
                  className={`nav-link ${pathname === "/brand-registration" || pathname === "/investor-registration" ? "active" : ""}`}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', cursor: 'pointer', border: 'none', whiteSpace: 'nowrap' }}
                >
                  Solutions <ChevronDown size={14} style={{ transform: activeDropdown ? 'rotate(180deg)' : 'none', transition: 'var(--transition-fast)', flexShrink: 0 }} />
                </button>

                {activeDropdown && (
                  <div id="solutions-dropdown" className="solutions-dropdown-panel" onMouseEnter={handleDropdownMouseEnter} onMouseLeave={handleDropdownMouseLeave} style={{
                    position: 'absolute',
                    top: 'calc(100% + 8px)',
                    left: '50%', transform: 'translateX(-50%)',
                    width: '340px',
                    background: '#ffffff',
                    backdropFilter: 'blur(20px)',
                    borderRadius: '16px',
                    boxShadow: '0 20px 45px -8px rgba(15, 23, 42, 0.16), 0 0 0 1px rgba(226, 232, 240, 0.9)',
                    border: '1px solid rgba(255, 255, 255, 0.6)',
                    padding: '10px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                    zIndex: 1100,
                    marginTop: '4px',
                    animation: 'dropdown-fade-in 0.2s ease-out'
                  }}>
                    <div style={{ position: 'absolute', top: '-14px', left: 0, right: 0, height: '16px', background: 'transparent' }} />
                    <Link
                      href="/brand-registration"
                      className="solutions-dropdown-item"
                      role="menuitem"
                      onClick={() => { setActiveDropdown(false); setMobileMenuOpen(false); }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '12px 14px',
                        borderRadius: '12px',
                        textDecoration: 'none',
                        background: '#ffffff',
                        border: '1px solid #f1f5f9',
                        transition: 'all 0.15s ease',
                        cursor: 'pointer'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = '#f0f7ff';
                        e.currentTarget.style.borderColor = '#bfdbfe';
                        e.currentTarget.style.transform = 'translateY(-1px)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = '#ffffff';
                        e.currentTarget.style.borderColor = '#f1f5f9';
                        e.currentTarget.style.transform = 'none';
                      }}
                    >
                      <div style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: '#2563eb' }}><Building size={18} /></div>
                      <div>
                        <h5 style={{ fontSize: '13.5px', fontWeight: '700', color: 'var(--text-dark)' }}>Brand Listing Expansion</h5>
                        <p style={{ fontSize: '12px', color: '#64748b', margin: 0, lineHeight: '1.4' }}>Promote your business concepts to 50k+ investors.</p>
                      </div>
                    </Link>
                    <Link
                      href="/investor-registration"
                      className="solutions-dropdown-item"
                      role="menuitem"
                      onClick={() => { setActiveDropdown(false); setMobileMenuOpen(false); }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '12px 14px',
                        borderRadius: '12px',
                        textDecoration: 'none',
                        background: '#ffffff',
                        border: '1px solid #f1f5f9',
                        transition: 'all 0.15s ease',
                        cursor: 'pointer'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = '#faf5ff';
                        e.currentTarget.style.borderColor = '#e9d5ff';
                        e.currentTarget.style.transform = 'translateY(-1px)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = '#ffffff';
                        e.currentTarget.style.borderColor = '#f1f5f9';
                        e.currentTarget.style.transform = 'none';
                      }}
                    >
                      <div style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: '#faf5ff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: '#9333ea' }}><Sparkles size={18} /></div>
                      <div>
                        <h5 style={{ fontSize: '13.5px', fontWeight: '700', color: 'var(--text-dark)' }}>Investor Matching Desk</h5>
                        <p style={{ fontSize: '12px', color: '#64748b', margin: 0, lineHeight: '1.4' }}>Identify pre-qualified franchise recommendations.</p>
                      </div>
                    </Link>
                    <div style={{ display: 'flex', gap: '12px', padding: '8px', borderTop: '1px solid rgba(229,231,235,0.5)', paddingTop: '12px' }}>
                      <Star size={18} style={{ color: 'var(--accent)', flexShrink: 0 }} />
                      <span style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-dark)' }}>100% Verified Opportunities</span>
                    </div>
                  </div>
                )}
              </li>
              <li>
                <Link
                  href="/brands"
                  className={`nav-link ${pathname === "/brands" || pathname.startsWith("/brands/") || pathname.startsWith("/brand/") ? "active" : ""}`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Brands
                </Link>
              </li>
              <li>
                <Link
                  href="/master-franchising"
                  className={`nav-link ${pathname === "/master-franchising" || pathname.startsWith("/master-franchis") ? "active" : ""}`}
                  onClick={() => setMobileMenuOpen(false)}
                  style={{ display: "inline-flex", alignItems: "center", gap: "5px", whiteSpace: "nowrap" }}
                >
                  <Crown size={13} style={{ color: "#d97706", flexShrink: 0 }} />
                  <span>Master Franchise</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/services"
                  className={`nav-link ${pathname === "/services" || pathname.startsWith("/services/") ? "active" : ""}`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Services
                </Link>
              </li>
              <li>
                <Link
                  href="/about-us"
                  className={`nav-link ${pathname === "/about-us" || pathname === "/about" ? "active" : ""}`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  href="/blogs"
                  className={`nav-link ${pathname === "/blogs" || pathname.startsWith("/blogs/") ? "active" : ""}`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Blogs
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className={`nav-link ${pathname === "/contact" || pathname.startsWith("/contact") ? "active" : ""}`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Contact
                </Link>
              </li>
              {isAdmin && (
                <li className="mobile-auth-item" style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px solid #e2e8f0' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <Link
                      href="/admin"
                      onClick={() => setMobileMenuOpen(false)}
                      className="btn"
                      style={{ padding: '8px 16px', fontSize: '13px', borderRadius: '9999px', textAlign: 'center', background: '#2563eb', color: '#fff', textDecoration: 'none', fontWeight: '700' }}
                    >
                      Admin Dashboard
                    </Link>
                    <button
                      type="button"
                      onClick={() => { setMobileMenuOpen(false); handleLogout(); }}
                      className="btn btn-outline"
                      style={{ padding: '8px 16px', fontSize: '13px', borderRadius: '9999px', background: '#fff', border: '1px solid #fecdd3', color: '#e11d48', cursor: 'pointer', fontWeight: '700' }}
                    >
                      Logout
                    </button>
                  </div>
                </li>
              )}
              {!isAdmin && !isInvestor && !isBrand && (
                <li className="mobile-auth-item" style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px solid #e2e8f0' }}>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      type="button"
                      onClick={() => {
                        setMobileMenuOpen(false);
                        window.dispatchEvent(new CustomEvent("open-auth-modal", { detail: { tab: "login" } }));
                      }}
                      className="btn btn-outline"
                      style={{ padding: '8px 16px', fontSize: '13px', borderRadius: '9999px', background: '#fff', border: '1px solid #e2e8f0', cursor: 'pointer' }}
                    >
                      Login
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setMobileMenuOpen(false);
                        window.dispatchEvent(new CustomEvent("open-auth-modal", { detail: { tab: "register" } }));
                      }}
                      className="btn"
                      style={{ padding: '8px 16px', fontSize: '13px', borderRadius: '9999px', background: '#eff6ff', color: '#2563eb', border: '1px solid #dbeafe', cursor: 'pointer' }}
                    >
                      Register
                    </button>
                  </div>
                </li>
              )}
            </ul>

            {/* Right-side utilities and CTAs */}
            <div className="nav-actions">
              <button
                type="button"
                className="search-circle-btn"
                onClick={() => setSearchModalOpen(true)}
                aria-label="Search opportunities"
                title="Search opportunities (Ctrl+K)"
              >
                <Search size={16} />
              </button>

              {/* Login Profile Actions */}
              {isAdmin || isInvestor || isBrand ? (
                <div style={{ position: 'relative' }} ref={userDropdownRef}>
                  <div
                    className="user-profile-group"
                    style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}
                    onClick={() => setUserDropdownOpen(prev => !prev)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        setUserDropdownOpen(prev => !prev);
                      }
                      if (event.key === "Escape") setUserDropdownOpen(false);
                    }}
                    role="button"
                    tabIndex={0}
                    aria-haspopup="menu"
                    aria-expanded={userDropdownOpen}
                  >
                    <div className="user-avatar-btn">
                      {isAdmin ? "AD" : isInvestor ? investorName.substring(0, 2).toUpperCase() : brandName.substring(0, 2).toUpperCase()}
                    </div>
                    <span className="user-greeting" style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-dark)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      Hi, {isAdmin ? "Admin" : isInvestor ? investorName.split(" ")[0] : brandName.split(" ")[0]}
                      <ChevronDown size={14} style={{ transform: userDropdownOpen ? 'rotate(180deg)' : 'none', transition: 'var(--transition-fast)' }} />
                    </span>
                  </div>

                  {/* Premium glass user profile dropdown */}
                  {userDropdownOpen && (
                    <div className="dropdown-panel-premium user-dropdown-panel">
                      <div className="user-dropdown-profile-header">
                        <span style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: '800', display: 'block' }}>Signed In As</span>
                        <span style={{ fontSize: '14.5px', fontWeight: '800', color: 'var(--text-dark)', marginTop: '2px', display: 'block' }}>
                          {isAdmin ? "System Administrator" : isInvestor ? investorName : brandName}
                        </span>
                      </div>
                      <div className="dropdown-panel-body" style={{ padding: "6px" }}>
                        <Link
                          href={isAdmin ? "/admin" : isInvestor ? "/investor-panel" : "/brand-panel"}
                          className="dropdown-item-hover"
                          style={{ display: 'flex', gap: '10px', padding: '10px 14px', borderRadius: '8px', fontSize: '13.5px', fontWeight: '600' }}
                          onClick={() => setUserDropdownOpen(false)}
                        >
                          <Layers size={16} style={{ color: 'var(--primary)' }} />
                          Dashboard
                        </Link>
                        <Link
                          href={isInvestor ? "/investor-panel?tab=applications" : isBrand ? "/brand-panel?tab=applications" : "/admin"}
                          className="dropdown-item-hover"
                          style={{ display: 'flex', gap: '10px', padding: '10px 14px', borderRadius: '8px', fontSize: '13.5px', fontWeight: '600' }}
                          onClick={() => setUserDropdownOpen(false)}
                        >
                          <Building size={16} style={{ color: 'var(--secondary)' }} />
                          My Applications
                        </Link>
                        <Link
                          href="/"
                          className="dropdown-item-hover"
                          style={{ display: 'flex', gap: '10px', padding: '10px 14px', borderRadius: '8px', fontSize: '13.5px', fontWeight: '600' }}
                          onClick={() => setUserDropdownOpen(false)}
                        >
                          <Star size={16} style={{ color: 'var(--accent)' }} />
                          Saved Brands
                        </Link>
                        <button
                          className="dropdown-item-hover"
                          style={{ display: 'flex', gap: '10px', padding: '10px 14px', borderRadius: '8px', fontSize: '13.5px', fontWeight: '600', width: '100%', textAlign: 'left', border: 'none', background: 'none', cursor: 'pointer' }}
                          onClick={() => { setUserDropdownOpen(false); setNotificationDropdownOpen(true); }}
                        >
                          <Bell size={16} style={{ color: 'var(--primary)' }} />
                          Notifications
                        </button>
                        <div style={{ height: '1px', background: 'rgba(229,231,235,0.5)', margin: '6px 0' }}></div>
                        <button
                          onClick={() => { setUserDropdownOpen(false); handleLogout(); }}
                          className="dropdown-item-hover"
                          style={{ display: 'flex', gap: '10px', padding: '10px 14px', borderRadius: '8px', fontSize: '13.5px', fontWeight: '600', color: 'var(--danger)', width: '100%', textAlign: 'left', border: 'none', background: 'none', cursor: 'pointer' }}
                        >
                          <LogOut size={16} style={{ color: 'var(--danger)' }} />
                          Logout
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="auth-buttons-group" style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'nowrap', flexShrink: 0 }}>
                  <button
                    type="button"
                    onClick={() => {
                      setLoadingLogin(true);
                      setTimeout(() => {
                        setLoadingLogin(false);
                        window.dispatchEvent(new CustomEvent("open-auth-modal", { detail: { tab: "login" } }));
                      }, 300);
                    }}
                    className="btn btn-outline desktop-only-auth"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      borderRadius: '9999px',
                      background: '#ffffff',
                      border: '1px solid #e2e8f0',
                      padding: '8px 16px',
                      fontSize: '13.5px',
                      fontWeight: '700',
                      color: 'var(--text-dark)',
                      whiteSpace: 'nowrap',
                      flexShrink: 0,
                      cursor: 'pointer'
                    }}
                  >
                    {loadingLogin ? (
                      <div className="spinner" style={{ width: "14px", height: "14px", borderWidth: "2px", borderColor: "rgba(0,0,0,0.1)", borderTopColor: "var(--primary)" }}></div>
                    ) : null}
                    Login
                    {!loadingLogin && <ArrowRight size={14} />}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      window.dispatchEvent(new CustomEvent("open-auth-modal", { detail: { tab: "register" } }));
                    }}
                    className="btn desktop-only-auth"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      borderRadius: '9999px',
                      background: '#eff6ff',
                      color: '#2563eb',
                      border: '1px solid #dbeafe',
                      padding: '8px 16px',
                      fontSize: '13.5px',
                      fontWeight: '700',
                      whiteSpace: 'nowrap',
                      flexShrink: 0,
                      cursor: 'pointer'
                    }}
                  >
                    <User size={15} />
                    Register
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setLoadingAddBrand(true);
                      setTimeout(() => {
                        setLoadingAddBrand(false);
                        router.push("/brand-registration");
                      }, 300);
                    }}
                    className="btn btn-primary add-brand-btn-premium"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '7px',
                      background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                      color: '#ffffff',
                      borderRadius: '9999px',
                      padding: '9px 20px',
                      border: '1px solid rgba(255, 255, 255, 0.25)',
                      boxShadow: '0 4px 14px rgba(220, 38, 38, 0.3)',
                      fontSize: '13.5px',
                      fontWeight: '700',
                      whiteSpace: 'nowrap',
                      flexShrink: 0,
                      lineHeight: 1,
                      cursor: 'pointer'
                    }}
                  >
                    {loadingAddBrand ? (
                      <div className="spinner" style={{ width: "14px", height: "14px", borderWidth: "2px", borderTopColor: "white" }}></div>
                    ) : (
                      <Building size={15} style={{ flexShrink: 0 }} />
                    )}
                    <span>+ Add Brand</span>
                  </button>
                </div>
              )}

              <a
                className="mobile-whatsapp-advisory"
                href={`https://api.whatsapp.com/send?phone=${(process.env.NEXT_PUBLIC_ADMIN_WHATSAPP || "919815489999").replace(/[^0-9]/g, "")}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setMobileMenuOpen(false)}
              >
                <MessageCircle size={17} /> WhatsApp Advisory
              </a>

            </div>
          </nav>
        </div>
      </header>

      {/* 4. Full-Width Glass Search Modal */}
      {searchModalOpen && (
        <div className="search-modal-overlay" onClick={() => setSearchModalOpen(false)}>
          <div className="search-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="search-modal-header">
              <div className="search-modal-input-wrapper">
                <Search size={22} style={{ color: "var(--primary)" }} />
                <input
                  ref={searchInputRef}
                  type="text"
                  className="search-modal-input"
                  placeholder="Search brands, sectors, locations... (e.g. Bombay Kulfi)"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearchSubmit(e)}
                />
              </div>
              <button
                className="search-modal-close-btn"
                onClick={() => setSearchModalOpen(false)}
                aria-label="Close search"
              >
                <X size={20} />
              </button>
            </div>

            <div className="search-modal-body">
              {/* History and Suggestions if Query is empty */}
              {!searchQuery ? (
                <>
                  {searchHistory.length > 0 && (
                    <div style={{ marginBottom: "24px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                        <span className="search-section-title">Recent Searches</span>
                        <button className="dropdown-panel-action" style={{ color: "var(--danger)" }} onClick={clearSearchHistory}>Clear history</button>
                      </div>
                      <div className="search-tags-row">
                        {searchHistory.map((term, index) => (
                          <div key={index} className="search-tag-chip history" onClick={() => handleRecentSearchClick(term)}>
                            <Clock size={12} />
                            {term}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div style={{ marginBottom: "24px" }}>
                    <span className="search-section-title">Trending Searches</span>
                    <div className="search-tags-row">
                      {["Bombay Kulfi", "Garage", "Tea Franchise", "Education", "Low Budget"].map((term, index) => (
                        <div key={index} className="search-tag-chip" onClick={() => handleRecentSearchClick(term)}>
                          <Sparkles size={12} />
                          {term}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <span className="search-section-title">Popular Categories</span>
                    <div className="search-tags-row">
                      {["Food and Beverage", "Retail", "Education", "Automotive", "Beauty & Health"].map((category, index) => (
                        <div key={index} className="search-tag-chip" style={{ background: "rgba(124, 58, 237, 0.05)", color: "var(--secondary)", borderColor: "rgba(124, 58, 237, 0.1)" }} onClick={() => {
                          setSearchModalOpen(false);
                          router.push(`/brands?category=${encodeURIComponent(category)}`);
                        }}>
                          <Building size={12} />
                          {category}
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                /* Search Results display */
                <div>
                  <span className="search-section-title">Matching Results ({filteredBrands.length})</span>

                  {loadingSearch ? (
                    <div className="flex-center" style={{ padding: "30px 0", flexDirection: "column", gap: "10px" }}>
                      <div className="spinner" style={{ borderTopColor: "var(--primary)" }}></div>
                      <p style={{ fontSize: "13px", color: "var(--text-muted)" }}>Searching catalog...</p>
                    </div>
                  ) : filteredBrands.length === 0 ? (
                    <div className="panel-empty-state" style={{ padding: "30px 0" }}>
                      <HelpCircle size={28} />
                      <span className="panel-empty-title">No Brands Found</span>
                      <p style={{ fontSize: "12px", marginTop: "4px" }}>We couldn&apos;t find any approved brand matching &quot;{searchQuery}&quot;.</p>
                    </div>
                  ) : (
                    <div className="search-results-list">
                      {filteredBrands.map((brand) => (
                        <div
                          key={brand.id}
                          className="search-result-item-card"
                          onClick={() => handleResultClick(brand)}
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            className="search-result-thumb"
                            src={brand.image || "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&q=80&w=100"}
                            alt={decodeHtmlEntities(brand.name)}
                          />
                          <div className="search-result-info">
                            <span className="search-result-name">{decodeHtmlEntities(brand.name)}</span>
                            <div className="search-result-meta">
                              <span className="search-result-badge">{decodeHtmlEntities(brand.category)}</span>
                              <span>•</span>
                              <span>HQ: {decodeHtmlEntities(brand.hq || "India")}</span>
                            </div>
                          </div>
                          <ArrowRight size={16} style={{ color: "var(--text-muted)" }} />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Standalone Notification Modal (Triggered by Alerts on mobile-bottom-nav) */}
      {notificationDropdownOpen && (
        <div className="notification-modal-overlay" onClick={() => setNotificationDropdownOpen(false)}>
          <div
            ref={notificationRef}
            className="dropdown-panel-premium notification-panel-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="dropdown-panel-header">
              <span className="dropdown-panel-title">Notifications</span>
              <div style={{ display: "flex", gap: "10px" }}>
                {unreadCount > 0 && (
                  <button className="dropdown-panel-action" onClick={markAllNotificationsRead}>Mark read</button>
                )}
                {notifications.length > 0 && (
                  <button className="dropdown-panel-action" style={{ color: "var(--danger)" }} onClick={clearAllNotifications}>Clear</button>
                )}
              </div>
            </div>
            <div className="dropdown-panel-body">
              {notifications.length === 0 ? (
                <div className="panel-empty-state">
                  <CheckCircle size={32} style={{ color: "var(--success)" }} />
                  <span className="panel-empty-title">All Caught Up!</span>
                  <p style={{ fontSize: "11px", marginTop: "4px" }}>No new notifications to display.</p>
                </div>
              ) : (
                notifications.map((notif) => (
                  <div
                    key={notif.id}
                    className={`notification-item-premium ${notif.read ? "" : "unread"}`}
                    onClick={() => handleNotificationClick(notif)}
                  >
                    <div className={`notification-icon-wrapper-premium ${notif.category}`}>
                      {notif.category === "system" && <Shield size={16} />}
                      {notif.category === "opportunity" && <Sparkles size={16} />}
                      {notif.category === "application" && <Building size={16} />}
                      {notif.category === "profile" && <User size={16} />}
                    </div>
                    <div className="notification-info-premium">
                      <h5>{notif.title}</h5>
                      <p>{notif.message}</p>
                      <span className="notification-time-label">
                        <Clock size={10} style={{ display: "inline", marginRight: "3px", verticalAlign: "middle" }} />
                        {notif.time}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* 5. Scroll to Top Floating Action Button */}
      <button
        className={`scroll-to-top-btn ${showScrollTop ? "visible" : ""}`}
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        aria-label="Scroll to top"
      >
        <ArrowUp size={20} />
      </button>

      {/* 6. Mobile bottom navigation bar */}
      <div className="mobile-bottom-nav">
        <button
          className={`mobile-bottom-nav-item ${pathname === "/" && !searchModalOpen ? "active" : ""}`}
          onClick={() => { setSearchModalOpen(false); router.push("/"); }}
        >
          <Layers size={20} />
          <span>Catalog</span>
        </button>
        <button
          className={`mobile-bottom-nav-item ${searchModalOpen ? "active" : ""}`}
          onClick={() => setSearchModalOpen(true)}
        >
          <Search size={20} />
          <span>Search</span>
        </button>
        <button
          className="mobile-bottom-nav-item"
          onClick={() => router.push("/brand-registration")}
        >
          <PlusCircle size={20} />
          <span>Add Brand</span>
        </button>
        <button
          className={`mobile-bottom-nav-item ${notificationDropdownOpen ? "active" : ""}`}
          onClick={() => { setNotificationDropdownOpen(prev => !prev); setUserDropdownOpen(false); }}
        >
          <div style={{ position: "relative" }}>
            <Bell size={20} />
            {unreadCount > 0 && <span className="notification-badge-red" style={{ top: "-5px", right: "-5px" }}>{unreadCount}</span>}
          </div>
          <span>Alerts</span>
        </button>
        <button
          className={`mobile-bottom-nav-item ${userDropdownOpen || pathname.includes("-panel") ? "active" : ""}`}
          onClick={() => {
            if (isAdmin || isInvestor || isBrand) {
              setUserDropdownOpen(prev => !prev);
              setNotificationDropdownOpen(false);
            } else {
              window.dispatchEvent(new CustomEvent("open-auth-modal", { detail: { tab: "login" } }));
            }
          }}
        >
          <User size={20} />
          <span>Profile</span>
        </button>
      </div>
    </>
  );
}
