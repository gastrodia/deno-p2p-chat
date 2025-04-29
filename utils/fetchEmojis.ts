import { DOMParser } from "@b-fuze/deno-dom"

interface EmojiCategory {
  name: string
  data: Array<{
    emoji: string
    name: string
  }>
}

async function fetchEmojis(): Promise<EmojiCategory[]> {
  try {
    const response = await fetch("https://funletu.com/emoji/")
    const html = await response.text()
    const parser = new DOMParser()
    const doc = parser.parseFromString(html, "text/html")
    const categoryElements = doc.querySelectorAll("section.emoji_card_list")
    const emojis: Array<EmojiCategory> = []
    for (const element of categoryElements) {
      if (!element) continue
      const categoryName = element.querySelector("h2 > .emoji_font")
        ?.nextSibling?.textContent?.trim()
      if (!categoryName) continue
      const emojiElements = element.querySelector(".emoji_list")
      if (!emojiElements) continue
      const item: EmojiCategory = {
        name: categoryName,
        data: [],
      }
      for (const emojiElement of emojiElements.children) {
        const emoji = emojiElement.querySelector(".emoji_font")?.textContent
          ?.trim()
        const emojiName = emojiElement.querySelector(".emoji_name")?.textContent
          ?.trim()
        item.data.push({
          emoji: emoji || "",
          name: emojiName || "",
        })
      }
      emojis.push(item)
    }

    return emojis
  } catch (error) {
    console.error("获取表情失败:", error)
    return []
  }
}

// 获取表情数据并保存到文件
const emojis = await fetchEmojis()
await Deno.writeTextFile(
  "./static/emojis.json",
  JSON.stringify(emojis, null, 2) + `\n`,
)
console.log("表情数据已保存到 static/emojis.json")
