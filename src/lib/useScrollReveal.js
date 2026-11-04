"use client";

import { useEffect } from "react";

/**
 * Lightweight, zero-dependency scroll reveal hook using native IntersectionObserver.
 * Triggers hardware-accelerated transitions via .reveal-on-scroll and .is-revealed.
 */
export function useScrollReveal() {
  useEffect(() => {
    if (typeof window === "undefined" || !("IntersectionObserver" in window)) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-revealed");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -30px 0px" }
    );

    const elements = document.querySelectorAll(".reveal-on-scroll:not(.is-revealed)");
    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);
}
