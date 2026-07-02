import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SafeSpend",
  description: "Mobile-first spending review for ARQ and DolarApp screenshots."
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#101218"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="text-ink antialiased dark:text-cloud">{children}</body>
    </html>
  );
}
