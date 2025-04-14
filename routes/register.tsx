import { Handlers, PageProps } from "$fresh/server.ts"
import { User, UserDB } from "../db/user.ts"
import { z } from "zod"
import { ExclamationIcon } from "../components/Icons.tsx"
import promiseToResult from "../utils/promiseToResult.ts"

const RegisterSchema = z.object({
  email: z.string().email("Invalid email format"),
  username: z.string().min(2, "Username Minimum 2 characters").max(
    8,
    "Username Maximum 8 characters",
  ),
  password: z.string().min(6, "Password must be at least 6 characters"),
})

type RegisterForm = Partial<Pick<User, "email" | "password" | "username">> & {
  error?: string
}

export default function Register(props: PageProps<RegisterForm>) {
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
                <label className="fieldset-label">Username</label>
                <input
                  type="input"
                  className="input validator w-full"
                  placeholder="Username"
                  name="username"
                  required
                />
                <p className="validator-hint">Required</p>
              </div>
              <div>
                <label className="fieldset-label">Email</label>
                <input
                  type="email"
                  className="input validator w-full"
                  placeholder="Email"
                  name="email"
                  required
                />
                <p className="validator-hint">Required</p>
              </div>

              <div>
                <label className="fieldset-label">Password</label>
                <input
                  type="password"
                  className="input validator w-full"
                  placeholder="Password"
                  name="password"
                  required
                />
                <p className="validator-hint">Required</p>
              </div>
              <button className="btn btn-neutral" type="submit">
                Sign up
              </button>

              <p class="mt-4">
                Already have an account?
                <a className="link ml-4" href="/login">
                  Sign in
                </a>
              </p>
            </form>
          </fieldset>
        </div>
      </div>
    </div>
  )
}

export const handler: Handlers<RegisterForm> = {
  async POST(req, ctx) {
    const formData = await req.formData()
    const vo: RegisterForm = Object.fromEntries(formData.entries())

    // Validate with Zod
    const valid = RegisterSchema.safeParse(vo)

    if (!valid.success) {
      console.log(valid)
      return ctx.render({
        email: vo.email, // 回填已输入邮箱
        username: vo.username,
        error: valid.error.issues.reduce(
          (c, p, i) => `${c}${i ? ";" : ""}${p.message}`,
          "",
        ),
      })
    }

    // 服务端验证逻辑
    const { email, password, username } = valid.data
    const userService = await UserDB.create()
    const [registerError, user] = await promiseToResult<User, Error>(
      userService.register(
        email,
        password,
        username,
      ),
    )

    if (registerError) {
      return ctx.render({
        email: vo.email,
        username: vo.username,
        error: registerError.message,
      })
    }

    const cookie = await userService.login(user.email, user.password)

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
