import Layout from "../components/Layout.tsx";
import Chat from "../components/Chat.tsx";
import Aside from "../components/Aside.tsx";
import Profile from "../components/Profile.tsx";
import Session from "../islands/Session.tsx";
import { PageProps } from "$fresh/server.ts";
import { AppState } from "./_middleware.ts";

export default function Home({ state }: PageProps<null, AppState>) {
  const user = state.user;

  return (
    <Layout
      aside={
        <Aside
          session={<Session />}
          profile={<Profile {...user} />}
        />
      }
    >
      <label
        htmlFor="aside-drawer"
        className="btn btn-primary drawer-button lg:hidden"
      >
        会话列表
      </label>
      <Chat />
    </Layout>
  );
}
