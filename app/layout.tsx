import "./globals.css";
import type { ReactNode } from "react";

export const metadata = {
  title: "eForwarder Wholesale",
  description: "Wholesale sneaker marketplace",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="overflow-x-hidden">
      <body className="bg-background text-slate-900 overflow-x-hidden">
        {children}
      </body>
    </html>
  );
}
