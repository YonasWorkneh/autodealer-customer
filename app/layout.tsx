import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import Session from "./Session";

export const metadata: Metadata = {
  title: "HuluCars",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="shortcut icon" href="/favicon.svg" type="image/svg+xml"/>
      </head>
      <body>
        <Session>
          <div className="root">{children}</div>
        </Session>
        <Toaster />
      </body>
    </html>
  );
}
