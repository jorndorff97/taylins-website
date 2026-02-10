import Link from "next/link";

const ERROR_MESSAGES: Record<string, string> = {
  missing: "Please enter your email and password.",
  invalid: "Invalid email or password.",
};

export default function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; redirect?: string }>;
}) {
  const params = searchParams as Promise<{ error?: string; redirect?: string }>;
  return (
    <div className="mx-auto max-w-sm px-4 py-16">
      <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
        Sign in
      </h1>
      <p className="mt-1 text-sm text-slate-600">
        Sign in to place orders and manage your account.
      </p>
      <form action="/api/buyer/login" method="post" className="mt-8 space-y-4">
        <LoginRedirectInput params={params} />
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
          <label htmlFor="password" className="block text-sm font-medium text-slate-700">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            autoComplete="current-password"
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400"
          />
        </div>
        <LoginError params={params} />
        <button
          type="submit"
          className="w-full rounded-lg bg-slate-900 py-2 text-sm font-medium text-white hover:bg-slate-800"
        >
          Sign in
        </button>
      </form>
      <p className="mt-4 text-center text-sm text-slate-600">
        Don&apos;t have an account?{" "}
        <Link href="/register" className="text-hero-accent hover:underline">
          Register
        </Link>
      </p>
    </div>
  );
}

async function LoginRedirectInput({
  params,
}: {
  params: Promise<{ redirect?: string }>;
}) {
  const { redirect } = await params;
  if (!redirect) return null;
  return <input type="hidden" name="redirect" value={redirect} />;
}

async function LoginError({ params }: { params: Promise<{ error?: string }> }) {
  const { error } = await params;
  if (!error) return null;
  return (
    <p className="text-sm text-red-600">
      {ERROR_MESSAGES[error] ?? "Something went wrong."}
    </p>
  );
}
