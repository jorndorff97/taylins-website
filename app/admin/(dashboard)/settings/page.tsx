import { PasskeyManager } from "@/components/admin/PasskeyManager";

export default function AdminSettingsPage() {
  return (
    <div className="flex-1 p-6 md:p-10">
      <h1 className="text-xl font-semibold text-slate-900">Settings</h1>
      <p className="mt-1 text-sm text-slate-500">
        Manage your admin account security.
      </p>

      <div className="mt-8 max-w-2xl">
        <PasskeyManager />
      </div>
    </div>
  );
}
