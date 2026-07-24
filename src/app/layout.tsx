import type { Metadata, Viewport } from "next";
import { Poppins, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { TooltipProvider, ToastViewport } from "@/components/ui";
import { Announcer } from "@/features/session/announcer";

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

export const metadata: Metadata = {
  title: "Looper — Practice difficult passages, one loop at a time",
  description:
    "Slow down any YouTube video, mark the exact section you need, and repeat it until it feels natural. A focused practice instrument for musicians.",
  applicationName: "Looper",
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
      <body>
        <TooltipProvider delayDuration={300} skipDelayDuration={200}>
          {children}
          <ToastViewport />
          <Announcer />
        </TooltipProvider>
      </body>
    </html>
  );
}
