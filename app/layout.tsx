import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "marketplace.ai — App-Ready Templates for Builders",
  description: "Ship faster with production-ready Next.js templates. Join 1,200+ developers on the waitlist.",
  keywords: ["marketplace", "templates", "nextjs", "react", "saas", "builders"],
  openGraph: {
    title: "marketplace.ai — App-Ready Templates for Builders",
    description: "Ship faster with production-ready Next.js templates. Join 1,200+ developers on the waitlist.",
    type: "website",
    url: "https://marketplace.ai",
  },
  twitter: {
    card: "summary_large_image",
    title: "marketplace.ai — App-Ready Templates for Builders",
    description: "Ship faster with production-ready Next.js templates.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Instrument+Sans:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
