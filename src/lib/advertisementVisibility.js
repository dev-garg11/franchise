// Every active public ad is shared by the header highlight strip and the
// partner spotlight. Placement is treated as metadata, not a silent visibility
// switch; only private dashboard/admin placements stay off the public site.
const HOMEPAGE_EXCLUDED_POSITIONS = new Set([
  "investor_dashboard",
  "admin_only"
]);

export function isHomepageAdvertisement(ad) {
  if (!ad || ad.isActive === false || !ad.title || !ad.image) return false;
  const position = String(ad.position || "homepage_banner").trim().toLowerCase();
  return !HOMEPAGE_EXCLUDED_POSITIONS.has(position);
}

export function filterHomepageAdvertisements(ads) {
  return Array.isArray(ads) ? ads.filter(isHomepageAdvertisement) : [];
}
