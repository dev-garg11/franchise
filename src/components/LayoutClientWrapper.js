"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useState, useEffect, Suspense } from "react";
import Header from "./Header";
import Footer from "./Footer";
import AuthModal from "./AuthModal";

function AuthParamsHandler({ setIsAuthModalOpen, setAuthModalTab }) {
  const searchParams = useSearchParams();

  useEffect(() => {
    const authVal = searchParams.get("auth");
    if (authVal === "login" || authVal === "register") {
      setIsAuthModalOpen(true);
      setAuthModalTab(authVal);
    }
  }, [searchParams, setIsAuthModalOpen, setAuthModalTab]);

  return null;
}

export default function LayoutClientWrapper({ children }) {
  const pathname = usePathname();
  
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState("login");

  // Listen to global open-auth-modal events
  useEffect(() => {
    const handleOpenAuth = (e) => {
      setIsAuthModalOpen(true);
      setAuthModalTab(e.detail?.tab || "login");
    };
    window.addEventListener("open-auth-modal", handleOpenAuth);
    return () => {
      window.removeEventListener("open-auth-modal", handleOpenAuth);
    };
  }, []);

  // Hide public header/footer on admin, investor-panel, or brand-panel routes
  const isNoHeaderFooter = 
    pathname.startsWith("/admin") || 
    pathname.startsWith("/investor-panel") || 
    pathname.startsWith("/brand-panel") ||
    pathname === "/login";

  return (
    <>
      <Suspense fallback={null}>
        <AuthParamsHandler 
          setIsAuthModalOpen={setIsAuthModalOpen} 
          setAuthModalTab={setAuthModalTab} 
        />
      </Suspense>
      {!isNoHeaderFooter && <Header />}
      <main style={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        {children}
      </main>
      {!isNoHeaderFooter && <Footer />}
      
      {/* Global Auth Modal Popup */}
      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
        initialTab={authModalTab} 
      />
    </>
  );
}
