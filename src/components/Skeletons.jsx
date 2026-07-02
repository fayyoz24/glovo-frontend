export function MerchantCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-tile border-2 border-ink/10 bg-white">
      <div className="skeleton h-28 w-full" />
      <div className="space-y-2 p-3">
        <div className="skeleton h-4 w-3/4 rounded" />
        <div className="skeleton h-3 w-1/2 rounded" />
      </div>
    </div>
  );
}

export function ProductRowSkeleton() {
  return (
    <div className="flex items-center gap-3 rounded-tile border-2 border-ink/10 bg-white p-3">
      <div className="skeleton h-16 w-16 shrink-0 rounded-xl" />
      <div className="flex-1 space-y-2">
        <div className="skeleton h-4 w-2/3 rounded" />
        <div className="skeleton h-3 w-1/3 rounded" />
      </div>
    </div>
  );
}

export function Grid({ children }) {
  return <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">{children}</div>;
}
