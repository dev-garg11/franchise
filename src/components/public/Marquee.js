export default function Marquee({ items = [] }) {
  const brands = items
    .map((item) => (typeof item === "string" ? { name: item, image: "" } : item))
    .filter((item) => item?.name || item?.image)
    .slice(0, 24);
  if (!brands.length) return null;
  const loop = [...brands, ...brands];
  return (
    <div className="public-marquee" tabIndex="0" aria-label="Verified brands">
      <div className="public-marquee-track">
        {loop.map((brand, index) => (
          <span className="public-marquee-brand" key={`${brand.name || "brand"}-${index}`} title={brand.name || "Verified brand"}>
            {/* eslint-disable-next-line @next/next/no-img-element -- admin may store remote/data-URI logos. */}
            <img
              src={brand.image || "/logo.png"}
              alt={`${brand.name || "Verified brand"} logo`}
              loading={index < brands.length ? "eager" : "lazy"}
              decoding="async"
              onError={(event) => {
                event.currentTarget.onerror = null;
                event.currentTarget.src = "/logo.png";
              }}
            />
          </span>
        ))}
      </div>
    </div>
  );
}
