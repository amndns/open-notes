export class AudioCaptureService {
  private audioContext: AudioContext | null = null
  private mediaRecorder: MediaRecorder | null = null
  private audioChunks: Blob[] = []
  private micStream: MediaStream | null = null
  private systemStream: MediaStream | null = null
  private onAudioInterrupted: ((source: 'mic' | 'system') => void) | null = null

  setOnAudioInterrupted(callback: (source: 'mic' | 'system') => void): void {
    this.onAudioInterrupted = callback
  }

  async startRecording(): Promise<{ hasMic: boolean; hasSystemAudio: boolean }> {
    let hasMic = false
    let hasSystemAudio = false

    // Try to get microphone stream (non-blocking)
    try {
      this.micStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      })
      hasMic = true
      console.log('✓ Microphone access granted')

      // Monitor mic tracks for unexpected termination
      this.micStream.getAudioTracks().forEach((track) => {
        track.onended = () => {
          if (this.mediaRecorder?.state === 'recording') {
            console.error('🎤 Microphone track ended unexpectedly')
            this.onAudioInterrupted?.('mic')
          }
        }
      })
    } catch (error) {
      console.warn('⚠️ Microphone not available:', error)
      this.micStream = null
    }

    // Try to get system audio stream (non-blocking)
    try {
      this.systemStream = await window.api.getSystemAudioSource()
      
      // Validate that we got a proper MediaStream
      if (!this.systemStream || !(this.systemStream instanceof MediaStream)) {
        console.warn('⚠️ Invalid MediaStream returned:', this.systemStream)
        throw new Error('Invalid MediaStream object returned from system audio capture')
      }
      
      // Ensure it has audio tracks
      const audioTracks = this.systemStream.getAudioTracks()
      if (audioTracks.length === 0) {
        console.warn('⚠️ System audio stream has no audio tracks')
        throw new Error(
          'No audio tracks found. When selecting what to share, make sure to check "Share audio" in the dialog.'
        )
      }
      
      hasSystemAudio = true
      console.log('✓ System audio access granted', { tracks: audioTracks.length })

      // Monitor system audio tracks for unexpected termination
      audioTracks.forEach((track) => {
        track.onended = () => {
          if (this.mediaRecorder?.state === 'recording') {
            console.error('🔊 System audio track ended unexpectedly')
            this.onAudioInterrupted?.('system')
          }
        }
      })
    } catch (error: any) {
      // Provide helpful error messages
      if (error.name === 'NotAllowedError') {
        console.warn('⚠️ User denied screen recording permission')
      } else if (error.name === 'AbortError') {
        console.warn('⚠️ User cancelled the screen sharing dialog')
      } else {
        console.warn('⚠️ System audio not available:', error)
      }
      this.systemStream = null
    }

    // Ensure at least ONE audio source is available
    if (!hasMic && !hasSystemAudio) {
      throw new Error(
        'No audio sources available. Please grant microphone permission or ensure system audio is accessible.'
      )
    }

    // Create audio context
    this.audioContext = new AudioContext()

    let finalStream: MediaStream

    // Case 1: Both sources available - mix them
    if (hasMic && hasSystemAudio) {
      console.log('🎙️ Recording with MIC + SYSTEM AUDIO')
      const merger = this.audioContext.createChannelMerger(2)

      const micSource = this.audioContext.createMediaStreamSource(this.micStream!)
      micSource.connect(merger, 0, 0)

      const systemSource = this.audioContext.createMediaStreamSource(this.systemStream!)
      systemSource.connect(merger, 0, 1)

      const destination = this.audioContext.createMediaStreamDestination()
      merger.connect(destination)
      finalStream = destination.stream
    }
    // Case 2: System audio only (useful for recording just the call)
    else if (hasSystemAudio) {
      console.log('🔊 Recording SYSTEM AUDIO only (no mic)')
      finalStream = this.systemStream!
    }
    // Case 3: Mic only (fallback)
    else {
      console.log('🎤 Recording MICROPHONE only (no system audio)')
      finalStream = this.micStream!
    }

    // Start recording with the final stream
    const mimeType = this.getSupportedMimeType()
    this.mediaRecorder = new MediaRecorder(finalStream, { mimeType })

    this.mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        this.audioChunks.push(event.data)
      }
    }

    this.mediaRecorder.start(1000) // Collect data every second

    return { hasMic, hasSystemAudio }
  }

  stopRecording(): Promise<Blob> {
    return new Promise((resolve, reject) => {
      if (!this.mediaRecorder) {
        reject(new Error('No active recording'))
        return
      }

      this.mediaRecorder.onstop = () => {
        const blob = new Blob(this.audioChunks, { type: 'audio/webm' })
        this.cleanup()
        resolve(blob)
      }

      this.mediaRecorder.stop()
    })
  }

  private getSupportedMimeType(): string {
    const types = ['audio/webm;codecs=opus', 'audio/webm', 'audio/ogg;codecs=opus']
    return types.find((type) => MediaRecorder.isTypeSupported(type)) || 'audio/webm'
  }

  private cleanup(): void {
    this.micStream?.getTracks().forEach((track) => track.stop())
    this.systemStream?.getTracks().forEach((track) => track.stop())
    this.audioContext?.close()

    this.micStream = null
    this.systemStream = null
    this.audioContext = null
    this.mediaRecorder = null
    this.audioChunks = []
  }
}
