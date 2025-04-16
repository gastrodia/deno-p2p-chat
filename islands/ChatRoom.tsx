import { useWsContext } from "@/islands/WsProvider.tsx"
import Header from "@/components/Header.tsx"
import { FunctionComponent } from "preact"
import { useEffect, useRef } from "preact/hooks"
import { useSignal } from "@preact/signals"
import { ChatUser, EventMap } from "@/message/types.ts"
import ChatItem from "@/components/ChatItem.tsx"

export interface ChatRoomProps {
  target: ChatUser
}

const ChatRoom: FunctionComponent<ChatRoomProps> = ({ target }) => {
  const wsContext = useWsContext()
  const { ws } = wsContext
  const chatWith = useSignal(target)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleOnChatWithOnline = (data: EventMap["ONLINE"]) => {
    chatWith.value = {
      ...chatWith.value,
      online: data.data,
    }
  }

  const handleSend = (e: Event) => {
    e.preventDefault()
    const input = inputRef.current
    if (!input) return
    const message = input.value
    if (!message) return
    console.log("send message", message)
    input.value = ""
  }

  useEffect(() => {
    ws?.on("ONLINE", handleOnChatWithOnline)
    return () => {
      ws?.off("ONLINE", handleOnChatWithOnline)
    }
  }, [ws])

  return (
    <div className="flex flex-col h-screen w-full overflow-hidden">
      <Header>
        <div className="flex">
          <h1 className="text-xl font-bold">
            {chatWith.value.username}
          </h1>
          {chatWith.value.online
            ? <div className="badge badge-soft badge-success">Online</div>
            : <div className="badge badge-neutral badge-dash">Offline</div>}
        </div>
      </Header>

      <div class="flex-1 p-4 overflow-y-auto">
        <ChatItem />
      </div>
      <div class="border-t p-4">
        <form class="flex gap-2" onSubmit={handleSend}>
          <input
            autocomplete="off"
            ref={inputRef}
            name="message"
            type="text"
            placeholder="Type your message..."
            class="input input-bordered flex-1"
          />
          <button type="submit" class="btn btn-neutral h-10 overflow-hidden">
            Send
          </button>
        </form>
      </div>
    </div>
  )
}

export default ChatRoom
