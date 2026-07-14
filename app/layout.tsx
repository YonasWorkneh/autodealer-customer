import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import Session from "./Session";
import IntroLoader from "@/components/IntroLoader";

const SITE_URL = "https://hulucars.com";
const SITE_NAME = "HuluCars";
const DESCRIPTION =
  "HuluCars — Ethiopia's #1 online car marketplace. Buy and sell new and used cars, SUVs, trucks, and more. Browse thousands of verified listings from trusted dealers and private sellers across Ethiopia.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} — Buy & Sell Cars in Ethiopia`,
    template: `%s | ${SITE_NAME}`,
  },
  description: DESCRIPTION,
  keywords: [
    // Brand name & misspellings
    "hulucars", "hulucar", "hulu cars", "hulu car", "hulu-cars", "hulu-car",
    "hulucarz", "hulucares", "hulukars", "holucars", "holocars", "hulucear",
    "hulucaars", "hulucars.com", "hulucar.com", "www.hulucars.com",
    "hulu", "huluu", "hullu", "hullucars",
    // Core intent
    "cars for sale Ethiopia", "buy cars Ethiopia", "sell cars Ethiopia",
    "used cars Ethiopia", "new cars Ethiopia", "car marketplace Ethiopia",
    "car listings Ethiopia", "Ethiopian car market", "Addis Ababa cars",
    "car dealer Ethiopia", "auto dealer Ethiopia", "car auction Ethiopia",
    "car buy sell Ethiopia", "second hand cars Ethiopia",
    // Car types
    "sedan", "SUV", "truck", "coupe", "hatchback", "convertible", "wagon", "van",
    "4x4 Ethiopia", "pickup truck Ethiopia", "electric car Ethiopia",
    // Makes available on the platform
    "Toyota Ethiopia", "BMW Ethiopia", "Hyundai Ethiopia", "BYD Ethiopia",
    "Jetour Ethiopia", "Lifan Ethiopia", "Suzuki Ethiopia", "Nissan Ethiopia",
    "Ford Ethiopia", "Audi Ethiopia", "Mercedes Ethiopia", "Lexus Ethiopia",
    "Infiniti Ethiopia", "Mitsubishi Ethiopia", "Land Rover Ethiopia",
    "Toyota", "BMW", "Hyundai", "BYD", "Jetour", "Lifan", "Suzuki",
    "Nissan", "Ford", "Audi", "Mercedes-Benz", "Lexus", "Infiniti", "Mitsubishi",
    // Popular models
    "Toyota Land Cruiser", "Toyota Hilux", "Toyota Camry", "Toyota RAV4",
    "Nissan Patrol", "Nissan Navara", "Hyundai Tucson", "Hyundai Santa Fe",
    // Action & platform keywords
    "buy a car online", "sell my car online", "car listing", "car search",
    "verified car listings", "trusted car sellers", "car price Ethiopia",
    "affordable cars Ethiopia", "luxury cars Ethiopia", "car financing Ethiopia",
    // Generic automotive
    "automobile", "vehicle", "motor vehicle", "auto", "motors",
    "car price", "car review", "car dealer", "car broker", "auto broker",
  ],
  authors: [{ name: SITE_NAME, url: SITE_URL }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
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
  openGraph: {
    type: "website",
    locale: "en_ET",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: `${SITE_NAME} — Buy & Sell Cars in Ethiopia`,
    description: DESCRIPTION,
    images: [
      {
        url: "/logo/hulucar5-01.svg",
        width: 1200,
        height: 630,
        alt: "HuluCars — Ethiopia's Car Marketplace",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} — Buy & Sell Cars in Ethiopia`,
    description: DESCRIPTION,
    images: ["/logo/hulucar5-01.svg"],
    creator: "@hulucars",
  },
  alternates: {
    canonical: SITE_URL,
  },
  category: "automotive",
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${SITE_URL}/#organization`,
      name: SITE_NAME,
      url: SITE_URL,
      logo: {
        "@type": "ImageObject",
        url: `${SITE_URL}/favicon.svg`,
      },
      description: DESCRIPTION,
      sameAs: [],
    },
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      url: SITE_URL,
      name: SITE_NAME,
      description: DESCRIPTION,
      publisher: { "@id": `${SITE_URL}/#organization` },
      potentialAction: {
        "@type": "SearchAction",
        target: {
          "@type": "EntryPoint",
          urlTemplate: `${SITE_URL}/listing?q={search_term_string}`,
        },
        "query-input": "required name=search_term_string",
      },
    },
    {
      "@type": "AutoDealer",
      "@id": `${SITE_URL}/#autodealer`,
      name: SITE_NAME,
      url: SITE_URL,
      description: DESCRIPTION,
      areaServed: {
        "@type": "Country",
        name: "Ethiopia",
      },
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body>
        <Session>
          <IntroLoader>
            <div className="root">{children}</div>
          </IntroLoader>
        </Session>
        <Toaster />
      </body>
    </html>
  );
}
