"use client";

import { useEffect, useMemo, useState } from "react";

function normalizeSources(primary, candidates) {
  const values = [primary, ...candidates.flatMap((candidate) => (
    Array.isArray(candidate) ? candidate : [candidate]
  ))];

  return [...new Set(values.filter((value) => typeof value === "string" && value.trim()).map((value) => value.trim()))];
}

export function getImageSources(item = {}, primaryKey = "image") {
  return normalizeSources(item[primaryKey], [
    item.images,
    item.imageUrls,
    item.gallery,
    item.photos,
    item.media
  ]);
}

export default function ImageRotator({ sources = [], alt = "", className = "", style, interval = 2000 }) {
  const imageSources = useMemo(() => normalizeSources(null, [sources]), [sources]);
  const [activeIndex, setActiveIndex] = useState(0);
  const safeActiveIndex = imageSources.length > 0 ? activeIndex % imageSources.length : 0;

  const handleImageError = (event) => {
    const image = event.currentTarget;
    if (image.dataset.fallbackApplied === "true") return;
    image.dataset.fallbackApplied = "true";
    if (imageSources.length > 1) {
      setActiveIndex((index) => (index + 1) % imageSources.length);
      return;
    }
    image.style.opacity = "0";
    image.parentElement?.classList.add("image-rotator--fallback");
  };

  useEffect(() => {
    if (imageSources.length < 2) return undefined;
    const timer = window.setInterval(() => {
      setActiveIndex((index) => (index + 1) % imageSources.length);
    }, interval);
    return () => window.clearInterval(timer);
  }, [imageSources.length, interval]);

  if (imageSources.length === 0) return null;

  return (
    <div className="image-rotator" aria-label={imageSources.length > 1 ? "Rotating images" : undefined}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        key={imageSources[activeIndex]}
        src={imageSources[safeActiveIndex]}
        alt={alt}
        className={`image-rotator-image${className ? ` ${className}` : ""}`}
        style={style}
        onError={handleImageError}
        loading="lazy"
      />
      {imageSources.length > 1 && (
        <span className="image-rotator-dots" aria-hidden="true">
          {imageSources.map((source, index) => <i key={source} className={index === safeActiveIndex ? "is-active" : ""} />)}
        </span>
      )}
    </div>
  );
}
