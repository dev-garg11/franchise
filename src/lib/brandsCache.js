"use client";

import { useState, useEffect, useCallback } from "react";

let memoryBrandsCache = null;
let fetchPromise = null;

const CACHE_KEY = "cached_approved_brands_v2";

/**
 * Safely saves brand data to sessionStorage while preserving original brand image data.
 */
function saveToSessionStorage(data) {
    if (typeof window === "undefined" || !Array.isArray(data)) return;
    try {
        // Sanitize brand items (omit sensitive user objects and passwords, retain all image data)
        const cleanData = data.map(b => {
            const { user, password, ...rest } = b;
            return rest;
        });
        sessionStorage.setItem(CACHE_KEY, JSON.stringify(cleanData));
    } catch (e) {
        // If quota exceeded, silently handle item to prevent browser error logs
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
            // Clean legacy cache key that stripped images
            sessionStorage.removeItem("cached_approved_brands");

            const stored = sessionStorage.getItem(CACHE_KEY);
            if (stored) {
                const parsed = JSON.parse(stored);
                if (Array.isArray(parsed) && parsed.length > 0) {
                    memoryBrandsCache = parsed;
                    return memoryBrandsCache;
                }
            }
        } catch (e) {
            // Ignore sessionStorage read errors
        }
    }
    return null;
}

/**
 * Fetches approved brands with client-side caching and request deduplication.
 */
export async function getApprovedBrands(options = {}) {
    const { forceRefresh = false } = options;

    if (!forceRefresh) {
        const cached = getCachedApprovedBrandsSync();
        if (cached) {
            return cached;
        }
    }

    if (fetchPromise && !forceRefresh) {
        return fetchPromise;
    }

    fetchPromise = (async () => {
        try {
            const res = await fetch("/api/brands?status=Approved");
            if (res.ok) {
                const data = await res.json();
                memoryBrandsCache = data;
                saveToSessionStorage(data);
                return data;
            }
        } catch (error) {
            console.error("Error fetching approved brands:", error);
        } finally {
            fetchPromise = null;
        }
        return memoryBrandsCache || [];
    })();

    return fetchPromise;
}

/**
 * Clears the client-side brands cache. Call this after creating, updating, or deleting brands.
 */
export function clearBrandsCache() {
    memoryBrandsCache = null;
    fetchPromise = null;
    if (typeof window !== "undefined") {
        try {
            sessionStorage.removeItem(CACHE_KEY);
            sessionStorage.removeItem("cached_approved_brands");
        } catch (e) {}
    }
}

/**
 * React hook to consume cached approved brands without UI loading flashes on remount/navigation.
 */
export function useApprovedBrands() {
    const [brands, setBrands] = useState(() => {
        const initialCache = getCachedApprovedBrandsSync();
        return initialCache || [];
    });

    const [loading, setLoading] = useState(() => {
        const initialCache = getCachedApprovedBrandsSync();
        return !initialCache;
    });

    const loadBrands = useCallback(async (force = false) => {
        if (force) {
            setLoading(true);
        }
        const data = await getApprovedBrands({ forceRefresh: force });
        setBrands(data);
        setLoading(false);
        return data;
    }, []);

    useEffect(() => {
        let isMounted = true;
        getApprovedBrands().then(data => {
            if (isMounted) {
                setBrands(data);
                setLoading(false);
            }
        });
        return () => {
            isMounted = false;
        };
    }, []);

    const refreshBrands = useCallback(() => {
        return loadBrands(true);
    }, [loadBrands]);

    return { brands, loading, refreshBrands, setBrands };
}
