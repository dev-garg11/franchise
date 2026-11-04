/**
 * Admin Dashboard Test Harness Controller
 * Simulates and verifies the exact navigation, state hydration, and routing logic
 * as specified in PROJECT.md Interface Contracts and ORIGINAL_REQUEST.md.
 */

export const TAB_ROUTE_MAP = {
  dashboard: "/admin",
  brands: "/admin/brands",
  investors: "/admin/investors",
  blogs: "/admin/blogs",
  services: "/admin/services",
  ads: "/admin/ads",
  logs: "/admin/logs"
};

export const ROUTE_TAB_MAP = Object.entries(TAB_ROUTE_MAP).reduce((acc, [tab, route]) => {
  acc[route] = tab;
  return acc;
}, {});

export class AdminDashboardModel {
  constructor(browserEnv, options = {}) {
    this.env = browserEnv;
    this.initialTab = options.initialTab || "dashboard";
    this.activeTab = this.initialTab;
    this.authorized = false;
    this.loading = false;
    this.dataCache = new Map();

    // Filters and local UI states
    this.brandFilters = { status: "all", category: "", state: "", sort: "newest" };
    this.investorFilters = { status: "all", brand: "", category: "", sort: "newest" };
    this.searchTerm = "";
    this.mobileSidebarOpen = false;
    this.activeModal = null; // { type, data }

    // Tab counts
    this.counts = {
      totalBrands: options.totalBrands ?? 12,
      pendingBrandsCount: options.pendingBrandsCount ?? 3,
      totalInvestors: options.totalInvestors ?? 25,
      totalBlogs: options.totalBlogs ?? 8,
      totalServices: options.totalServices ?? 5,
      totalAds: options.totalAds ?? 4
    };

    // Mount lifecycle
    this.mount();
  }

  mount() {
    // Check auth from localStorage
    const isLoggedIn = this.env.localStorage.getItem("adminLoggedIn");
    if (isLoggedIn === "true") {
      this.authorized = true;
    } else {
      this.env.recordElementMount({
        className: "spinner",
        text: "Verifying Authorization status..."
      });
      this.authorized = false;
      this.env.location.pathname = "/login";
      return;
    }

    // Set canonical URL for initial tab if needed
    const expectedRoute = TAB_ROUTE_MAP[this.activeTab] || "/admin";
    if (this.env.location.pathname !== expectedRoute && this.env.location.pathname.startsWith("/admin")) {
      // Direct deep link check: sync activeTab from location.pathname
      const matchedTab = ROUTE_TAB_MAP[this.env.location.pathname];
      if (matchedTab) {
        this.activeTab = matchedTab;
      }
    }

    // Wire popstate listener per PROJECT.md interface contract:
    // window.addEventListener("popstate", ... synchronizes activeTab from window.location.pathname)
    this._popstateHandler = (e) => {
      const path = this.env.location.pathname;
      const matched = ROUTE_TAB_MAP[path] || "dashboard";
      this.activeTab = matched;
    };
    this.env.addEventListener("popstate", this._popstateHandler);
  }

  destroy() {
    if (this._popstateHandler) {
      this.env.removeEventListener("popstate", this._popstateHandler);
    }
  }

  handleTabChange(tabId) {
    if (!TAB_ROUTE_MAP[tabId]) return;

    // Check if auth guard would flash
    if (!this.authorized) {
      this.env.recordElementMount({
        className: "spinner",
        text: "Verifying Authorization status..."
      });
      return;
    }

    this.activeTab = tabId;
    this.searchTerm = "";
    this.mobileSidebarOpen = false;

    // HTML5 pushState per PROJECT.md interface contract
    const targetRoute = TAB_ROUTE_MAP[tabId];
    this.env.history.pushState(null, "", targetRoute);
  }

  openModal(type, data = {}) {
    this.activeModal = { type, data };
  }

  closeModal() {
    this.activeModal = null;
  }

  setBrandStatusFilter(status) {
    this.brandFilters.status = status;
  }

  setSearch(term) {
    this.searchTerm = term;
  }
}
