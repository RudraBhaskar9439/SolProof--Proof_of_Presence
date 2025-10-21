"use client"

export function SkeletonCard() {
  return (
    <div className="card animate-pulse">
      <div className="h-40 bg-surface-light rounded-lg mb-4" />
      <div className="h-6 bg-surface-light rounded mb-2" />
      <div className="h-4 bg-surface-light rounded w-3/4" />
    </div>
  )
}

export function SkeletonText() {
  return <div className="h-4 bg-surface-light rounded animate-pulse" />
}

export function SkeletonLine() {
  return <div className="h-6 bg-surface-light rounded animate-pulse mb-2" />
}
