import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'
import { getLoopbackAudioMediaStream } from 'electron-audio-loopback'

// Custom APIs for renderer
const api = {
  // Audio capture - get system audio source
  getSystemAudioSource: async (): Promise<MediaStream> => {
    // First, call main process to set up electron-audio-loopback
    await ipcRenderer.invoke('get-system-audio-source')

    // Then get the actual MediaStream in the renderer
    return await getLoopbackAudioMediaStream()
  },

  // File operations
  saveAudioFile: (arrayBuffer: ArrayBuffer): Promise<string> => {
    return ipcRenderer.invoke('save-audio-file', arrayBuffer)
  },

  // Transcription
  startTranscription: (filePath: string): Promise<void> => {
    return ipcRenderer.invoke('start-transcription', filePath)
  },

  // Event listeners
  onTranscriptionProgress: (callback: (percent: number) => void): void => {
    ipcRenderer.on('transcription-progress', (_event, percent) => callback(percent))
  },

  onTranscriptionComplete: (callback: (transcript: any) => void): void => {
    ipcRenderer.on('transcription-complete', (_event, transcript) => callback(transcript))
  },

  onTranscriptionError: (callback: (error: any) => void): void => {
    ipcRenderer.on('transcription-error', (_event, error) => callback(error))
  },

  // Cleanup listeners
  removeAllListeners: (channel: string): void => {
    ipcRenderer.removeAllListeners(channel)
  }
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
}
