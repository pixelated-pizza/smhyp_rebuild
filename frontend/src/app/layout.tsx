import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Image from "next/image";
import Link from "next/link";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Sales Monitoring & Hypercare",
  description: "App for monitoring sales and orders",
  icons: {
    icon: "/logo-millsbrands.svg",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} flex min-h-screen font-sans`}>
        <aside className="w-64 bg-gradient-to-br from-gray-900 via-black to-gray-900  p-6 flex flex-col justify-between">
          <div>
            <div className="mb-8">
              <Image
                src="/logo-millsbrands.svg"
                alt="MillsBrands logo"
                width={140}
                height={30}
                priority
              />
            </div>

            <nav className="flex flex-col gap-4">
              <Link
                href="/realtime_monitoring"
                className="flex items-center gap-2 hover:bg-gray-200 dark:hover:bg-gray-800 px-3 py-2 rounded transition"
              >
                <i className="pi pi-chart-line"></i>
                <span>Real-time Monitoring</span>
              </Link>
              <Link
                href="/hypercare"
                className="flex items-center gap-2 hover:bg-gray-200 dark:hover:bg-gray-800 px-3 py-2 rounded transition"
              >
                <i className="pi pi-heart"></i>
                <span>Hypercare</span>
              </Link>
               <Link
                href="/sales_forecast"
                className="flex items-center gap-2 hover:bg-gray-200 dark:hover:bg-gray-800 px-3 py-2 rounded transition"
              >
                <i className="pi pi-chart-bar"></i>
                <span>Sales Forecast</span>
              </Link>

              <Link
                href="/data_source"
                className="flex items-center gap-2 hover:bg-gray-200 dark:hover:bg-gray-800 px-3 py-2 rounded transition"
              >
                <i className="pi pi-database"></i>
                <span>Data Source</span>
              </Link>
            </nav>

          </div>

          <footer className="mt-8 flex flex-col gap-2 text-sm text-gray-600 dark:text-gray-400">
            <span>Created by ESS</span>
          </footer>
        </aside>

        <main className="flex-1 p-10">{children}</main>
      </body>
    </html>
  );
}
