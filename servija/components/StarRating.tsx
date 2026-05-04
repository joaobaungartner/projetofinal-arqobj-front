import { Star } from 'lucide-react'

interface StarRatingProps {
  rating: number
  max?: number
  size?: 'sm' | 'md'
  showValue?: boolean
}

export function StarRating({
  rating,
  max = 5,
  size = 'md',
  showValue = true,
}: StarRatingProps) {
  const px = size === 'sm' ? 12 : 14
  const filled = Math.round(rating)

  return (
    <span className="inline-flex items-center gap-0.5">
      {Array.from({ length: max }).map((_, i) => (
        <Star
          key={i}
          size={px}
          strokeWidth={0}
          className={i < filled ? 'fill-warning' : 'fill-border'}
        />
      ))}
      {showValue && (
        <span className="text-xs text-muted ml-1 tabular-nums">
          {rating.toFixed(1)}
        </span>
      )}
    </span>
  )
}
