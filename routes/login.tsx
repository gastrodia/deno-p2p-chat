import { Handlers, PageProps } from "$fresh/server.ts"
import { User, UserDB } from "../db/user.ts"
import { z } from "zod"
import { ExclamationIcon } from "../components/Icons.tsx"

const LoginSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(6, "Password must be at least 6 characters"),
})

type LoginForm = Partial<Pick<User, "email" | "password">> & {
  error?: string
}

export default function Login(props: PageProps<LoginForm>) {
  const { data } = props
  return (
    <div className="w-screen h-screen flex items-center justify-center bg-base-200">
      <div className="card bg-base-100 w-full max-w-sm shrink-0 shadow-2xl">
        <div className="card-body">
          <fieldset className="fieldset">
            {data?.error
              ? (
                <div role="alert" className="alert">
                  <ExclamationIcon />
                  <span>{data.error}</span>
                </div>
              )
              : null}
            <form method="POST">
              <div>
                <label className="fieldset-label">Email</label>
                <input
                  type="email"
                  className="input validator w-full"
                  placeholder="Email"
                  required
                  value={data?.email || ""}
                  name="email"
                />
                <p className="validator-hint">Required</p>
              </div>

              <div>
                <label className="fieldset-label">Password</label>
                <input
                  type="password"
                  className="input validator w-full"
                  placeholder="Password"
                  required
                  name="password"
                />
                <p className="validator-hint">
                  Required
                  <br />
                  Must be more than 6 characters, including
                </p>
              </div>

              <button className="btn btn-neutral" type="submit">Sign in</button>

              <p className="mt-4">
                No account?
                <a className="link ml-4" href="/register">
                  Create an account
                </a>
              </p>
            </form>
          </fieldset>
          <a href="https://fresh.deno.dev">
            <img
              src="https://fresh.deno.dev/fresh-badge.svg"
              alt="Made with Fresh"
            />
          </a>
        </div>
      </div>
    </div>
  )
}

export const handler: Handlers<LoginForm> = {
  async POST(req, ctx) {
    const formData = await req.formData()
    const vo: LoginForm = Object.fromEntries(formData.entries())

    // Validate with Zod
    const valid = LoginSchema.safeParse(vo)

    if (!valid.success) {
      return ctx.render({
        email: vo.email, // 回填已输入邮箱
        error: valid.error.issues.reduce(
          (c, p, i) => `${c}${i ? ";" : ""}${p.message}`,
          "",
        ),
      })
    }

    // 服务端验证逻辑
    const { email, password } = valid.data
    const userService = await UserDB.create()

    const cookie = await userService.login(email, password)

    if (!cookie) {
      return ctx.render({
        email,
        error: "Invalid email or password",
      })
    }

    const url = new URL(req.url)
    const redirectTo = url.searchParams.get("redirect") || "/"
    return new Response("", {
      status: 302,
      headers: {
        Location: redirectTo,
        "Set-Cookie": `auth=${cookie}; Path=/; HttpOnly; Secure; SameSite=Lax`,
      },
    })
  },
}
