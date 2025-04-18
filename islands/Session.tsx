import { useWsContext } from "./WsProvider.tsx"
import { useEffect, useState } from "preact/hooks"
import { ChatUser, EventMap } from "../message/types.ts"

type ChatsType = EventMap["SESSIONS"]["data"]

const ChatItem = (
  { item, isOnline }: { item: ChatUser; isOnline?: boolean },
) => (
  <a
    key={item.id}
    href={`/app/${item.id}`}
    className="list-row hover:bg-gray-100"
  >
    <div className={`avatar ${isOnline ? "avatar-online" : ""}`}>
      <div className="w-12">
        <img src={item.avatar} alt={item.username} />
      </div>
    </div>
    <div>{item.username}</div>
  </a>
)

const Session = () => {
  const wsContext = useWsContext()
  const [chats, setChats] = useState<ChatsType>({
    onlines: [],
    contacts: [],
  })

  const handleSessions = (data: EventMap["SESSIONS"]) => {
    const { onlines, contacts } = data.data
    setChats({ onlines, contacts })
  }

  useEffect(() => {
    const { ws } = wsContext
    if (!ws) return
    ws.on("SESSIONS", handleSessions)
    return () => {
      ws.off("SESSIONS", handleSessions)
    }
  }, [wsContext])

  return (
    <div className="list bg-base-100 rounded-box shadow-md">
      <div className="p-4 pb-2 text-xs opacity-60 tracking-wide">
        Recent Chats
      </div>
      {chats.contacts.map((item) => <ChatItem key={item.id} item={item} />)}
      <div className="p-4 pb-2 text-xs opacity-60 tracking-wide">Online</div>
      {chats.onlines.map((item) => (
        <ChatItem key={item.id} item={item} isOnline />
      ))}
    </div>
  )
}

export default Session
