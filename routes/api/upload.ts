import uploadFile from "@/utils/uploadFile.ts"
import { Handlers } from "$fresh/server.ts"

interface UpdateBody {
  file: File
}

export const handler: Handlers<UpdateBody> = {
  async POST(req) {
    const formData = await req.formData()
    const file = formData.get("file") as File
    const url = await uploadFile(file)
    return new Response(url)
  },
}
