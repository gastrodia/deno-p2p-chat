import { Handlers, PageProps } from "$fresh/server.ts";

interface LoginForm {
  email?: string;
  password?: string;
  error?: string;
}

export default function Login(props: PageProps<LoginForm>) {
  const { data } = props;
  return (
    <div className="w-screen h-screen flex items-center justify-center bg-base-200">
      <div className="card bg-base-100 w-full max-w-sm shrink-0 shadow-2xl">
        <div className="card-body">
          <fieldset className="fieldset">
            {data?.error
              ? (
                <div role="alert" className="alert">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    className="stroke-info h-6 w-6 shrink-0"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    >
                    </path>
                  </svg>
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
                <p className="validator-hint">Required</p>
              </div>

              <button className="btn btn-neutral" type="submit">Sign in</button>

              <p class="mt-4">
                No account?
                <a className="link ml-4" href="/register">
                  Create an account
                </a>
              </p>
            </form>
          </fieldset>
        </div>
      </div>
    </div>
  );
}

export const handler: Handlers<LoginForm> = {
  async POST(req, ctx) {
    const form = await req.formData();
    const email = form.get("email")?.toString();
    // return ctx.render({
    //   error: "邮箱和密码不能为空",
    //   email, // 回填已输入邮箱
    // });
    // 服务端验证逻辑
    const url = new URL(req.url);
    const redirectTo = url.searchParams.get("redirect") || "/";
    return new Response("", {
      status: 302,
      headers: {
        Location: redirectTo,
        "Set-Cookie": `token=${email}; Path=/; HttpOnly; Secure; SameSite=Lax`,
      },
    });
  },
};
