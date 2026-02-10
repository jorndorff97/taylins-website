import Link from "next/link";

const ERROR_MESSAGES: Record<string, string> = {
  missing: "Please enter your email and password.",
  short: "Password must be at least 8 characters.",
  exists: "An account with this email already exists.",
};

export default function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = searchParams as Promise<{ error?: string }>;
  return (
    <div className="mx-auto max-w-sm px-4 py-16">
      <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
        Create account
      </h1>
      <p className="mt-1 text-sm text-slate-600">
        Register to place orders and browse wholesale listings.
      </p>
      <form action="/api/buyer/register" method="post" className="mt-8 space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-slate-700">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400"
          />
        </div>
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-slate-700">
            Name (optional)
          </label>
          <input
            id="name"
            name="name"
            type="text"
            autoComplete="name"
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400"
          />
        </div>
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-slate-700">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            autoComplete="new-password"
            minLength={8}
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400"
          />
          <p className="mt-1 text-xs text-slate-500">At least 8 characters</p>
        </div>
        <RegisterError params={params} />
        <button
          type="submit"
          className="w-full rounded-lg bg-slate-900 py-2 text-sm font-medium text-white hover:bg-slate-800"
        >
          Create account
        </button>
      </form>
      <p className="mt-4 text-center text-sm text-slate-600">
        Already have an account?{" "}
        <Link href="/login" className="text-hero-accent hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}

async function RegisterError({ params }: { params: Promise<{ error?: string }> }) {
  const { error } = await params;
  if (!error) return null;
  return (
    <p className="text-sm text-red-600">
      {ERROR_MESSAGES[error] ?? "Something went wrong."}
    </p>
  );
}
