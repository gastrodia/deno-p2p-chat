// 维护在线用户的websocket

import { SafeUser } from "@/db/user.ts"
import { EventMap } from "../message/types.ts"

export class SocketService {
  public connections = new Map<string, {
    socket: WebSocket // WebSocket connection
    user: SafeUser // User information
  }>()
  // 映射关系  谁和谁聊天
  chatsMap = new Map<string, string | undefined>()

  private static instance: SocketService | null = null

  getOnlineUsers() {
    return Array.from(this.connections.values()).map((v) => ({
      ...v.user,
      online: true,
    }))
  }

  addConnection(user: SafeUser, socket: WebSocket, chatWith?: string) {
    this.connections.set(user.id, { socket, user })
    this.chatsMap.set(user.id, chatWith)
    this.sendToChatWith(user.id, true)
  }

  // 某一方断开连接 清除这个人的连接 并清除对方的chatWith
  removeConnection(userId: string) {
    this.connections.delete(userId)
    this.chatsMap.delete(userId)
    this.sendToChatWith(userId, false)
  }

  sendToUser<T>(userId: string, message: EventMap[keyof EventMap]) {
    const value = this.connections.get(userId)
    if (!value) {
      return false
    }
    value.socket.send(JSON.stringify(message))
  }

  broadcast(message: EventMap[keyof EventMap]) {
    this.connections.forEach((value) => {
      value.socket.send(JSON.stringify(message))
    })
  }

  isOnline(userId?: string) {
    if (!userId) return false
    return this.connections.has(userId)
  }

  messageHandle() {
  }

  // 更新所有在线用户的聊天列表
  broadcastChats() {
    this.broadcast({
      type: "SESSIONS",
      data: {
        online: this.getOnlineUsers(),
        chats: [],
      },
    })
  }

  sendToChatWith(userId: string, online: boolean) {
    for (const [key, value] of this.chatsMap.entries()) {
      if (value === userId) {
        this.sendToUser(key, {
          type: "ONLINE",
          data: online,
        })
      }
    }
  }

  static create() {
    if (!this.instance) {
      this.instance = new SocketService()
    }
    return this.instance
  }
}
