import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "My3DPrintNews",
  description: "Your Personalised 3D Printing News",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
