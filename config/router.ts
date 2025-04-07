export const WHITE_ROUTES = [
  "/login",
  "/register",
  "/api/login",
  "/api/register",
];

export const STATIC_DIR = [
  "/_frsh/", // Fresh 框架内部资源
  "/static/", // 静态文件目录
];


export const IS_STATIC_DIR = (pathname: string) => {
  return STATIC_DIR.some((p) => {
    if (p.endsWith("/")) return pathname.startsWith(p);
    return pathname === p;
  });
}

export const IS_RESOURCE = (pathname: string) => {
  const resourceRegex = /\.(css|js|jpg|jpeg|png|gif|ico|svg|woff2?|ttf|eot|webp|mp4|webm|mp3|json|xml|txt)(\?.*)?$/i;
  return resourceRegex.test(pathname)
}

export const IS_WHITE_ROUTES = (pathname: string) => {
    return WHITE_ROUTES.some((p) => {
        if (p.endsWith("/")) return pathname.startsWith(p);
        return pathname === p;
      });
}

export const ALLOW_NEXT = (pathname: string) => {
  return IS_RESOURCE(pathname) || IS_STATIC_DIR(pathname) || IS_WHITE_ROUTES(pathname)
}