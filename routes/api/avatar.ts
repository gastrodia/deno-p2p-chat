import randomAvatar from "@/utils/avatar.ts";
import { Handlers } from "$fresh/server.ts";

export const handler: Handlers = {
  async GET() {
    const avatar = await randomAvatar();
    return new Response(avatar);
  },
};
