// 维护在线用户的websocket

import { SafeUser } from "@/db/user.ts"
import { ChatUser, EventMap, Message, TextMessage } from "../message/types.ts"
import { ContactDB } from "@/db/contact.ts"
import { ChatDB } from "@/db/chats.ts"

export class SocketService {
  public connections = new Map<string, {
    socket: WebSocket // WebSocket connection
    user: SafeUser // User information
    // 好友列表
    contacts: SafeUser[]
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

  async addConnection(user: SafeUser, socket: WebSocket, chatWith?: string) {
    // 获取这个人的好友列表
    const contactService = await ContactDB.create()
    const contacts = await contactService.queryContactUsersByUserId(user.id)
    this.connections.set(user.id, { socket, user, contacts })
    this.chatsMap.set(user.id, chatWith)
    this.sendToChatWith(user.id, true)
    this.broadcastSessions()
    // 判断chatWith是否是好友
    if (chatWith) {
      const isContact = contacts.some((v) => v.id === chatWith)
      if (isContact) {
        const chatService = await ChatDB.create()
        const history = await chatService.getMessages(user.id, chatWith)
        this.sendToUser(user.id, "ONLINE", {
          history,
        })
      }
    }
    this.sendToUser(user.id, "ONLINE", {
      history: [],
    })
  }

  // 某一方断开连接 清除这个人的连接 并清除对方的chatWith
  removeConnection(userId: string) {
    this.connections.delete(userId)
    this.chatsMap.delete(userId)
    this.sendToChatWith(userId, false)
    this.broadcastSessions()
  }

  getContacts(userId: string): ChatUser[] {
    const value = this.connections.get(userId)
    if (!value) {
      return []
    }
    return value.contacts.map((v) => ({
      ...v,
      online: this.isOnline(v.id),
    }))
  }

  // 获取陌生人列表 即不在好友列表中的用户和自己
  getStrangers(userId: string, contacts: SafeUser[]): ChatUser[] {
    const onlines = this.getOnlineUsers()
    return onlines.filter((v) => {
      return v.id !== userId && !contacts.some((c) => c.id === v.id)
    })
  }

  broadcastSessions() {
    for (const [key] of this.connections.entries()) {
      const contacts = this.getContacts(key)
      this.sendToUser(key, "SESSIONS", {
        onlines: this.getStrangers(key, contacts),
        contacts,
      })
    }
  }

  // 推送
  sendToUser<K extends keyof EventMap, T extends EventMap[K]["data"]>(
    userId: string,
    key: K,
    message: T,
  ) {
    const value = this.connections.get(userId)
    if (!value) {
      return false
    }
    value.socket.send(JSON.stringify({
      type: key,
      data: message,
    }))
  }

  broadcast<T extends EventMap[keyof EventMap]>(message: T) {
    this.connections.forEach((value) => {
      value.socket.send(JSON.stringify(message))
    })
  }

  isOnline(userId?: string) {
    if (!userId) return false
    return this.connections.has(userId)
  }

  eventHandle<K extends keyof EventMap>(type: K, data: EventMap[K]) {
    this.eventHandleMap[type]?.(data)
  }

  eventHandleMap: {
    [K in keyof EventMap]?: (data: EventMap[K]) => void
  } = {
    MESSAGE: ({ data }) => this.messageHandle(data),
  }

  messageHandle(message: Message) {
    const { type } = message
    switch (type) {
      case "text":
        this.onTextMessage(message)
        break
    }
  }

  handleMessageBefore<T extends Message>(message: T): T {
    // 判断对方有没有读消息
    const { from, to } = message
    const chatWith = this.chatsMap.get(to)
    return {
      ...message,
      read: chatWith === from,
      createdAt: Date.now(),
    }
  }

  onTextMessage(payload: TextMessage) {
    const message = this.handleMessageBefore(payload)
    const { read } = message
    if (read) {
      this.sendToUser(message.to, "MESSAGE", {
        ...message,
        self: false,
      })
    }
    this.sendToUser(message.from, "SENDED", {
      ...message,
      self: true,
    })
  }

  sendToChatWith(userId: string, online: boolean) {
    for (const [key, value] of this.chatsMap.entries()) {
      if (value === userId) {
        this.sendToUser(key, "ON_OFF", online)
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
