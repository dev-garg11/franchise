export async function logActivity({
  panel,
  action,
  description,
  userEmail = "",
  userName = "",
  role = "",
  targetId = "",
  targetType = "",
  details = null
}) {
  try {
    let email = userEmail;
    let name = userName;

    if (typeof window !== "undefined") {
      if (!email) {
        if (panel === "admin") email = localStorage.getItem("adminEmail") || "admin@franchiseroots.com";
        else if (panel === "brand") email = localStorage.getItem("brandEmail") || "";
        else if (panel === "investor") email = localStorage.getItem("investorEmail") || "";
      }
      if (!name) {
        if (panel === "admin") name = "Administrator";
        else if (panel === "brand") name = localStorage.getItem("brandName") || "";
        else if (panel === "investor") name = localStorage.getItem("investorName") || "";
      }
    }

    const res = await fetch("/api/logs", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        panel,
        action,
        description,
        userEmail: email,
        userName: name,
        role: role || panel,
        targetId,
        targetType,
        details
      })
    });
    return await res.json();
  } catch (err) {
    console.error("Logger error:", err);
    return null;
  }
}
