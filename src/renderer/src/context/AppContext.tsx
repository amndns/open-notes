import { createContext, useReducer, useContext, ReactNode } from 'react'
import { AppState, AppAction } from '../types'

const initialState: AppState = { status: 'IDLE' }

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'START_RECORDING':
      return { status: 'RECORDING', duration: 0, startTime: Date.now() }

    case 'UPDATE_DURATION':
      return state.status === 'RECORDING' ? { ...state, duration: action.duration } : state

    case 'STOP_RECORDING':
      return { status: 'PROCESSING', progress: 0, message: 'Preparing...' }

    case 'START_PROCESSING':
      return { status: 'PROCESSING', progress: 0, message: 'Uploading audio...' }

    case 'UPDATE_PROGRESS':
      return state.status === 'PROCESSING'
        ? { ...state, progress: action.progress, message: action.message }
        : state

    case 'DISPLAY_TRANSCRIPT':
      return { status: 'DISPLAYING', transcript: action.transcript }

    case 'ERROR':
      return { status: 'ERROR', error: action.error }

    case 'RESET':
      return initialState

    default:
      return state
  }
}

const AppContext = createContext<{
  state: AppState
  dispatch: React.Dispatch<AppAction>
} | null>(null)

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState)
  return <AppContext.Provider value={{ state, dispatch }}>{children}</AppContext.Provider>
}

export function useAppContext() {
  const context = useContext(AppContext)
  if (!context) throw new Error('useAppContext must be used within AppProvider')
  return context
}
