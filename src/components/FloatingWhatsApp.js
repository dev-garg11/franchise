"use client";

import { MessageCircle } from "lucide-react";

export default function FloatingWhatsApp({ onOpenModal }) {
  const adminPhone = process.env.NEXT_PUBLIC_ADMIN_WHATSAPP || "919876543210";
  const cleanPhone = adminPhone.replace(/[^0-9]/g, "");
  const defaultMessage = encodeURIComponent("Hello Franchise Roots Team, I need expert advice on top franchise opportunities.");

  const handleClick = (e) => {
    if (onOpenModal) {
      e.preventDefault();
      onOpenModal();
    }
  };

  return (
    <a
      href={`https://api.whatsapp.com/send?phone=${cleanPhone}&text=${defaultMessage}`}
      target="_blank"
      rel="noopener noreferrer"
      onClick={handleClick}
      className="floating-whatsapp-btn"
      title="Ask Our Franchise Experts on WhatsApp"
      aria-label="Ask Experts on WhatsApp"
    >
      <div className="whatsapp-pulse"></div>
      <MessageCircle size={28} style={{ fill: '#ffffff', color: '#25D366' }} />
      <span className="whatsapp-tooltip">Ask Experts</span>
    </a>
  );
}
