export function LoadingSpinner({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-8 h-8",
    lg: "w-12 h-12",
  };

  return (
    <div className="flex items-center justify-center">
      <div
        className={`${sizeClasses[size]} animate-spin rounded-full border-2 border-slate-600 border-t-purple-500`}
      />
    </div>
  );
}

export function SkeletonLoader({ className = "" }: { className?: string }) {
  return <div className={`bg-slate-700 rounded animate-pulse ${className}`} />;
}

export function CardLoadingState() {
  return (
    <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 space-y-4">
      <SkeletonLoader className="h-6 w-3/4" />
      <SkeletonLoader className="h-4 w-full" />
      <SkeletonLoader className="h-4 w-5/6" />
      <div className="flex gap-2 pt-4">
        <SkeletonLoader className="h-10 w-24" />
        <SkeletonLoader className="h-10 w-24" />
      </div>
    </div>
  );
}

export function ListLoadingState({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-slate-800 border border-slate-700 rounded-lg p-4">
          <div className="space-y-3">
            <SkeletonLoader className="h-4 w-2/3" />
            <SkeletonLoader className="h-3 w-full" />
            <SkeletonLoader className="h-3 w-4/5" />
          </div>
        </div>
      ))}
    </div>
  );
}
