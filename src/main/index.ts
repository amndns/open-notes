import 'dotenv/config'
import { app, shell, BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import { initMain } from 'electron-audio-loopback'
import icon from '../../resources/icon.png?asset'
import { fileSystemService } from './services/fileSystem'
import { audioCaptureService } from './services/audioCapture'
import { assemblyAIService } from './services/assemblyai'
import { geminiService } from './services/gemini'

// Initialize electron-audio-loopback
initMain()

let mainWindow: BrowserWindow | null = null

function createWindow(): void {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 480,
    height: 720,
    minWidth: 400,
    minHeight: 600,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow?.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set app user model id for windows
  app.setName('OpenNotes')

  // Register IPC handlers
  registerIPCHandlers()

  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// Cleanup on quit
app.on('quit', () => {
  // Temp files are in /tmp and will be cleaned by OS
  console.log('App quit')
})

/**
 * Register all IPC handlers
 */
function registerIPCHandlers(): void {
  // Get system audio source
  ipcMain.handle('get-system-audio-source', async () => {
    try {
      await audioCaptureService.getSystemAudioSource()
      // Return success - actual MediaStream is obtained in renderer
      return { success: true }
    } catch (error: any) {
      console.error('Failed to get system audio source:', error)
      throw new Error(error.message)
    }
  })

  // Save audio file from renderer
  ipcMain.handle('save-audio-file', async (_event, arrayBuffer: ArrayBuffer) => {
    try {
      const buffer = Buffer.from(arrayBuffer)
      const filePath = await fileSystemService.saveTempAudio(buffer)
      console.log('Audio saved to:', filePath)
      return filePath
    } catch (error: any) {
      console.error('Failed to save audio file:', error)
      throw new Error(`Failed to save audio: ${error.message}`)
    }
  })

  // Start transcription workflow
  ipcMain.handle('start-transcription', async (_event, filePath: string) => {
    try {
      // Check if AssemblyAI is configured
      if (!assemblyAIService.isConfigured()) {
        throw new Error(
          'AssemblyAI API key not configured. Please create a .env file with ASSEMBLYAI_API_KEY'
        )
      }

      // Update progress: uploading
      mainWindow?.webContents.send('transcription-progress', 10)

      // Upload audio file
      const uploadUrl = await assemblyAIService.uploadAudio(filePath)
      console.log('Audio uploaded:', uploadUrl)

      mainWindow?.webContents.send('transcription-progress', 30)

      // Start transcription
      const transcriptId = await assemblyAIService.startTranscription(uploadUrl)
      console.log('Transcription started:', transcriptId)

      // Poll for completion
      const transcript = await assemblyAIService.pollTranscription(transcriptId, (percent) => {
        mainWindow?.webContents.send('transcription-progress', percent)
      })

      console.log('Transcription completed')

      // Save transcript to Documents
      const savedPath = await fileSystemService.saveTranscript({
        id: transcript.id,
        text: transcript.text,
        confidence: transcript.confidence,
        timestamp: new Date().toISOString(),
        duration: transcript.audio_duration,
        words: transcript.words,
        utterances: transcript.utterances
      })

      console.log('Transcript saved to:', savedPath)

      // Cleanup temp audio file
      await fileSystemService.cleanupTempFile(filePath)

      // Prepare base transcript data
      const transcriptData = {
        id: transcript.id,
        text: transcript.text,
        confidence: transcript.confidence,
        timestamp: new Date().toISOString(),
        duration: transcript.audio_duration,
        utterances: transcript.utterances,
        words: transcript.words,
        savedPath
      }

      // Summarization step - always attempt
      mainWindow?.webContents.send('transcription-progress', 95)

      try {
        console.log('Starting summarization...')
        const summary = await geminiService.summarizeTranscript({
          id: transcript.id,
          text: transcript.text,
          duration: transcript.audio_duration,
          utterances: transcript.utterances
        })

        // Save summary to separate file
        const summaryPath = await fileSystemService.saveSummary(summary, savedPath)
        summary.savedPath = summaryPath
        console.log('Summary saved to:', summaryPath)

        // Send completion with summary
        mainWindow?.webContents.send('transcription-complete', {
          ...transcriptData,
          summary
        })
      } catch (error: any) {
        console.error('Summarization failed:', error.message)
        // Send transcript with error info so UI can display it
        mainWindow?.webContents.send('transcription-complete', {
          ...transcriptData,
          summaryError: error.message || 'Failed to generate summary'
        })
      }
    } catch (error: any) {
      console.error('Transcription error:', error)
      mainWindow?.webContents.send('transcription-error', {
        message: error.message || 'Transcription failed',
        details: error
      })
    }
  })
}
