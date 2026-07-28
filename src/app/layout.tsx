import type { Metadata, Viewport } from "next";
import { DM_Sans, DM_Serif_Display } from "next/font/google";
import { AppProviders } from "@/components/providers/app-providers";
import { ClientPwaShell } from "@/components/pwa/client-pwa-shell";
import { isE2eMode } from "@/lib/global/shared/env";
import { ServiceWorkerRegistration } from "@/components/pwa/service-worker-registration";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
});

const dmSerif = DM_Serif_Display({
  variable: "--font-dm-serif",
  weight: "400",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Jiwambe Onboarding",
  description:
    "Tablet PWA for Jiwambe onboarding agents — desk queue, in-person capture, agreement, and handover.",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [
      { url: "/icons/favicon-32.png", type: "image/png", sizes: "32x32" },
      { url: "/icons/icon-192.png", type: "image/png", sizes: "192x192" },
      { url: "/icons/icon-512.png", type: "image/png", sizes: "512x512" },
    ],
    apple: [
      {
        url: "/apple-touch-icon.png",
        type: "image/png",
        sizes: "180x180",
      },
    ],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Jiwambe Onboarding",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
  themeColor: "#123E31",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${dmSans.variable} ${dmSerif.variable} h-full antialiased`}
    >
      <body className="flex min-h-dvh flex-col bg-[#D9DDD9] text-ink">
        <div className="mx-auto flex min-h-dvh w-full max-w-[960px] flex-1 flex-col bg-background shadow-[0_0_44px_rgba(0,0,0,0.16)]">
          <AppProviders>
            {children}
          </AppProviders>
        </div>
        <ClientPwaShell showInstallPrompt={!isE2eMode()} />
        <Toaster />
        <ServiceWorkerRegistration />
      </body>
    </html>
  );
}
