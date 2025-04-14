import { Handlers } from "$fresh/server.ts"
import { UserDB } from "@/db/user.ts"

// 获取所有的User
export const handler: Handlers = {
  async GET() {
    const userService = await UserDB.create()
    const users = await userService.getAllUser()
    return new Response(JSON.stringify(users))
  },
  async DELETE() {
    const userService = await UserDB.create()
    await userService.clearUsers()
    return new Response(JSON.stringify({
      code: 0,
    }))
  },
}
