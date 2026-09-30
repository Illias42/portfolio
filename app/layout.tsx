import type { Metadata } from "next";

import { fontMono, fontSans, fontScript, fontSerif } from "@/_app/fonts";
import { MotionProvider } from "@/_app/providers";
import { siteConfig } from "@/shared/config";

import "@/_app/styles/globals.css";

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

export default function RootLayout({ children, modal }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${fontSans.variable} ${fontMono.variable} ${fontSerif.variable} ${fontScript.variable} h-full`}
    >
      <body className="flex min-h-full flex-col">
        <MotionProvider>
          {children}
          {modal}
        </MotionProvider>
      </body>
    </html>
  );
}
