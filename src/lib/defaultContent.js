// Public content shown when a fresh environment has no CMS records yet.
// MongoDB records always take priority; these entries prevent blank public
// pages during first deployment, a slow database, or a temporary outage.
export const DEFAULT_SERVICES = [
  {
    id: "franchise-consulting",
    title: "Franchise Consulting & Strategy",
    content: "Build a practical franchise roadmap with market research, business model review, investment planning, and territory strategy.",
    image: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&q=80&w=900",
    createdAt: "2025-01-01T00:00:00.000Z",
  },
  {
    id: "brand-expansion",
    title: "Brand Expansion & Franchise Setup",
    content: "Prepare your brand for franchise growth with documentation, unit economics, partner profiling, and launch support across India.",
    image: "https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&q=80&w=900",
    createdAt: "2025-01-02T00:00:00.000Z",
  },
  {
    id: "investor-matchmaking",
    title: "Investor Matchmaking",
    content: "Connect with verified investors and franchise seekers through targeted outreach, qualification, and dedicated advisory support.",
    image: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&q=80&w=900",
    createdAt: "2025-01-03T00:00:00.000Z",
  },
  {
    id: "legal-compliance",
    title: "Legal & Compliance Advisory",
    content: "Get clear guidance on franchise agreements, registrations, compliance workflows, and the documentation needed for confident expansion.",
    image: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&q=80&w=900",
    createdAt: "2025-01-04T00:00:00.000Z",
  },
];

export const DEFAULT_BLOGS = [
  {
    id: "how-to-choose-franchise",
    title: "How to Choose the Right Franchise Opportunity",
    content: "A practical guide to comparing investment, support, location, margins, and long-term growth before choosing a franchise.",
    image: "https://images.unsplash.com/photo-1556761175-4b46a572b786?auto=format&fit=crop&q=80&w=900",
    createdAt: "2025-01-04T00:00:00.000Z",
  },
  {
    id: "franchise-market-trends",
    title: "Franchise Market Trends Every Investor Should Know",
    content: "Explore the categories, customer behaviours, and expansion signals shaping India’s franchise and business opportunity market.",
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=900",
    createdAt: "2025-01-03T00:00:00.000Z",
  },
  {
    id: "brand-expansion-playbook",
    title: "The Brand Expansion Playbook",
    content: "Learn how an established business can create a repeatable franchise model and build a dependable partner network.",
    image: "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&q=80&w=900",
    createdAt: "2025-01-02T00:00:00.000Z",
  },
];
