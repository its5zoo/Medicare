export interface User {
  id: string
  username: string
  full_name: string
  role: string
  [key: string]: any // For future extensibility
}

export type AuthStatus = 'idle' | 'loading' | 'authenticated' | 'unauthenticated' | 'error'

export interface AuthState {
  status: AuthStatus
  user: User | null
  error: string | null
}

export type AuthAction =
  | { type: 'CHECK_SESSION_START' }
  | { type: 'SESSION_RESTORED'; payload: User }
  | { type: 'SESSION_REJECTED' }
  | { type: 'SESSION_ERROR'; payload: string }
  | { type: 'LOGOUT' }

