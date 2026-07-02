import type { Metadata, Viewport } from "next";
import { StoreProvider } from "@/lib/store";
import "./globals.css";

export const metadata: Metadata = {
  title: "SafeSpend",
  description: "Mobile-first spending review from screenshots.",
  appleWebApp: {
    capable: true,
    title: "SafeSpend",
    statusBarStyle: "black-translucent"
  },
  icons: {
    apple: "/apple-touch-icon.png"
  }
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f5f5f8" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0b0e" }
  ]
};

const themeInit = `
try {
  const stored = localStorage.getItem("safespend.theme");
  const dark = stored ? stored === "dark" : matchMedia("(prefers-color-scheme: dark)").matches;
  if (dark) document.documentElement.classList.add("dark");
} catch {}
`;

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInit }} />
      </head>
      <body className="text-ink antialiased dark:text-cloud">
        <StoreProvider>{children}</StoreProvider>
      </body>
    </html>
  );
}
