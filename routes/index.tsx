import Layout from "../components/Layout.tsx";
import Chat from "../components/Chat.tsx";
import Aside from "../components/Aside.tsx";
import Profile from "../components/Profile.tsx";
import Session from "../islands/Session.tsx";

export default function Home() {
  return (
    <Layout
      aside={
        <Aside
          session={<Session />}
          profile={<Profile />}
        />
      }
    >
      <label htmlFor="aside-drawer" className="btn btn-primary drawer-button lg:hidden">
        会话列表
      </label>
      <Chat />
    </Layout>
  );
}
