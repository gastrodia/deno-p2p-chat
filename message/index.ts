import {EventMap} from "./types.ts";

class WsEmitter<T extends Record<string, { type: string; }>> {
  private listeners = new Map<keyof T, Array<(data: T[keyof T]) => void>>();
  private ws: WebSocket;

  constructor(url: string) {
    this.ws = new WebSocket(url);
    this.ws.onmessage = this.wsOnMessage.bind(this);
  }

  private wsOnMessage(event: MessageEvent) {
    try {
      const data = JSON.parse(event.data);
      const type: keyof T = data.type;
      if (this.listeners.has(type)) {
        this.emit(type, data);
      }
    } catch (error) {
      console.error("Error processing message:", error);
    }
  }

  send(data: T[keyof T]) {
    if (this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data));
    }
  }

  on<K extends keyof T, >(key: K, callback: (data: T[keyof T]) => void) {
    if (!this.listeners.has(key)) {
      this.listeners.set(key, []);
    }
    this.listeners.get(key)!.push(callback);
  }

  private emit<K extends keyof T, >(key: K, data: T[keyof T]) {
    const callbacks = this.listeners.get(key);
    if (!callbacks) {
      return;
    }
    for (const cb of callbacks) {
      cb(data);
    }
  }
}

export function createWs(url: string) {
  return new WsEmitter<EventMap>(url);
}

export type WsMessage = ReturnType<typeof createWs>;