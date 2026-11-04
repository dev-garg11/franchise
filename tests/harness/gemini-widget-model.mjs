/**
 * Gemini Assistant Widget Model & Contract Verification
 * Tests the Google AI Studio / Gemini Assistant widget shell, prompt chips,
 * dual-engine interaction, and modal trigger contracts.
 */

import fs from "node:fs";
import path from "node:path";

export const REQUIRED_PROMPT_CHIPS = [
  "🔥 Top Trending Brands",
  "💰 Under ₹10L",
  "🍔 Food & Beverage",
  "👑 Master Franchises",
  "🚗 Automotive & EV"
];

export class GeminiWidgetModel {
  constructor(options = {}) {
    this.isOpen = options.initialOpen || false;
    this.messages = [
      {
        id: "welcome",
        role: "assistant",
        content: "Hello! I am your Franchise Roots AI Assistant powered by Google AI Studio & verified franchise database. How can I help you find your dream business today?",
        timestamp: Date.now()
      }
    ];
    this.promptChips = [...REQUIRED_PROMPT_CHIPS];
    this.isMuted = false;
    this.isSpeaking = false;
    this.speechUtterances = [];
    this.clipboardCopies = [];
    this.onOpenEnquiryModal = options.onOpenEnquiryModal || null;
    this.apiUrl = options.apiUrl || "/api/ai-agent";
    this.geminiApiKey = options.geminiApiKey || null;
    this.loading = false;
  }

  toggleOpen() {
    this.isOpen = !this.isOpen;
    return this.isOpen;
  }

  close() {
    this.isOpen = false;
  }

  open() {
    this.isOpen = true;
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    return this.isMuted;
  }

  resetSession() {
    this.messages = [
      {
        id: "welcome-reset",
        role: "assistant",
        content: "Session reset. How can I assist you with franchise opportunities?",
        timestamp: Date.now()
      }
    ];
  }

  copyMessage(text) {
    if (!text) return false;
    this.clipboardCopies.push(text);
    return true;
  }

  speakMessage(text) {
    if (this.isMuted || !text) return false;
    this.speechUtterances.push(text);
    this.isSpeaking = true;
    return true;
  }

  async sendQuery(query, mockEngineResponse = null) {
    const trimmed = typeof query === "string" ? query.trim() : "";
    if (!trimmed) {
      return { success: false, error: "Empty query rejected" };
    }

    // Add user message
    this.messages.push({
      id: `msg-${Date.now()}-user`,
      role: "user",
      content: trimmed,
      timestamp: Date.now()
    });

    this.loading = true;

    try {
      let responseData = null;

      if (mockEngineResponse) {
        responseData = mockEngineResponse;
      } else {
        // Simulated dual engine resolution
        responseData = {
          success: true,
          message: `Here are recommendations for: ${trimmed}`,
          brands: [
            {
              id: "brand-1",
              name: "Burger Express QSR",
              category: "Food and Beverage",
              investmentRange: "Rs. 10 Lakhs - 20 Lakhs",
              location: "Pan India",
              areaRequired: "300 - 500 Sq. Ft.",
              link: "/brands/brand-1"
            }
          ],
          suggestedPrompts: ["Franchises under ₹10 Lakhs", "Show food brands"]
        };
      }

      this.messages.push({
        id: `msg-${Date.now()}-assistant`,
        role: "assistant",
        content: responseData.message,
        brands: responseData.brands || [],
        suggestedPrompts: responseData.suggestedPrompts || [],
        timestamp: Date.now()
      });

      if (!this.isMuted && responseData.message) {
        this.speakMessage(responseData.message);
      }

      return {
        success: true,
        response: responseData
      };
    } finally {
      this.loading = false;
    }
  }

  clickBrandEnquire(brand) {
    if (typeof this.onOpenEnquiryModal === "function") {
      this.onOpenEnquiryModal(brand);
      return true;
    }
    return false;
  }

  static verifyComponentSource(rootDir = process.cwd()) {
    const widgetPath = path.join(rootDir, "src", "components", "GeminiAssistantWidget.js");
    if (!fs.existsSync(widgetPath)) {
      return {
        exists: false,
        path: path.relative(rootDir, widgetPath),
        missingReason: "Component file src/components/GeminiAssistantWidget.js not yet created"
      };
    }

    const content = fs.readFileSync(widgetPath, "utf8");
    const checks = {
      hasFloatingDock: content.includes("fixed") && (content.includes("bottom-") || content.includes("right-")),
      hasExpandableDialog: content.includes("isOpen") || content.includes("dialog") || content.includes("setIsOpen"),
      hasPromptChips: REQUIRED_PROMPT_CHIPS.some(chip => content.includes(chip.replace(/[^\w\s]/g, "").trim())),
      hasApiRouteCall: content.includes("/api/ai-agent"),
      hasEnquiryCallback: content.includes("onOpenEnquiryModal"),
      hasCardActions: content.includes("Enquire Now") || content.includes("enquire")
    };

    return {
      exists: true,
      path: path.relative(rootDir, widgetPath),
      checks,
      passed: Object.values(checks).every(Boolean)
    };
  }
}
