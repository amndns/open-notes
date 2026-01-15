import { useRef, useEffect } from 'react'
import { useAppContext } from '../context/AppContext'
import { AudioCaptureService } from '../services/audioCapture'

export function useRecording() {
  const { state, dispatch } = useAppContext()
  const audioService = useRef(new AudioCaptureService())
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const startTimeRef = useRef<number>(0)

  const startRecording = async () => {
    try {
      const { hasMic, hasSystemAudio } = await audioService.current.startRecording()

      // Store which sources are active
      startTimeRef.current = Date.now()
      dispatch({ type: 'START_RECORDING' })

      // Show user what's being recorded
      let sourceInfo = ''
      if (hasMic && hasSystemAudio) {
        sourceInfo = 'Recording microphone + system audio'
      } else if (hasSystemAudio) {
        sourceInfo = 'Recording system audio only (microphone unavailable)'
      } else if (hasMic) {
        sourceInfo = 'Recording microphone only (system audio unavailable)'
      }
      console.log(sourceInfo)

      // Start timer
      timerRef.current = setInterval(() => {
        const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000)
        dispatch({ type: 'UPDATE_DURATION', duration: elapsed })
      }, 1000)
    } catch (error: any) {
      console.error('Recording error:', error)
      dispatch({
        type: 'ERROR',
        error: {
          type: 'PERMISSION',
          message:
            error.message ||
            'Failed to start recording. Please grant microphone permission or ensure system audio is accessible.',
          details: error
        }
      })
    }
  }

  const stopRecording = async () => {
    try {
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }

      dispatch({ type: 'STOP_RECORDING' })

      const audioBlob = await audioService.current.stopRecording()
      const arrayBuffer = await audioBlob.arrayBuffer()

      dispatch({ type: 'START_PROCESSING' })

      const filePath = await window.api.saveAudioFile(arrayBuffer)
      await window.api.startTranscription(filePath)
    } catch (error: any) {
      console.error('Stop recording error:', error)
      dispatch({
        type: 'ERROR',
        error: {
          type: 'RUNTIME',
          message: 'Failed to process recording',
          details: error
        }
      })
    }
  }

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [])

  return {
    startRecording,
    stopRecording,
    isRecording: state.status === 'RECORDING'
  }
}
