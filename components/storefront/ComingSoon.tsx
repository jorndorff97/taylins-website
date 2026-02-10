import Link from "next/link";

interface ComingSoonProps {
  categoryLabel: string;
  categorySlug: string;
}

export function ComingSoon({ categoryLabel, categorySlug }: ComingSoonProps) {
  return (
    <div className="mx-auto max-w-2xl px-4 py-16 text-center">
      <div className="inline-flex items-center gap-2 rounded-full bg-amber-50 px-4 py-2">
        <span className="text-sm font-medium text-amber-900">Coming Soon</span>
      </div>
      <h1 className="mt-6 text-4xl font-semibold tracking-tight text-slate-900">
        {categoryLabel}
      </h1>
      <p className="mt-4 text-lg text-slate-600">
        We&apos;re expanding our marketplace. {categoryLabel} will be available soon.
      </p>
      <p className="mt-2 text-sm text-slate-500">
        Check back later or browse our other categories.
      </p>
      <Link 
        href="/browse" 
        className="mt-8 inline-flex rounded-lg bg-slate-900 px-6 py-3 text-sm font-medium text-white hover:bg-slate-800"
      >
        Browse All Categories
      </Link>
    </div>
  );
}
