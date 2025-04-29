import { FunctionComponent } from "preact/src/index.d.ts"
import { useEffect, useRef, useState } from "preact/hooks"

interface EmojiCategory {
  name: string
  data: Array<{
    emoji: string
    name: string
  }>
}

interface EmojiPickerProps {
  onSelect: (emoji: string) => void
  onOpen?: () => void
  onClose?: () => void
}

const EmojiPicker: FunctionComponent<EmojiPickerProps> = ({
  onSelect,
  onOpen,
  onClose,
}) => {
  const [categories, setCategories] = useState<EmojiCategory[]>([])
  const [loading, setLoading] = useState(false)
  const [loaded, setLoaded] = useState(false)
  const [visible, setVisible] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
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

    if (visible && !loaded) {
      loadEmojis()
    }

    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setVisible(false)
      }
    }

    if (visible) {
      document.addEventListener("click", handleClickOutside)
      onOpen?.()
    } else {
      onClose?.()
    }

    return () => {
      document.removeEventListener("click", handleClickOutside)
    }
  }, [visible])

  const handleClick = (e: MouseEvent) => {
    // 使用事件委托来处理点击事件
    const target = e.target as HTMLElement
    if (target.tagName === "BUTTON" && target.dataset.emoji) {
      const emoji = target.dataset.emoji
      onSelect(emoji)
    }
  }

  return (
    <div class="relative" ref={containerRef}>
      <button
        type="button"
        class="btn"
        onClick={() => setVisible(!visible)}
      >
        😊
      </button>
      <div
        style={{ display: visible ? "block" : "none" }}
        className="absolute bottom-full mb-2 bg-base-100 rounded-lg shadow-lg border p-2 w-72 max-h-96 overflow-y-auto"
      >
        {loading
          ? (
            <div className="flex justify-center items-center h-20">
              <span className="loading loading-spinner loading-md"></span>
            </div>
          )
          : (
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
          )}
      </div>
    </div>
  )
}

export default EmojiPicker
