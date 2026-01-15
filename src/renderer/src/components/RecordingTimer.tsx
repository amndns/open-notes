interface RecordingTimerProps {
  duration: number
}

export default function RecordingTimer({ duration }: RecordingTimerProps) {
  const minutes = Math.floor(duration / 60)
  const seconds = duration % 60

  return (
    <div className="text-lg font-medium tabular-nums text-gray-500">
      {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
    </div>
  )
}
