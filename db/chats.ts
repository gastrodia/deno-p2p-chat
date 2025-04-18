// 存储聊天记录
import { DenoKV } from "./denoKV.ts"
import { Message } from "@/message/types.ts"

export class ChatDB {
  private static instance: ChatDB
  private kv: Deno.Kv

  private constructor(kv: Deno.Kv) {
    this.kv = kv
  }

  // 获取两个用户之间的有序ID
  private getSortedUserIds(user1: string, user2: string): [string, string] {
    return user1 < user2 ? [user1, user2] : [user2, user1]
  }

  // 保存消息
  async saveMessage(message: Message) {
    const [smallerId, biggerId] = this.getSortedUserIds(
      message.from,
      message.to,
    )
    const key = ["chats", smallerId, biggerId]
    await this.kv.set(key, message)
  }

  // 获取两个用户之间的聊天记录
  async getMessages(from: string, to: string): Promise<Message[]> {
    const [smallerId, biggerId] = this.getSortedUserIds(from, to)
    const prefix = ["chats", smallerId, biggerId]
    const data = this.kv.list<Message>({ prefix })
    const messages: Message[] = []
    for await (const item of data) {
      messages.push({
        ...item.value,
        self: item.value.from === from,
      })
    }
    return messages
  }

  static async create() {
    if (ChatDB.instance) {
      return ChatDB.instance
    }
    const kv = await DenoKV.create()
    ChatDB.instance = new ChatDB(kv)
    return ChatDB.instance
  }
}
