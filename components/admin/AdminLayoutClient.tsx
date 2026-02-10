"use client";

import type { ReactNode } from "react";
import { useState, createContext, useContext } from "react";

interface AdminLayoutContextType {
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
}

const AdminLayoutContext = createContext<AdminLayoutContextType>({
  mobileMenuOpen: false,
  setMobileMenuOpen: () => {},
});

export function useAdminLayout() {
  return useContext(AdminLayoutContext);
}

export function AdminLayoutClient({ children }: { children: ReactNode }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <AdminLayoutContext.Provider value={{ mobileMenuOpen, setMobileMenuOpen }}>
      {children}
      
      {/* Mobile menu backdrop */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
    </AdminLayoutContext.Provider>
  );
}
