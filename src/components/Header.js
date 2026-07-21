"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LogIn, PlusCircle, Shield, User, LogOut, Building, Menu, X,
  Bell, Search, ChevronDown, Sparkles, HelpCircle, Layers, Star,
  Trash2, CheckCircle, ArrowRight, Clock, ArrowUp
} from "lucide-react";

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
  const [scrollPercent, setScrollPercent] = useState(0);
  const [showScrollTop, setShowScrollTop] = useState(false);

  // Mouse Glow Position
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  // Refs for closing on click outside
  const notificationRef = useRef(null);
  const userDropdownRef = useRef(null);
  const searchInputRef = useRef(null);

  // Sync auth, notifications, history on render/pathname change
  useEffect(() => {
    const adminAuth = localStorage.getItem("adminLoggedIn");
    const investorAuth = localStorage.getItem("investorLoggedIn");
    const brandAuth = localStorage.getItem("brandLoggedIn");

    const invName = localStorage.getItem("investorName");
    const brName = localStorage.getItem("brandName");

    setIsAdmin(adminAuth === "true");
    setIsInvestor(investorAuth === "true");
    setIsBrand(brandAuth === "true");

    setInvestorName(invName || "Investor");
    setBrandName(brName || "Brand Owner");

    setMobileMenuOpen(false);

    // Notifications init
    const storedNotifs = localStorage.getItem("userNotifications");
    if (storedNotifs) {
      setNotifications(JSON.parse(storedNotifs));
    } else {
      localStorage.setItem("userNotifications", JSON.stringify(DEFAULT_NOTIFICATIONS));
      setNotifications(DEFAULT_NOTIFICATIONS);
    }

    // Search History init
    const storedHistory = localStorage.getItem("recentSearches");
    if (storedHistory) {
      setSearchHistory(JSON.parse(storedHistory));
    }
  }, [pathname]);

  // Sync Scroll Percent and mouse move glow
  useEffect(() => {
    const handleScroll = () => {
      // shrink navbar
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }

      // show scroll top
      if (window.scrollY > 300) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }

      // calculate reading progress
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        setScrollPercent((window.scrollY / totalHeight) * 100);
      }
    };

    const handleMouseMove = (e) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener("scroll", handleScroll);
    window.addEventListener("mousemove", handleMouseMove);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  // Keyboard Shortcuts Ctrl+K and ESC
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setSearchModalOpen(prev => !prev);
      }
      if (e.key === "Escape") {
        setSearchModalOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Click Outside logic
  useEffect(() => {
    function handleClickOutside(event) {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setNotificationDropdownOpen(false);
      }
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target)) {
        setUserDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch approved brands for search if search modal is opened
  useEffect(() => {
    if (searchModalOpen && allBrands.length === 0) {
      const fetchBrands = async () => {
        try {
          setLoadingSearch(true);
          const res = await fetch("/api/brands?status=Approved");
          if (res.ok) {
            const data = await res.json();
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
      router.push(`/?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleRecentSearchClick = (term) => {
    setSearchQuery(term);
    addQueryToHistory(term);
    setSearchModalOpen(false);
    router.push(`/?search=${encodeURIComponent(term)}`);
  };

  const handleResultClick = (brand) => {
    addQueryToHistory(brand.name);
    setSearchModalOpen(false);
    router.push(`/?search=${encodeURIComponent(brand.name)}`);
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
      {/* 1. Reading Progress Bar */}
      <div className="progress-bar-container">
        <div className="progress-bar" style={{ width: `${scrollPercent}%` }}></div>
      </div>

      {/* 2. Interactive Mouse Glow Orbs */}
      <div className="mouse-glow-trail" style={{ left: `${mousePos.x}px`, top: `${mousePos.y}px` }}></div>

      {/* 3. Header Container */}
      <header className={`header ${isScrolled ? "shrink" : ""}`} style={{
        position: 'sticky',
        top: 0,
        zIndex: 1000,
        width: '100%',
        transition: 'var(--transition-normal)'
      }}>
        <div className="container header-container" style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'relative'
        }}>
          {/* Logo */}
          <Link href="/" style={{ display: 'flex', alignItems: 'center', transition: 'var(--transition-normal)' }}>
            <img 
              src="/WhatsApp_Image_2026-07-16_at_4.40.00_PM__2_-removebg-preview.png" 
              alt="Franchise Roots" 
              style={{
                height: isScrolled ? '130px' : '185px',
                width: 'auto',
                transition: 'var(--transition-normal)',
                objectFit: 'contain'
              }} 
            />
          </Link>

          {/* Mobile Hamburger Button */}
          <button
            className="mobile-menu-toggle flex-center"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>

          {/* Navigation container */}
          <nav className={`nav-container ${mobileMenuOpen ? "open" : ""}`}>
            <ul className="nav-links">
              <li>
                <Link href="/" className={`nav-link ${pathname === "/" ? "active" : ""}`}>
                  Home
                </Link>
              </li>

              {/* Mega Dropdown / Solutions menu */}
              <li
                onMouseEnter={() => setActiveDropdown(true)}
                onMouseLeave={() => setActiveDropdown(false)}
                style={{ position: 'relative' }}
              >
                <button className="nav-link" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
                  Solutions <ChevronDown size={14} style={{ transform: activeDropdown ? 'rotate(180deg)' : 'none', transition: 'var(--transition-fast)' }} />
                </button>

                {activeDropdown && (
                  <div style={{
                    position: 'absolute',
                    top: '100%',
                    left: '-50px',
                    width: '320px',
                    background: 'rgba(255, 255, 255, 0.95)',
                    backdropFilter: 'blur(20px)',
                    borderRadius: 'var(--radius-md)',
                    boxShadow: 'var(--shadow-lg)',
                    border: '1px solid rgba(255, 255, 255, 0.6)',
                    padding: '20px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '16px',
                    zIndex: 1100,
                    marginTop: '4px',
                    animation: 'dropdown-fade-in 0.2s ease-out'
                  }}>
                    <Link href="/brand-registration" style={{ display: 'flex', gap: '12px', padding: '8px', borderRadius: '8px' }} className="dropdown-item-hover">
                      <Building size={18} style={{ color: 'var(--primary)', flexShrink: 0, marginTop: '2px' }} />
                      <div>
                        <h5 style={{ fontSize: '13.5px', fontWeight: '700', color: 'var(--text-dark)' }}>Brand Listing Expansion</h5>
                        <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Promote your business concepts to 50k+ investors.</p>
                      </div>
                    </Link>
                    <Link href="/investor-registration" style={{ display: 'flex', gap: '12px', padding: '8px', borderRadius: '8px' }} className="dropdown-item-hover">
                      <Sparkles size={18} style={{ color: 'var(--secondary)', flexShrink: 0, marginTop: '2px' }} />
                      <div>
                        <h5 style={{ fontSize: '13.5px', fontWeight: '700', color: 'var(--text-dark)' }}>Investor Matching Desk</h5>
                        <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Identify pre-qualified franchise recommendations.</p>
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
                  href="/brand-registration"
                  className={`nav-link ${pathname === "/brand-registration" ? "active" : ""}`}
                >
                  Register Your Brand
                </Link>
              </li>
              <li>
                <Link
                  href="/investor-registration"
                  className={`nav-link ${pathname === "/investor-registration" ? "active" : ""}`}
                >
                  Start A Business
                </Link>
              </li>
            </ul>

            {/* Right-side utilities and CTAs */}
            <div className="nav-actions">
              {/* Search and Notification Utility Icons */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginRight: '4px' }} className="nav-utility-icons">
                {/* Search Trigger Button */}
                <button
                  aria-label="Search opportunities"
                  className="nav-icon-btn"
                  onClick={() => setSearchModalOpen(true)}
                  title="Search (Ctrl + K)"
                >
                  <Search size={18} />
                </button>

                {/* Notifications dropdown trigger */}
                <div style={{ position: 'relative' }} ref={notificationRef}>
                  <button
                    aria-label="Notifications"
                    className="nav-icon-btn"
                    onClick={() => setNotificationDropdownOpen(prev => !prev)}
                  >
                    <Bell size={18} />
                    {unreadCount > 0 && (
                      <span className="notification-badge-red">{unreadCount}</span>
                    )}
                  </button>

                  {/* Premium glass notification panel */}
                  {notificationDropdownOpen && (
                    <div className="dropdown-panel-premium notification-panel">
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
                  )}
                </div>
              </div>

              {/* Login Profile Actions */}
              {isAdmin || isInvestor || isBrand ? (
                <div style={{ position: 'relative' }} ref={userDropdownRef}>
                  <div
                    className="user-profile-group"
                    style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}
                    onClick={() => setUserDropdownOpen(prev => !prev)}
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
                <div className="auth-buttons-group" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <button
                    onClick={() => {
                      setLoadingLogin(true);
                      setTimeout(() => {
                        setLoadingLogin(false);
                        window.dispatchEvent(new CustomEvent("open-auth-modal", { detail: { tab: "login" } }));
                      }, 400);
                    }}
                    className="btn btn-outline"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '10px 20px' }}
                  >
                    {loadingLogin ? (
                      <div className="spinner" style={{ width: "14px", height: "14px", borderWidth: "2px", borderColor: "rgba(0,0,0,0.1)", borderTopColor: "var(--primary)" }}></div>
                    ) : (
                      <LogIn size={15} />
                    )}
                    Login
                  </button>
                  <button
                    onClick={() => {
                      setLoadingAddBrand(true);
                      setTimeout(() => {
                        setLoadingAddBrand(false);
                        router.push("/brand-registration");
                      }, 500);
                    }}
                    className="btn btn-primary add-brand-btn-premium"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '10px 20px' }}
                  >
                    {loadingAddBrand ? (
                      <div className="spinner" style={{ width: "14px", height: "14px", borderWidth: "2px", borderTopColor: "white" }}></div>
                    ) : (
                      <PlusCircle size={15} />
                    )}
                    Add Brand
                  </button>
                </div>
              )}
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
                      {["Food and Beverage", "Retail", "Education", "Automobiles", "Health and Wellness"].map((category, index) => (
                        <div key={index} className="search-tag-chip" style={{ background: "rgba(124, 58, 237, 0.05)", color: "var(--secondary)", borderColor: "rgba(124, 58, 237, 0.1)" }} onClick={() => {
                          setSearchModalOpen(false);
                          router.push(`/?category=${encodeURIComponent(category)}`);
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
                      <p style={{ fontSize: "12px", marginTop: "4px" }}>We couldn't find any approved brand matching "{searchQuery}".</p>
                    </div>
                  ) : (
                    <div className="search-results-list">
                      {filteredBrands.map((brand) => (
                        <div
                          key={brand.id}
                          className="search-result-item-card"
                          onClick={() => handleResultClick(brand)}
                        >
                          <img
                            className="search-result-thumb"
                            src={brand.image || "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&q=80&w=100"}
                            alt={brand.name}
                          />
                          <div className="search-result-info">
                            <span className="search-result-name">{brand.name}</span>
                            <div className="search-result-meta">
                              <span className="search-result-badge">{brand.category}</span>
                              <span>•</span>
                              <span>HQ: {brand.hq}</span>
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
