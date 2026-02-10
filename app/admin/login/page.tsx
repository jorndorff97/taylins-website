import { redirect } from "next/navigation";
import { hasValidAdminSession } from "@/lib/auth";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

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
      <Card className="w-full max-w-sm">
        <form action="/api/admin/login" method="POST">
          <h1 className="text-lg font-semibold text-slate-900">Admin login</h1>
          <p className="mt-1 text-xs text-slate-500">
            Enter the admin password to continue.
          </p>
          {error === "invalid" && (
            <p className="mt-2 text-xs text-red-600">Invalid password.</p>
          )}
          {error === "config" && (
            <p className="mt-2 text-xs text-red-600">
              ADMIN_PASSWORD not configured. Add it to .env
            </p>
          )}
          <div className="mt-4 space-y-3">
            <div>
              <label
                htmlFor="password"
                className="block text-xs font-medium text-slate-700"
              >
                Password
              </label>
              <Input
                id="password"
                name="password"
                type="password"
                required
                autoComplete="current-password"
                className="mt-1"
              />
            </div>
            <Button type="submit" className="w-full">
              Sign in
            </Button>
          </div>
        </form>
      </Card>
    </main>
  );
}
