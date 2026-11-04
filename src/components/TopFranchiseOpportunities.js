"use client";

import { useMemo, useState } from "react";
import { Award, ArrowRight } from "lucide-react";
import { ProductSkeletonGrid } from "@/components/SkeletonLoader";
import SectionHeader from "@/components/public/SectionHeader";
import Button from "@/components/public/Button";
import BrandCard from "@/components/public/BrandCard";

export default function TopFranchiseOpportunities({ brands = [], loading = false, onSelectBrand }) {
  const [activeCategory, setActiveCategory] = useState("All");
  const categories = useMemo(() => [
    "All",
    ...Array.from(new Set(brands.map((brand) => brand.category).filter(Boolean))).slice(0, 5)
  ], [brands]);
  const filteredBrands = useMemo(() => (
    brands.filter((brand) => activeCategory === "All" || brand.category === activeCategory).slice(0, 6)
  ), [activeCategory, brands]);

  return (
    <section className="public-top-picks" aria-labelledby="top-picks-title">
      <div className="container">
        <SectionHeader
          eyebrow={<><Award size={14} /> Certified Top Picks</>}
          title="Top Franchise Opportunities in "
          accent="India"
          subtitle="Explore verified opportunities using real investment, location and brand data from Franchise Roots."
          align="center"
        />
        <div className="public-filter-row" aria-label="Top opportunity categories">
          {categories.map((category) => (
            <button key={category} type="button" className={`public-filter-pill${activeCategory === category ? " is-active" : ""}`} onClick={() => setActiveCategory(category)}>
              {category === "All" ? "All Top Brands" : category}
            </button>
          ))}
        </div>
        {loading ? <ProductSkeletonGrid count={3} minWidth="280px" /> : filteredBrands.length === 0 ? (
          <div className="public-empty-state"><h3>No top opportunities listed yet</h3><p>Approved brands will appear here when they are available.</p></div>
        ) : (
          <div className="public-top-picks-grid">
            {filteredBrands.slice(0, 3).map((brand, index) => (
              <div className="public-top-pick-wrap" key={brand.id || brand._id || brand.name}>
                <BrandCard brand={brand} topPick={index === 0} onEnquire={onSelectBrand} />
              </div>
            ))}
          </div>
        )}
        <div className="public-centered-action"><Button href="/brands" variant="red">See all top brands <ArrowRight size={16} /></Button></div>
      </div>
    </section>
  );
}
