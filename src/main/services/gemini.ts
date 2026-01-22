import { createGoogleGenerativeAI } from '@ai-sdk/google'
import { generateText } from 'ai'
import { randomUUID } from 'crypto'
import type { Summary, TranscriptForSummary } from '../types/summary'

const SYSTEM_PROMPT = `You are an expert meeting and call summarizer. Your task is to analyze a transcript and produce a structured, actionable summary.

Follow these steps carefully to ensure accurate analysis:

STEP 1 - UNDERSTAND THE CONTEXT
First, read through the entire transcript to understand:
- What type of conversation is this? (meeting, phone call, interview, discussion, presentation, etc.)
- What is the main topic or purpose of this conversation?
- Who are the participants? Identify them from dialogue patterns and any names mentioned.
- What is the relationship between participants? (colleagues, client-vendor, interviewer-candidate, etc.)

STEP 2 - IDENTIFY KEY INFORMATION
Now, carefully extract:
- The main discussion points and any decisions that were made
- Action items or tasks that were assigned (note who is responsible if mentioned)
- Important deadlines, dates, or commitments mentioned
- Key insights, conclusions, or outcomes
- Any unresolved issues or questions that need follow-up

STEP 3 - SYNTHESIZE A SUMMARY
Finally, write a clear, readable summary in Markdown format that:
- Captures the essence of the conversation
- Uses proper Markdown formatting (headers, bullet points, bold for emphasis)
- Is written in a professional, neutral tone
- Focuses on what matters most - decisions, outcomes, and next steps
- Is easy to scan and understand quickly

Your response MUST be valid JSON matching this exact structure:
{
  "context": "A 1-2 sentence description of what this conversation is about and its purpose",
  "participants": ["Person 1 or Role 1", "Person 2 or Role 2"],
  "keyPoints": ["Key point 1", "Key point 2", "Key point 3"],
  "actionItems": ["Action item 1", "Action item 2"],
  "summary": "A Markdown-formatted summary with proper headings, bullet points, and paragraphs. Use ## for section headers, - for bullet points, and **bold** for emphasis."
}

Important notes:
- If you cannot identify specific participant names, use descriptive roles like "Host", "Participant", "Interviewer", "Caller", etc.
- If there are no clear action items, return an empty array for actionItems
- Keep keyPoints concise - aim for 3-7 bullet points
- The summary should be informative but not overly long - focus on what someone would need to know if they missed the call`

export class GeminiService {
  private apiKey: string | undefined

  constructor() {
    this.apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY
  }

  async summarizeTranscript(transcript: TranscriptForSummary): Promise<Summary> {
    if (!this.apiKey || this.apiKey === 'your_api_key_here') {
      throw new Error('Please add your Gemini API key to the .env file')
    }

    const google = createGoogleGenerativeAI({
      apiKey: this.apiKey
    })

    const formattedTranscript = this.formatTranscriptForPrompt(transcript)
    const durationMinutes = Math.round(transcript.duration / 60)

    const userPrompt = `Here is the transcript to summarize:

---
Duration: ${durationMinutes} minute${durationMinutes !== 1 ? 's' : ''}
${transcript.utterances ? `Speakers detected: ${new Set(transcript.utterances.map((u) => u.speaker)).size}` : ''}

${formattedTranscript}
---

Remember to follow the 3 steps: (1) understand the context, (2) identify key information, (3) synthesize the summary. Return only valid JSON.`

    const maxRetries = 3
    let lastError: Error | null = null

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        const { text } = await generateText({
          model: google('gemini-3-flash-preview'),
          system: SYSTEM_PROMPT,
          prompt: userPrompt,
          temperature: 0.3,
          maxOutputTokens: 2048
        })

        // Parse JSON response
        const jsonMatch = text.match(/\{[\s\S]*\}/)
        if (!jsonMatch) {
          throw new Error('No JSON found in response')
        }

        const parsed = JSON.parse(jsonMatch[0])

        // Validate required fields
        if (!parsed.context || !parsed.summary) {
          throw new Error('Missing required fields in response')
        }

        return {
          id: randomUUID(),
          transcriptId: transcript.id,
          context: parsed.context,
          participants: parsed.participants || [],
          keyPoints: parsed.keyPoints || [],
          actionItems: parsed.actionItems || [],
          summary: parsed.summary,
          generatedAt: new Date().toISOString()
        }
      } catch (error: unknown) {
        lastError = error instanceof Error ? error : new Error(String(error))
        const errorMessage = lastError.message
        const errorStatus = (error as { status?: number }).status

        console.error(`Summarization attempt ${attempt + 1} failed:`, errorMessage)

        // Rate limited - wait and retry
        if (errorStatus === 429) {
          await this.sleep(Math.pow(2, attempt) * 1000)
          continue
        }

        // JSON parsing error - retry
        if (errorMessage?.includes('JSON') || errorMessage?.includes('Missing required')) {
          await this.sleep(500)
          continue
        }

        // Other error - don't retry
        throw error
      }
    }

    throw lastError || new Error('Summarization failed after retries')
  }

  private formatTranscriptForPrompt(transcript: TranscriptForSummary): string {
    if (transcript.utterances && transcript.utterances.length > 0) {
      return transcript.utterances
        .map((u) => {
          const speakerLabel = this.getSpeakerLabel(u.speaker)
          return `[${speakerLabel}]: ${u.text}`
        })
        .join('\n\n')
    }
    return transcript.text
  }

  private getSpeakerLabel(speaker: string): string {
    // Map speaker IDs to friendly names for the LLM
    if (speaker.startsWith('1')) {
      return speaker === '1A' ? 'You (Host)' : `Speaker ${speaker}`
    }
    // Channel 2 = system audio (call participants)
    const letter = speaker.slice(1)
    return `Participant ${letter}`
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }
}

export const geminiService = new GeminiService()
