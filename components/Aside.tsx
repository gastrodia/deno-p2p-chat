import { FunctionalComponent, JSX } from "preact"

type LayoutProps = {
  session?: JSX.Element
  profile?: JSX.Element
}

const Aside: FunctionalComponent<LayoutProps> = ({ profile, session }) => {
  return (
    <div className="bg-base-200 text-base-content h-full w-80 overflow-hidden flex flex-col">
      <div className="flex-1 overflow-y-auto p-4">
        {session}
      </div>
      {profile}
    </div>
  )
}

export default Aside
