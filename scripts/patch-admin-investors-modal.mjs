import fs from "fs";

let code = fs.readFileSync("src/app/admin/page.js", "utf8");

// 1. Replace the modal useEffect
const oldModalEffect = `  useEffect(() => {
    if (selectedItem && modalType === "brand") {
      const brandId = selectedItem.id || selectedItem._id;
      const attached = investors
        .filter(inv => inv.assignedBrands && (inv.assignedBrands.includes(brandId) || inv.assignedBrands.includes(selectedItem._id)))
        .map(inv => inv.id || inv._id);
      setSelectedInvestorsForBrand(attached);
      setAssignFilterMode("matching");
      setAssignSearch("");
    }
  }, [selectedItem, modalType, investors]);`;

const newModalEffect = `  useEffect(() => {
    if (selectedItem && modalType === "brand") {
      const loadInvestorsPool = async () => {
        if (allInvestors.length === 0) {
          try {
            const res = await fetch("/api/investors", { cache: "no-store" });
            if (res.ok) {
              const data = await res.json();
              const list = Array.isArray(data) ? data : (data.data || []);
              if (Array.isArray(list) && list.length > 0) {
                setAllInvestors(list);
                setTotalInvestors(list.length);
              }
            }
          } catch (e) {
            console.warn("Could not load full investors pool for brand modal:", e);
          }
        }
      };
      loadInvestorsPool();

      const pool = allInvestors.length > 0 ? allInvestors : investors;
      const brandId = selectedItem.id || selectedItem._id;
      const attached = pool
        .filter(inv => inv.assignedBrands && (inv.assignedBrands.includes(brandId) || inv.assignedBrands.includes(selectedItem._id)))
        .map(inv => inv.id || inv._id);
      setSelectedInvestorsForBrand(attached);
      setAssignFilterMode("matching");
      setAssignSearch("");
    }
  }, [selectedItem, modalType, allInvestors.length, investors]);`;

if (code.includes(oldModalEffect.trim())) {
  code = code.replace(oldModalEffect.trim(), newModalEffect.trim());
  console.log("✔ Modal useEffect successfully patched");
} else {
  // Try regex match with normalized newlines
  const regex = /useEffect\(\(\) => \{\s*if \(selectedItem && modalType === "brand"\) \{[\s\S]*?setSelectedInvestorsForBrand\(attached\);[\s\S]*?setAssignSearch\(""\);\s*\}\s*\}, \[selectedItem, modalType, investors\]\);/;
  if (regex.test(code)) {
    code = code.replace(regex, newModalEffect.trim());
    console.log("✔ Modal useEffect matched via regex and patched");
  } else {
    console.log("Warning: modal useEffect pattern not found");
  }
}

// 2. In Assign to Investors section, define investorAssignPool and use it
const oldAssignSectionHeader = `{/* Assign to Investors section */}
              <div style={{ marginTop: "20px", background: "#ffffff", padding: "18px", borderRadius: "12px", border: "1px solid var(--light-border)", boxShadow: "0 2px 8px rgba(0,0,0,0.03)" }}>`;

const newAssignSectionHeader = `{/* Assign to Investors section */}
              {(() => {
                const investorAssignPool = allInvestors.length > 0 ? allInvestors : investors;
                return (
              <div style={{ marginTop: "20px", background: "#ffffff", padding: "18px", borderRadius: "12px", border: "1px solid var(--light-border)", boxShadow: "0 2px 8px rgba(0,0,0,0.03)" }}>`;

if (code.includes(oldAssignSectionHeader)) {
  code = code.replace(oldAssignSectionHeader, newAssignSectionHeader);
  console.log("✔ Wrapped Assign to Investors section with investorAssignPool scope");
}

// Replace button All Investors ({investors.length}) with ({investorAssignPool.length})
code = code.replace(
  /All Investors \(\{investors\.length\}\)/g,
  "All Investors ({investorAssignPool.length})"
);

// Replace {investors.length === 0 ? (
code = code.replace(
  /\{investors\.length === 0 \? \(/g,
  "{investorAssignPool.length === 0 ? ("
);

// Replace const displayedAssignInvestors = investors.filter
code = code.replace(
  /const displayedAssignInvestors = investors\.filter/g,
  "const displayedAssignInvestors = investorAssignPool.filter"
);

// Close the wrapper before closing modal content
const oldSectionEnd = `                  </div>
                </div>
              </div>
            </div>`;

// Let's verify closing tag
code = code.replace(
  `{isSavingAssign ? "Saving Assignment..." : \`Save Assignment (\${selectedInvestorsForBrand.length} Selected)\`}
                      </button>
                    </div>
                  </div>
                </div>
              </div>`,
  `{isSavingAssign ? "Saving Assignment..." : \`Save Assignment (\${selectedInvestorsForBrand.length} Selected)\`}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
                );
              })()}`
);

fs.writeFileSync("src/app/admin/page.js", code, "utf8");
console.log("✔ Successfully updated src/app/admin/page.js with investorAssignPool");
