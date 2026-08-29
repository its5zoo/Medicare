import type { SyncSession, SyncActionType } from './types'

const activeSessions = new Map<string, SyncSession>()

export function getSessionKey(actionType: SyncActionType, patientId?: string): string {
  return patientId ? `${actionType}-${patientId}` : `${actionType}-global`
}

export function registerSession(session: SyncSession): () => void {
  const key = getSessionKey(session.actionType, session.patientId)

  // Duplicate session protection: abort existing
  const existingSession = activeSessions.get(key)
  if (existingSession) {
    existingSession.abortController.abort('DUPLICATE_SESSION')
    activeSessions.delete(key)
    console.log(`[PostWriteSync] Aborted previous session for ${key}`)
  }

  activeSessions.set(key, session)

  return () => {
    // Empty cleanup function. Session survives component unmount.
  }
}

export function removeSession(session: SyncSession, reason: string) {
  const key = getSessionKey(session.actionType, session.patientId)
  if (activeSessions.get(key)?.sessionId === session.sessionId) {
    session.abortController.abort(reason)
    activeSessions.delete(key)
  }
}
