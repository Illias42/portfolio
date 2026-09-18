import type { Metadata } from "next";

import { fontMono, fontSans } from "@/_app/fonts";
import { MotionProvider } from "@/_app/providers";

import "@/_app/styles/globals.css";

export const metadata: Metadata = {};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${fontSans.variable} ${fontMono.variable} h-full`}>
      <body className="flex min-h-full flex-col">
        <MotionProvider>{children}</MotionProvider>
      </body>
    </html>
  );
}
