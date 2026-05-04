interface SkeletonProps {
  className?: string
}

export function Skeleton({ className = '' }: SkeletonProps) {
  return (
    <div className={`animate-pulse rounded-lg bg-border/70 ${className}`} />
  )
}

export function ProviderCardSkeleton() {
  return (
    <div className="bg-card border border-border rounded-lg p-5">
      <div className="flex items-center gap-3 mb-4">
        <Skeleton className="w-12 h-12 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-3/5" />
          <Skeleton className="h-3 w-2/5" />
        </div>
      </div>
      <Skeleton className="h-3 w-1/3 mb-2" />
      <Skeleton className="h-3 w-2/5" />
    </div>
  )
}

export function ServiceCardSkeleton() {
  return (
    <div className="bg-card border border-border rounded-lg p-5">
      <Skeleton className="h-4 w-2/3 mb-2" />
      <Skeleton className="h-3 w-full mb-1" />
      <Skeleton className="h-3 w-4/5 mb-4" />
      <div className="flex justify-between">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-4 w-16" />
      </div>
    </div>
  )
}

export function AppointmentCardSkeleton() {
  return (
    <div className="bg-card border border-border rounded-lg p-5">
      <div className="flex justify-between mb-3">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-5 w-20 rounded-sm" />
      </div>
      <Skeleton className="h-3 w-32 mb-2" />
      <Skeleton className="h-3 w-24" />
    </div>
  )
}

export function MetricCardSkeleton() {
  return (
    <div className="bg-card border border-border rounded-lg p-5">
      <Skeleton className="h-3 w-24 mb-3" />
      <Skeleton className="h-8 w-16" />
    </div>
  )
}
