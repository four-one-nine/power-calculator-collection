import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Power-Calc",
  description: "Electrical calculation tools for electricians and hobbyists",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-gray-900 text-white min-h-screen`}>
        <main className="max-w-md mx-auto px-4 py-6">
          {children}
        </main>
      </body>
    </html>
  );
}
