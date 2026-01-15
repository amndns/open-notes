import { AppProvider, useAppContext } from './context/AppContext'
import { useRecording } from './hooks/useRecording'
import { useTranscription } from './hooks/useTranscription'
import RecordingButton from './components/RecordingButton'
import RecordingTimer from './components/RecordingTimer'
import ProcessingIndicator from './components/ProcessingIndicator'
import TranscriptDisplay from './components/TranscriptDisplay'
import ErrorDisplay from './components/ErrorDisplay'
import { Mic } from 'lucide-react'

function EmptyState({
  status
}: {
  status: 'idle' | 'recording' | 'processing'
}) {
  const getTitle = () => {
    switch (status) {
      case 'recording':
        return 'Recording...'
      case 'processing':
        return 'Processing...'
      default:
        return 'Ready to Record'
    }
  }

  const getSubtitle = () => {
    switch (status) {
      case 'recording':
        return 'Capturing system audio and microphone'
      case 'processing':
        return 'Transcribing your audio'
      default:
        return 'Click the record button to start capturing audio'
    }
  }

  return (
    <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
      <div
        className={`mb-6 flex h-24 w-24 items-center justify-center rounded-full ${
          status === 'recording'
            ? 'animate-pulse bg-red-100'
            : status === 'processing'
              ? 'bg-blue-100'
              : 'bg-gray-100'
        }`}
      >
        <Mic
          className={`h-12 w-12 ${
            status === 'recording'
              ? 'text-red-600'
              : status === 'processing'
                ? 'text-blue-600'
                : 'text-gray-400'
          }`}
        />
      </div>
      <h2 className="mb-2 text-xl font-semibold text-gray-900">{getTitle()}</h2>
      <p className="max-w-xs text-sm text-gray-500">{getSubtitle()}</p>
    </div>
  )
}

function AppContent() {
  const { state } = useAppContext()
  const { startRecording, stopRecording, isRecording } = useRecording()
  useTranscription()

  return (
    <div className="flex h-screen flex-col bg-white">
      {/* Draggable title bar for macOS */}
      <div className="h-12 shrink-0 [-webkit-app-region:drag]" />

      {/* Main content area */}
      {state.status === 'IDLE' && <EmptyState status="idle" />}

      {state.status === 'RECORDING' && (
        <div className="flex flex-1 flex-col">
          <EmptyState status="recording" />
          <div className="flex justify-center pb-4">
            <RecordingTimer duration={state.duration} />
          </div>
        </div>
      )}

      {state.status === 'PROCESSING' && (
        <div className="flex flex-1 flex-col">
          <ProcessingIndicator progress={state.progress} message={state.message} />
        </div>
      )}

      {state.status === 'DISPLAYING' && <TranscriptDisplay transcript={state.transcript} />}

      {state.status === 'ERROR' && <ErrorDisplay error={state.error} />}

      {/* Bottom control panel */}
      <div className="flex items-center justify-center gap-4 border-t border-gray-200 bg-gray-50 px-6 py-4">
        <RecordingButton
          isRecording={isRecording}
          onClick={isRecording ? stopRecording : startRecording}
          disabled={state.status === 'PROCESSING'}
        />
      </div>
    </div>
  )
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  )
}
