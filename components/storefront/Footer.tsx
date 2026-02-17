import Link from "next/link";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-slate-200/60 bg-white/50 backdrop-blur-sm">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <p className="text-sm text-slate-500">
            © {currentYear} eForwarder. All rights reserved.
          </p>
          <nav className="flex items-center gap-6">
            <Link
              href="/terms"
              className="text-sm text-slate-500 transition-colors hover:text-slate-900"
            >
              Terms of Service
            </Link>
            <Link
              href="/privacy"
              className="text-sm text-slate-500 transition-colors hover:text-slate-900"
            >
              Privacy Policy
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}
