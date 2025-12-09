/**
 * Cross-tab authentication synchronization
 * Detects when user logs out/logs in in another tab and syncs state
 */

export type AuthEvent = 
  | { type: 'LOGOUT' }
  | { type: 'LOGIN'; token: string }
  | { type: 'TOKEN_REFRESH'; token: string }

const AUTH_CHANNEL = 'auth_status_channel'
const AUTH_EVENT_KEY = 'auth_event'

class AuthSync {
  private channel: BroadcastChannel | null = null
  private listeners: Set<(event: AuthEvent) => void> = new Set()

  constructor() {
    // Use BroadcastChannel API if available (modern browsers)
    if (typeof BroadcastChannel !== 'undefined') {
      this.channel = new BroadcastChannel(AUTH_CHANNEL)
      this.channel.onmessage = (event) => {
        this.handleAuthEvent(event.data)
      }
    }

    // Also listen to storage events (fallback for older browsers & cross-tab sync)
    window.addEventListener('storage', this.handleStorageChange)
  }

  /**
   * Broadcast auth event to all tabs
   * Uses both BroadcastChannel (fast) and localStorage (fallback)
   */
  broadcast(event: AuthEvent) {
    // Method 1: BroadcastChannel (instant, same-origin only)
    if (this.channel) {
      try {
        this.channel.postMessage(event)
      } catch (error) {
        console.error('Failed to broadcast via BroadcastChannel', error)
      }
    }
    
    // Method 2: localStorage (triggers storage event in other tabs)
    try {
      localStorage.setItem(AUTH_EVENT_KEY, JSON.stringify({
        ...event,
        timestamp: Date.now()
      }))
      
      // Remove immediately to ensure storage event fires on next change
      setTimeout(() => {
        localStorage.removeItem(AUTH_EVENT_KEY)
      }, 100)
    } catch (error) {
      console.error('Failed to broadcast via localStorage', error)
    }
  }

  /**
   * Handle auth events from other tabs
   */
  private handleAuthEvent(event: AuthEvent) {
    console.log('🔄 Auth event received from another tab:', event.type)
    this.listeners.forEach(listener => {
      try {
        listener(event)
      } catch (error) {
        console.error('Error in auth event listener', error)
      }
    })
  }

  /**
   * Handle storage changes (localStorage fallback method)
   * Only fires in OTHER tabs, not the tab that made the change
   */
  private handleStorageChange = (e: StorageEvent) => {
    if (e.key === AUTH_EVENT_KEY && e.newValue) {
      try {
        const event = JSON.parse(e.newValue)
        // Ignore old events (older than 5 seconds)
        if (event.timestamp && Date.now() - event.timestamp < 5000) {
          this.handleAuthEvent(event)
        }
      } catch (error) {
        console.error('Failed to parse auth event from storage', error)
      }
    }
  }

  /**
   * Subscribe to auth events
   * Returns unsubscribe function
   */
  subscribe(listener: (event: AuthEvent) => void) {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }

  /**
   * Get number of active listeners
   */
  get listenerCount() {
    return this.listeners.size
  }

  /**
   * Cleanup resources
   */
  destroy() {
    if (this.channel) {
      this.channel.close()
      this.channel = null
    }
    window.removeEventListener('storage', this.handleStorageChange)
    this.listeners.clear()
  }
}

// Export singleton instance
export const authSync = new AuthSync()

// Cleanup on window unload
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    authSync.destroy()
  })
}
