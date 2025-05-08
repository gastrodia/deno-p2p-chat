import { Handlers } from "$fresh/server.ts"
import {SocketService} from "@/services/session.ts"

export const handler: Handlers = {
  async GET() {
    const sessionService = await SocketService.create()
    return new Response(JSON.stringify(sessionService.displayConnections()))
  },
}
