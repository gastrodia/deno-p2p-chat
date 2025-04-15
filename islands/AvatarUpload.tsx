import {useCallback, useEffect, useRef} from "preact/hooks"
import {useSignal} from "@preact/signals"
import {PlusIcon} from "@/components/Icons.tsx"

interface Props {
  name?: string
  accept?: string
  required?: boolean
  initialPreview?: string // 新增初始预览属性
  onUpload?: (file: File) => void
  maxSize?: number
}

export default function AvatarUpload(props: Props) {
  const {
    name = "avatar",
    accept = "image/*",
    required = false,
    initialPreview = "",
    onUpload,
    maxSize = 2 * 1024 * 1024,
  } = props
  const preview = useSignal<string>(initialPreview)
  const isLoading = useSignal(false)
  const error = useSignal<string | null>(null)
  const fileInput = useRef<HTMLInputElement | null>(null)

  const handleFileChange = useCallback((event: Event) => {
    const input = event.target as HTMLInputElement
    const file = input.files?.[0]

    error.value = null

    if (!file) {
      // 清除已选择文件时恢复初始预览
      preview.value = initialPreview
      if (required) error.value = "请选择头像文件"
      return
    }

    if (!file.type.startsWith("image/")) {
      error.value = "请选择有效的图片文件"
      return
    }

    if (file.size > maxSize) {
      error.value = `文件大小不能超过${Math.round(maxSize / 1024 / 1024)}MB`
      return
    }

    // 生成预览URL
    preview.value = URL.createObjectURL(file)
    onUpload?.(file)
  }, [onUpload, maxSize, required, initialPreview])


  useEffect(() => {
    if (preview.value) {
      return () => {
        URL.revokeObjectURL(preview.value)
      }
    }
  }, [preview.value])

  return (
    <div className="relative border border-dashed w-40 h-40 hover:border-neutral rounded-lg overflow-hidden">
      <div className="absolute inset-0">
        {preview.value
          ? (
            <img
              src={preview.value}
              alt="avatar preview"
              className="w-full h-full object-cover"
            />
          )
          : <div className="w-full h-full flex items-center justify-center">
            <PlusIcon className="w-4 h-4" />
          </div>
        }
      </div>

      <input
        ref={fileInput}
        type="file"
        className="absolute inset-0 opacity-0 cursor-pointer"
        accept={accept}
        name={name}
        onChange={handleFileChange}
        disabled={isLoading.value}
        required={required && !preview.value}
        aria-label="avatar upload"
      />
    </div>
  )
}
