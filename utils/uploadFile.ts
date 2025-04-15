import {CONFIG, FILE_UPLOAD_SRC} from "@/config/index.ts"

const uploadFile = async (file: File) => {
  const formData = new FormData()
  formData.append("file", file)
  const res = await fetch(FILE_UPLOAD_SRC, {
    method: "POST",
    body: formData,
  })
  const data: Array<{src: string}> = await res.json()
  const src = data.at(0)?.src
  if (!src) {
    throw new Error("上传失败")
  }
  return `${CONFIG.FILE_UPLOAD_URL}${src}`
}

export default uploadFile