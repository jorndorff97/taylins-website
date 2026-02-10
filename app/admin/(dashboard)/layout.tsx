import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminLayoutClient } from "@/components/admin/AdminLayoutClient";
import { hasValidAdminSession } from "@/lib/auth";

export default async function AdminDashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  if (!(await hasValidAdminSession())) {
    redirect("/admin/login");
  }

  return (
    <AdminLayoutClient>
      <div className="flex min-h-screen bg-background">
        <AdminSidebar />
        <div className="flex min-h-screen flex-1 flex-col">{children}</div>
      </div>
    </AdminLayoutClient>
  );
}
