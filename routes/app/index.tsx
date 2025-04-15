import AvatarUpload from "@/islands/AvatarUpload.tsx"
import { Handlers, PageProps } from "$fresh/server.ts"
import { AppState } from "../_middleware.ts"
import { z } from "zod"
import { UserDB } from "@/db/user.ts"
import promiseToResult from "@/utils/promiseToResult.ts"
import deno from "@/deno.json" with { type: "json" }
import {ExclamationIcon} from "@/components/Icons.tsx";
import Header from "@/components/Header.tsx"
import { useMemo } from "preact/hooks"

interface UpdateUserForm {
  username?: string
  avatar?: string
  error?: string
}

const UpdateUserSchema = z.object({
  username: z.string().min(2, "Username Minimum 2 characters").max(
    8,
    "Username Maximum 8 characters",
  ),
  avatar: z.string(),
})

const Home = (props: PageProps<UpdateUserForm, AppState>) => {
  const { data } = props
  const about = useMemo(() => JSON.stringify(deno, null, 2), [deno])
  return (
    <div>
      <Header>
        <h1 className="text-xl font-bold">Deno P2P Chat</h1>
      </Header>
      <div className="w-80 p-4">
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
              <label className="fieldset-label">Avatar</label>
              <AvatarUpload
                name="avatar"
                required
                initialPreview={data.avatar}
              />
            </div>

            <div className="mt-4">
              <label className="fieldset-label">Username</label>
              <input
                type="input"
                className="input validator"
                placeholder="Username"
                name="username"
                value={data.username}
                required
              />
              <p className="validator-hint">Save</p>
            </div>
            <button className="btn" type="submit">
              Update Profile
            </button>
          </form>
        </fieldset>
      </div>
      <div
        className="collapse collapse-arrow bg-base-100 border-base-300 border"
      >
        <input type="checkbox" />
        <div className="collapse-title font-semibold">ABOUT ?</div>
        <div className="collapse-content text-sm w-full overflow-x-auto">
          <pre>
            {about}
          </pre>
        </div>
      </div>
    </div>
  )
}

export default Home

export const handler: Handlers<UpdateUserForm, AppState> = {
  GET(_, ctx) {
    console.log(ctx.state.user)
    const { username, avatar } = ctx.state.user
    return ctx.render({
      username,
      avatar,
    })
  },
  async POST(req, ctx) {
    const formData = await req.formData()
    const vo: UpdateUserForm = Object.fromEntries(formData.entries())

    const valid = UpdateUserSchema.safeParse(vo)
    if (!valid.success) {
      return ctx.render({
        username: ctx.state.user.username,
        avatar: ctx.state.user.avatar,
        error: valid.error.issues.reduce(
          (c, p, i) => `${c}${i ? ";" : ""}${p.message}`,
          "",
        ),
      })
    }

    const userService = await UserDB.create()
    const { username, avatar } = valid.data
    const [error, ok] = await promiseToResult(
      userService.updateUserById(ctx.state.user.id, {
        username,
        avatar,
      }),
    )
    if (!ok) {
      return ctx.render({
        ...vo,
        error: error instanceof Error ? error.message : "Unknown error",
      })
    }
    ctx.state.user.avatar = avatar
    ctx.state.user.username = username

    return ctx.render({
      username,
      avatar,
    })
  },
}
