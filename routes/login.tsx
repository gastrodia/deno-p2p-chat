import { Handlers } from "$fresh/server.ts";

export default function Login() {
  return (
    <div className="w-screen h-screen flex items-center justify-center bg-base-200">
      <div className="card bg-base-100 w-full max-w-sm shrink-0 shadow-2xl">
        <div className="card-body">
          <fieldset className="fieldset">
            <form method="POST">
              <div>
                <label className="fieldset-label">Email</label>
                <input
                  type="email"
                  className="input validator"
                  placeholder="Email"
                  required
                  name="email"
                />
                <p className="validator-hint">Required</p>
              </div>

              <div>
                <label className="fieldset-label">Password</label>
                <input
                  type="password"
                  className="input validator"
                  placeholder="Password"
                  required
                  name="password"
                />
                <p className="validator-hint">Required</p>
              </div>
              <button className="btn btn-neutral" type="submit">Sign in</button>

              <p class="mt-4">
                No account?
                <a className="link link-hover" href="/register">
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

export const handler: Handlers = {
  async POST(req) {
    const form = await req.formData();
    const email = form.get("email")?.toString();
    console.log(email)
    // 服务端验证逻辑
    // if (invalid) return ctx.render({ error: "Invalid credentials" });
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
