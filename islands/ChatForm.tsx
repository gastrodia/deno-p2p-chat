import { FunctionComponent } from "preact/src/index.d.ts"
import { useRef } from "preact/hooks"
import EmojiPicker from "./EmojiPicker.tsx"

interface ChatFormProps {
  handleSendText: (message: string) => void
}

const ChatForm: FunctionComponent<ChatFormProps> = ({
  handleSendText,
}) => {
  const inputRef = useRef<HTMLInputElement>(null)

  const handleSend = (e: Event) => {
    e.preventDefault()
    const input = inputRef.current
    if (!input) return
    const message = input.value
    if (!message) return
    handleSendText(message)
    input.value = ""
  }

  const handleEmojiSelect = (emoji: string) => {
    const input = inputRef.current
    if (!input) return
    const start = input.selectionStart || 0
    const end = input.selectionEnd || 0
    const text = input.value
    input.value = text.substring(0, start) + emoji + text.substring(end)
    input.focus()
    input.selectionStart = input.selectionEnd = start + emoji.length
  }

  const handleEmojiOpen = () => {
    const input = inputRef.current
    if (!input) return
    input.readOnly = true
  }

  const handleEmojiClose = () => {
    const input = inputRef.current
    if (!input) return
    input.readOnly = false
  }

  return (
    <form class="flex gap-2 relative" onSubmit={handleSend}>
      <EmojiPicker
        onSelect={handleEmojiSelect}
        onOpen={handleEmojiOpen}
        onClose={handleEmojiClose}
      />
      <input
        autocomplete="off"
        ref={inputRef}
        name="message"
        type="text"
        placeholder="Type your message..."
        class="input input-bordered flex-1"
      />
      <button type="submit" class="btn btn-neutral h-10 overflow-hidden">
        🚀Send
      </button>
    </form>
  )
}

export default ChatForm
