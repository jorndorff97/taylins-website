import { redirect } from "next/navigation";
import { hasValidAdminSession } from "@/lib/auth";
import { AdminLoginForm } from "@/components/admin/AdminLoginForm";

interface AdminLoginPageProps {
  searchParams: Promise<{ error?: string }>;
}

export default async function AdminLoginPage({ searchParams }: AdminLoginPageProps) {
  if (await hasValidAdminSession()) {
    redirect("/admin/listings");
  }

  const { error } = await searchParams;

  return (
    <main className="flex min-h-screen items-center justify-center bg-background">
      <AdminLoginForm error={error} />
    </main>
  );
}
