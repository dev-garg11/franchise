"use client";

/**
 * Lightweight in-memory + sessionStorage cache for admin dashboard.
 * Eliminates UI freezes and skeleton flashes across tab switches
 * while enabling quiet background SWR revalidation.
 */

const memoryStore = new Map();
const STORAGE_PREFIX = "admin_cache_";
const DEFAULT_TTL_MS = 5 * 60 * 1000; // 5 minutes default TTL

/**
 * Retrieves cached data by key from memory or sessionStorage if fresh.
 * @param {string} key
 * @returns {any | null}
 */
export function getAdminCache(key) {
  if (!key) return null;

  const now = Date.now();

  // 1. Check in-memory cache
  if (memoryStore.has(key)) {
    const entry = memoryStore.get(key);
    if (!entry.expiry || entry.expiry > now) {
      return entry.data;
    }
    // Expired
    memoryStore.delete(key);
  }

  // 2. Check sessionStorage
  if (typeof window !== "undefined") {
    try {
      const raw = sessionStorage.getItem(STORAGE_PREFIX + key);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (!parsed.expiry || parsed.expiry > now) {
          // Promote back to in-memory store
          memoryStore.set(key, parsed);
          return parsed.data;
        }
        // Expired
        sessionStorage.removeItem(STORAGE_PREFIX + key);
      }
    } catch {
      // Silently fall back if sessionStorage unavailable or corrupted
    }
  }

  return null;
}

function sanitizeForStorage(obj, depth = 0) {
  if (depth > 6 || obj === null || obj === undefined) return obj;
  if (typeof obj === "string") {
    // Strip large base64 data URIs from sessionStorage to prevent QuotaExceededError
    if (obj.length > 300 && obj.startsWith("data:image")) {
      return "";
    }
    return obj;
  }
  if (Array.isArray(obj)) {
    return obj.map((item) => sanitizeForStorage(item, depth + 1));
  }
  if (typeof obj === "object") {
    const clean = {};
    for (const [k, v] of Object.entries(obj)) {
      clean[k] = sanitizeForStorage(v, depth + 1);
    }
    return clean;
  }
  return obj;
}

/**
 * Stores data in memory and sessionStorage with optional TTL.
 * @param {string} key
 * @param {any} data
 * @param {number} [ttlMs]
 */
export function setAdminCache(key, data, ttlMs = DEFAULT_TTL_MS) {
  if (!key || data === undefined) return;

  const expiry = ttlMs ? Date.now() + ttlMs : null;
  const entry = { data, expiry };

  // 1. Update in-memory store
  memoryStore.set(key, entry);

  // 2. Update sessionStorage (sanitized to prevent QuotaExceededError)
  if (typeof window !== "undefined") {
    try {
      const sanitizedEntry = {
        data: sanitizeForStorage(data),
        expiry
      };
      sessionStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(sanitizedEntry));
    } catch {
      // Gracefully handle quota exception or security blocks
    }
  }
}

/**
 * Invalidates cache entries matching a pattern or clears all if no pattern provided.
 * @param {string} [pattern]
 */
export function invalidateAdminCache(pattern) {
  if (!pattern) {
    memoryStore.clear();
    if (typeof window !== "undefined") {
      try {
        const keysToRemove = [];
        for (let i = 0; i < sessionStorage.length; i++) {
          const k = sessionStorage.key(i);
          if (k && k.startsWith(STORAGE_PREFIX)) {
            keysToRemove.push(k);
          }
        }
        keysToRemove.forEach((k) => sessionStorage.removeItem(k));
      } catch {
        // Ignore errors
      }
    }
    return;
  }

  // Invalidate matching keys in memory
  for (const k of Array.from(memoryStore.keys())) {
    if (k.includes(pattern) || k.startsWith(pattern)) {
      memoryStore.delete(k);
    }
  }

  // Invalidate matching keys in sessionStorage
  if (typeof window !== "undefined") {
    try {
      const keysToRemove = [];
      for (let i = 0; i < sessionStorage.length; i++) {
        const k = sessionStorage.key(i);
        if (k && k.startsWith(STORAGE_PREFIX)) {
          const subKey = k.slice(STORAGE_PREFIX.length);
          if (subKey.includes(pattern) || subKey.startsWith(pattern)) {
            keysToRemove.push(k);
          }
        }
      }
      keysToRemove.forEach((k) => sessionStorage.removeItem(k));
    } catch {
      // Ignore errors
    }
  }
}
