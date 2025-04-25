import { Handlers } from "$fresh/server.ts"
import { AppState } from "../_middleware.ts"
import { SocketService } from "@/services/session.ts"

interface WsRequest {
  target?: string
}

export const handler: Handlers<WsRequest, AppState> = {
  GET(req, ctx) {
    const url = new URL(req.url)
    const chatWith = url.searchParams.get("target") || void 0
    const { username, id, avatar } = ctx.state.user
    const fromUser = { username, id, avatar }

    const { socket, response } = Deno.upgradeWebSocket(req)

    const sessionService = SocketService.create()

    socket.onopen = () => {
      sessionService.addConnection(fromUser, socket, chatWith)
    }
    socket.onclose = () => {
      sessionService.removeConnection(fromUser.id)
    }

    socket.onmessage = async (event: MessageEvent) => {
      const payload = JSON.parse(event.data)
      const type = payload.type
      await sessionService.eventHandle(type, payload)
    }
    return response
  },
}
