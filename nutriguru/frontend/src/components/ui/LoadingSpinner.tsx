import { Leaf } from 'lucide-react'

interface Props {
  message?: string
}

export default function LoadingSpinner({ message = 'Loading...' }: Props) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[200px] gap-3">
      <Leaf className="w-8 h-8 text-primary animate-spin" />
      <span className="text-sm text-text-muted">{message}</span>
    </div>
  )
}
