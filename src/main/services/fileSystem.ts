import { promises as fs } from 'fs'
import path from 'path'
import os from 'os'

export class FileSystemService {
  private openNotesDir: string

  constructor() {
    this.openNotesDir = path.join(os.homedir(), 'Documents', 'OpenNotes')
  }

  /**
   * Ensures the OpenNotes directory exists in ~/Documents/
   */
  async ensureOpenNotesDir(): Promise<void> {
    try {
      await fs.access(this.openNotesDir)
    } catch {
      await fs.mkdir(this.openNotesDir, { recursive: true })
    }
  }

  /**
   * Saves audio buffer to temporary file
   * Returns the full path to the saved file
   */
  async saveTempAudio(buffer: Buffer): Promise<string> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const filename = `open-notes-${timestamp}.webm`
    const filePath = path.join(os.tmpdir(), filename)

    await fs.writeFile(filePath, buffer)
    return filePath
  }

  /**
   * Saves transcript to the OpenNotes directory
   */
  async saveTranscript(transcript: any, metadata?: any): Promise<string> {
    await this.ensureOpenNotesDir()

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const filename = `${timestamp}-transcript.json`
    const filePath = path.join(this.openNotesDir, filename)

    const data = {
      ...transcript,
      savedAt: new Date().toISOString(),
      metadata: metadata || {}
    }

    await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8')
    return filePath
  }

  /**
   * Deletes a temporary audio file
   */
  async cleanupTempFile(filePath: string): Promise<void> {
    try {
      await fs.unlink(filePath)
    } catch (error) {
      console.error('Failed to cleanup temp file:', error)
    }
  }

  /**
   * Gets the OpenNotes directory path
   */
  getOpenNotesDir(): string {
    return this.openNotesDir
  }
}

// Export singleton instance
export const fileSystemService = new FileSystemService()
