import { FunctionComponent } from "preact"
import { ChatUser, Message } from "@/message/types.ts"
import { SafeUser } from "@/db/user.ts"
import dayjs from "dayjs"

interface ChatItemProps {
  message: Message
  me: SafeUser
  target?: ChatUser
}

const RenderChat: FunctionComponent<ChatItemProps> = (
  { message, me, target, children },
) => {
  const { self } = message
  if (self) {
    return (
      <div className="chat chat-end">
        <div className="chat-image avatar">
          <div className="w-10 rounded-full">
            <img
              alt={me.username}
              src={me.avatar}
            />
          </div>
        </div>
        <div className="chat-header">
          {me.username}
        </div>
        <div className="chat-bubble">
          {children}
        </div>
        {message.createdAt
          ? (
            <div className="chat-footer opacity-50">
              {dayjs(message.createdAt).format("YYYY-MM-DD HH:mm:ss")}
            </div>
          )
          : ""}
      </div>
    )
  }

  return (
    <div className="chat chat-start">
      <div className="chat-image avatar">
        <div className="w-10 rounded-full">
          <img
            alt={target?.username}
            src={target?.avatar}
          />
        </div>
      </div>
      <div className="chat-header">
        {target?.username}
      </div>
      <div className="chat-bubble">
        {children}
      </div>
      {message.createdAt
        ? (
          <div className="chat-footer opacity-50">
            {dayjs(message.createdAt).format("YYYY-MM-DD HH:mm:ss")}
          </div>
        )
        : ""}
    </div>
  )
}

const RenderContent: FunctionComponent<{
  message: Message
}> = ({ message }) => {
  const { type } = message
  if (type === "text") {
    return <>{message.content}</>
  }
  return <h1>empty</h1>
}

const ChatItem: FunctionComponent<ChatItemProps> = (
  { message, me, target },
) => {
  const { type } = message
  if (type === "system") {
    return (
      <div
        className={`badge badge-outline badge-${message.status} block m-auto message-badge`}
      >
        {message.content}
      </div>
    )
  }
  return (
    <RenderChat message={message} me={me} target={target}>
      <RenderContent message={message} />
    </RenderChat>
  )
}

export default ChatItem
