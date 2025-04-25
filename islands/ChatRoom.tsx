import { useWsContext } from "@/islands/WsProvider.tsx"
import Header from "@/components/Header.tsx"
import { FunctionComponent } from "preact"
import { useEffect, useRef, useState } from "preact/hooks"
import { ChatUser, EventMap } from "@/message/types.ts"
import ChatItem from "@/components/ChatItem.tsx"
import { Message } from "@/message/types.ts"
import { SafeUser } from "@/db/user.ts"

export interface ChatRoomProps {
  target: ChatUser
  me: SafeUser
}

const ChatRoom: FunctionComponent<ChatRoomProps> = ({ target, me }) => {
  const wsContext = useWsContext()
  const { ws, from, to } = wsContext
  const [chatWith, setChatWith] = useState(target)
  const inputRef = useRef<HTMLInputElement>(null)
  const [chatHistory, setChatHistory] = useState<Message[]>([])
  const chatContainerRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight
    }
  }

  const handleOnChatWithON_OFF = (data: EventMap["ON_OFF"]) => {
    setChatWith({
      ...chatWith,
      online: data.data,
    })
    setChatHistory(
      (history) => {
        return [
          ...history,
          {
            type: "system",
            content: data.data
              ? `${chatWith.username} is online`
              : `${chatWith.username} is offline`,
            status: data.data ? "success" : "neutral",
            from: "system",
            to: "system",
          },
        ]
      },
    )
  }

  const handleSend = (e: Event) => {
    e.preventDefault()
    const input = inputRef.current
    if (!input) return
    const message = input.value
    if (!message) return
    ws?.send({
      type: "MESSAGE",
      data: {
        from,
        to: to!,
        type: "text",
        content: message,
      },
    })
    input.value = ""
  }

  const handleOnline = (data: EventMap["ONLINE"]) => {
    setChatHistory((history) => {
      return [
        ...history,
        ...data.data.history,
      ]
    })
  }

  const handleOnMessage = (data: EventMap["MESSAGE"]) => {
    setChatHistory(
      (history) => {
        return [
          ...history,
          data.data,
        ]
      },
    )
  }

  const handleOnSended = (data: EventMap["SENDED"]) => {
    setChatHistory(
      (history) => {
        return [
          ...history,
          data.data,
        ]
      },
    )
  }

  useEffect(() => {
    ws?.on("ON_OFF", handleOnChatWithON_OFF)
    ws?.on("ONLINE", handleOnline)
    ws?.on("MESSAGE", handleOnMessage)
    ws?.on("SENDED", handleOnSended)
    return () => {
      ws?.off("ON_OFF", handleOnChatWithON_OFF)
      ws?.off("ONLINE", handleOnline)
      ws?.off("MESSAGE", handleOnMessage)
      ws?.off("SENDED", handleOnSended)
    }
  }, [ws])

  useEffect(() => {
    scrollToBottom()
  }, [chatHistory])

  return (
    <div className="flex flex-col h-screen w-full overflow-hidden">
      <Header>
        <div className="flex">
          <h1 className="text-xl font-bold">
            {chatWith.username}
          </h1>
          {chatWith.online
            ? <div className="badge badge-soft badge-success">Online</div>
            : <div className="badge badge-neutral badge-dash">Offline</div>}
        </div>
      </Header>

      <div ref={chatContainerRef} class="flex-1 p-4 overflow-y-auto">
        {chatHistory.map((message, index) => {
          return (
            <ChatItem key={index} message={message} me={me} target={chatWith} />
          )
        })}
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
