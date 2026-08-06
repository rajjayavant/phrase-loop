import type { Metadata, Viewport } from "next";
import { Poppins, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { TooltipProvider, ToastViewport } from "@/components/ui";
import { Announcer } from "@/features/session/announcer";
import { AnalyticsScripts } from "@/features/session/analytics-scripts";

// Display / brand voice — rounded, characterful, matches the studio aesthetic.
const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-poppins",
  display: "swap",
});

// Body / UI — clean and legible for long practice sessions.
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

// Measurements — a true monospace so timestamps and speeds read as instrument
// readouts, not prose.
const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-mono",
  display: "swap",
});

const SITE_URL = "https://phraseloop.online";
// The title leads with the terms people actually search — "loop a section",
// "AB repeat", "slow down" — rather than the brand alone, which nobody yet
// knows to look for.
const TITLE = "PhraseLoop — Loop a Section of Any Video | AB Repeat for Practice";
// Kept under 155 characters so Google shows it in full rather than truncating.
const DESCRIPTION =
  "Loop a section of any YouTube video or your own file and slow it down to 0.25x, pitch intact, and repeat it until it feels natural. Free, no account.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: TITLE,
  description: DESCRIPTION,
  applicationName: "PhraseLoop",
  // No `keywords`: Google has ignored the meta keywords tag since 2009, and
  // publishing a target list only helps competitors.
  alternates: { canonical: "/" },
  // icon.png and apple-icon.png are picked up from src/app automatically;
  // naming them here keeps the intent explicit.
  icons: { icon: "/icon.png", apple: "/apple-icon.png" },
  openGraph: {
    type: "website",
    url: SITE_URL,
    siteName: "PhraseLoop",
    title: TITLE,
    description: DESCRIPTION,
    images: [
      {
        url: "/opengraph-image.png",
        width: 1200,
        height: 630,
        alt: "PhraseLoop — a practice tool for musicians",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
    images: ["/opengraph-image.png"],
  },
};

export const viewport: Viewport = {
  themeColor: "#151312",
  width: "device-width",
  initialScale: 1,
  // Allow zoom for accessibility; the timeline manages its own touch scrolling.
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      data-theme="dark"
      className={`${poppins.variable} ${inter.variable} ${jetbrainsMono.variable}`}
    >
      <head>
        {/* The YouTube player and analytics are both third-party and both on
            the critical path for the player. Opening the connections early
            saves the DNS, TCP and TLS round trips when the scripts are
            actually requested. */}
        {/* No youtube.com / i.ytimg.com preconnects here: the player loads
            only on activation (warmed on hover in PlayerSurface), and the
            poster is served same-origin through next/image. Lighthouse flags
            preconnects to origins the initial load never hits. */}
        <link rel="preconnect" href="https://www.googletagmanager.com" />
        <link rel="dns-prefetch" href="https://www.google-analytics.com" />
      </head>
      <body>
        <TooltipProvider delayDuration={300} skipDelayDuration={200}>
          {children}
          <ToastViewport />
          <Announcer />
        </TooltipProvider>
        <AnalyticsScripts />
      </body>
    </html>
  );
}
