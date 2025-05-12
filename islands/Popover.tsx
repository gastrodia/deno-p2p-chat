import { FunctionComponent, JSX} from "preact"
import { useEffect, useRef, useState } from "preact/hooks"

interface PopoverProps {
  onOpen?: () => void
  onClose?: () => void
  content: (visible: boolean, close: () => void) => JSX.Element
}

const Popover: FunctionComponent<PopoverProps> = ({
  onOpen,
  onClose,
  content,
  children
}) => {
  const [visible, setVisible] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const close = () => {
    setVisible(false)
  }

  useEffect(() => {
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

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        className="btn"
        onClick={() => setVisible(!visible)}
      >
        {children}
      </button>
      <div
        style={{ display: visible ? "block" : "none" }}
        className="absolute bottom-full mb-2 bg-base-100 rounded-lg shadow-lg border p-2 w-72 max-h-96 overflow-y-auto"
      >
        {content(visible, close)}
      </div>
    </div>
  )
}

export default Popover
