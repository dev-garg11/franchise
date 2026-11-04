"use client";

import { useState, useEffect } from "react";
import { CheckCircle2, AlertOctagon, AlertTriangle, Info, X } from "lucide-react";
import { subscribeToasts, subscribeSwal } from "@/lib/swal";

const COLOR_MAP = {
  success: {
    base: "#00e676",
    glow: "rgba(0, 230, 118, 0.45)",
    bg: "#051e11",
    border: "#00e676",
    gradient: "linear-gradient(135deg, #00e676 0%, #00b34d 100%)",
    iconColor: "#00e676",
    textLight: "#bbf7d0",
    buttonText: "#041c0e"
  },
  error: {
    base: "#ff1744",
    glow: "rgba(255, 23, 68, 0.5)",
    bg: "#240409",
    border: "#ff1744",
    gradient: "linear-gradient(135deg, #ff1744 0%, #d50000 100%)",
    iconColor: "#ff1744",
    textLight: "#fecdd3",
    buttonText: "#ffffff"
  },
  warning: {
    base: "#ffab00",
    glow: "rgba(255, 171, 0, 0.45)",
    bg: "#261502",
    border: "#ffab00",
    gradient: "linear-gradient(135deg, #ffab00 0%, #ff8f00 100%)",
    iconColor: "#ffab00",
    textLight: "#fef08a",
    buttonText: "#1f1300"
  },
  info: {
    base: "#00b0ff",
    glow: "rgba(0, 176, 255, 0.45)",
    bg: "#02162b",
    border: "#00b0ff",
    gradient: "linear-gradient(135deg, #00b0ff 0%, #0088cc 100%)",
    iconColor: "#00b0ff",
    textLight: "#bae6fd",
    buttonText: "#001933"
  }
};

export default function ToastSweetAlert() {
  const [toasts, setToasts] = useState([]);
  const [currentSwal, setCurrentSwal] = useState(null);

  // Subscribe to Toastr notifications
  useEffect(() => {
    const unsubscribe = subscribeToasts((toastObj) => {
      setToasts((prev) => [...prev, toastObj]);
      if (toastObj.duration) {
        setTimeout(() => {
          setToasts((prev) => prev.filter((t) => t.id !== toastObj.id));
        }, toastObj.duration);
      }
    });
    return unsubscribe;
  }, []);

  // Subscribe to SweetAlert dialogs
  useEffect(() => {
    const unsubscribe = subscribeSwal((swalObj) => {
      setCurrentSwal(swalObj);
    });
    return unsubscribe;
  }, []);

  // Keyboard accessibility (Esc to cancel, Enter to confirm)
  useEffect(() => {
    function handleKeyDown(e) {
      if (!currentSwal) return;
      if (e.key === "Escape") {
        handleSwalDismiss();
      } else if (e.key === "Enter" && !e.shiftKey) {
        handleSwalConfirm();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentSwal]);

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const handleSwalConfirm = () => {
    if (!currentSwal) return;
    currentSwal.resolve({ isConfirmed: true, isDenied: false, isDismissed: false });
    setCurrentSwal(null);
  };

  const handleSwalDismiss = () => {
    if (!currentSwal) return;
    currentSwal.resolve({ isConfirmed: false, isDenied: false, isDismissed: true });
    setCurrentSwal(null);
  };

  const getIcon = (type, size = 26) => {
    switch (type) {
      case "success":
        return <CheckCircle2 size={size} color="#00e676" strokeWidth={2.6} />;
      case "error":
        return <AlertOctagon size={size} color="#ff1744" strokeWidth={2.6} />;
      case "warning":
        return <AlertTriangle size={size} color="#ffab00" strokeWidth={2.6} />;
      case "info":
      default:
        return <Info size={size} color="#00b0ff" strokeWidth={2.6} />;
    }
  };

  return (
    <>
      {/* 1. Global CSS Keyframe Animations */}
      <style jsx global>{`
        @keyframes toastrSlideBounce {
          0% {
            transform: translateX(120%) scale(0.9);
            opacity: 0;
          }
          70% {
            transform: translateX(-6px) scale(1.02);
            opacity: 1;
          }
          100% {
            transform: translateX(0) scale(1);
            opacity: 1;
          }
        }

        @keyframes toastrProgress {
          from {
            width: 100%;
          }
          to {
            width: 0%;
          }
        }

        @keyframes swalPulseRing {
          0% {
            box-shadow: 0 0 0 0 rgba(255, 255, 255, 0.4);
          }
          70% {
            box-shadow: 0 0 0 22px rgba(255, 255, 255, 0);
          }
          100% {
            box-shadow: 0 0 0 0 rgba(255, 255, 255, 0);
          }
        }

        @keyframes swalPopIn {
          0% {
            transform: scale(0.75) translateY(20px);
            opacity: 0;
          }
          65% {
            transform: scale(1.03) translateY(-4px);
            opacity: 1;
          }
          100% {
            transform: scale(1) translateY(0);
            opacity: 1;
          }
        }
      `}</style>

      {/* 2. Toastr Container (Top-Right Floating Stack) */}
      <div
        style={{
          position: "fixed",
          top: "22px",
          right: "22px",
          zIndex: 9999999,
          display: "flex",
          flexDirection: "column",
          gap: "14px",
          pointerEvents: "none",
          maxWidth: "420px",
          width: "calc(100vw - 36px)"
        }}
      >
        {toasts.map((t) => {
          const theme = COLOR_MAP[t.type] || COLOR_MAP.info;
          return (
            <div
              key={t.id}
              style={{
                pointerEvents: "auto",
                backgroundColor: theme.bg,
                border: `2.5px solid ${theme.border}`,
                borderRadius: "16px",
                boxShadow: `0 12px 35px -4px ${theme.glow}, 0 4px 18px rgba(0, 0, 0, 0.7)`,
                padding: "16px 18px",
                display: "flex",
                flexDirection: "column",
                position: "relative",
                overflow: "hidden",
                animation: "toastrSlideBounce 0.35s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards",
                backdropFilter: "blur(12px)",
                WebkitBackdropFilter: "blur(12px)"
              }}
            >
              <div style={{ display: "flex", alignItems: "flex-start", gap: "14px" }}>
                <div style={{ flexShrink: 0, marginTop: "2px" }}>
                  {getIcon(t.type, 26)}
                </div>

                <div style={{ flexGrow: 1, paddingRight: "10px" }}>
                  {t.title && (
                    <div
                      style={{
                        fontSize: "12px",
                        fontWeight: "900",
                        textTransform: "uppercase",
                        letterSpacing: "0.08em",
                        color: theme.base,
                        marginBottom: "3px"
                      }}
                    >
                      {t.title}
                    </div>
                  )}
                  <div
                    style={{
                      fontSize: "14px",
                      fontWeight: "600",
                      color: "#ffffff",
                      lineHeight: "1.45"
                    }}
                  >
                    {t.message}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => removeToast(t.id)}
                  aria-label="Close notification"
                  style={{
                    background: "transparent",
                    border: "none",
                    color: "rgba(255, 255, 255, 0.7)",
                    cursor: "pointer",
                    padding: "4px",
                    borderRadius: "6px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    transition: "color 0.15s ease, background 0.15s ease"
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = "#ffffff";
                    e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.15)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = "rgba(255, 255, 255, 0.7)";
                    e.currentTarget.style.backgroundColor = "transparent";
                  }}
                >
                  <X size={16} />
                </button>
              </div>

              {/* Countdown Progress Bar */}
              {t.duration && (
                <div
                  style={{
                    position: "absolute",
                    bottom: 0,
                    left: 0,
                    height: "4px",
                    backgroundColor: theme.base,
                    boxShadow: `0 0 8px ${theme.base}`,
                    animation: `toastrProgress ${t.duration}ms linear forwards`
                  }}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* 3. SweetAlert Modal Dialog (Backdrop + Animated Card) */}
      {currentSwal && (() => {
        const theme = COLOR_MAP[currentSwal.icon] || COLOR_MAP.info;

        return (
          <div
            role="dialog"
            aria-modal="true"
            style={{
              position: "fixed",
              inset: 0,
              backgroundColor: "rgba(3, 7, 18, 0.85)",
              backdropFilter: "blur(14px)",
              WebkitBackdropFilter: "blur(14px)",
              zIndex: 10000000,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "20px"
            }}
            onClick={(e) => {
              if (e.target === e.currentTarget) handleSwalDismiss();
            }}
          >
            <div
              style={{
                width: "100%",
                maxWidth: "460px",
                backgroundColor: "#0b0f19",
                border: `3px solid ${theme.border}`,
                borderRadius: "24px",
                boxShadow: `0 25px 70px -10px ${theme.glow}, 0 0 45px rgba(0, 0, 0, 0.9)`,
                padding: "36px 32px 30px 32px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                textAlign: "center",
                gap: "20px",
                animation: "swalPopIn 0.35s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards",
                position: "relative"
              }}
            >
              {/* Animated Pulsing Icon Badge */}
              <div
                style={{
                  width: "84px",
                  height: "84px",
                  borderRadius: "50%",
                  backgroundColor: theme.bg,
                  border: `3px solid ${theme.border}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: `0 0 35px ${theme.glow}`,
                  animation: "swalPulseRing 2s infinite"
                }}
              >
                {getIcon(currentSwal.icon, 44)}
              </div>

              {/* Title & Description */}
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {currentSwal.title && (
                  <h3
                    style={{
                      fontSize: "24px",
                      fontWeight: "900",
                      color: "#ffffff",
                      margin: 0,
                      letterSpacing: "-0.02em"
                    }}
                  >
                    {currentSwal.title}
                  </h3>
                )}
                {currentSwal.text && (
                  <p
                    style={{
                      fontSize: "15px",
                      fontWeight: "500",
                      color: "#cbd5e1",
                      margin: 0,
                      lineHeight: "1.6"
                    }}
                  >
                    {currentSwal.text}
                  </p>
                )}
              </div>

              {/* Buttons (Confirm & Cancel) */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "12px",
                  width: "100%",
                  marginTop: "8px"
                }}
              >
                {currentSwal.showCancelButton && (
                  <button
                    type="button"
                    onClick={handleSwalDismiss}
                    style={{
                      flex: 1,
                      padding: "13px 22px",
                      borderRadius: "14px",
                      backgroundColor: "rgba(255, 255, 255, 0.1)",
                      border: "1.5px solid rgba(255, 255, 255, 0.22)",
                      color: "#ffffff",
                      fontSize: "14.5px",
                      fontWeight: "700",
                      cursor: "pointer",
                      transition: "all 0.15s ease"
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.2)";
                      e.currentTarget.style.borderColor = "#ffffff";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.1)";
                      e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.22)";
                    }}
                  >
                    {currentSwal.cancelButtonText}
                  </button>
                )}

                <button
                  type="button"
                  autoFocus
                  onClick={handleSwalConfirm}
                  style={{
                    flex: currentSwal.showCancelButton ? 1.3 : 1,
                    padding: "13px 26px",
                    borderRadius: "14px",
                    background: currentSwal.confirmButtonColor || theme.gradient,
                    border: "none",
                    color: theme.buttonText,
                    fontSize: "15px",
                    fontWeight: "900",
                    cursor: "pointer",
                    boxShadow: `0 6px 20px ${theme.glow}`,
                    transition: "transform 0.15s ease, filter 0.15s ease",
                    letterSpacing: "0.01em"
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "scale(1.03)";
                    e.currentTarget.style.filter = "brightness(1.15)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "scale(1)";
                    e.currentTarget.style.filter = "brightness(1)";
                  }}
                >
                  {currentSwal.confirmButtonText}
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </>
  );
}
