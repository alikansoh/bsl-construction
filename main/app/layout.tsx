import type { Metadata, Viewport } from "next";
import { Oswald, Inter } from "next/font/google";
import SiteChrome from "@/components/SiteChrome";
import "./globals.css";

const oswald = Oswald({
  variable: "--font-heading",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const inter = Inter({
  variable: "--font-body",
  subsets: ["latin"],
});

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ??
  "https://bsl-construction.vercel.app";

const SITE_NAME = "BSL Construction";
const SITE_TITLE =
  "BSL Construction | Builders, Extensions & M&E Services in London";
const SITE_DESCRIPTION =
  "BSL Construction delivers new builds, extensions, refurbishments, and mechanical & electrical services across Greater London — fully insured, one accountable team, clear fixed quotes.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),

  title: {
    default: SITE_TITLE,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,

  keywords: [
    "construction company London",
    "builders London",
    "house extensions London",
    "new build construction London",
    "refurbishment contractors London",
    "mechanical and electrical services London",
    "commercial maintenance London",
    "loft conversions London",
  ],

  authors: [{ name: SITE_NAME }],
  creator: SITE_NAME,
  publisher: SITE_NAME,

  applicationName: SITE_NAME,
  referrer: "origin-when-cross-origin",

  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },

  alternates: {
    canonical: "/",
  },

  openGraph: {
    type: "website",
    locale: "en_GB",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: `${SITE_NAME} — Builders, Extensions & M&E Services in London`,
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    images: ["/og-image.png"],
  },

  icons: {
    icon: [{ url: "/favicon.ico" }],
    shortcut: ["/favicon.ico"],
    apple: [{ url: "/logo.png" }],
  },

  manifest: "/site.webmanifest",

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },

  category: "construction",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#FAFAF9" },
    { media: "(prefers-color-scheme: dark)", color: "#1D1813" },
  ],
};

const ORGANIZATION_STRUCTURED_DATA = {
  "@context": "https://schema.org",
  "@type": "HomeAndConstructionBusiness",
  name: SITE_NAME,
  url: SITE_URL,
  logo: `${SITE_URL}/logo.png`,
  image: `${SITE_URL}/og-image.png`,
  description: SITE_DESCRIPTION,
  telephone: "+44 20 7946 0958",
  email: "info@bslconstruction.co.uk",
  areaServed: {
    "@type": "City",
    name: "London",
  },
  address: {
    "@type": "PostalAddress",
    addressLocality: "London",
    addressCountry: "GB",
  },
  sameAs: [] as string[],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en-GB"
      className={`${oswald.variable} ${inter.variable} h-full antialiased`}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(ORGANIZATION_STRUCTURED_DATA),
          }}
        />
      </head>
      <body className="min-h-full flex flex-col">
        <SiteChrome>{children}</SiteChrome>
      </body>
    </html>
  );
}