import { SafeUser } from "@/db/user.ts"

export type ChatUser = SafeUser & {
  online: boolean
}

interface MessageBase {
  createdAt?: number
  from: string
  to: string
  read?: boolean
  self?: boolean
}

export interface TextMessage extends MessageBase {
  content: string
  type: "text"
}

export interface ImageMessage extends MessageBase {
  url?: string
  type: "image"
}

interface SystemMessage extends MessageBase {
  content: string
  type: "system"
  status: "info" | "success" | "warning" | "error" | "primary" | "neutral"
}

export type Message = TextMessage | ImageMessage | SystemMessage

export interface Contact {
  userId: string
  createdAt: number
  lastMessage: string // 最后一条消息
  lastMessageFrom: string // 最后一条消息来自谁
  lastMessageAt: number // 最后一条消息的时间
  read?: boolean // 已读
}

export interface ContactUser extends Contact {
  avatar: string
  username: string
  online?: boolean
}

export type EventMapKey =
  | "SESSIONS"
  | "ON_OFF"
  | "ONLINE"
  | "MESSAGE"
  | "SENDED"
  | "PING"
  | "PONG"

type MapTo<T extends string, U extends Record<T, unknown>> = {
  [K in T]: {
    type: K
    data: U[K]
  }
}

export type EventMap = MapTo<
  EventMapKey,
  {
    SESSIONS: { // 聊天列表
      onlines: ChatUser[] // 在线的陌生人
      contacts: ContactUser[] // 联系人
    }
    ON_OFF: boolean // 对方上下线
    ONLINE: {
      history: Message[] // 历史消息
      chatWith?: string // 聊天对象
    }
    PEER: string // peerId
    MESSAGE: Message // 消息
    SENDED: Message // 消息
    PING: { timestamp: number; target: string } // 心跳检测请求
    PONG: { timestamp: number } // 心跳检测响应
  }
>
