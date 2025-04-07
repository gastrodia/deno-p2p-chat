// routes/_middleware.ts
import { FreshContext  } from "$fresh/server.ts";
import { getCookies } from "$std/http/cookie.ts";
// import { verifyAuthToken } from "@/lib/auth.ts";
import {ALLOW_NEXT} from '../config/router.ts'


// export const handler: Handlers = {
//   async GET(req, ctx) {
//     return handleAuthCheck(req, ctx);
//   },
//   async POST(req, ctx) {
//     return handleAuthCheck(req, ctx);
//   },
//   // 其他需要处理的 HTTP 方法...
// };

interface State {

}

export async function handler(
    req: Request,
    ctx: FreshContext<State>,
) {
    const url = new URL(req.url);
  const pathname = url.pathname;

  const allow = ALLOW_NEXT(pathname)
  if (allow) return ctx.next()

  // 验证用户登录状态
  const cookies = getCookies(req.headers);

  const token = cookies.token

  // Case 1: 已登录用户访问登录/注册页 → 重定向到首页
  if (token && ["/login", "/register"].includes(pathname)) {
    return new Response("", {
      status: 302,
      headers: { Location: "/" },
    });
  }

  // Case 3: 非公共路径且未登录 → 重定向到登录页
  if (!token) {
    const redirectUrl = `/login?redirect=${encodeURIComponent(pathname)}`;
    return new Response("", {
      status: 302,
      headers: { Location: redirectUrl },
    });
  }

  // Case 4: 已登录用户 → 传递用户信息到后续处理
//   ctx.state.userId = "TODO";
  return ctx.next();
}
