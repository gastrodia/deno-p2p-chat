import deno from "@/deno.json" with { type: "json" }

const Home = () => {
  return (
    <>
      <label
        htmlFor="aside-drawer"
        className="btn btn-primary drawer-button lg:hidden"
      >
        会话列表
      </label>
      <pre>
        {JSON.stringify(deno, null, 2)}
      </pre>
    </>
  )
}

export default Home
