# OpenNotes Architecture

## Overview

OpenNotes is an Electron desktop application that records system audio and microphone input, then transcribes the audio using AssemblyAI. It's built with React 19, TypeScript, and uses electron-vite for bundling.

## Application Purpose

The application allows users to:

1. Record audio from system audio (e.g., video calls, meetings) and/or microphone
2. Save recordings as temporary WebM files
3. Transcribe audio using AssemblyAI's speech-to-text API
4. Store transcripts as JSON files in `~/Documents/OpenNotes/`

## Architecture Pattern: Electron Three-Process Model

### 1. Main Process (`src/main/`)

- **Runtime**: Node.js environment
- **Entry**: `src/main/index.ts`
- **Responsibilities**:
  - Application lifecycle management
  - Window creation and management
  - IPC handler registration
  - Native OS interactions (file system, process management)
  - Service orchestration

#### Services Architecture

**AudioCaptureService** (`src/main/services/audioCapture.ts`)

- Initializes electron-audio-loopback for system audio capture
- Called from main process to set up necessary Chromium flags
- Validates macOS 12.3+ and Electron 31.0.1+ requirements

**FileSystemService** (`src/main/services/fileSystem.ts`)

- Manages file operations (read/write/delete)
- Creates and maintains `~/Documents/OpenNotes/` directory
- Saves temporary audio files to OS temp directory (`/tmp`)
- Persists transcript JSON files with metadata
- Handles cleanup of temporary files

**AssemblyAIService** (`src/main/services/assemblyai.ts`)

- Integrates with AssemblyAI API for transcription
- Handles audio file upload
- Manages transcription job lifecycle (create, poll, retrieve)
- Reports progress back to renderer via IPC events
- Configuration: Requires `ASSEMBLYAI_API_KEY` in `.env`

### 2. Preload Scripts (`src/preload/`)

- **Entry**: `src/preload/index.ts`
- **Purpose**: Security bridge between main and renderer processes
- **Uses**: `contextBridge` API to safely expose limited APIs
- **Pattern**: Converts IPC calls into type-safe JavaScript functions

#### Exposed APIs (via `window.api`):

```typescript
{
  getSystemAudioSource(): Promise<MediaStream>  // Gets loopback audio stream
  saveAudioFile(ArrayBuffer): Promise<string>   // Saves recording to temp file
  startTranscription(string): Promise<void>     // Initiates transcription workflow
  onTranscriptionProgress(callback)             // Event: progress updates
  onTranscriptionComplete(callback)             // Event: transcript ready
  onTranscriptionError(callback)                // Event: error occurred
  removeAllListeners(channel)                   // Cleanup event listeners
}
```

### 3. Renderer Process (`src/renderer/`)

- **Runtime**: Chromium browser environment
- **Entry**: `src/renderer/src/main.tsx`
- **Framework**: React 19 with TypeScript
- **State Management**: React Context API + useReducer
- **Styling**: Tailwind CSS v4 with Radix UI components

#### Component Architecture

**State Management** (`src/renderer/src/context/AppContext.tsx`)

- Centralized state using reducer pattern
- States: `IDLE`, `RECORDING`, `PROCESSING`, `DISPLAYING`, `ERROR`
- Type-safe actions and state transitions

**Custom Hooks**:

- `useRecording()` - Manages audio recording lifecycle
- `useTranscription()` - Handles transcription events from main process

**AudioCaptureService** (`src/renderer/src/services/audioCapture.ts`)

- Runs in renderer process (browser environment)
- Handles MediaStream capture and mixing
- Supports three modes:
  1. **Microphone + System Audio**: Mixes both sources using Web Audio API
  2. **System Audio Only**: Records calls/meetings without user's mic
  3. **Microphone Only**: Fallback if system audio unavailable
- Uses MediaRecorder API to encode to WebM/Opus format

## Data Flow

### Recording Workflow

```
User clicks Record Button
  → useRecording.startRecording()
  → AudioCaptureService (renderer) requests streams:
      ├─ navigator.mediaDevices.getUserMedia() [microphone]
      └─ window.api.getSystemAudioSource() [system audio]
          → Preload: ipcRenderer.invoke('get-system-audio-source')
          → Main: audioCaptureService.getSystemAudioSource()
          → Returns to renderer with MediaStream
  → AudioContext mixes streams (if both available)
  → MediaRecorder starts encoding
  → Timer updates UI every second

User clicks Stop
  → useRecording.stopRecording()
  → MediaRecorder.stop() → Blob created
  → window.api.saveAudioFile(arrayBuffer)
      → Main: fileSystemService.saveTempAudio() → /tmp/open-notes-{timestamp}.webm
  → window.api.startTranscription(filePath)
      → Transcription workflow begins...
```

### Transcription Workflow

```
startTranscription IPC handler
  ├─ Validate ASSEMBLYAI_API_KEY exists
  ├─ assemblyAIService.uploadAudio(filePath)
  │    └─ POST to AssemblyAI with file stream
  │    └─ Returns upload URL
  │    └─ Emit progress: 30%
  ├─ assemblyAIService.startTranscription(uploadUrl)
  │    └─ POST to create transcription job
  │    └─ Returns transcript ID
  ├─ assemblyAIService.pollTranscription(transcriptId)
  │    └─ Poll every 3 seconds (max 10 minutes)
  │    └─ Emit progress: 10% (queued) → 50% (processing) → 100% (completed)
  │    └─ Returns full transcript object
  ├─ fileSystemService.saveTranscript()
  │    └─ Save to ~/Documents/OpenNotes/{timestamp}-transcript.json
  ├─ fileSystemService.cleanupTempFile()
  │    └─ Delete /tmp/open-notes-*.webm
  └─ Emit 'transcription-complete' event to renderer
       └─ useTranscription hook updates state to DISPLAYING
```

## Technology Stack

### Core Technologies

- **Electron 39.2.7**: Desktop app framework
- **React 19.2.1**: UI library
- **TypeScript 5.9.3**: Type safety
- **Vite 7.2.6**: Build tool
- **electron-vite 5.0.0**: Electron-specific Vite config

### Key Dependencies

- **electron-audio-loopback 1.0.6**: System audio capture (macOS)
- **assemblyai 4.22.1**: Speech-to-text API client
- **Tailwind CSS 4.1.18**: Utility-first styling
- **Radix UI**: Accessible component primitives (Progress, Slot)
- **lucide-react**: Icon library
- **dotenv**: Environment variable management

### Development Tools

- **electron-builder 26.0.12**: Application packaging
- **ESLint 9**: Code linting with Electron Toolkit presets
- **Prettier 3.7.4**: Code formatting
- **pnpm**: Package manager

## File Storage

### Temporary Files

- **Location**: OS temp directory (`/tmp` on macOS)
- **Format**: `open-notes-{ISO-timestamp}.webm`
- **Lifecycle**: Created on recording stop, deleted after transcription
- **Cleanup**: Automatic via fileSystemService

### Persistent Files

- **Location**: `~/Documents/OpenNotes/`
- **Format**: `{ISO-timestamp}-transcript.json`
- **Structure**:

```json
{
  "id": "assembly-ai-id",
  "text": "Transcribed text...",
  "confidence": 0.95,
  "timestamp": "2026-01-15T...",
  "duration": 123.45,
  "savedAt": "2026-01-15T...",
  "words": [...],
  "utterances": [...],
  "metadata": {}
}
```

## Security Model

### Context Isolation

- Enabled by default in Electron
- Preload script uses `contextBridge` to expose safe APIs
- Renderer has no direct access to Node.js or Electron APIs

### Sandbox

- **Disabled** (`sandbox: false` in webPreferences)
- Required for Web Audio API and MediaRecorder functionality

### Permissions

- **Microphone**: Requested via `navigator.mediaDevices.getUserMedia()`
- **System Audio**: Requires macOS Screen Recording permission
- **File System**: Main process has full access; renderer goes through IPC

## Build Configuration

### electron-vite.config.ts

- Separate Vite configs for main, preload, renderer
- Renderer uses `@vitejs/plugin-react` for JSX/TSX
- Path alias: `@renderer` → `src/renderer/src`
- Tailwind CSS v4 via `@tailwindcss/vite`

### electron-builder.yml

- App ID: `com.electron.app`
- Platforms: Windows, macOS, Linux
- ASAR packaging with resources unpack
- Auto-updater: Generic provider with dev-app-update.yml

### TypeScript Configuration

- Root `tsconfig.json` uses project references
- `tsconfig.node.json`: Main + preload (Node environment)
- `tsconfig.web.json`: Renderer (browser + React)

## Development Workflow

### Commands

- `pnpm dev`: Hot-reload development server
- `pnpm typecheck`: Validate all TypeScript
- `pnpm lint`: ESLint with cache
- `pnpm format`: Prettier formatting
- `pnpm build`: Type-check + build
- `pnpm build:mac`: Build macOS DMG

### Hot Module Replacement (HMR)

- Renderer: Automatic via Vite + React Refresh
- Main/Preload: Requires restart (electron-vite handles this)

## Error Handling

### Error Types

1. **PERMISSION**: Microphone/system audio access denied
2. **RUNTIME**: Recording/processing failures
3. **API**: AssemblyAI transcription errors

### Error Flow

- Caught in hooks/services
- Dispatched to AppContext as ERROR state
- Displayed via ErrorDisplay component
- User can retry or reset to IDLE

## UI/UX Design

### Window Configuration

- Dimensions: 480×720 (min: 400×600)
- Frameless with custom draggable title bar (macOS style)
- Menu bar hidden for cleaner interface

### Application States

1. **IDLE**: Empty state with instructions
2. **RECORDING**: Pulsing mic icon + live timer
3. **PROCESSING**: Progress bar with status message
4. **DISPLAYING**: Transcript with metadata (confidence, duration)
5. **ERROR**: Error message with details

### Visual Design

- Modern, minimal interface
- Tailwind utility classes
- Radix UI for accessible components
- Lucide icons for consistent iconography
- Responsive layout (mobile-first approach)

## Platform Requirements

### macOS

- **Version**: 12.3+ (Monterey or later)
- **Reason**: electron-audio-loopback requires system audio capture APIs
- **Permissions**: Screen Recording permission for system audio

### Electron

- **Version**: 31.0.1+ (currently using 39.2.7)
- **Reason**: electron-audio-loopback compatibility

### AssemblyAI

- **API Key**: Required in `.env` file
- **Format**: `ASSEMBLYAI_API_KEY=your_key_here`

## Known Limitations

1. **Platform**: System audio capture only works on macOS 12.3+
2. **Audio Format**: WebM/Opus (browser-dependent codec support)
3. **Transcription**: Requires internet connection and API key
4. **Storage**: Transcripts stored locally only (no cloud sync)
5. **Languages**: AssemblyAI default settings (English, but supports multiple languages)
6. **Speaker Diarization**: Optimal performance requires each speaker to speak for at least 30 seconds

## Speaker Diarization

The application uses AssemblyAI's multichannel speaker diarization to identify different speakers:

- **Multichannel Processing**: Enables channel-aware transcription
  - Channel 1 (microphone): User's voice
  - Channel 2 (system audio): Video call participants

- **Speaker Labels**: Uses combined format `[channel][speaker]`
  - `1A` = User speaking (microphone)
  - `2A`, `2B`, `2C` = Individual call participants (system audio)

- **Configuration** (`src/main/services/assemblyai.ts`):
  - `multichannel: true` - Processes stereo channels independently
  - `speaker_labels: true` - Enables speaker identification
  - `speaker_options` - Expects 2-6 total speakers

- **Output Format**:
  - Word-level speaker labels in `words` array
  - Utterance-level segmentation in `utterances` array
  - Each segment includes speaker, text, timestamps, and confidence

## Future Enhancement Opportunities

1. Cross-platform system audio support (Windows WASAPI, Linux PulseAudio)
2. Local transcription models (Whisper.cpp)
3. Real-time transcription display during recording
4. Transcript editing and annotation
5. Export formats (TXT, SRT, VTT)
6. Cloud storage integration
7. Speaker identification with voice profiles (name-based labels)
8. Custom vocabulary and language models
9. Enhanced UI with speaker color-coding and timeline visualization
