import { useCallback, useRef, useState } from 'react'
import {
  TRANSACTION_TIMEOUT_MS,
  getErrorPresentation,
  type ApiResult,
} from '@/services/api'
import { pushTransactionNotification } from '@/store/notifications'

export interface TransactionSuccessState {
  title: string
  lines: Array<{ label: string; value: string }>
}

export interface TransactionErrorState {
  title: string
  message: string
  isTimeout: boolean
}

interface ExecuteOptions<TData> {
  steps: string[]
  apiCall: () => Promise<ApiResult<TData>>
  buildSuccess: (data: TData) => TransactionSuccessState
  buildLateNotification: (data: TData) => {
    title: string
    lines: Array<{ label: string; value: string }>
  }
}

export function useWorkflowTransaction() {
  const [isRunning, setIsRunning] = useState(false)
  const [activeSteps, setActiveSteps] = useState<string[]>([])
  const [success, setSuccess] = useState<TransactionSuccessState | null>(null)
  const [error, setError] = useState<TransactionErrorState | null>(null)
  const [timeoutNotice, setTimeoutNotice] = useState(false)
  const uiTimedOutRef = useRef(false)

  const clearStates = useCallback(() => {
    setSuccess(null)
    setError(null)
    setTimeoutNotice(false)
    uiTimedOutRef.current = false
  }, [])

  const execute = useCallback(async <TData>(options: ExecuteOptions<TData>) => {
    clearStates()
    setIsRunning(true)
    setActiveSteps(options.steps)
    uiTimedOutRef.current = false

    let timeoutId: ReturnType<typeof setTimeout> | null = null

    timeoutId = setTimeout(() => {
      uiTimedOutRef.current = true
      setIsRunning(false)
      setTimeoutNotice(true)
      setTimeout(() => setTimeoutNotice(false), 5000)
    }, TRANSACTION_TIMEOUT_MS)

    const result = await options.apiCall()

    if (timeoutId) clearTimeout(timeoutId)

    if (result.success) {
      if (uiTimedOutRef.current) {
        const late = options.buildLateNotification(result.data)
        pushTransactionNotification({
          title: late.title,
          lines: late.lines,
        })
      } else {
        setSuccess(options.buildSuccess(result.data))
      }
    } else if (!uiTimedOutRef.current) {
      const presentation = getErrorPresentation(result.error)
      setError({
        title: presentation.title,
        message: presentation.message,
        isTimeout: presentation.isTimeout,
      })
      if (presentation.isTimeout) {
        setTimeout(() => setError(null), 5000)
      }
    }

    setIsRunning(false)
    setActiveSteps([])
  }, [clearStates])

  return {
    isRunning,
    activeSteps,
    success,
    error,
    timeoutNotice,
    execute,
    clearStates,
  }
}
