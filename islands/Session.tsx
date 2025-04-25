import { useWsContext } from "./WsProvider.tsx"
import { useEffect, useState } from "preact/hooks"
import { ChatUser, ContactUser, EventMap } from "../message/types.ts"
import { FunctionComponent } from "preact"

type ChatsType = EventMap["SESSIONS"]["data"]

const ContactItem: FunctionComponent<{ item: ContactUser }> = ({ item }) => (
  <a
    key={item.userId}
    href={`/app/${item.userId}`}
    className="list-row hover:bg-gray-100"
  >
    <div className={`avatar ${item.online ? "avatar-online" : ""}`}>
      <div className="size-12">
        <img src={item.avatar} alt={item.username} />
      </div>
    </div>
    <div class="overflow-hidden">
      <div>
        {item.username}
        {item.read ? null : (
          <span
            aria-label="success"
            className="ml-2 status status-info animate-bounce"
          >
          </span>
        )}
      </div>
      <div className="list-col-wrap text-xs">
        {item.lastMessage}
      </div>
    </div>
  </a>
)

const OnlineItem: FunctionComponent<{ item: ChatUser }> = ({ item }) => (
  <a
    key={item.id}
    href={`/app/${item.id}`}
    className="list-row hover:bg-gray-100"
  >
    <div className="avatar avatar-online">
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
      {chats.contacts.map((item) => (
        <ContactItem key={item.userId} item={item} />
      ))}
      <div className="p-4 pb-2 text-xs opacity-60 tracking-wide">Online</div>
      {chats.onlines.map((item) => <OnlineItem key={item.id} item={item} />)}
    </div>
  )
}

export default Session
