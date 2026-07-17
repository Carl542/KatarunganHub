import { Merriweather, Public_Sans, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";

const merriweather = Merriweather({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "700", "900"],
});

const publicSans = Public_Sans({
  variable: "--font-body",
  subsets: ["latin"],
});

const plexMono = IBM_Plex_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata = {
  title: "KatarunganHub — Barangay Case Tracking",
  description:
    "Case tracking and management system for the Katarungang Pambarangay dispute resolution process.",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${merriweather.variable} ${publicSans.variable} ${plexMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
