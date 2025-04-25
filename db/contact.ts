import { DenoKV } from "./denoKV.ts"
import { UserDB } from "./user.ts"
import { Contact, ContactUser } from "@/message/types.ts"

export class ContactDB {
  private kv: Deno.Kv
  private static instance: ContactDB | null = null

  // 私有构造函数，禁止直接 new 实例化
  private constructor(kv: Deno.Kv) {
    this.kv = kv
  }

  async queryContactUsersByUserId(userId: string) {
    const entries = this.kv.list<Contact>({ prefix: ["contacts", userId] })
    const userService = await UserDB.create()
    const contacts: ContactUser[] = []
    for await (const entry of entries) {
      const contactId = entry.value.userId
      if (!contactId) {
        continue
      }
      const contact = await userService.getUserById(contactId, true)
      if (!contact) {
        continue
      }
      contacts.push({
        userId: contact.id,
        avatar: contact.avatar,
        username: contact.username,
        createdAt: entry.value.createdAt,
        lastMessage: entry.value.lastMessage,
        lastMessageFrom: entry.value.lastMessageFrom,
        lastMessageAt: entry.value.lastMessageAt,
        read: entry.value.read,
      })
    }
    return contacts
  }

  async addContact(
    userId: string,
    contactId: string,
    message: string,
    messageAt: number,
    read: boolean = false,
  ) {
    const key = ["contacts", userId, contactId]
    // 先检查联系人是否已存在
    const existingContact = await this.kv.get<Contact>(key)
    const contact: Contact = {
      userId: contactId,
      lastMessage: message,
      lastMessageFrom: userId,
      lastMessageAt: messageAt,
      read: read,
      createdAt: existingContact.value?.createdAt || Date.now(), // 如果已存在则保留原有的 createdAt，否则设置当前时间
    }
    const result = await this.kv.atomic()
      .check({ key, versionstamp: existingContact.versionstamp })
      .set(key, contact)
      .commit()
    return result.ok
  }

  // 把联系人设为已读
  async setContactRead(userId: string, contactId: string) {
    const key = ["contacts", userId, contactId]
    const contact = await this.kv.get<Contact>(key)
    if (!contact.value) {
      return false
    }
    const result = await this.kv.atomic()
      .check({ key, versionstamp: contact.versionstamp })
      .set(key, { ...contact.value, read: true })
      .commit()
    return result.ok
  }

  // 双向存储联系人
  async addBidirectionalContact(
    userId: string,
    contactId: string,
    message: string,
    messageAt: number,
    read: boolean = false,
  ) {
    // 为双方创建联系人记录
    const userToContact = await this.addContact(
      userId,
      contactId,
      message,
      messageAt,
      true,
    )
    const contactToUser = await this.addContact(
      contactId,
      userId,
      message,
      messageAt,
      read,
    )
    return userToContact && contactToUser
  }

  static async create(): Promise<ContactDB> {
    if (ContactDB.instance) {
      return ContactDB.instance
    }
    const kv = await DenoKV.create()
    ContactDB.instance = new ContactDB(kv)
    return ContactDB.instance
  }
}
