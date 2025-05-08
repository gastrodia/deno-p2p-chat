// 维护在线用户的websocket

import { SafeUser } from "@/db/user.ts"
import {
  ChatUser,
  ContactUser,
  EventMap,
  ImageMessage,
  Message,
  TextMessage,
} from "../message/types.ts"
import { ContactDB } from "@/db/contact.ts"
import { ChatDB } from "@/db/chats.ts"
import uploadFile from "@/utils/uploadFile.ts"

export class SocketService {
  public connections = new Map<string, {
    socket: WebSocket // WebSocket connection
    user: SafeUser // User information
    // 好友列表
    contacts: ContactUser[]
    // 映射关系  谁和谁聊天
    chatWith?: string
  }>()

  private static instance: SocketService | null = null

  displayConnections() {
    return Array.from(this.connections.entries()).map(([key, value]) => ({
      key: key,
      ...value
    }))
  }

  getOnlineUsers() {
    return Array.from(this.connections.values()).map((v) => ({
      ...v.user,
      online: true,
    }))
  }

  async addConnection(user: SafeUser, socket: WebSocket, chatWith?: string) {
    // 获取这个人的好友列表
    const contactService = await ContactDB.create()
    if (chatWith) {
      // 把未读消息设为已读
      await contactService.setContactRead(user.id, chatWith)
    }
    const contacts = await contactService.queryContactUsersByUserId(user.id)
    this.connections.set(user.id, { socket, user, contacts, chatWith })
    // this.chatsMap.set(user.id, chatWith)
    this.sendToChatWith(user.id, true)
    // 判断chatWith是否是好友
    if (chatWith) {
      const isContact = contacts.some((v) => v.userId === chatWith)
      if (isContact) {
        const chatService = await ChatDB.create()
        const history = await chatService.getMessages(user.id, chatWith)
        this.sendToUser(user.id, "ONLINE", {
          history,
        })
      }
    } else {
      this.sendToUser(user.id, "ONLINE", {
        history: [],
      })
    }
    
    this.broadcastSessions()
  }

  // 某一方断开连接 清除这个人的连接 并清除对方的chatWith
  removeConnection(userId: string) {
    this.connections.delete(userId)
    // this.chatsMap.delete(userId)
    this.sendToChatWith(userId, false)
    this.broadcastSessions()
  }

  getContacts(userId: string): ContactUser[] {
    const value = this.connections.get(userId)
    if (!value) {
      return []
    }
    return value.contacts.map((v) => ({
      ...v,
      online: this.isOnline(v.userId),
    }))
  }

  // 获取陌生人列表 即不在好友列表中的用户和自己
  getStrangers(userId: string, contacts: ContactUser[]): ChatUser[] {
    const onlines = this.getOnlineUsers()
    return onlines.filter((v) => {
      return v.id !== userId && !contacts.some((c) => c.userId === v.id)
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

  async eventHandle<K extends keyof EventMap>(type: K, data: EventMap[K]) {
    await this.eventHandleMap[type]?.(data)
  }

  eventHandleMap: {
    [K in keyof EventMap]?: (data: EventMap[K]) => void
  } = {
    MESSAGE: async ({ data }) => await this.messageHandle(data),
    PING: ({ data }) => {
      this.sendToUser(data.target, "PONG", data)
    },
  }

  async messageHandle(message: Message) {
    const { type } = message
    switch (type) {
      case "text":
        await this.onTextMessage(message)
        break
      case "image":
        await this.onImageMessage(message)
        break
    }
  }

  handleMessageBefore<T extends Message>(message: T): T {
    // 判断对方有没有读消息
    const { from, to } = message
    // const chatWith = this.chatsMap.get(to)
    const chatWith = this.connections.get(to)?.chatWith
    return {
      ...message,
      read: chatWith === from,
      createdAt: Date.now(),
    }
  }

  async onTextMessage(payload: TextMessage) {
    const message = this.handleMessageBefore(payload)
    const { read } = message
    if (read) {
      this.sendToUser(message.to, "MESSAGE", {
        ...message,
        self: false,
      })
    }
    // 保存消息
    await this.saveMessage(message)
  }

  async onImageMessage(payload: ImageMessage) {
    const message = this.handleMessageBefore(payload)
    const { read, fileRaw } = message
    // 上传图片
    if (fileRaw) {
      const url = await uploadFile(fileRaw)
      message.url = url
    }
    if (read) {
      this.sendToUser(message.to, "MESSAGE", {
        ...message,
        self: false,
      })
    }
    // 保存消息
    await this.saveMessage(message)
  }

  async saveMessage(message: Message) {
    const chatService = await ChatDB.create()
    await chatService.saveMessage(message)
    // 保存联系人
    const contactService = await ContactDB.create()
    const { from, to, type, createdAt, read } = message
    let lastMessage = ""
    if (type === "text") {
      lastMessage = message.content || ""
    } else if (type === "image") {
      lastMessage = "[IMAGE]"
    }
    await contactService.addBidirectionalContact(
      from,
      to,
      lastMessage,
      createdAt!,
      read,
    )
    const fromItem = this.connections.get(from)
    if (fromItem) {
      const contacts = await contactService.queryContactUsersByUserId(from)
      fromItem.contacts = contacts
    }
    const toItem = this.connections.get(to)
    if (toItem) {
      const contacts = await contactService.queryContactUsersByUserId(to)
      toItem.contacts = contacts
    }
    this.broadcastSessions()
    this.sendToUser(message.from, "SENDED", {
      ...message,
      self: true,
    })
  }

  sendToChatWith(userId: string, online: boolean) {
    for (const [key, value] of this.connections.entries()) {
      if (value.chatWith === userId) {
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
