export class AudioCaptureService {
  private audioContext: AudioContext | null = null
  private mediaRecorder: MediaRecorder | null = null
  private audioChunks: Blob[] = []
  private micStream: MediaStream | null = null
  private systemStream: MediaStream | null = null

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
    } catch (error) {
      console.warn('⚠️ Microphone not available:', error)
      this.micStream = null
    }

    // Try to get system audio stream (non-blocking)
    try {
      this.systemStream = await window.api.getSystemAudioSource()
      hasSystemAudio = true
      console.log('✓ System audio access granted')
    } catch (error) {
      console.warn('⚠️ System audio not available:', error)
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
