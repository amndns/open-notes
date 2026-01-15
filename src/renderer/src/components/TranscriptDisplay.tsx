import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { useAppContext } from '../context/AppContext'
import { FileText } from 'lucide-react'

interface TranscriptDisplayProps {
  transcript: {
    id: string
    text: string
    timestamp: string
    duration: number
    confidence: number
    savedPath?: string
  }
}

export default function TranscriptDisplay({ transcript }: TranscriptDisplayProps) {
  const { dispatch } = useAppContext()

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}m ${secs}s`
  }

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-4xl font-bold">Transcript Ready</h1>
        <Button onClick={() => dispatch({ type: 'RESET' })} variant="outline">
          New Recording
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Transcription Complete
              </CardTitle>
              <CardDescription className="mt-2">
                {formatTimestamp(transcript.timestamp)}
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Badge variant="secondary">{formatDuration(transcript.duration)}</Badge>
              <Badge variant="secondary">
                {Math.round(transcript.confidence * 100)}% confidence
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="max-h-96 overflow-y-auto rounded-md bg-muted p-4">
            <p className="whitespace-pre-wrap text-sm leading-relaxed">{transcript.text}</p>
          </div>
          {transcript.savedPath && (
            <p className="mt-4 text-xs text-muted-foreground">Saved to: {transcript.savedPath}</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
