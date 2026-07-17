import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import Sidebar from "@/components/Sidebar";

export const metadata: Metadata = {
  title: "InvoiceX-Ray — TBML Compliance Dashboard",
  description:
    "Trade-Based Money Laundering detection for Authorized Dealer banks. Cross-reference invoice values against commodity benchmarks and EDPMS deadlines.",
  keywords: ["TBML", "compliance", "trade finance", "EDPMS", "STR", "FIU-IND", "invoice"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>
        <ThemeProvider>
          <div
            style={{
              display: "flex",
              minHeight: "100vh",
            }}
          >
            <Sidebar />
            <main
              style={{
                flex: 1,
                marginLeft: "var(--sidebar-width)",
                minHeight: "100vh",
                background: "var(--bg-secondary)",
                display: "flex",
                flexDirection: "column",
              }}
            >
              {children}
            </main>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
