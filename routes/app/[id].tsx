import { Handlers, PageProps } from "$fresh/server.ts"
import { UserDB } from "@/db/user.ts"
import ChatRoom, { ChatRoomProps } from "@/islands/ChatRoom.tsx"
import { SocketService } from "@/services/session.ts"
const ChatView = (props: PageProps<ChatRoomProps>) => {
  const { data } = props
  const { target } = data
  if (!target) return <h1>User not found</h1>
  return <ChatRoom target={target} />
}

export default ChatView

export const handler: Handlers = {
  async GET(_, ctx) {
    const { id } = ctx.params
    const userService = await UserDB.create()
    const target = await userService.getUserById(id)
    if (!target) return ctx.render()
    const sessionService = SocketService.create()
    const online = await sessionService.isOnline(target?.id)
    return ctx.render({
      target: {
        ...target,
        online,
      },
    })
  },
}
