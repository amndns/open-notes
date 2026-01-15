import { ElectronAPI } from '@electron-toolkit/preload'

export interface IElectronAPI {
  getSystemAudioSource: () => Promise<MediaStream>
  saveAudioFile: (arrayBuffer: ArrayBuffer) => Promise<string>
  startTranscription: (filePath: string) => Promise<void>
  onTranscriptionProgress: (callback: (percent: number) => void) => void
  onTranscriptionComplete: (callback: (transcript: any) => void) => void
  onTranscriptionError: (callback: (error: any) => void) => void
  removeAllListeners: (channel: string) => void
}

declare global {
  interface Window {
    electron: ElectronAPI
    api: IElectronAPI
  }
}
