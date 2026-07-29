import type { Metadata } from "next";
import "./globals.css";
import { productionBaseUrl } from "@/config/launch-mode";

export const metadata: Metadata = {
  metadataBase: new URL(productionBaseUrl),
  title: "My3DPrintNews",
  description:
    "Personalised 3D Printing News from manufacturers, creators, reviewers and industry experts.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "My3DPrintNews",
    description:
      "Personalised 3D Printing News from manufacturers, creators, reviewers and industry experts.",
    siteName: "My3DPrintNews",
    type: "website",
    url: "/",
  },
  twitter: {
    card: "summary",
    title: "My3DPrintNews",
    description:
      "Personalised 3D Printing News from manufacturers, creators, reviewers and industry experts.",
  },
  icons: {
    icon: "/icon.svg",
  },
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
