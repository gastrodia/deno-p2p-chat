import { DenoKV } from "./denoKV.ts"
import { SafeUser, UserDB } from "./user.ts"

interface Contact {
  userId: string
  createdAt: Date
}

export class ContactDB {
  private kv: Deno.Kv
  private static instance: ContactDB | null = null

  // 私有构造函数，禁止直接 new 实例化
  private constructor(kv: Deno.Kv) {
    this.kv = kv
  }

  async queryContactUsersByUserId(userId: string): Promise<SafeUser[]> {
    const entries = this.kv.list<Contact>({ prefix: ["contacts", userId] })
    const userService = await UserDB.create()
    const contacts: SafeUser[] = []
    for await (const entry of entries) {
      const contactId = entry.value.userId
      if (!contactId) {
        continue
      }
      const contact = await userService.getUserById(contactId, true)
      if (!contact) {
        continue
      }
      contacts.push(contact)
    }
    return contacts
  }

  async addContact(userId: string, contactId: string) {
    const key = ["contacts", userId]
    const result = await this.kv.atomic()
      .check({ key, versionstamp: null })
      .set(key, {
        userId: contactId,
        createdAt: new Date(),
      })
      .commit()
    return result.ok
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
