import type { Metadata } from "next";
import { EB_Garamond, Inter } from "next/font/google";
import "./globals.css";

const ebGaramond = EB_Garamond({
  variable: "--font-heading",
  subsets: ["latin"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-body",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  title: "Swiss Bullion Depository Vault | Global Trust. Swiss Security.",
  description: "A private Swiss institution offering uncompromised security and bullion depository services to global clients. Discreet vaulting services for private investors, institutions, and sovereign clients.",
  keywords: ["Swiss vault", "bullion storage", "private vault", "Swiss security", "precious metals", "wealth preservation", "Swiss bullion", "private depository"],
  authors: [{ name: "Swiss Bullion Depository Vault" }],
  creator: "Swiss Bullion Depository Vault",
  publisher: "Swiss Bullion Depository Vault",
  openGraph: {
    title: "Swiss Bullion Depository Vault | Global Trust. Swiss Security.",
    description: "A private Swiss institution offering uncompromised security and bullion depository services to global clients.",
    type: "website",
    siteName: "Swiss Bullion Depository Vault",
    images: [
      {
        url: "/logo.png",
        width: 546,
        height: 385,
        alt: "Swiss Bullion Depository Vault",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Swiss Bullion Depository Vault",
    description: "Swiss Security. Global Wealth.",
    images: ["/logo.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/logo.png",
    shortcut: "/logo.png",
    apple: "/logo.png",
  },
  verification: {
    // Add verification codes here when available
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Swiss Bullion Depository Vault",
    alternateName: "SBDV",
    url: process.env.NEXT_PUBLIC_SITE_URL || "https://sbdv.swiss",
    logo: `${process.env.NEXT_PUBLIC_SITE_URL || "https://sbdv.swiss"}/logo.png`,
    description:
      "A private Swiss institution offering vault custody, investment advisory, and portfolio management to global clients.",
    address: {
      "@type": "PostalAddress",
      addressCountry: "CH",
      addressLocality: "Zurich",
      streetAddress: "Bahnhofstrasse 45",
      postalCode: "8001",
    },
    location: [
      { "@type": "Place", name: "Zurich HQ", address: { addressLocality: "Zurich", addressCountry: "CH" } },
      { "@type": "Place", name: "Dubai Office", address: { addressLocality: "Dubai", addressCountry: "AE" } },
      { "@type": "Place", name: "Singapore Office", address: { addressLocality: "Singapore", addressCountry: "SG" } },
      { "@type": "Place", name: "New York Office", address: { addressLocality: "New York", addressCountry: "US" } },
    ],
  };

  const financialServiceSchema = {
    "@context": "https://schema.org",
    "@type": "FinancialService",
    name: "Swiss Bullion Depository Vault",
    description:
      "Private vault custody, investment advisory, and portfolio management with Swiss precision and security.",
    provider: {
      "@type": "Organization",
      name: "Swiss Bullion Depository Vault",
    },
    areaServed: "Worldwide",
    serviceType: [
      "Private Vault Leasing",
      "Bullion Custody & Verification",
      "Insurance & Audit Reporting",
      "VIP Private Viewing Rooms",
      "Investment Advisory",
      "Portfolio Management",
      "Alternative Investments",
      "Consolidated Reporting",
    ],
  };

  const investmentServiceSchema = {
    "@context": "https://schema.org",
    "@type": "FinancialService",
    name: "SBDV Wealth & Investment",
    description: "Globally diversified portfolio management integrated with Swiss bullion custody.",
    provider: { "@type": "Organization", name: "Swiss Bullion Depository Vault" },
    serviceType: "Investment Management",
    areaServed: "Worldwide",
  };

  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${ebGaramond.variable} ${inter.variable} font-body antialiased`}
      >
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationSchema),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(financialServiceSchema),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(investmentServiceSchema),
          }}
        />
        {children}
      </body>
    </html>
  );
}
