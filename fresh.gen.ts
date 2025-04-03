// DO NOT EDIT. This file is generated by Fresh.
// This file SHOULD be checked into source version control.
// This file is automatically updated during development when running `dev.ts`.

import * as $_404 from "./routes/_404.tsx";
import * as $_app from "./routes/_app.tsx";
import * as $_middleware from "./routes/_middleware.ts";
import * as $api_ws from "./routes/api/ws.ts";
import * as $index from "./routes/index.tsx";
import * as $login from "./routes/login.tsx";
import * as $register from "./routes/register.tsx";

import type { Manifest } from "$fresh/server.ts";

const manifest = {
  routes: {
    "./routes/_404.tsx": $_404,
    "./routes/_app.tsx": $_app,
    "./routes/_middleware.ts": $_middleware,
    "./routes/api/ws.ts": $api_ws,
    "./routes/index.tsx": $index,
    "./routes/login.tsx": $login,
    "./routes/register.tsx": $register,
  },
  islands: {},
  baseUrl: import.meta.url,
} satisfies Manifest;

export default manifest;
