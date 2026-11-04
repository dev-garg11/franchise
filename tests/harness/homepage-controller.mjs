/**
 * Homepage Interactive Controller & Behavioral Model
 * Models all state transitions, search filters, carousel actions, enquiry submissions,
 * and event dispatchers on the Franchise Roots homepage.
 */

import { parseRupeeValue, getFilteredMinBudgets, getFilteredMaxBudgets } from "../../src/lib/investmentData.js";

export const FI_INDUSTRIES = [
  "Automotive", "Beauty & Health", "Business Services", "Dealers & Distributors",
  "Education", "Fashion", "Food and Beverage", "Home Based Business",
  "Hotel, Travel & Tourism", "Retail", "Sports, Fitness & Entertainment"
];

export const FI_STATES = [
  "Andaman and Nicobar", "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar",
  "Chandigarh", "Chhattisgarh", "Delhi NCR", "Goa", "Gujarat", "Haryana",
  "Himachal Pradesh", "Jammu and Kashmir", "Jharkhand", "Karnataka", "Kerala",
  "Ladakh", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram",
  "Nagaland", "Odisha", "Puducherry", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu",
  "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal"
];

export class HomepageController {
  constructor(options = {}) {
    this.localStorage = options.localStorage || new Map();
    this.eventsDispatched = [];

    // Search state
    this.searchTab = "categories"; // "categories" | "location" | "investment"
    this.fiIndustry = "";
    this.fiSector = "";
    this.fiService = "";

    this.fiLocIndustry = "";
    this.fiState = "";
    this.fiCity = "";

    this.fiInvIndustry = "";
    this.fiMinInv = "";
    this.fiMaxInv = "";

    this.searchTerm = "";
    this.selectedCategory = "";
    this.selectedBudget = "";
    this.selectedLocation = "";

    // Carousel refs scroll simulation
    this.leadingScrollLeft = 0;
    this.sliderScrollLeft = 0;

    // Modal state
    this.selectedBrand = null;
    this.enquirySubmitted = false;
    this.enquiryForm = { name: "", email: "", phone: "", message: "" };
    this.submittingEnquiry = false;
    this.enquiryApiSubmissions = [];

    // Newsletter & FAQs
    this.newsletterEmail = "";
    this.newsletterSuccess = false;
    this.openFaqIndex = null;

    // Services & Ads
    this.services = [];
    this.ads = [];

    // Navigation tracker
    this.lastRedirectUrl = null;
  }

  // Tab switching
  setSearchTab(tab) {
    if (["categories", "location", "investment"].includes(tab)) {
      this.searchTab = tab;
      return true;
    }
    return false;
  }

  // Budget interlocking
  handleMinInvChange(val) {
    this.fiMinInv = val;
    const minVal = parseRupeeValue(val);
    const maxVal = parseRupeeValue(this.fiMaxInv);
    if (minVal !== null && maxVal !== null && maxVal <= minVal) {
      this.fiMaxInv = "";
    }
  }

  handleMaxInvChange(val) {
    this.fiMaxInv = val;
    const maxVal = parseRupeeValue(val);
    const minVal = parseRupeeValue(this.fiMinInv);
    if (maxVal !== null && minVal !== null && minVal >= maxVal) {
      this.fiMinInv = "";
    }
  }

  getAvailableMinBudgets() {
    return getFilteredMinBudgets(this.fiMaxInv);
  }

  getAvailableMaxBudgets() {
    return getFilteredMaxBudgets(this.fiMinInv);
  }

  // Search compilation
  handleFiSearchSubmit() {
    const params = new URLSearchParams();

    if (this.searchTab === "categories") {
      if (this.fiIndustry) params.set("category", this.fiIndustry);
      if (this.fiSector) params.set("sector", this.fiSector);
      if (this.fiService) params.set("search", this.fiService);
    } else if (this.searchTab === "location") {
      if (this.fiLocIndustry) params.set("category", this.fiLocIndustry);
      if (this.fiState) params.set("state", this.fiState);
      if (this.fiCity) params.set("location", this.fiCity);
    } else if (this.searchTab === "investment") {
      if (this.fiInvIndustry) params.set("category", this.fiInvIndustry);
      if (this.fiMinInv) params.set("minBudget", this.fiMinInv);
      if (this.fiMaxInv) params.set("maxBudget", this.fiMaxInv);
    }

    const qs = params.toString();
    this.lastRedirectUrl = qs ? `/brands?${qs}` : "/brands";
    return this.lastRedirectUrl;
  }

  // Select brand for enquiry modal
  selectBrand(brand) {
    this.selectedBrand = brand;
    this.enquirySubmitted = false;

    // Check localStorage hydration
    if (this.localStorage.get("investorLoggedIn") === "true") {
      this.enquiryForm = {
        name: this.localStorage.get("investorName") || "",
        email: this.localStorage.get("investorEmail") || "",
        phone: this.localStorage.get("investorPhone") || "",
        message: ""
      };
    } else {
      this.enquiryForm = { name: "", email: "", phone: "", message: "" };
    }
  }

  closeModal() {
    this.selectedBrand = null;
    this.enquirySubmitted = false;
  }

  // Submit Enquiry
  async handleEnquirySubmit(mockApiResponse = { ok: true, status: 201 }) {
    if (!this.enquiryForm.name?.trim() || !this.enquiryForm.email?.trim() || !this.enquiryForm.phone?.trim()) {
      return { success: false, error: "Validation failed: Name, Email, and Phone are required." };
    }

    if (!this.selectedBrand) {
      return { success: false, error: "No brand selected." };
    }

    this.submittingEnquiry = true;

    const payload = {
      name: this.enquiryForm.name,
      email: this.enquiryForm.email,
      phone: this.enquiryForm.phone,
      budgetMin: this.selectedBrand.minInvestment,
      budgetMax: this.selectedBrand.maxInvestment,
      industries: [this.selectedBrand.category],
      preferredLocation: this.selectedBrand.hq || this.selectedBrand.location,
      brandId: this.selectedBrand.id || this.selectedBrand._id,
      brandName: this.selectedBrand.name,
      category: this.selectedBrand.category,
      investorId: this.localStorage.get("investorId") || null,
      comments: `Enquiry submitted for Brand: ${this.selectedBrand.name}. Message: ${this.enquiryForm.message || "None"}`
    };

    this.enquiryApiSubmissions.push(payload);

    try {
      if (mockApiResponse.ok) {
        this.enquirySubmitted = true;
        this.enquiryForm = { name: "", email: "", phone: "", message: "" };
        return { success: true, payload };
      } else {
        return { success: false, status: mockApiResponse.status, error: "API submission rejected" };
      }
    } finally {
      this.submittingEnquiry = false;
    }
  }

  // Carousel controls
  handlePrevLeading(delta = 310) {
    this.leadingScrollLeft = Math.max(0, this.leadingScrollLeft - delta);
    return this.leadingScrollLeft;
  }

  handleNextLeading(delta = 310) {
    this.leadingScrollLeft += delta;
    return this.leadingScrollLeft;
  }

  handlePrevSlide(delta = 320) {
    this.sliderScrollLeft = Math.max(0, this.sliderScrollLeft - delta);
    return this.sliderScrollLeft;
  }

  handleNextSlide(delta = 320) {
    this.sliderScrollLeft += delta;
    return this.sliderScrollLeft;
  }

  // Ask Our Experts custom event dispatch
  handleOpenAskExperts(mode = "buy") {
    const targetMode = mode === "expand" ? "expand" : "buy";
    const evt = { type: "open-ask-experts", detail: { mode: targetMode } };
    this.eventsDispatched.push(evt);
    return evt;
  }

  // Newsletter
  handleNewsletterSubmit(email) {
    if (email && email.includes("@") && email.includes(".")) {
      this.newsletterEmail = email;
      this.newsletterSuccess = true;
      return true;
    }
    return false;
  }

  // FAQs
  toggleFaq(index) {
    this.openFaqIndex = this.openFaqIndex === index ? null : index;
    return this.openFaqIndex;
  }
}
