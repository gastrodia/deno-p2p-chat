import { FunctionalComponent, JSX } from "preact";

type LayoutProps = {
  aside?: JSX.Element;
};

const Layout: FunctionalComponent<LayoutProps> = ({ children, aside }) => {
  return (
    <div className="drawer lg:drawer-open">
      <input id="aside-drawer" type="checkbox" className="drawer-toggle" />
      <div className="drawer-content">
        {children}
      </div>
      <div className="drawer-side">
        <label
          htmlFor="aside-drawer"
          aria-label="close sidebar"
          className="drawer-overlay"
        >
        </label>
        {aside}
      </div>
    </div>
  );
};

export default Layout;
