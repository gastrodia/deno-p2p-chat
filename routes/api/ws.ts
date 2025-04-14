import { Handlers } from "$fresh/server.ts";

export const handler: Handlers = {
  GET(req) {
    const url = new URL(req.url);
    const from = url.searchParams.get("id");
    const { socket, response } = Deno.upgradeWebSocket(req);
    if (!from) {
      socket.close(1000, "no from");
      return response;
    }
    socket.onopen = () => {
      console.log("open1");
      socket.send(JSON.stringify({ type: "B", data: "emm" }));
    };
    socket.onclose = (e) => {
      console.log(e);
    };
    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log(data, 11);
    };
    return response;
  },
};
