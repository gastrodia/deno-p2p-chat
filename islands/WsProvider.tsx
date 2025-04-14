import { createContext, FunctionComponent } from "preact";
import { useContext, useMemo } from "preact/hooks";
import { IS_BROWSER } from "$fresh/runtime.ts";
import { createWs, WsMessage } from "@/message/index.ts";

interface WsProviderProps {
  from: string;
  to?: string;
  ws?: WsMessage;
}

interface WsProviderContext extends WsProviderProps {
}

const Context = createContext<WsProviderContext | null>(null);

export const useWsContext = () => {
  const value = useContext(Context);
  if (!value) {
    throw new Error(
      "useWsContext must be used within a WsProvider",
    );
  }
  return value;
};

const WsProvider: FunctionComponent<
  WsProviderProps
> = (
  {
    children,
    from,
    to,
  },
) => {
  const value = useMemo<WsProviderContext>(
    () => {
      return {
        from,
        to,
        ws: IS_BROWSER ? createWs(`/api/ws?id=${from}`) : void 0,
      };
    },
    [from, to]
  );
  return (
    <Context.Provider value={value}>
      {children}
    </Context.Provider>
  );
};

export default WsProvider;
