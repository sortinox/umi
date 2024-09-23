import { MenuFoldOutlined, MenuUnfoldOutlined } from "@ant-design/icons"
import { RunTimeLayoutConfig, history } from "@sortinox/umi-max"
import SwipeableSidebar from "./components/SwipeableSidebar"

type AppState = {
  name: string
  loading?: boolean | undefined
  sidebarCollapsed?: boolean | undefined
}

// https://umijs.org/docs/api/runtime-config#getinitialstate
export async function getInitialState(): Promise<AppState> {
  const uncollapseSidebar = (await localStorage.getItem("sidebar-collapsed")) === "false"

  return {
    name: "@sortinox/umi-max",
    loading: false,
    sidebarCollapsed: uncollapseSidebar === null ? true : !uncollapseSidebar,
  }
}

export const layout: RunTimeLayoutConfig = ({ initialState, setInitialState }) => ({
  logo: "https://img.alicdn.com/tfs/TB1YHEpwUT1gK0jSZFhXXaAtVXa-28-27.svg",
  menu: {
    locale: false,
  },
  layout: "side",
  menuProps: {
    onClick: (e) => {
      history.push(e.key)
    },
  },
  menuRender: (props, defaultDom) => {
    // make sure we don't show nav menu while loading the app, this and headerRenderer are the 2 catch alls where
    // it's necessary to check loading status
    if (initialState?.loading) {
      return null
    } else {
      return defaultDom
    }
  },
  // used for desktop
  menuContentRender: (props, defaultDom) => {
    return <SwipeableSidebar>{defaultDom}</SwipeableSidebar>
  },
  // custom implementation to collapse sidebar after click if mobile menu is used. Also fixes findDOMNode warning in ProLayout
  menuItemRender: (item, defaultDom, menuProps) => {
    const collapseMenu = () => {
      document.body.style.position = ""
      document.body.style.overflow = "auto"

      setInitialState((preInitialState) => ({
        ...preInitialState,
        sidebarCollapsed: true,
      }))
      localStorage.setItem("sidebar-collapsed", "true")
    }

    if (menuProps.isMobile) {
      return <a onClick={() => collapseMenu()}>{defaultDom}</a>
    } else {
      return defaultDom
    }
  },
  collapsed: initialState?.sidebarCollapsed,
  collapsedButtonRender: (collapsed) => {
    const setCollapsed = (value: boolean | undefined) => {
      if (!value) {
        document.body.style.position = ""
        document.body.style.overflow = "auto"
      }
      setInitialState((preInitialState) => ({
        ...preInitialState,
        sidebarCollapsed: !value,
      }))
      localStorage.setItem("sidebar-collapsed", String(!value))
    }

    const ActionIcon = collapsed ? MenuUnfoldOutlined : MenuFoldOutlined

    return (
      <div className="absolute h-[40px] w-[40px] rounded-full bg-white" style={{ insetBlockStart: "7px", insetInlineEnd: "-50px" }}>
        <a onClick={() => setCollapsed(collapsed)}>
          <ActionIcon className="ml-[10px] mt-[10px] align-top text-[20px] text-black" />
        </a>
      </div>
    )
  },
  // only used for mobile layout
  headerRender: () => {
    const uncollapseSidebar = () => {
      document.body.style.position = "fixed"
      document.body.style.overflow = "none"

      setInitialState((preInitialState) => ({
        ...preInitialState,
        sidebarCollapsed: false,
      }))
      localStorage.setItem("sidebar-collapsed", "false")
    }

    // making sure we don't render mobile header nav while loading the app
    if (initialState?.loading) {
      return null
    } else {
      return (
        <div className="text-center" style={{ height: 56 }}>
          <a onClick={uncollapseSidebar} className="float-left">
            <MenuUnfoldOutlined className="ml-[15px] mt-[17px] align-top text-[20px] text-black" />
          </a>
          <a>
            <div
              className="ml-8 inline-block text-[16px] font-semibold"
              style={{ overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis", maxWidth: "230px" }}
            >
              {initialState?.name}
            </div>
          </a>
        </div>
      )
    }
  },
  rightContentRender: false,
})
