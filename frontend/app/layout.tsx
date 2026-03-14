import type { Metadata } from "next";
import { Sora } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";

const sora = Sora({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "VoiceScript AI",
  description: "Speech to Text Transcription App",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${sora.className} text-slate-900 antialiased`}>
        <div className="mx-auto min-h-screen max-w-6xl px-3 pb-6 sm:px-4 lg:px-6">
          <Navbar />
          <main className="pt-3">{children}</main>
        </div>
      </body>
    </html>
  );
}
