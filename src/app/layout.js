import "./globals.css";
import LayoutClientWrapper from "@/components/LayoutClientWrapper";

export const metadata = {
  title: "Franchise Roots - Business and Franchise Opportunities India",
  description: "Franchise Roots offers premium and luxury business and franchise opportunities in India. Connect with corporate investors to grow your franchise network.",
  keywords: "franchise, business opportunity, franchise india, low investment business, buy business, brand expansion, franchise roots",
  openGraph: {
    title: "Franchise Roots - Business and Franchise Opportunities India",
    description: "Buy top franchise and business ideas in India. Expand your brand franchise network with Franchise Roots.",
    url: "https://www.franchiseroots.com",
    siteName: "Franchise Roots",
    locale: "en_IN",
    type: "website",
  },
  alternates: {
    canonical: "https://www.franchiseroots.com",
  }
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="flex flex-col min-h-screen" suppressHydrationWarning>
        <LayoutClientWrapper>{children}</LayoutClientWrapper>
      </body>
    </html>
  );
}

