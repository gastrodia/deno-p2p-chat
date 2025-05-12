import { FunctionComponent } from "preact"
import { useEffect, useRef, useState } from "preact/hooks"
import Popover from "./Popover.tsx"
import { CloseIcon } from "@/components/Icons.tsx"

interface ImgPickerProps {
  onSend: (src: string) => void
}

const ImgSelector: FunctionComponent<
  Pick<ImgPickerProps, "onSend"> & {
    close: () => void
    visible: boolean
  }
> = (
  {
    onSend,
    close,
    visible
  },
) => {
  const [src, setSrc] = useState("")
  const [file, setFile] = useState<File>()
  const [loading, setLoading] = useState(false)
  const [isDragging, setIsDragging] = useState(false)

  const handleImageFile = (file: File) => {
    if (file && file.type.startsWith("image/")) {
      setFile(file)
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => {
        setSrc(reader.result as string)
      }
    }
  }

  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      e.preventDefault()
      if (!visible) return
      const items = e.clipboardData?.items
      if (!items) return

      for (const item of items) {
        if (item.type.startsWith("image/")) {
          const file = item.getAsFile()
          if (file) {
            handleImageFile(file)
            break
          }
        }
      }
    }

    document.addEventListener("paste", handlePaste)
    return () => {
      document.removeEventListener("paste", handlePaste)
    }
  }, [visible])

  const handleUploadImg = async () => {
    if (!file) return
    setLoading(true)
    const formData = new FormData()
    formData.append("file", file)
    const res = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    })
    const data = await res.text()
    onSend(data)
    setLoading(false)
    close()
    handleClearImg()
  }

  const handleSelectImgFile = async () => {
    const [fileHandle] = await window.showOpenFilePicker({
      types: [
        {
          description: "Images",
          accept: {
            "image/*": [".png", ".gif", ".jpeg", ".jpg"],
          },
        },
      ],
    })
    const file = await fileHandle.getFile()
    handleImageFile(file)
  }
  const handleClearImg = () => {
    setSrc("")
    setFile(void 0)
  }
  const handleDragOver = (e: DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer?.files[0]
    if (!file) return
    handleImageFile(file)
  }
  return (
    <div>
      <div
        className={`border border-dashed min-h-40 hover:border-neutral rounded-lg w-full ${
          isDragging ? "border-primary" : ""
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {src
          ? (
            <div className="relative">
              <img src={src} className="h-full w-full object-contain" />
              <div className="absolute top-0 right-0">
                <button
                  type="button"
                  className="btn btn-circle size-6"
                  onClick={handleClearImg}
                >
                  <CloseIcon />
                </button>
              </div>
            </div>
          )
          : (
            <div className="overflow-hidden absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-xs">
              <div>Drag and drop the image here</div>

              <div>
                <em>or</em> Paste the picture
              </div>
              <em>or</em> 
              <a className="link" onClick={handleSelectImgFile}>
                Select a local image
              </a>
            </div>
          )}
      </div>
      <div className="mt-2 flex justify-end">
        <button
          type="button"
          className="btn btn-square"
          onClick={handleUploadImg}
        >
          {loading
            ? <div className="loading loading-spinner loading-lg"></div>
            : `send`}
        </button>
      </div>
    </div>
  )
}

const ImgPicker: FunctionComponent<ImgPickerProps> = ({
  onSend,
}) => {
  return (
    <Popover
      content={(visible, close) => <ImgSelector visible={visible} onSend={onSend} close={close} />}
    >
      🖼
    </Popover>
  )
}

export default ImgPicker
