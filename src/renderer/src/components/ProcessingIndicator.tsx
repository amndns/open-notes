import { Mic } from 'lucide-react'

interface ProcessingIndicatorProps {
  progress: number
  message: string
}

export default function ProcessingIndicator({ progress, message }: ProcessingIndicatorProps) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
      {/* Spinning icon container */}
      <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-blue-100">
        <Mic className="h-12 w-12 text-blue-600" />
      </div>

      <h2 className="mb-2 text-xl font-semibold text-gray-900">Processing...</h2>
      <p className="max-w-xs text-sm text-gray-500">{message || 'Transcribing your audio'}</p>

      {/* Progress indicator */}
      <div className="mt-6 flex items-center gap-2 text-gray-500">
        <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600" />
        <span className="text-sm">{Math.round(progress)}%</span>
      </div>
    </div>
  )
}
