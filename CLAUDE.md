# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an Electron desktop application built with React 19, TypeScript, and Vite. The project uses electron-vite for bundling and development, with separate configurations for the main process (Node.js), preload scripts, and renderer process (browser).

## Development Commands

### Setup
```bash
pnpm install
```

### Development
```bash
pnpm dev                 # Start development server with HMR
```

### Type Checking
```bash
pnpm typecheck           # Check both Node and web TypeScript
pnpm typecheck:node      # Check main process and preload scripts
pnpm typecheck:web       # Check renderer process
```

### Code Quality
```bash
pnpm lint                # Run ESLint with cache
pnpm format              # Format code with Prettier
```

### Building
```bash
pnpm build               # Type check and build for development
pnpm build:unpack        # Build and create unpacked directory
pnpm build:win           # Build Windows installer
pnpm build:mac           # Build macOS DMG
pnpm build:linux         # Build Linux AppImage/snap/deb
```

### Running Production Build
```bash
pnpm start               # Preview built app
```

## Architecture

### Three-Process Model

The application follows Electron's standard architecture with three separate processes:

1. **Main Process** (`src/main/`)
   - Entry point: [src/main/index.ts](src/main/index.ts)
   - Runs in Node.js environment
   - Controls application lifecycle, creates windows, handles native OS interactions
   - Communicates with renderer via IPC (ipcMain)
   - TypeScript config: [tsconfig.node.json](tsconfig.node.json)

2. **Preload Scripts** (`src/preload/`)
   - Entry point: [src/preload/index.ts](src/preload/index.ts)
   - Bridge between main and renderer processes
   - Uses `contextBridge` to safely expose APIs to renderer
   - Type definitions: [src/preload/index.d.ts](src/preload/index.d.ts)
   - TypeScript config: [tsconfig.node.json](tsconfig.node.json)

3. **Renderer Process** (`src/renderer/`)
   - Entry point: [src/renderer/src/main.tsx](src/renderer/src/main.tsx)
   - Runs in browser environment with React
   - UI code using React components
   - Communicates with main process via exposed APIs from preload
   - TypeScript config: [tsconfig.web.json](tsconfig.web.json)
   - Path alias: `@renderer` maps to `src/renderer/src`

### TypeScript Configuration

The project uses TypeScript project references:
- Root [tsconfig.json](tsconfig.json) references both Node and web configs
- [tsconfig.node.json](tsconfig.node.json): Main process, preload, and build config
- [tsconfig.web.json](tsconfig.web.json): Renderer process with React JSX

### Build Configuration

- **electron-vite**: [electron.vite.config.ts](electron.vite.config.ts)
  - Separate Vite configs for main, preload, and renderer
  - Renderer uses `@vitejs/plugin-react` for JSX support

- **electron-builder**: [electron-builder.yml](electron-builder.yml)
  - App ID: `com.electron.app`
  - Builds for Windows, macOS, and Linux
  - ASAR packaging with resources unpack
  - Auto-updater configured (generic provider)

## Adding New Features

### IPC Communication

To add communication between main and renderer:

1. In [src/main/index.ts](src/main/index.ts), add handler:
   ```typescript
   ipcMain.on('your-channel', (event, arg) => { ... })
   // or for async:
   ipcMain.handle('your-channel', async (event, arg) => { ... })
   ```

2. In [src/preload/index.ts](src/preload/index.ts), expose API via contextBridge:
   ```typescript
   const api = {
     yourMethod: () => ipcRenderer.send('your-channel')
   }
   ```

3. Update [src/preload/index.d.ts](src/preload/index.d.ts) with type definitions

4. Use in renderer via `window.api.yourMethod()`

### React Components

- Components live in `src/renderer/src/components/`
- Import using path alias: `import Component from '@renderer/components/Component'`
- Main App component: [src/renderer/src/App.tsx](src/renderer/src/App.tsx)

## Package Manager

This project uses **pnpm** (not npm or yarn). The lock file is [pnpm-lock.yaml](pnpm-lock.yaml).

## ESLint and Prettier

- ESLint config: [eslint.config.mjs](eslint.config.mjs) (flat config format)
- Uses `@electron-toolkit` presets for TypeScript and Prettier integration
- React plugin with hooks and refresh rules enabled
- Prettier config: [.prettierrc.yaml](.prettierrc.yaml)
