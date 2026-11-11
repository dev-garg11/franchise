"use client";

import { useState, useEffect, useCallback } from "react";

let memoryBrandsCache = null;
let memoryTotalCount = null;
let fetchPromise = null;
let statsPromise = null;

const CACHE_KEY = "cached_approved_brands_v2";
const STATS_KEY = "cached_brands_stats_v1";

/**
 * Safely saves brand data to sessionStorage while preserving original brand image data.
 */
function saveToSessionStorage(data) {
    if (typeof window === "undefined" || !Array.isArray(data)) return;
    try {
        const cleanData = data.map(b => {
            const { user, password, ...rest } = b;
            return rest;
        });
        sessionStorage.setItem(CACHE_KEY, JSON.stringify(cleanData));
    } catch (e) {
        try {
            sessionStorage.removeItem(CACHE_KEY);
        } catch (ignored) {}
    }
}

/**
 * Synchronously retrieves cached approved brands from memory or sessionStorage if available.
 */
export function getCachedApprovedBrandsSync() {
    if (memoryBrandsCache && memoryBrandsCache.length > 0) {
        return memoryBrandsCache;
    }
    if (typeof window !== "undefined") {
        try {
            sessionStorage.removeItem("cached_approved_brands");
            const stored = sessionStorage.getItem(CACHE_KEY);
            if (stored) {
                const parsed = JSON.parse(stored);
                if (Array.isArray(parsed) && parsed.length > 0) {
                    memoryBrandsCache = parsed;
                    return memoryBrandsCache;
                }
            }
        } catch (e) {}
    }
    return null;
}

/**
 * Synchronously retrieves cached total count from memory or sessionStorage.
 */
export function getCachedTotalCountSync() {
    if (typeof memoryTotalCount === "number" && memoryTotalCount > 0) {
        return memoryTotalCount;
    }
    if (typeof window !== "undefined") {
        try {
            const stored = sessionStorage.getItem(STATS_KEY);
            if (stored) {
                const parsed = JSON.parse(stored);
                if (parsed && typeof parsed.total === "number" && parsed.total > 0) {
                    memoryTotalCount = parsed.total;
                    return memoryTotalCount;
                }
            }
        } catch (e) {}
    }
    return null;
}

/**
 * Fetches real-time brand statistics from /api/brands/stats.
 */
export async function getBrandStats(forceRefresh = false) {
    if (statsPromise && !forceRefresh) return statsPromise;

    statsPromise = (async () => {
        try {
            const res = await fetch(`/api/brands/stats?t=${Date.now()}`, { cache: "no-store" });
            if (res.ok) {
                const data = await res.json();
                if (data && typeof data.total === "number") {
                    memoryTotalCount = data.total;
                    if (typeof window !== "undefined") {
                        try {
                            sessionStorage.setItem(STATS_KEY, JSON.stringify(data));
                        } catch (e) {}
                    }
                    return data;
                }
            }
        } catch (e) {
            // Fail silently
        } finally {
            statsPromise = null;
        }
        return { total: memoryTotalCount || 154, approved: 149 };
    })();

    return statsPromise;
}

/**
 * Background revalidation helper
 */
async function revalidateApprovedBrands(force = false) {
    if (fetchPromise && !force) {
        return fetchPromise;
    }

    fetchPromise = (async () => {
        const controller = new AbortController();
        const timeout = typeof window !== "undefined"
            ? window.setTimeout(() => controller.abort("Request timed out"), 25000)
            : null;
        try {
            const fetchOptions = {
                cache: "no-store",
                signal: controller.signal
            };
            const res = await fetch(`/api/brands?status=Approved&t=${Date.now()}`, fetchOptions);
            if (res.ok) {
                const data = await res.json();
                if (Array.isArray(data)) {
                    memoryBrandsCache = data;
                    saveToSessionStorage(data);
                    return data;
                }
            }
        } catch (error) {
            if (error?.name !== "AbortError" && error?.name !== "TimeoutError") {
                console.error("Error fetching approved brands:", error);
            }
        } finally {
            if (timeout) window.clearTimeout(timeout);
            fetchPromise = null;
        }
        return memoryBrandsCache || getCachedApprovedBrandsSync() || [];
    })();

    return fetchPromise;
}

/**
 * Fetches approved brands with client-side caching and automatic background refresh.
 */
export async function getApprovedBrands(options = {}) {
    const { forceRefresh = false } = options;

    if (!forceRefresh) {
        const cached = getCachedApprovedBrandsSync();
        if (cached && cached.length > 0) {
            // Revalidate in background so subsequent visits and tabs have fresh data
            revalidateApprovedBrands(false).catch(() => {});
            return cached;
        }
    }

    return revalidateApprovedBrands(forceRefresh);
}

/**
 * Clears client-side brands and stats cache and triggers a broadcast event.
 */
export function clearBrandsCache() {
    memoryBrandsCache = null;
    memoryTotalCount = null;
    fetchPromise = null;
    statsPromise = null;
    if (typeof window !== "undefined") {
        try {
            sessionStorage.removeItem(CACHE_KEY);
            sessionStorage.removeItem(STATS_KEY);
            sessionStorage.removeItem("cached_approved_brands");
            window.dispatchEvent(new CustomEvent("brands-updated"));
        } catch (e) {}
    }
}

/**
 * React hook to consume approved brands with real-time totalCount and background revalidation.
 */
export function useApprovedBrands() {
    const [brands, setBrands] = useState([]);
    const [totalCount, setTotalCount] = useState(0);
    const [loading, setLoading] = useState(true);

    const loadBrands = useCallback(async (force = false) => {
        if (force) {
            setLoading(true);
        }
        try {
            const [brandsData, statsData] = await Promise.all([
                getApprovedBrands({ forceRefresh: force }),
                getBrandStats(force)
            ]);

            if (Array.isArray(brandsData) && brandsData.length > 0) {
                setBrands(brandsData);
            }
            if (statsData && typeof statsData.total === "number" && statsData.total > 0) {
                setTotalCount(statsData.total);
            } else if (Array.isArray(brandsData) && brandsData.length > 0) {
                setTotalCount(brandsData.length);
            }
            setLoading(false);
            return brandsData;
        } catch (e) {
            setLoading(false);
            return [];
        }
    }, []);

    useEffect(() => {
        let isMounted = true;

        // 1. Synchronous initial state from session storage for 0ms paint
        const syncBrands = getCachedApprovedBrandsSync();
        const syncTotal = getCachedTotalCountSync();
        if (syncBrands && syncBrands.length > 0) {
            setBrands(syncBrands);
            setTotalCount(syncTotal || syncBrands.length);
            setLoading(false);
        }

        // 2. Fetch fresh real-time data in background
        loadBrands(false).then((data) => {
            if (isMounted && data && data.length > 0) {
                setBrands(data);
            }
        });

        // 3. Listen to brand updates across components (e.g. brand registered, brand approved)
        const handleUpdate = () => {
            loadBrands(true);
        };
        window.addEventListener("brands-updated", handleUpdate);

        // 4. Revalidate when tab becomes visible
        const handleVisibilityChange = () => {
            if (document.visibilityState === "visible") {
                loadBrands(false);
            }
        };
        document.addEventListener("visibilitychange", handleVisibilityChange);

        return () => {
            isMounted = false;
            window.removeEventListener("brands-updated", handleUpdate);
            document.removeEventListener("visibilitychange", handleVisibilityChange);
        };
    }, [loadBrands]);

    const refreshBrands = useCallback(() => {
        return loadBrands(true);
    }, [loadBrands]);

    return { brands, loading, refreshBrands, setBrands, totalCount };
}
