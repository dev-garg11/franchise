import "./globals.css";
import LayoutClientWrapper from "@/components/LayoutClientWrapper";

export const metadata = {
  title: "Franchise Apply - Business and Franchise Opportunities India",
  description: "Franchise Apply offers every business and franchise opportunity in India at low cost. Buy top franchise and business ideas in India with low investment.",
  keywords: "franchise, business opportunity, franchise india, low investment business, buy business, brand expansion, franchise apply",
  openGraph: {
    title: "Franchise Apply - Business and Franchise Opportunities India",
    description: "Buy top franchise and business ideas in India with low investment. Expand your brand franchise network.",
    url: "https://www.franchiseapply.com",
    siteName: "Franchise Apply",
    locale: "en_IN",
    type: "website",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="flex flex-col min-h-screen">
        <LayoutClientWrapper>{children}</LayoutClientWrapper>
      </body>
    </html>
  );
}
