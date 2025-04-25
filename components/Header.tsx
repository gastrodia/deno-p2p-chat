import { FunctionComponent, JSX } from "preact"
import { MenuIcon } from "@/components/Icons.tsx"
const Header: FunctionComponent<{
  right?: JSX.Element
}> = (props) => {
  const { children, right } = props
  return (
    <header className="flex items-center justify-between p-4 bg-base-100 border-b">
      <div>
        <label
          htmlFor="aside-drawer"
          className="btn btn-square btn-ghost drawer-button lg:hidden"
        >
          <MenuIcon />
        </label>
      </div>
      <div className="flex-1">
        {children}
      </div>
      <div>
        {right}
      </div>
    </header>
  )
}
export default Header
