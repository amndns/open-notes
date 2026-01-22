import { useEffect } from 'react'
import { useAppContext } from '../context/AppContext'

export function useTranscription() {
  const { dispatch } = useAppContext()

  useEffect(() => {
    const handleProgress = (percent: number) => {
      let message = 'Processing...'
      if (percent < 30) message = 'Uploading audio...'
      else if (percent < 90) message = 'Transcribing...'
      else if (percent < 95) message = 'Saving transcript...'
      else message = 'Generating summary...'

      dispatch({ type: 'UPDATE_PROGRESS', progress: Math.min(percent, 100), message })
    }

    const handleComplete = (transcript: any) => {
      dispatch({ type: 'DISPLAY_TRANSCRIPT', transcript })
    }

    const handleError = (error: any) => {
      dispatch({
        type: 'ERROR',
        error: {
          type: 'API',
          message: error.message || 'Transcription failed',
          details: error
        }
      })
    }

    window.api.onTranscriptionProgress(handleProgress)
    window.api.onTranscriptionComplete(handleComplete)
    window.api.onTranscriptionError(handleError)

    return () => {
      window.api.removeAllListeners('transcription-progress')
      window.api.removeAllListeners('transcription-complete')
      window.api.removeAllListeners('transcription-error')
    }
  }, [dispatch])
}
