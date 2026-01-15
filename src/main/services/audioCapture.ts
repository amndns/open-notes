import { getLoopbackAudioMediaStream } from 'electron-audio-loopback'

export class AudioCaptureService {
  /**
   * Gets the system audio source using electron-audio-loopback
   * This captures audio playing from the system (speakers/headphones output)
   */
  async getSystemAudioSource(): Promise<void> {
    try {
      // electron-audio-loopback requires calling this in the main process
      // It sets up the necessary Chromium flags for loopback audio
      await getLoopbackAudioMediaStream()
    } catch (error: any) {
      console.error('Failed to get system audio source:', error)
      throw new Error(
        `System audio capture not available: ${error.message}. ` +
          'Make sure you are running macOS 12.3+ and Electron 31.0.1+'
      )
    }
  }
}

// Export singleton instance
export const audioCaptureService = new AudioCaptureService()
