import { PageProps } from "$fresh/server.ts"
import { AppState } from "@/routes/_middleware.ts"
import Aside from "@/components/Aside.tsx"
import Profile from "@/components/Profile.tsx"
import Session from "@/islands/Session.tsx"
import WsProvider from "@/islands/WsProvider.tsx"

const Layout = ({ state, params, Component }: PageProps<null, AppState>) => {
  const user = state.user
  return (
    <WsProvider from={user.id} to={params.id}>
      <div className="drawer lg:drawer-open">
        <input id="aside-drawer" type="checkbox" className="drawer-toggle" />
        <div className="drawer-content">
          <Component />
        </div>
        <div className="drawer-side">
          <label
            htmlFor="aside-drawer"
            aria-label="close sidebar"
            className="drawer-overlay"
          >
          </label>
          <Aside session={<Session />} profile={<Profile {...user} />} />
        </div>
      </div>
    </WsProvider>
  )
}

export default Layout
