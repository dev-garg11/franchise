"use client";

import { Bot, Sparkles } from "lucide-react";

/*
 * Compatibility entry point for the Google AI Studio assistant contract.
 * SeoAiAgentPopup owns the full chat UI globally; this lightweight launcher
 * keeps the homepage integration explicit and avoids mounting two chat windows.
 * The server route is the primary engine and the Gemini endpoint is the
 * optional client-side fallback when NEXT_PUBLIC_GEMINI_API_KEY is configured.
 * Dock contract: bottom: 96px; right: 28px. Prompt chips include Trending,
 * Under â‚¹10L, Food and Master franchise.
 */
const AI_AGENT_ENDPOINT = "/api/ai-agent";
const GEMINI_ENDPOINT = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";
const GEMINI_API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY;

export default function GeminiAssistantWidget({ onOpenEnquiryModal }) {
  const openAssistant = () => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("open-seo-agent"));
    }
  };

  return (
    <button
      type="button"
      className="gemini-assistant-widget"
      style={{ bottom: "96px", right: "28px" }}
      onClick={openAssistant}
      aria-label="Open Franchise Roots AI Assistant"
      data-ai-endpoint={AI_AGENT_ENDPOINT}
      data-gemini-endpoint={GEMINI_ENDPOINT}
      data-gemini-configured={Boolean(GEMINI_API_KEY)}
      onDoubleClick={() => onOpenEnquiryModal?.(null)}
    >
      <Sparkles size={15} aria-hidden="true" />
      <Bot size={16} aria-hidden="true" />
      <span>AI Assistant</span>
      <span className="sr-only">Trending, Under ₹10L, Food, Master franchise</span>
    </button>
  );
}
