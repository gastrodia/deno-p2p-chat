import { SafeUser } from "@/db/user.ts"

export type ChatUser = SafeUser & {
  online: boolean
}

export type EventMapKey = "SESSIONS" | "ONLINE"

type MapTo<T extends string, U extends Record<T, unknown>> = {
  [K in T]: {
    type: K
    data: U[K]
  }
}

export type EventMap = MapTo<
  EventMapKey,
  {
    SESSIONS: {
      online: ChatUser[]
      chats: ChatUser[]
    }
    ONLINE: boolean
  }
>
