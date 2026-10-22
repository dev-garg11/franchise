"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Sparkles,
  Bot,
  Send,
  X,
  RotateCcw,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  IndianRupee,
  MapPin,
  Building2,
  Check,
  Copy,
  ArrowRight,
  ShieldCheck,
  Zap
} from "lucide-react";

const INITIAL_MESSAGE = {
  id: "welcome-msg",
  role: "assistant",
  content: `### 👋 Welcome to Franchise Roots FR AI Agent!

I'm your **AI-Powered Franchise Advisor**. I analyze high-ranking search trends, brand authority, and investment returns across India to match you with top-performing franchise opportunities.

Ask me about:
- **Best franchise brands** in any category (Food, Automotive, Fashion, Services)
- **Budget filters** (e.g., *"Franchises under ₹10 Lakhs"*)
- **Direct page links** to explore brand investment sheets & terms
- **Master franchise & exclusive territory** availability`,
  brands: [],
  suggestedPrompts: [
    "🔥 Show Top Trending Franchises",
    "🍔 Best Food & Beverage Brands",
    "💰 Low Investment Under ₹10L",
    "👑 Master Franchise Opportunities"
  ],
  timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
};

export default function SeoAiAgentPopup() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([INITIAL_MESSAGE]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const [unreadBadge, setUnreadBadge] = useState(true);

  // Auto-open if query param ?agent=open or ?ai=true exists
  useEffect(() => {
    if (searchParams) {
      const agentParam = searchParams.get("agent") || searchParams.get("ai");
      if (agentParam === "open" || agentParam === "true") {
        setIsOpen(true);
        setUnreadBadge(false);
      }
    }
  }, [searchParams]);

  // Global event listener to open AI Agent from any component without menus
  useEffect(() => {
    const handleOpenAgent = (e) => {
      setIsOpen(true);
      setUnreadBadge(false);
      if (e.detail?.query) {
        handleSendMessage(e.detail.query);
      }
    };

    window.addEventListener("open-seo-agent", handleOpenAgent);
    return () => window.removeEventListener("open-seo-agent", handleOpenAgent);
  }, []);

  // Auto scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      // Focus input on open
      setTimeout(() => inputRef.current?.focus(), 200);
    }
  }, [isOpen, messages, isLoading]);

  // Send message to AI Agent API
  const handleSendMessage = async (textToSend) => {
    const query = (textToSend || inputValue).trim();
    if (!query || isLoading) return;

    setInputValue("");
    setUnreadBadge(false);

    const userMessageId = `user-${Date.now()}`;
    const userMessage = {
      id: userMessageId,
      role: "user",
      content: query,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const response = await fetch("/api/ai-agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: query,
          history: messages.slice(-4).map((m) => ({
            role: m.role,
            content: m.content
          }))
        })
      });

      const data = await response.json();

      if (data.success && data.message) {
        const botMessage = {
          id: `bot-${Date.now()}`,
          role: "assistant",
          content: data.message,
          brands: data.brands || [],
          suggestedPrompts: data.suggestedPrompts || [],
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        };
        setMessages((prev) => [...prev, botMessage]);
      } else {
        throw new Error(data.error || "Failed to get AI response");
      }
    } catch (err) {
      console.error("AI Agent fetch error:", err);
      const errorMessage = {
        id: `bot-err-${Date.now()}`,
        role: "assistant",
        content: "⚠️ I encountered a temporary connection issue while querying our franchise database. Please try asking again or select one of the suggested prompts below.",
        brands: [],
        suggestedPrompts: [
          "🔥 Show Top 3 Trending Franchises",
          "🍔 Best Food & Beverage Brands",
          "💰 Franchises Under ₹10 Lakhs"
        ],
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleResetChat = () => {
    setMessages([INITIAL_MESSAGE]);
  };

  const handleCopyLink = (brandId, e) => {
    e.stopPropagation();
    const url = `${window.location.origin}/brands/${brandId}`;
    navigator.clipboard.writeText(url);
    setCopiedId(brandId);
    setTimeout(() => setCopiedId(null), 2500);
  };

  return (
    <>
      {/* ================= FLOATING AI LAUNCHER BUTTON ================= */}
      {/* Positioned on bottom-left */}
      <div className="seo-agent-floating-container">
        {!isOpen && (
          <button
            type="button"
            onClick={() => {
              setIsOpen(true);
              setUnreadBadge(false);
            }}
            className="seo-agent-launcher-btn"
            aria-label="Open FR AI Agent"
            title="Ask FR AI Agent for Best Franchises & Links"
          >
            <div className="seo-agent-glow-aura" />
            <div className="seo-agent-btn-content">
              <div className="seo-agent-icon-wrap">
                <Sparkles className="seo-agent-sparkle-icon" size={20} />
              </div>
              <div className="seo-agent-text-wrap">
                <span className="seo-agent-title">FR AI Agent</span>
                <span className="seo-agent-sub">Ask Brands & Links</span>
              </div>
              {unreadBadge && (
                <span className="seo-agent-ping-badge">
                  <span className="seo-agent-ping-dot" />
                </span>
              )}
            </div>
            <div className="seo-agent-tooltip">
              ✨ Ask FR AI Agent for Good Franchise Brands & Direct Links
            </div>
          </button>
        )}
      </div>

      {/* ================= AI CHAT POPUP WINDOW ================= */}
      {isOpen && (
        <div className="seo-agent-popup-backdrop">
          <div className="seo-agent-popup-window" role="dialog" aria-modal="true" aria-label="FR AI Agent Chat">
            
            {/* --- HEADER --- */}
            <div className="seo-agent-header">
              <div className="seo-agent-header-left">
                <div className="seo-agent-avatar">
                  <Bot size={22} color="#ffffff" />
                  <span className="seo-agent-online-dot" />
                </div>
                <div>
                  <div className="seo-agent-header-title-row">
                    <h3 className="seo-agent-header-title">FR AI Agent</h3>
                    <span className="seo-agent-verified-badge" title="Franchise Roots Intelligence">
                      <ShieldCheck size={13} style={{ display: 'inline', marginRight: '3px' }} />
                      Verified
                    </span>
                  </div>
                  <p className="seo-agent-header-subtitle">
                    Live Brand Recommendations • Direct Links
                  </p>
                </div>
              </div>

              <div className="seo-agent-header-actions">
                <button
                  type="button"
                  onClick={handleResetChat}
                  className="seo-agent-header-icon-btn"
                  title="Reset Conversation"
                  aria-label="Reset Conversation"
                >
                  <RotateCcw size={16} />
                </button>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="seo-agent-header-icon-btn close-btn"
                  title="Close AI Agent"
                  aria-label="Close AI Agent"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* --- QUICK SUGGESTION CHIPS TOP BAR --- */}
            <div className="seo-agent-quick-chips-bar">
              <button
                type="button"
                onClick={() => handleSendMessage("Show top 3 trending franchise brands in India with direct links")}
                className="seo-agent-chip"
              >
                🔥 Top Brands
              </button>
              <button
                type="button"
                onClick={() => handleSendMessage("Best food and beverage franchise opportunities with links")}
                className="seo-agent-chip"
              >
                🍔 Food & Cafe
              </button>
              <button
                type="button"
                onClick={() => handleSendMessage("Good low investment franchises under 10 lakhs and links")}
                className="seo-agent-chip"
              >
                💰 Under ₹10L
              </button>
              <button
                type="button"
                onClick={() => handleSendMessage("Automotive and car care franchise opportunities with links")}
                className="seo-agent-chip"
              >
                🚗 Automotive
              </button>
              <button
                type="button"
                onClick={() => handleSendMessage("Master franchise opportunities with exclusive state territory")}
                className="seo-agent-chip"
              >
                👑 Master Franchise
              </button>
            </div>

            {/* --- CHAT MESSAGES BODY --- */}
            <div className="seo-agent-messages-container">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`seo-agent-message-row ${msg.role === "user" ? "user-row" : "bot-row"}`}
                >
                  {msg.role === "assistant" && (
                    <div className="seo-agent-bot-thumb">
                      <Bot size={17} color="#ffffff" />
                    </div>
                  )}

                  <div className="seo-agent-message-bubble-wrap">
                    {/* Message Bubble */}
                    <div className={`seo-agent-bubble ${msg.role === "user" ? "user-bubble" : "bot-bubble"}`}>
                      {/* Render formatted text content */}
                      <div className="seo-agent-formatted-text">
                        {renderFormattedMarkdown(msg.content)}
                      </div>

                      {/* Render Interactive Brand Recommendation Cards if present */}
                      {msg.brands && msg.brands.length > 0 && (
                        <div className="seo-agent-brand-cards-grid">
                          {msg.brands.map((brand) => (
                            <div key={brand.id} className="seo-agent-brand-card">
                              {/* Card Header & Category Badge */}
                              <div className="seo-agent-brand-card-top">
                                <span className="seo-agent-brand-category-badge">
                                  {brand.category || "Franchise Opportunity"}
                                </span>
                                {brand.masterFranchiseAvailable && (
                                  <span className="seo-agent-master-badge">
                                    👑 Master Avail.
                                  </span>
                                )}
                              </div>

                              {/* Brand Name & Image / Icon */}
                              <div className="seo-agent-brand-card-main">
                                <div className="seo-agent-brand-avatar">
                                  {brand.image ? (
                                    <img
                                      src={brand.image}
                                      alt={brand.name}
                                      className="seo-agent-brand-img"
                                      onError={(e) => {
                                        e.currentTarget.style.display = 'none';
                                        e.currentTarget.nextElementSibling.style.display = 'flex';
                                      }}
                                    />
                                  ) : null}
                                  <div
                                    className="seo-agent-brand-fallback-logo"
                                    style={{ display: brand.image ? 'none' : 'flex' }}
                                  >
                                    <Building2 size={20} color="#4338ca" />
                                  </div>
                                </div>

                                <div className="seo-agent-brand-info">
                                  <Link
                                    href={brand.link}
                                    className="seo-agent-brand-title"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                  >
                                    {brand.name}
                                    <ExternalLink size={13} className="seo-agent-external-icon" />
                                  </Link>
                                  <div className="seo-agent-brand-loc">
                                    <MapPin size={12} style={{ display: 'inline', marginRight: '3px' }} />
                                    {brand.location || "Pan India"}
                                  </div>
                                </div>
                              </div>

                              {/* Key Metrics: Investment & Space */}
                              <div className="seo-agent-brand-metrics">
                                <div className="seo-agent-metric-item">
                                  <span className="metric-label">Investment</span>
                                  <span className="metric-val highlight">
                                    {brand.investmentRange}
                                  </span>
                                </div>
                                <div className="seo-agent-metric-item">
                                  <span className="metric-label">Area</span>
                                  <span className="metric-val">
                                    {brand.areaRequired || "Custom"}
                                  </span>
                                </div>
                              </div>

                              {/* SEO Highlight summary */}
                              {brand.seoSummary && (
                                <p className="seo-agent-brand-summary">
                                  {brand.seoSummary}
                                </p>
                              )}

                              {/* Action Buttons: Direct Page Link & Copy */}
                              <div className="seo-agent-brand-card-actions">
                                <Link
                                  href={brand.link}
                                  className="seo-agent-brand-link-btn"
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  <span>View Brand Opportunity</span>
                                  <ArrowRight size={14} />
                                </Link>
                                
                                <button
                                  type="button"
                                  onClick={(e) => handleCopyLink(brand.id, e)}
                                  className="seo-agent-copy-btn"
                                  title="Copy Direct Link"
                                  aria-label="Copy Direct Link"
                                >
                                  {copiedId === brand.id ? (
                                    <Check size={14} color="#16a34a" />
                                  ) : (
                                    <Copy size={14} />
                                  )}
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      <span className="seo-agent-timestamp">{msg.timestamp}</span>
                    </div>

                    {/* Follow-up Prompts */}
                    {msg.suggestedPrompts && msg.suggestedPrompts.length > 0 && (
                      <div className="seo-agent-followup-chips">
                        {msg.suggestedPrompts.map((prompt, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => handleSendMessage(prompt)}
                            className="seo-agent-followup-btn"
                          >
                            <Zap size={11} style={{ marginRight: '4px', color: '#6366f1' }} />
                            {prompt}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {/* Typing indicator */}
              {isLoading && (
                <div className="seo-agent-message-row bot-row">
                  <div className="seo-agent-bot-thumb">
                    <Bot size={17} color="#ffffff" />
                  </div>
                  <div className="seo-agent-bubble bot-bubble typing-bubble">
                    <div className="seo-agent-typing-dots">
                      <span className="dot" />
                      <span className="dot" />
                      <span className="dot" />
                    </div>
                    <span className="typing-text">FR AI Agent is searching verified brands & links...</span>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* --- INPUT FORM --- */}
            <div className="seo-agent-input-container">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="seo-agent-input-form"
              >
                <input
                  ref={inputRef}
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask FR AI Agent for franchise brands, budgets, or links..."
                  className="seo-agent-input-field"
                  disabled={isLoading}
                />

                <button
                  type="submit"
                  disabled={!inputValue.trim() || isLoading}
                  className="seo-agent-send-btn"
                  aria-label="Send query"
                  title="Send query"
                >
                  <Send size={16} />
                </button>
              </form>

              <div className="seo-agent-footer-note">
                ⚡ Franchise Roots FR AI Agent • Instant Brand Matching & Verified Links
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// Markdown Formatter Helper to render headings, bullet points, bold tags, and clickable links cleanly
function renderFormattedMarkdown(text) {
  if (!text) return null;

  const lines = text.split("\n");

  return lines.map((line, lineIndex) => {
    const trimmed = line.trim();

    // Empty line spacer
    if (!trimmed) {
      return <div key={lineIndex} style={{ height: "6px" }} />;
    }

    // Heading 3
    if (trimmed.startsWith("### ")) {
      return (
        <h4 key={lineIndex} className="md-heading-3">
          {formatInline(trimmed.replace("### ", ""))}
        </h4>
      );
    }

    // Heading 2
    if (trimmed.startsWith("## ")) {
      return (
        <h3 key={lineIndex} className="md-heading-2">
          {formatInline(trimmed.replace("## ", ""))}
        </h3>
      );
    }

    // Bullet points
    if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
      return (
        <div key={lineIndex} className="md-bullet-item">
          <span className="md-bullet-dot">•</span>
          <span className="md-bullet-content">
            {formatInline(trimmed.slice(2))}
          </span>
        </div>
      );
    }

    // Numbered item (e.g., "1. [Brand](...)")
    const numberedMatch = trimmed.match(/^(\d+)\.\s+(.*)/);
    if (numberedMatch) {
      return (
        <div key={lineIndex} className="md-numbered-item">
          <span className="md-number-badge">{numberedMatch[1]}.</span>
          <span className="md-bullet-content">
            {formatInline(numberedMatch[2])}
          </span>
        </div>
      );
    }

    // Regular paragraph
    return (
      <p key={lineIndex} className="md-paragraph">
        {formatInline(trimmed)}
      </p>
    );
  });
}

// Format bold (**text**), italics (*text*), and markdown links ([text](url))
function formatInline(str) {
  if (!str) return null;

  // Tokenize string for links [text](url), bold **text**, and italic *text*
  const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
  const parts = [];
  let lastIdx = 0;
  let match;

  while ((match = linkRegex.exec(str)) !== null) {
    if (match.index > lastIdx) {
      parts.push({ type: "text", content: str.slice(lastIdx, match.index) });
    }
    parts.push({ type: "link", label: match[1], url: match[2] });
    lastIdx = linkRegex.lastIndex;
  }
  if (lastIdx < str.length) {
    parts.push({ type: "text", content: str.slice(lastIdx) });
  }

  return parts.map((part, pIdx) => {
    if (part.type === "link") {
      const isExternal = part.url.startsWith("http");
      return (
        <Link
          key={pIdx}
          href={part.url}
          target={isExternal ? "_blank" : undefined}
          rel={isExternal ? "noopener noreferrer" : undefined}
          className="md-inline-link"
        >
          {part.label}
          <ExternalLink size={12} style={{ display: 'inline', marginLeft: '3px' }} />
        </Link>
      );
    }

    // Process bold within regular text
    const boldTokens = part.content.split(/\*\*(.*?)\*\*/g);
    return (
      <span key={pIdx}>
        {boldTokens.map((token, tIdx) => {
          if (tIdx % 2 === 1) {
            return <strong key={tIdx} className="md-bold">{token}</strong>;
          }
          // Process italics
          const italicTokens = token.split(/\*(.*?)\*/g);
          return italicTokens.map((iToken, iIdx) => {
            if (iIdx % 2 === 1) {
              return <em key={iIdx} className="md-italic">{iToken}</em>;
            }
            return iToken;
          });
        })}
      </span>
    );
  });
}
