import fs from "fs";

let code = fs.readFileSync("src/app/admin/page.js", "utf8");

const target = "  const [totalInvestors, setTotalInvestors] = useState(0);";
const replacement = "  const [totalInvestors, setTotalInvestors] = useState(0);\n  const investorAssignPool = (allInvestors && allInvestors.length > 0) ? allInvestors : (investors || []);";

if (code.includes(target) && !code.includes("const investorAssignPool")) {
  code = code.replace(target, replacement);
  fs.writeFileSync("src/app/admin/page.js", code, "utf8");
  console.log("✔ Added investorAssignPool definition to AdminDashboard state");
} else if (code.includes("const investorAssignPool")) {
  console.log("ℹ investorAssignPool already defined");
} else {
  console.log("Error: Target not found");
}
