export interface Summary {
  id: string
  transcriptId: string
  context: string
  participants: string[]
  keyPoints: string[]
  actionItems: string[]
  summary: string
  generatedAt: string
  savedPath?: string
}

export interface TranscriptForSummary {
  id: string
  text: string
  duration: number
  utterances?: {
    speaker: string
    text: string
    start: number
    end: number
  }[]
}
