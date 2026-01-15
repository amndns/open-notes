import { Alert, AlertDescription, AlertTitle } from './ui/alert'
import { Button } from './ui/button'
import { useAppContext } from '../context/AppContext'
import { AlertCircle } from 'lucide-react'

interface ErrorDisplayProps {
  error: {
    type: 'PERMISSION' | 'RUNTIME' | 'API'
    message: string
    details?: any
  }
}

export default function ErrorDisplay({ error }: ErrorDisplayProps) {
  const { dispatch } = useAppContext()

  const getErrorTitle = () => {
    switch (error.type) {
      case 'PERMISSION':
        return 'Permission Required'
      case 'API':
        return 'Transcription Error'
      case 'RUNTIME':
      default:
        return 'Error'
    }
  }

  const getActionButton = () => {
    if (error.type === 'PERMISSION') {
      return (
        <Button
          onClick={() => {
            // Guide user to system preferences
            alert('Please grant microphone permission in System Preferences > Privacy & Security')
            dispatch({ type: 'RESET' })
          }}
        >
          Grant Permissions
        </Button>
      )
    }
    return (
      <Button onClick={() => dispatch({ type: 'RESET' })} variant="outline">
        Try Again
      </Button>
    )
  }

  return (
    <div className="space-y-6">
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>{getErrorTitle()}</AlertTitle>
        <AlertDescription className="mt-2">
          {error.message}
          {error.details && (
            <details className="mt-2">
              <summary className="cursor-pointer text-xs">Technical details</summary>
              <pre className="mt-2 overflow-auto rounded bg-muted p-2 text-xs">
                {JSON.stringify(error.details, null, 2)}
              </pre>
            </details>
          )}
        </AlertDescription>
      </Alert>
      <div className="flex justify-center">{getActionButton()}</div>
    </div>
  )
}
