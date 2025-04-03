// routes/_middleware.ts
import { FreshContext  } from "$fresh/server.ts";
import { getCookies } from "$std/http/cookie.ts";
// import { verifyAuthToken } from "@/lib/auth.ts";

// 公共路径白名单（无需登录）
const PUBLIC_PATHS = [
  "/login",
  "/register",
  "/api/login",
  "/api/register",
  "/_frsh/",     // Fresh 框架内部资源
  "/static/",    // 静态文件目录
  "/favicon.ico",
  "/robots.txt",
  "/styles.css"
];

const isPublic = (pathname: string) => {
    return PUBLIC_PATHS.some((p) => {
        if (p.endsWith("/")) return pathname.startsWith(p);
        return pathname === p;
      });
}

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

  // 检查是否属于公共路径
  const _isPublic = isPublic(pathname)

  console.log(_isPublic, pathname)

  // Case 2: 公共路径 → 直接放行
  if (_isPublic) return ctx.next();

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
