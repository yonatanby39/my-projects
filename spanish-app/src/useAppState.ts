import { useCallback, useState } from 'react'
import { toDateKey } from './lib/date'
import { type AppState, loadState, saveState } from './lib/storage'

/** Today's date key. Read at call time so a session left open past midnight uses the new day. */
export function today(): string {
  return toDateKey(new Date())
}

/** App state loaded from localStorage; every update is saved immediately. */
export function useAppState() {
  const [state, setState] = useState<AppState>(() => loadState())
  const update = useCallback((fn: (s: AppState) => AppState) => {
    setState((prev) => {
      const next = fn(prev)
      saveState(next)
      return next
    })
  }, [])
  return [state, update] as const
}
