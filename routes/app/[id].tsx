import { PageProps } from "$fresh/server.ts"

const ChatRoom = ({ params }: PageProps) => {
  return (
    <h1>
      {params.id}
    </h1>
  )
}

export default ChatRoom
