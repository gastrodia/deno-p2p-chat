// routes/_middleware.ts
import { FreshContext } from "$fresh/server.ts";
import { getCookies } from "$std/http/cookie.ts";
// import { verifyAuthToken } from "@/lib/auth.ts";
import { ALLOW_NEXT } from "../config/router.ts";
import { User, UserDB } from "@/db/user.ts";

export interface AppState {
  user: User;
}

export async function handler(
  req: Request,
  ctx: FreshContext<AppState>,
) {
  const url = new URL(req.url);
  const pathname = url.pathname;

  const allow = ALLOW_NEXT(pathname);
  if (allow) return ctx.next();

  // 验证用户登录状态
  const cookies = getCookies(req.headers);
  const userService = await UserDB.create();

  const auth = await userService.auth(cookies.auth);

  // Case 3: 非公共路径且未登录 → 重定向到登录页
  if (!auth) {
    const redirectUrl = `/login?redirect=${encodeURIComponent(pathname)}`;
    return new Response("", {
      status: 302,
      headers: { Location: redirectUrl },
    });
  }

  // Case 4: 已登录用户 → 传递用户信息到后续处理
  ctx.state.user = auth;
  return ctx.next();
}
