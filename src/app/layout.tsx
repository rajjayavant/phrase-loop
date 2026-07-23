import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { TooltipProvider, ToastViewport } from "@/components/ui";
import { Announcer } from "@/features/session/announcer";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Looper — Practice difficult passages, one loop at a time",
  description:
    "Slow down any YouTube video, mark the exact section you need, and repeat it until it feels natural. A focused practice instrument for musicians.",
  applicationName: "Looper",
};

export const viewport: Viewport = {
  themeColor: "#0b0d10",
  width: "device-width",
  initialScale: 1,
  // Allow zoom for accessibility; the timeline manages its own touch scrolling.
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" data-theme="dark" className={inter.variable}>
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
