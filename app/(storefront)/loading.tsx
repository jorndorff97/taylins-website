export default function StorefrontLoading() {
  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6">
        <div className="animate-pulse space-y-12">
          <div className="h-12 w-3/4 max-w-xl rounded bg-neutral-100" />
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="aspect-square rounded-xl bg-neutral-100" />
            ))}
          </div>
          <div className="h-8 w-1/2 rounded bg-neutral-100" />
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="aspect-[3/4] rounded-xl bg-neutral-100" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
