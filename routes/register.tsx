export default function Register() {
  return (
    <div className="hero bg-base-200 min-h-screen">
      <div className="hero-content flex-col lg:flex-row-reverse">
        <div className="text-left text-nowrap">
          <h1 className="text-5xl font-bold">Sign up now!</h1>
          <ul className="list-disc p-6">
            <li className="">Powered by Deno</li>
            <li className="">Made with Fresh</li>
            <li className="">Deploy in Deno Deploy</li>
            <li className="">Desgin by Daisyui</li>
            <li className="">PeerJS for WebRTC</li>
          </ul>
        </div>
        <div className="card bg-base-100 w-full max-w-sm shrink-0 shadow-2xl">
          <div className="card-body">
            <fieldset className="fieldset">
              <form >
                <div>
                  <label className="fieldset-label">Username</label>
                  <input
                    type="input"
                    className="input validator"
                    placeholder="Username"
                    required
                  />
                  <p className="validator-hint">Required</p>
                </div>
                <div>
                  <label className="fieldset-label">Email</label>
                  <input
                    type="email"
                    className="input validator"
                    placeholder="Email"
                    required
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
                  />
                  <p className="validator-hint">Required</p>
                </div>
                <button className="btn btn-neutral" type="submit">
                  Sign up
                </button>

                <p class="mt-4">
                  Already have an account?
                  <a className="link link-hover" href="/login">
                    Sign in
                  </a>
                </p>
              </form>
            </fieldset>
          </div>
        </div>
      </div>
    </div>
  );
}
