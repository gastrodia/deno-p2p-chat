import { EventMap } from "./types.ts"
class WsEmitter<T extends Record<string, { type: string }>> {
  private listeners: { [K in keyof T]?: Array<(data: T[K]) => void> } = {}
  private ws: WebSocket

  constructor(url: string) {
    this.ws = new WebSocket(url)
    this.ws.onmessage = this.wsOnMessage.bind(this)
  }

  private wsOnMessage(event: MessageEvent) {
    try {
      const data = JSON.parse(event.data) as T[keyof T]
      const type = data.type as keyof T
      if (this.listeners[type]) {
        this.emit(type, data as T[typeof type])
      }
    } catch (error) {
      console.error("Error processing message:", error)
    }
  }

  send(data: T[keyof T]) {
    if (this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data))
    }
  }

  on<K extends keyof T>(key: K, callback: (data: T[K]) => void) {
    if (!this.listeners[key]) {
      this.listeners[key] = []
    }
    this.listeners[key]!.push(callback)
  }

  off<K extends keyof T>(key: K, callback: (data: T[K]) => void) {
    const callbacks = this.listeners[key]
    if (callbacks) {
      const index = callbacks.indexOf(callback)
      if (index !== -1) {
        callbacks.splice(index, 1)
      }
    }
  }

  private emit<K extends keyof T>(key: K, data: T[K]) {
    const callbacks = this.listeners[key]
    if (callbacks) {
      for (const cb of callbacks) {
        cb(data)
      }
    }
  }
}
export function createWs(url: string) {
  return new WsEmitter<EventMap>(url)
}

export type WsMessage = ReturnType<typeof createWs>
