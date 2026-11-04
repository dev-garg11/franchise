/**
 * Lightweight, high-fidelity browser/DOM shim for opaque-box E2E testing
 * Implements Window, Document, History, Location, Storage, and MutationObserver tracking
 * Zero external dependencies (stdlib first - Ponytail ladder)
 */

export class MockStorage {
  constructor() {
    this._data = new Map();
  }
  getItem(key) {
    return this._data.has(key) ? this._data.get(key) : null;
  }
  setItem(key, value) {
    this._data.set(key, String(value));
  }
  removeItem(key) {
    this._data.delete(key);
  }
  clear() {
    this._data.clear();
  }
  get length() {
    return this._data.size;
  }
  key(index) {
    return Array.from(this._data.keys())[index] || null;
  }
}

export class MockHistory {
  constructor(location, onPopState) {
    this._stack = [{ state: null, url: location.href, title: "" }];
    this._index = 0;
    this._location = location;
    this._onPopState = onPopState;
  }

  get length() {
    return this._stack.length;
  }

  get state() {
    return this._stack[this._index]?.state ?? null;
  }

  pushState(state, title, url) {
    if (url) {
      this._location._setPathname(url);
    }
    // Truncate any forward history
    this._stack = this._stack.slice(0, this._index + 1);
    this._stack.push({ state, title, url: this._location.href });
    this._index = this._stack.length - 1;
  }

  replaceState(state, title, url) {
    if (url) {
      this._location._setPathname(url);
    }
    this._stack[this._index] = { state, title, url: this._location.href };
  }

  back() {
    this.go(-1);
  }

  forward() {
    this.go(1);
  }

  go(delta) {
    const target = this._index + delta;
    if (target >= 0 && target < this._stack.length) {
      this._index = target;
      const entry = this._stack[this._index];
      this._location._setPathname(entry.url);
      if (typeof this._onPopState === "function") {
        this._onPopState({ state: entry.state, pathname: this._location.pathname });
      }
    }
  }
}

export class MockLocation {
  constructor(initialUrl = "http://localhost:3000/admin") {
    this._url = new URL(initialUrl);
  }

  get href() {
    return this._url.href;
  }
  set href(val) {
    this._url = new URL(val, this._url.origin);
  }

  get pathname() {
    return this._url.pathname;
  }
  set pathname(val) {
    this._url.pathname = val;
  }

  get search() {
    return this._url.search;
  }

  get origin() {
    return this._url.origin;
  }

  _setPathname(urlOrPath) {
    if (urlOrPath.startsWith("http://") || urlOrPath.startsWith("https://")) {
      this._url = new URL(urlOrPath);
    } else {
      this._url.pathname = urlOrPath.startsWith("/") ? urlOrPath : "/" + urlOrPath;
    }
  }
}

export class BrowserEnvironment {
  constructor(initialUrl = "http://localhost:3000/admin") {
    this.location = new MockLocation(initialUrl);
    this.listeners = new Map();
    this.localStorage = new MockStorage();
    this.sessionStorage = new MockStorage();

    this.history = new MockHistory(this.location, (e) => {
      this.dispatchEvent("popstate", e);
    });

    this.spinnerMountCount = 0;
    this.domElements = [];
    this.activeTab = null;

    // Default pre-authenticated admin state
    this.localStorage.setItem("adminLoggedIn", "true");
  }

  addEventListener(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event).add(callback);
  }

  removeEventListener(event, callback) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).delete(callback);
    }
  }

  dispatchEvent(event, data) {
    if (this.listeners.has(event)) {
      for (const cb of this.listeners.get(event)) {
        try {
          cb(data);
        } catch (err) {
          console.error(`Error in event listener for ${event}:`, err);
        }
      }
    }
  }

  recordElementMount(elementDesc) {
    this.domElements.push(elementDesc);
    if (
      (typeof elementDesc === "string" && elementDesc.includes("Verifying Authorization status")) ||
      (elementDesc?.className && elementDesc.className.includes("spinner") && elementDesc.text?.includes("Verifying Authorization"))
    ) {
      this.spinnerMountCount++;
    }
  }

  resetSpinnerCount() {
    this.spinnerMountCount = 0;
  }
}
