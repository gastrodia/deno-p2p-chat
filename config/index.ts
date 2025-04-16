export const CONFIG = {
  FILE_UPLOAD_URL: Deno.env.get("FILE_UPLOAD_URL") ||
    "https://img.jiajiwei.top",
  FILE_UPLOAD_PATH: Deno.env.get("FILE_UPLOAD_PATH") || "/upload",
}

export const FILE_UPLOAD_SRC =
  `${CONFIG.FILE_UPLOAD_URL}${CONFIG.FILE_UPLOAD_PATH}`
