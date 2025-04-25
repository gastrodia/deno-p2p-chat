import { EventMap } from "./types.ts"
class WsEmitter<T extends Record<string, { type: string }>> {
  private listeners: { [K in keyof T]?: Array<(data: T[K]) => void> } = {}
  private ws: WebSocket
  private pingTimer?: number
  private onPing: (ws: WsEmitter<T>) => void
  private pingDelay = 10000

  constructor(url: string, onPing: (ws: WsEmitter<T>) => void) {
    this.ws = new WebSocket(url)
    this.ws.onmessage = this.wsOnMessage.bind(this)
    this.ws.onclose = this.wsOnClose.bind(this)
    this.onPing = onPing
  }

  private wsOnClose() {
    clearTimeout(this.pingTimer)
    console.log("WebSocket connection closed")
  }

  private wsOnMessage(event: MessageEvent) {
    try {
      const data = JSON.parse(event.data) as T[keyof T]
      const type = data.type as keyof T
      this.ping()
      if (this.listeners[type]) {
        this.emit(type, data as T[typeof type])
      }
    } catch (error) {
      console.error("Error processing message:", error)
    }
  }

  private ping() {
    clearTimeout(this.pingTimer)
    this.pingTimer = setTimeout(() => {
      this.onPing(this)
    }, this.pingDelay)
  }

  send(data: T[keyof T]) {
    if (this.ws.readyState === WebSocket.OPEN) {
      this.ping()
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
export function createWs(
  url: string,
  onPing: (ws: WsEmitter<EventMap>) => void,
) {
  return new WsEmitter<EventMap>(url, onPing)
}

export type WsMessage = ReturnType<typeof createWs>
