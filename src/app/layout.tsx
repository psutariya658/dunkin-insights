import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import { SessionProvider } from "@/components/SessionProvider";
import { LayoutProvider } from "@/components/LayoutProvider";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ['400', '600', '700', '800'],
  variable: '--font-poppins',
});

export const metadata: Metadata = {
  title: "Dunkin Feedback",
  description: "Provide feedback for Dunkin' products and services.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${poppins.variable} font-sans bg-gray-50`}>
        <SessionProvider>
          <LayoutProvider>{children}</LayoutProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
