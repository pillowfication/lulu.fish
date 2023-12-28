import { cn } from '@/lib/utils'
import { type JSX } from 'react'

interface SpinnerProps {
  className?: string
  size?: 'sm' | 'md' | 'lg' | 'inline'
}

const Spinner = ({ className, size = 'md' }: SpinnerProps): JSX.Element => (
  <div
    className={cn(
      {
        sm: 'w-6 h-6 border-t-4',
        md: 'w-12 h-12 border-t-[6px]',
        lg: 'w-24 h-24 border-t-8',
        inline: 'w-[1.15em] h-[1.15em] border-t-[0.25em]'
      }[size],
      'border-primary border-solid rounded-full animate-spin',
      className
    )}
  />
)

export {
  Spinner,
  type SpinnerProps
}
