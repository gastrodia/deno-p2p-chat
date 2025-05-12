import { FunctionComponent } from "preact"
import { useEffect, useRef, useState } from "preact/hooks"
import Popover from "./Popover.tsx"

interface EmojiPickerProps {
  onSelect: (emoji: string) => void
  onOpen?: () => void
  onClose?: () => void
}

interface EmojiCategory {
  name: string
  data: Array<{
    emoji: string
    name: string
  }>
}

const EmojiSelector: FunctionComponent<
  Pick<EmojiPickerProps, "onSelect"> & {
    visible: boolean
  }
> = ({
  onSelect,
  visible,
}) => {
  const [categories, setCategories] = useState<EmojiCategory[]>([])
  const [loading, setLoading] = useState(false)
  const [loaded, setLoaded] = useState(false)

  const handleClick = (e: MouseEvent) => {
    // 使用事件委托来处理点击事件
    const target = e.target as HTMLElement
    if (target.tagName === "BUTTON" && target.dataset.emoji) {
      const emoji = target.dataset.emoji
      onSelect(emoji)
    }
  }

  const loadEmojis = async () => {
    try {
      setLoading(true)
      const response = await fetch("/emojis.json")
      const data = await response.json()
      setCategories(data)
    } catch (error) {
      console.error("加载表情失败:", error)
    } finally {
      setLoading(false)
      setLoaded(true)
    }
  }
  useEffect(() => {
    if (visible && !loaded) {
      loadEmojis()
    }
  }, [visible])

  if (loading) {
    return (
      <div className="flex justify-center items-center h-20">
        <span className="loading loading-spinner loading-md"></span>
      </div>
    )
  }

  return (
    <div className="space-y-4" onClick={handleClick}>
      {categories.map((category, index) => (
        <div key={index} className="space-y-2">
          <h3 className="text-sm font-bold text-base-content/70">
            {category.name}
          </h3>
          <div className="grid grid-cols-8 gap-1">
            {category.data.map((item, emojiIndex) => (
              <button
                type="button"
                key={emojiIndex}
                className="hover:bg-base-200 p-1 rounded"
                title={item.name}
                data-emoji={item.emoji}
              >
                {item.emoji}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

const EmojiPicker: FunctionComponent<EmojiPickerProps> = ({
  onSelect,
  onOpen,
  onClose,
}) => {
  return (
    <Popover
      content={(visible) => (
        <EmojiSelector visible={visible} onSelect={onSelect} />
      )}
      onClose={onClose}
      onOpen={onOpen}
    >
      😀
    </Popover>
  )
}

export default EmojiPicker
