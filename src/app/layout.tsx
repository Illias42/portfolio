import type { Metadata } from "next";

import { fontMono, fontSans } from "@/public/fonts";
import { MotionProvider } from "@/src/app/providers";
import { siteConfig } from "@/src/shared/config";

import "@/src/app/styles/globals.css";

export const metadata: Metadata = {
  title: siteConfig.title,
  description: siteConfig.description,
  authors: [{ name: siteConfig.name }],
  openGraph: {
    title: siteConfig.title,
    description: siteConfig.description,
    type: "website",
    locale: "en_GB",
  },
  twitter: { card: "summary", title: siteConfig.title, description: siteConfig.description },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${fontSans.variable} ${fontMono.variable} h-full`}>
      <body className="flex min-h-full flex-col">
        <MotionProvider>{children}</MotionProvider>
      </body>
    </html>
  );
}
