import { Circle, Square } from 'lucide-react'
import { Button } from '@renderer/components/ui/button'

interface RecordingButtonProps {
  isRecording?: boolean
  onClick: () => void
  disabled?: boolean
}

export default function RecordingButton({
  isRecording = false,
  onClick,
  disabled = false
}: RecordingButtonProps) {
  if (isRecording) {
    return (
      <Button
        onClick={onClick}
        disabled={disabled}
        size="lg"
        variant="outline"
        className="gap-2 border-red-300 text-red-600 hover:bg-red-50"
      >
        <Square className="h-4 w-4 fill-current" />
        Stop Recording
      </Button>
    )
  }

  return (
    <Button
      onClick={onClick}
      disabled={disabled}
      size="lg"
      className="gap-2 bg-red-600 text-white hover:bg-red-700"
    >
      <Circle className="h-4 w-4 fill-current" />
      Start Recording
    </Button>
  )
}
