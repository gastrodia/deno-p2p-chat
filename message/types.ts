export type EventMapKey = "A" | "B"

type MapTo<
  T extends string,
  U extends Record<
    T,
    unknown
  >,
> = {
  [K in T]: {
    type: K
    data: U[K]
  }
}

export type EventMap = MapTo<
  EventMapKey,
  {
    A: string[]
    B: string
  }
>
