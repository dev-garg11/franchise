"use client";

import { usePathname } from "next/navigation";
import Header from "./Header";
import Footer from "./Footer";

export default function LayoutClientWrapper({ children }) {
  const pathname = usePathname();
  
  // Hide public header/footer on admin, investor-panel, brand-panel, or login routes
  const isNoHeaderFooter = 
    pathname.startsWith("/admin") || 
    pathname.startsWith("/investor-panel") || 
    pathname.startsWith("/brand-panel") || 
    pathname === "/login";

  return (
    <>
      {!isNoHeaderFooter && <Header />}
      <main style={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        {children}
      </main>
      {!isNoHeaderFooter && <Footer />}
    </>
  );
}
