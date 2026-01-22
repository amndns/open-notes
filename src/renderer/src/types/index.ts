export type AppStatus = 'IDLE' | 'RECORDING' | 'PROCESSING' | 'DISPLAYING' | 'ERROR'

export interface Word {
  text: string
  start: number
  end: number
  confidence: number
  speaker: string
  channel?: string
}

export interface Utterance {
  speaker: string
  text: string
  confidence: number
  start: number
  end: number
  words?: Word[]
}

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

export interface Transcript {
  id: string
  text: string
  timestamp: string
  duration: number
  confidence: number
  savedPath?: string
  words?: Word[]
  utterances?: Utterance[]
  summary?: Summary
  summaryError?: string
}

export interface ErrorInfo {
  type: 'PERMISSION' | 'RUNTIME' | 'API'
  message: string
  details?: any
}

export type AppState =
  | { status: 'IDLE' }
  | { status: 'RECORDING'; duration: number; startTime: number }
  | { status: 'PROCESSING'; progress: number; message: string }
  | { status: 'DISPLAYING'; transcript: Transcript }
  | { status: 'ERROR'; error: ErrorInfo }

export type AppAction =
  | { type: 'START_RECORDING' }
  | { type: 'UPDATE_DURATION'; duration: number }
  | { type: 'STOP_RECORDING' }
  | { type: 'START_PROCESSING' }
  | { type: 'UPDATE_PROGRESS'; progress: number; message: string }
  | { type: 'DISPLAY_TRANSCRIPT'; transcript: Transcript }
  | { type: 'ERROR'; error: ErrorInfo }
  | { type: 'RESET' }
