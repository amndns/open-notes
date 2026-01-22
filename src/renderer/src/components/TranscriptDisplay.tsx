import { FileText, Clock, AlertCircle } from 'lucide-react'
import Markdown from 'react-markdown'
import { Transcript } from '../types'

interface TranscriptDisplayProps {
  transcript: Transcript
}

export default function TranscriptDisplay({ transcript }: TranscriptDisplayProps) {
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}m ${secs}s`
  }

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString()
  }

  // Error state - summarization failed
  if (transcript.summaryError) {
    return (
      <div className="flex flex-1 flex-col overflow-hidden bg-white">
        <div className="border-b border-gray-200 bg-gray-50 px-6 py-4">
          <h1 className="text-lg font-semibold text-gray-900">Summary Unavailable</h1>
          <div className="mt-1 flex items-center gap-3 text-xs text-gray-500">
            <span>{formatTimestamp(transcript.timestamp)}</span>
            <span>{formatDuration(transcript.duration)}</span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-6">
          <div className="rounded-lg border border-red-200 bg-red-50 p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-500" />
              <div>
                <p className="font-medium text-red-800">Failed to generate summary</p>
                <p className="mt-1 text-sm text-red-700">{transcript.summaryError}</p>
              </div>
            </div>
          </div>

          <p className="mt-6 text-sm text-gray-500">
            Your transcript has been saved and you can try again later.
          </p>

          {transcript.savedPath && (
            <p className="mt-6 border-t border-gray-100 pt-6 text-xs text-gray-400">
              Transcript saved: {transcript.savedPath}
            </p>
          )}
        </div>
      </div>
    )
  }

  const summary = transcript.summary

  // No summary yet (shouldn't happen but handle gracefully)
  if (!summary) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center bg-white p-6">
        <p className="text-gray-500">Processing...</p>
      </div>
    )
  }

  // Success - show summary
  return (
    <div className="flex flex-1 flex-col overflow-hidden bg-white">
      {/* Header */}
      <div className="border-b border-gray-200 bg-gray-50 px-6 py-4">
        <h1 className="text-lg font-semibold text-gray-900">Summary</h1>
        <div className="mt-1 flex items-center gap-3 text-xs text-gray-500">
          <div className="flex items-center gap-1">
            <FileText className="h-3 w-3" />
            <span>AI Generated</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            <span>{formatTimestamp(summary.generatedAt)}</span>
          </div>
          <span>{formatDuration(transcript.duration)}</span>
        </div>
      </div>

      {/* Summary content */}
      <div className="flex-1 overflow-y-auto bg-white px-6 py-6">
        <div className="prose prose-sm prose-gray max-w-none">
          <Markdown>{summary.summary}</Markdown>
        </div>

        {/* File paths */}
        <div className="mt-8 space-y-1 border-t border-gray-100 pt-6 text-xs text-gray-400">
          {summary.savedPath && <p>Summary: {summary.savedPath}</p>}
          {transcript.savedPath && <p>Transcript: {transcript.savedPath}</p>}
        </div>
      </div>
    </div>
  )
}
