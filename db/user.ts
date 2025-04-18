import randomAvatar from "@/utils/avatar.ts"
import { DenoKV } from "./denoKV.ts"

export interface SafeUser {
  id: string
  avatar: string
  username: string
}

export interface User extends SafeUser {
  password: string
  email: string
  createdAt: number
}

export class UserDB {
  private kv: Deno.Kv
  private static instance: UserDB | null = null

  // 私有构造函数，禁止直接 new 实例化
  private constructor(kv: Deno.Kv) {
    this.kv = kv
  }

  async login(email: string, password: string): Promise<string | null> {
    // Find user by email
    const users = await this.kv.list<User>({ prefix: ["users"] })
    for await (const user of users) {
      if (user.value.email === email && user.value.password === password) {
        return `${email}/${user.value.id}`
      }
    }
    return null
  }

  async auth(cookie?: string) {
    if (!cookie) {
      return null
    }
    const [email, userId] = cookie.split("/")
    if (!email || !userId) {
      return null
    }
    const user = await this.getUserById(userId)
    if (user?.email === email) {
      return user
    }
    return null
  }

  async register(
    email: string,
    password: string,
    username: string,
  ): Promise<User> {
    // Check if email already exists
    const users = await this.kv.list<User>({ prefix: ["users"] })
    for await (const user of users) {
      if (user.value.email === email) {
        throw new Error("Email already registered")
      }
    }
    const uuid = crypto.randomUUID()
    const newUser: User = {
      id: uuid.substring(uuid.lastIndexOf("-") + 1),
      avatar: await randomAvatar(),
      username,
      password,
      email,
      createdAt: Date.now(),
    }
    await this.kv.set(["users", newUser.id], newUser)
    return newUser
  }

  async getUserById(id: string): Promise<User | null>
  async getUserById(id: string, safe: true): Promise<SafeUser | null>
  async getUserById(
    id: string,
    safe?: boolean,
  ): Promise<User | SafeUser | null> {
    const user = await this.kv.get<User>(["users", id])
    if (!user.value) {
      return null
    }
    if (safe) {
      const { id, avatar, username } = user.value
      return { id, avatar, username }
    }
    return user.value
  }

  async updateUserById(
    id: string,
    info: Partial<Pick<User, "avatar" | "username" | "password">>,
  ) {
    const user = await this.getUserById(id)
    if (!user) {
      throw new Error("User not found")
    }
    const updatedUser = { ...user, ...info }
    const result = await this.kv.set(["users", id], updatedUser)
    return result.ok
  }

  async getAllUser(): Promise<User[]> {
    const users: User[] = []
    const entries = this.kv.list<User>({ prefix: ["users"] })
    for await (const entry of entries) {
      users.push(entry.value)
    }
    return users
  }

  async clearUsers() {
    // 步骤：获取所有用户条目
    const entries = this.kv.list<User>({ prefix: ["users"] })
    const keys: Deno.KvKey[] = []
    // 收集所有用户键
    for await (const entry of entries) {
      keys.push(entry.key)
    }
    // 步骤：分批次删除（每批10个）
    const BATCH_SIZE = 10
    for (let i = 0; i < keys.length; i += BATCH_SIZE) {
      const batch = keys.slice(i, i + BATCH_SIZE)
      const atomic = this.kv.atomic()
      batch.forEach((key) => atomic.delete(key))
      const result = await atomic.commit()
      if (!result.ok) {
        throw new Error("Failed to delete user batch")
      }
    }
  }

  static async create(): Promise<UserDB> {
    if (UserDB.instance) {
      return UserDB.instance
    }
    const kv = await DenoKV.create()
    UserDB.instance = new UserDB(kv)
    return UserDB.instance
  }
}
