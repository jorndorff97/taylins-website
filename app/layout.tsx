import "./globals.css";
import type { ReactNode } from "react";

export const metadata = {
  title: "Taylin Wholesale",
  description: "Wholesale sneaker marketplace",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-background text-slate-900">
        {children}
      </body>
    </html>
  );
}
