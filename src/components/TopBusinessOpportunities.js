"use client";

import { useEffect, useMemo, useState } from "react";
import { Zap } from "lucide-react";
import { getApprovedBrands } from "@/lib/brandsCache";
import { ProductSkeletonGrid } from "@/components/SkeletonLoader";
import SectionHeader from "@/components/public/SectionHeader";
import BrandCard from "@/components/public/BrandCard";

export default function TopBusinessOpportunities({ brands = [], loading = false, onSelectBrand }) {
  const [dbBrands, setDbBrands] = useState([]);
  const [activeFilter, setActiveFilter] = useState("All");
  const [fetching, setFetching] = useState(false);

  useEffect(() => {
    // If brands are already provided by parent, no need to fetch
    if (brands && brands.length > 0) {
      setFetching(false);
      return;
    }
    let isMounted = true;
    setFetching(true);
    getApprovedBrands()
      .then((data) => {
        if (isMounted) setDbBrands(Array.isArray(data) ? data : []);
      })
      .catch(() => {})
      .finally(() => {
        if (isMounted) setFetching(false);
      });
    return () => {
      isMounted = false;
    };
  }, [brands]);

  const sourceBrands = (brands && brands.length > 0) ? brands : dbBrands;
  const isLoading = loading || (sourceBrands.length === 0 && fetching);

  const filters = useMemo(() => [
    "All",
    ...Array.from(new Set(sourceBrands.map((brand) => brand.category).filter(Boolean))).slice(0, 4)
  ], [sourceBrands]);

  const visibleBrands = useMemo(() => (
    sourceBrands.filter((brand) => activeFilter === "All" || brand.category === activeFilter).slice(0, 6)
  ), [activeFilter, sourceBrands]);

  return (
    <section className="public-business-opportunities" aria-labelledby="business-opportunities-title">
      <div className="container">
        <SectionHeader
          eyebrow={<><Zap size={14} /> Verified Database</>}
          title="Top Business Opportunities"
          subtitle="Discover available concepts using the latest approved brand records."
          align="center"
        />
        <div className="public-filter-row public-filter-row--left">
          {filters.map((filter) => (
            <button
              type="button"
              key={filter}
              className={`public-filter-pill public-filter-pill--green${activeFilter === filter ? " is-active" : ""}`}
              onClick={() => setActiveFilter(filter)}
            >
              {filter}
            </button>
          ))}
        </div>
        {isLoading ? (
          <ProductSkeletonGrid count={3} minWidth="280px" />
        ) : visibleBrands.length > 0 ? (
          <div className="public-business-grid">
            {visibleBrands.map((brand) => (
              <BrandCard
                key={brand.id || brand._id || brand.name}
                brand={brand}
                compact
                onEnquire={onSelectBrand}
              />
            ))}
          </div>
        ) : (
          <div className="public-empty-state">
            <h3>No business opportunities listed yet</h3>
            <p>Approved business concepts will appear here.</p>
          </div>
        )}
      </div>
    </section>
  );
}
