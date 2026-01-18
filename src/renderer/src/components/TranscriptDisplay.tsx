import { FileText, Clock, TrendingUp, User } from 'lucide-react'
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

  const formatTime = (milliseconds: number) => {
    const totalSeconds = Math.floor(milliseconds / 1000)
    const mins = Math.floor(totalSeconds / 60)
    const secs = totalSeconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const getSpeakerColor = (speaker: string) => {
    // Simple color mapping for speakers
    const colors: Record<string, string> = {
      '1A': 'bg-blue-50 border-blue-200 text-blue-900',
      '1B': 'bg-green-50 border-green-200 text-green-900',
      '2A': 'bg-purple-50 border-purple-200 text-purple-900',
      '2B': 'bg-orange-50 border-orange-200 text-orange-900',
      '2C': 'bg-pink-50 border-pink-200 text-pink-900'
    }
    return colors[speaker] || 'bg-gray-50 border-gray-200 text-gray-900'
  }

  const getSpeakerLabel = (speaker: string) => {
    // Map speaker IDs to friendly names
    if (speaker.startsWith('1')) {
      return speaker === '1A' ? 'You' : `Speaker ${speaker}`
    }
    // Channel 2 = system audio (call participants)
    return `Participant ${speaker.slice(1)}`
  }

  // Use utterances if available, otherwise fall back to plain text
  const hasUtterances = transcript.utterances && transcript.utterances.length > 0

  return (
    <div className="flex flex-1 flex-col overflow-hidden bg-white">
      {/* Header */}
      <div className="border-b border-gray-200 bg-gray-50 px-6 py-4">
        <h1 className="text-lg font-semibold text-gray-900">Transcript Ready</h1>
        <div className="mt-1 flex items-center gap-3 text-xs text-gray-500">
          <div className="flex items-center gap-1">
            <FileText className="h-3 w-3" />
            <span>Transcription Complete</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            <span>{formatTimestamp(transcript.timestamp)}</span>
          </div>
        </div>
      </div>

      {/* Metadata bar */}
      <div className="flex items-center gap-6 border-b border-gray-200 bg-white px-6 py-3">
        <div className="flex items-center gap-2 text-sm">
          <Clock className="h-4 w-4 text-gray-400" />
          <span className="font-medium text-gray-700">{formatDuration(transcript.duration)}</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <TrendingUp className="h-4 w-4 text-gray-400" />
          <span className="font-medium text-gray-700">
            {Math.round(transcript.confidence * 100)}% confidence
          </span>
        </div>
        {hasUtterances && (
          <div className="flex items-center gap-2 text-sm">
            <User className="h-4 w-4 text-gray-400" />
            <span className="font-medium text-gray-700">
              {new Set(transcript.utterances?.map((u) => u.speaker)).size} speakers
            </span>
          </div>
        )}
      </div>

      {/* Transcript content - scrollable area */}
      <div className="flex-1 overflow-y-auto bg-white px-6 py-6">
        {hasUtterances ? (
          <div className="space-y-5">
            {transcript.utterances?.map((utterance, index) => (
              <div key={index}>
                <div className="mb-2 flex items-center justify-between">
                  <span className={`text-xs font-semibold uppercase tracking-wide ${getSpeakerColor(utterance.speaker).split(' ')[2]}`}>
                    {getSpeakerLabel(utterance.speaker)}
                  </span>
                  <span className="text-xs text-gray-400">{formatTime(utterance.start)}</span>
                </div>
                <p className="text-sm leading-relaxed text-gray-700">{utterance.text}</p>
              </div>
            ))}
          </div>
        ) : (
          <div>
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-gray-700">
              {transcript.text}
            </p>
          </div>
        )}
        {transcript.savedPath && (
          <p className="mt-6 text-xs text-gray-400">Saved to: {transcript.savedPath}</p>
        )}
      </div>
    </div>
  )
}
