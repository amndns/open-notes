import { AssemblyAI } from 'assemblyai'
import { createReadStream } from 'fs'

export class AssemblyAIService {
  private client: AssemblyAI | null = null

  constructor() {
    const apiKey = process.env.ASSEMBLYAI_API_KEY
    if (apiKey && apiKey !== 'your_api_key_here') {
      this.client = new AssemblyAI({ apiKey })
    }
  }

  /**
   * Checks if the service is properly configured
   */
  isConfigured(): boolean {
    return this.client !== null
  }

  /**
   * Uploads an audio file to AssemblyAI
   */
  async uploadAudio(filePath: string): Promise<string> {
    if (!this.client) {
      throw new Error(
        'AssemblyAI API key not configured. Please set ASSEMBLYAI_API_KEY in .env file'
      )
    }

    try {
      const uploadUrl = await this.client.files.upload(createReadStream(filePath))
      return uploadUrl
    } catch (error: any) {
      console.error('Failed to upload audio:', error)
      throw new Error(`Upload failed: ${error.message}`)
    }
  }

  /**
   * Starts a transcription job
   */
  async startTranscription(audioUrl: string): Promise<string> {
    if (!this.client) {
      throw new Error('AssemblyAI API key not configured')
    }

    try {
      const transcript = await this.client.transcripts.create({
        audio_url: audioUrl,
        multichannel: true,
        speaker_labels: true,
        speaker_options: {
          min_speakers_expected: 2,
          max_speakers_expected: 6 // User + up to 5 call participants
        }
      })

      return transcript.id
    } catch (error: any) {
      console.error('Failed to start transcription:', error)
      throw new Error(`Transcription start failed: ${error.message}`)
    }
  }

  /**
   * Polls for transcription completion
   * Calls onProgress callback with percentage (0-100)
   */
  async pollTranscription(
    transcriptId: string,
    onProgress: (percent: number) => void
  ): Promise<any> {
    if (!this.client) {
      throw new Error('AssemblyAI API key not configured')
    }

    const pollInterval = 3000 // 3 seconds
    const maxPolls = 200 // 10 minutes max
    let polls = 0

    while (polls < maxPolls) {
      try {
        const transcript = await this.client.transcripts.get(transcriptId)

        // Calculate progress based on status
        let progress = 0
        switch (transcript.status) {
          case 'queued':
            progress = 10
            break
          case 'processing':
            progress = 50
            break
          case 'completed':
            progress = 100
            onProgress(progress)
            return transcript
          case 'error':
            throw new Error(transcript.error || 'Transcription failed')
        }

        onProgress(progress)

        // Wait before next poll
        await new Promise((resolve) => setTimeout(resolve, pollInterval))
        polls++
      } catch (error: any) {
        console.error('Failed to poll transcription:', error)
        throw new Error(`Polling failed: ${error.message}`)
      }
    }

    throw new Error('Transcription timeout: exceeded 10 minutes')
  }

  /**
   * Gets the full transcript result
   */
  async getTranscript(transcriptId: string): Promise<any> {
    if (!this.client) {
      throw new Error('AssemblyAI API key not configured')
    }

    try {
      const transcript = await this.client.transcripts.get(transcriptId)

      return {
        id: transcript.id,
        text: transcript.text,
        confidence: transcript.confidence,
        words: transcript.words,
        utterances: transcript.utterances,
        audio_duration: transcript.audio_duration
      }
    } catch (error: any) {
      console.error('Failed to get transcript:', error)
      throw new Error(`Failed to retrieve transcript: ${error.message}`)
    }
  }
}

// Export singleton instance
export const assemblyAIService = new AssemblyAIService()
