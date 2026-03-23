import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Sirena — Creator Dashboard",
  description: "Your creator business, elevated. Dashboard and monetization platform for Hispanic creators.",
  openGraph: {
    title: "Sirena — Creator Dashboard",
    description: "Your creator business, elevated.",
    type: "website",
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
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;0,800;1,400;1,700&family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased font-ui">
        {children}
      </body>
    </html>
  );
}
