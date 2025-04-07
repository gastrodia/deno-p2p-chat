export default function Register() {
  return (
    <div className="w-screen h-screen flex items-center justify-center bg-base-200">
      <div className="card bg-base-100 w-full max-w-sm shrink-0 shadow-2xl">
        <div className="card-body">
          <fieldset className="fieldset">
            <form>
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
                <a className="link ml-4" href="/login">
                  Sign in
                </a>
              </p>
            </form>
          </fieldset>
        </div>
      </div>
    </div>
  );
}
