"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  useEffect(() => {
    // If the user lands on /login, redirect to homepage and trigger the auth modal popup
    router.replace("/?auth=login");
  }, [router]);

  return (
    <div style={{ minHeight: "100vh", background: "#090a0f", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
    </div>
  );
}
