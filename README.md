# OpenNotes

A desktop application for recording and transcribing audio from system audio (meetings, video calls) and microphone input. Built with Electron, React, and TypeScript.

## Overview

OpenNotes captures audio from your system and microphone, then automatically transcribes it using AssemblyAI's speech-to-text API with speaker diarization. All transcripts are stored locally on your machine.

**Key Features:**
- Record system audio (video calls, meetings) and/or microphone
- Automatic transcription with speaker identification
- Speaker diarization with multichannel processing
- Local storage of transcripts in `~/Documents/OpenNotes/`
- Clean, minimal interface with real-time recording feedback

## Quick Start

### Prerequisites

- **Node.js** 18+ and **pnpm**
- **macOS 12.3+** (Monterey or later) - required for system audio capture
- **AssemblyAI API Key** - [Get one free](https://www.assemblyai.com/)

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd open-notes

# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env
# Edit .env and add your AssemblyAI API key:
# ASSEMBLYAI_API_KEY=your_key_here
```

### Development

```bash
# Start development server with hot reload
pnpm dev

# Type checking
pnpm typecheck

# Linting
pnpm lint

# Code formatting
pnpm format
```

### Building

```bash
# Build for production
pnpm build

# Build platform-specific packages
pnpm build:mac    # macOS DMG
pnpm build:win    # Windows installer
pnpm build:linux  # Linux AppImage
```

## Architecture Overview

OpenNotes follows Electron's three-process architecture. For a detailed technical breakdown, see [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

### Process Structure

```
┌─────────────────────────────────────────────────────────┐
│                    Main Process (Node.js)               │
│  • Application lifecycle & window management            │
│  • IPC handler registration                             │
│  • Service orchestration (audio, file system, API)      │
└─────────────────────────────────────────────────────────┘
                           ↕ IPC
┌─────────────────────────────────────────────────────────┐
│                  Preload Script (Bridge)                │
│  • Secure API exposure via contextBridge                │
│  • Type-safe IPC communication                          │
└─────────────────────────────────────────────────────────┘
                           ↕
┌─────────────────────────────────────────────────────────┐
│               Renderer Process (Chromium)               │
│  • React 19 UI with TypeScript                          │
│  • MediaRecorder for audio capture                      │
│  • Web Audio API for stream mixing                      │
└─────────────────────────────────────────────────────────┘
```

### Key Services

**Main Process (`src/main/services/`):**
- **AudioCaptureService**: System audio loopback initialization (macOS only)
- **FileSystemService**: File operations, temp files, transcript storage
- **AssemblyAIService**: Transcription API integration with progress tracking

**Renderer Process (`src/renderer/src/`):**
- **AudioCaptureService**: MediaStream handling and mixing
- **AppContext**: State management (IDLE → RECORDING → PROCESSING → DISPLAYING)
- **Custom Hooks**: `useRecording()`, `useTranscription()`

### Data Flow

#### Recording Flow
```
User clicks Record
  → Request microphone + system audio streams
  → Mix streams using Web Audio API
  → MediaRecorder encodes to WebM/Opus
  → User clicks Stop → Save to temp file
  → Start transcription workflow
```

#### Transcription Flow
```
Save audio file to /tmp
  → Upload to AssemblyAI (30% progress)
  → Create transcription job (50% progress)
  → Poll until completed (100% progress)
  → Save transcript to ~/Documents/OpenNotes/
  → Delete temp file
  → Display transcript in UI
```

## Project Structure

```
open-notes/
├── src/
│   ├── main/               # Main process (Node.js)
│   │   ├── index.ts        # Entry point, window creation
│   │   └── services/       # Business logic services
│   │       ├── audioCapture.ts
│   │       ├── fileSystem.ts
│   │       └── assemblyai.ts
│   ├── preload/            # Preload scripts (security bridge)
│   │   └── index.ts        # API exposure via contextBridge
│   └── renderer/           # Renderer process (React)
│       ├── index.html
│       └── src/
│           ├── App.tsx             # Main component
│           ├── components/         # React components
│           ├── context/            # State management
│           ├── hooks/              # Custom React hooks
│           ├── services/           # Renderer-side services
│           └── types/              # TypeScript definitions
├── build/                  # Build assets (icons)
├── docs/                   # Documentation
│   ├── ARCHITECTURE.md     # Detailed architecture guide
│   └── README-STYLING.md   # Design system & styling guide
└── electron-builder.yml    # Build configuration
```

## Technology Stack

### Core
- **Electron 39.2.7** - Desktop application framework
- **React 19.2.1** - UI library with latest features
- **TypeScript 5.9.3** - Type safety
- **Vite 7.2.6** - Fast build tool
- **electron-vite 5.0.0** - Electron-specific Vite configuration

### Key Libraries
- **electron-audio-loopback 1.0.6** - System audio capture (macOS 12.3+)
- **assemblyai 4.22.1** - Speech-to-text API client
- **Tailwind CSS 4.1.18** - Utility-first styling
- **Radix UI** - Accessible component primitives
- **lucide-react** - Icon library

### Development Tools
- **electron-builder 26.0.12** - Application packaging
- **ESLint 9** - Code linting
- **Prettier 3.7.4** - Code formatting
- **pnpm** - Fast, disk-efficient package manager

## Configuration

### Environment Variables

Create a `.env` file in the project root:

```bash
# Required: AssemblyAI API key for transcription
ASSEMBLYAI_API_KEY=your_api_key_here

# Optional: Custom output directory
# OUTPUT_DIR=/path/to/custom/directory
```

### AssemblyAI Configuration

Transcription settings are in `src/main/services/assemblyai.ts`:

```typescript
{
  multichannel: true,        // Process stereo channels separately
  speaker_labels: true,      // Enable speaker identification
  speaker_options: {
    expected_speakers: {     // Expected speaker count
      min: 2,
      max: 6
    }
  }
}
```

### TypeScript Configuration

The project uses TypeScript project references:

- `tsconfig.json` - Root configuration
- `tsconfig.node.json` - Main + Preload (Node.js environment)
- `tsconfig.web.json` - Renderer (Browser + React)

### Electron Builder

Platform-specific build settings are in `electron-builder.yml`. Key settings:

```yaml
appId: com.electron.app
asar: true
directories:
  output: dist
  buildResources: build
```

## Development Guidelines

### Code Style

- **ESLint**: Run `pnpm lint` before committing
- **Prettier**: Auto-format with `pnpm format`
- **TypeScript**: Strict mode enabled, no implicit any
- **Component Structure**: One component per file
- **Imports**: Use path aliases (`@renderer`, `@main`, `@preload`)

### Adding Features

#### Adding a New UI Component

1. Create component in `src/renderer/src/components/`
2. Import UI primitives from `@renderer/components/ui/`
3. Use Tailwind CSS for styling (see [docs/README-STYLING.md](docs/README-STYLING.md))
4. Add to App.tsx or relevant parent component

Example:
```tsx
import { Button } from '@renderer/components/ui/button'

export function MyComponent() {
  return (
    <div className="flex flex-col gap-4 p-6">
      <Button onClick={handleClick}>Click Me</Button>
    </div>
  )
}
```

#### Adding a Main Process Service

1. Create service in `src/main/services/`
2. Export functions that return promises
3. Register IPC handlers in `src/main/index.ts`
4. Expose via preload script in `src/preload/index.ts`

Example:
```typescript
// src/main/services/myService.ts
export async function doSomething(): Promise<string> {
  return 'result'
}

// src/main/index.ts
ipcMain.handle('do-something', async () => {
  return await doSomething()
})

// src/preload/index.ts
doSomething: () => ipcRenderer.invoke('do-something')
```

### Testing

Currently, the project doesn't have automated tests. Contributions to add testing infrastructure are welcome!

**Suggested Testing Strategy:**
- **Unit Tests**: Vitest for services and utilities
- **Component Tests**: React Testing Library
- **E2E Tests**: Playwright for Electron

### State Management

The application uses React Context + useReducer pattern. State is centralized in `AppContext.tsx`:

**States:** `IDLE`, `RECORDING`, `PROCESSING`, `DISPLAYING`, `ERROR`

**Actions:** `START_RECORDING`, `STOP_RECORDING`, `START_PROCESSING`, `COMPLETE`, `ERROR`, `RESET`

When adding new features, consider if they require new states or actions.

## Speaker Diarization

The application uses AssemblyAI's multichannel speaker diarization:

- **Channel 1** (microphone): User's voice → labeled as `1A`
- **Channel 2** (system audio): Call participants → labeled as `2A`, `2B`, `2C`, etc.

**Requirements:**
- Optimal performance when each speaker talks for at least 30 seconds
- Multichannel recording (stereo) required
- Speaker labels are automatically assigned

**Output Format:**
```json
{
  "utterances": [
    {
      "speaker": "1A",
      "text": "Hello everyone",
      "start": 1250,
      "end": 3420,
      "confidence": 0.95
    }
  ]
}
```

## Known Limitations

1. **Platform Support**: System audio capture only works on macOS 12.3+
2. **Audio Format**: WebM/Opus (browser-dependent codec availability)
3. **Internet Required**: Transcription requires active internet connection
4. **No Cloud Sync**: Transcripts are stored locally only
5. **Speaker Diarization**: Works best with 2-6 speakers, each speaking for 30+ seconds

## Troubleshooting

### System Audio Not Working

**Issue**: Can't capture system audio

**Solutions:**
- Verify macOS version is 12.3+ (Monterey or later)
- Grant Screen Recording permission in System Preferences → Security & Privacy → Screen Recording
- Restart the application after granting permissions
- Check Electron version is 31.0.1+ (currently using 39.2.7)

### Transcription Fails

**Issue**: Transcription errors or timeouts

**Solutions:**
- Verify AssemblyAI API key is correct in `.env`
- Check internet connection
- Ensure audio file is valid (not corrupted)
- Check API quotas on AssemblyAI dashboard
- Review error message in application for specific details

### Build Errors

**Issue**: Build fails with dependency errors

**Solutions:**
- Delete `node_modules` and `pnpm-lock.yaml`, then run `pnpm install`
- Ensure pnpm version is up to date: `pnpm --version`
- Clear pnpm cache: `pnpm store prune`
- Check Node.js version is 18+ compatible

### Development Server Issues

**Issue**: Hot reload not working

**Solutions:**
- Kill all node processes: `pkill -9 node`
- Delete `.vite` cache folder in project root
- Restart development server: `pnpm dev`
- Check port 5173 is not in use

## Documentation

- [Architecture Guide](docs/ARCHITECTURE.md) - Detailed technical architecture and data flows
- [Styling Guide](docs/README-STYLING.md) - Design system, Tailwind CSS setup, and component styling

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
