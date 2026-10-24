"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useState, useEffect, Suspense } from "react";
import Header from "./Header";
import Footer from "./Footer";
import TopMenuBanner from "./TopMenuBanner";
import AuthModal from "./AuthModal";

import FloatingWhatsApp from "./FloatingWhatsApp";
import AskExpertsModal from "./AskExpertsModal";
import SeoAiAgentPopup from "./SeoAiAgentPopup";

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
  
  const [mounted, setMounted] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState("login");
  const [isAskExpertsOpen, setIsAskExpertsOpen] = useState(false);
  const [askExpertsMode, setAskExpertsMode] = useState("buy");

  useEffect(() => {
    setMounted(true);
  }, []);

  // Listen to global open-auth-modal and open-ask-experts events
  useEffect(() => {
    const handleOpenAuth = (e) => {
      setIsAuthModalOpen(true);
      setAuthModalTab(e.detail?.tab || "login");
    };
    const handleOpenAskExperts = (e) => {
      setIsAskExpertsOpen(true);
      const requestedMode = e.detail?.mode;
      const mode = typeof requestedMode === "string" && requestedMode === "expand" ? "expand" : "buy";
      setAskExpertsMode(mode);
    };

    window.addEventListener("open-auth-modal", handleOpenAuth);
    window.addEventListener("open-ask-experts", handleOpenAskExperts);
    return () => {
      window.removeEventListener("open-auth-modal", handleOpenAuth);
      window.removeEventListener("open-ask-experts", handleOpenAskExperts);
    };
  }, []);

  // Hide public header/footer on admin, investor-panel, or brand-panel routes
  const isNoHeaderFooter = 
    pathname.startsWith("/admin") || 
    pathname.startsWith("/investor-panel") || 
    pathname.startsWith("/brand-panel") ||
    pathname === "/login";

  return (
    <div suppressHydrationWarning>
      <Suspense fallback={null}>
        <AuthParamsHandler 
          setIsAuthModalOpen={setIsAuthModalOpen} 
          setAuthModalTab={setAuthModalTab} 
        />
      </Suspense>
      {!isNoHeaderFooter && <Header />}
      {!isNoHeaderFooter && <TopMenuBanner />}
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

      {/* Global Floating WhatsApp & Ask Experts Modal (rendered after mounted) */}
      {mounted && !isNoHeaderFooter && (
        <FloatingWhatsApp onOpenModal={() => { setAskExpertsMode("buy"); setIsAskExpertsOpen(true); }} />
      )}

      {/* Global FR AI Agent Popup (Fixed on left side, only in popup, not in menu) */}
      {mounted && !isNoHeaderFooter && (
        <SeoAiAgentPopup />
      )}

      {mounted && (
        <AskExpertsModal
          isOpen={isAskExpertsOpen}
          onClose={() => setIsAskExpertsOpen(false)}
          initialMode={askExpertsMode}
        />
      )}
    </div>
  );
}



