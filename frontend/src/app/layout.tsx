import type { Metadata } from "next";
import { Gabarito } from "next/font/google";
import "./globals.css";


const gabarito = Gabarito({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Twenty CRM | Open Source CRM",
  description: "Manage your contacts, companies, and opportunities with ease.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${gabarito.className} bg-slate-50 text-slate-900 antialiased`}>
        {children}
      </body>
    </html>
  );
}
