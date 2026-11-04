"use client";

// Global Pub/Sub Listeners for Toastr & SweetAlert
const toastListeners = new Set();
const swalListeners = new Set();

/**
 * Toastr Notification API
 * Example:
 *   toast.success("Listing saved successfully!");
 *   toast.error("Failed to delete record.");
 *   toast.warning("Please check required fields.");
 *   toast.info("Exporting CSV file...");
 */
export const toast = {
  show: (type, message, title = "", duration = 4000) => {
    const id = Date.now() + Math.random().toString(36).substring(2, 7);
    const toastObj = { id, type, message, title, duration };
    toastListeners.forEach((listener) => listener(toastObj));
    return id;
  },
  success: (message, title = "", duration = 4000) =>
    toast.show("success", message, title || "Success", duration),
  error: (message, title = "", duration = 4500) =>
    toast.show("error", message, title || "Error", duration),
  warning: (message, title = "", duration = 4500) =>
    toast.show("warning", message, title || "Warning", duration),
  info: (message, title = "", duration = 4000) =>
    toast.show("info", message, title || "Information", duration)
};

/**
 * SweetAlert API (Full Promise-based modern modal dialogs)
 * Example:
 *   const { isConfirmed } = await Swal.fire({
 *     title: "Delete Brand?",
 *     text: "Are you sure you want to delete this brand?",
 *     icon: "warning",
 *     showCancelButton: true,
 *     confirmButtonText: "Yes, Delete It!"
 *   });
 *
 * Shortcut:
 *   const ok = await Swal.confirm("Are you sure you want to delete this?");
 *   if (ok) { ... }
 */
export const Swal = {
  fire: (options = {}) => {
    return new Promise((resolve) => {
      const id = Date.now() + Math.random().toString(36).substring(2, 7);
      const swalObj = {
        id,
        title: options.title || "",
        text: options.text || options.message || "",
        html: options.html || null,
        icon: options.icon || "info", // "success", "error", "warning", "info"
        showCancelButton: options.showCancelButton || false,
        confirmButtonText: options.confirmButtonText || "OK",
        cancelButtonText: options.cancelButtonText || "Cancel",
        confirmButtonColor: options.confirmButtonColor || null,
        timer: options.timer || null,
        resolve: (result) => {
          resolve(result);
        }
      };
      swalListeners.forEach((listener) => listener(swalObj));
    });
  },

  confirm: (text, title = "Are you sure?", options = {}) => {
    return Swal.fire({
      title,
      text,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: options.confirmButtonText || "Yes, Proceed",
      cancelButtonText: options.cancelButtonText || "Cancel",
      ...options
    }).then((res) => Boolean(res.isConfirmed));
  },

  success: (text, title = "Success!") => {
    return Swal.fire({ title, text, icon: "success" });
  },

  error: (text, title = "Error!") => {
    return Swal.fire({ title, text, icon: "error" });
  },

  warning: (text, title = "Warning!") => {
    return Swal.fire({ title, text, icon: "warning" });
  },

  info: (text, title = "Notice") => {
    return Swal.fire({ title, text, icon: "info" });
  }
};

export function subscribeToasts(fn) {
  toastListeners.add(fn);
  return () => toastListeners.delete(fn);
}

export function subscribeSwal(fn) {
  swalListeners.add(fn);
  return () => swalListeners.delete(fn);
}
