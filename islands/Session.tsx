import { useWsContext } from "./WsProvider.tsx"
import { useEffect } from "preact/hooks"

const Session = () => {
  const list = [1, 2, 3, 4, 5]
  const wsContext = useWsContext()

  const handleClick = () => {
    console.log(wsContext)
    wsContext.ws?.send({ type: "A", data: ["1"] })
  }

  useEffect(() => {
    const { ws } = wsContext
    if (!ws) {
      return
    }
    console.log(ws)
    ws.on("B", (data) => {
      console.log("B", data.data)
    })
    ws.on("B", (data) => {
      console.log("Bc", data.data)
    })
  }, [wsContext])

  return (
    <div className="list bg-base-100 rounded-box shadow-md">
      <button className="btn" onClick={handleClick}>Default</button>
      {list.map((item) => (
        <a href={`/app/${item}`} className={`list-row hover:bg-gray-100`}>
          <div>
            <img
              className="size-10 rounded-box"
              src={`https://img.daisyui.com/images/profile/demo/${item}@94.webp`}
            />
          </div>
          <div>
            <div>Dio Lupa</div>
            <div className="text-xs uppercase font-semibold opacity-60">
              Remaining Reason
            </div>
          </div>
        </a>
      ))}
    </div>
  )
}

export default Session
