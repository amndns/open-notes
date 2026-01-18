export class AudioCaptureService {
  /**
   * Validates that system audio capture is available
   * The actual MediaStream is obtained in the renderer process via getLoopbackAudioMediaStream()
   * This method just performs validation checks
   */
  async getSystemAudioSource(): Promise<void> {
    // electron-audio-loopback's initMain() must be called before this
    // The actual MediaStream will be obtained in the renderer/preload
    // This is just a validation/acknowledgment handler
    
    // Check platform requirements
    if (process.platform === 'darwin') {
      const version = process.getSystemVersion()
      const [major, minor] = version.split('.').map(Number)
      
      if (major < 12 || (major === 12 && minor < 3)) {
        throw new Error(
          'System audio capture requires macOS 12.3 or later. ' +
          `Current version: ${version}`
        )
      }
      
      console.log('✓ macOS version compatible:', version)
      console.log('ℹ️ A screen sharing picker will appear when you start recording')
    }
    
    // If we get here, the system should support loopback audio
    // The actual capture happens in renderer via getLoopbackAudioMediaStream()
  }
}

// Export singleton instance
export const audioCaptureService = new AudioCaptureService()
