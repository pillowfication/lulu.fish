import { cn } from '@/lib/utils'
import { type HTMLAttributes, type JSX } from 'react'

function Skeleton ({ className, ...props }: HTMLAttributes<HTMLDivElement>): JSX.Element {
  return (
    <div
      className={cn(
        'animate-pulse rounded-md bg-muted',
        className
      )}
      {...props}
    />
  )
}

export {
  Skeleton
}
