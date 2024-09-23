import { PageContainer, PageContainerProps } from "@ant-design/pro-components"
import { useModel } from "@sortinox/umi-max"
import { Spin } from "antd"
import React, { isValidElement } from "react"
import { useHotkeys } from "react-hotkeys-hook"
import useAntdMediaQuery from "use-media-antd-query"
import styles from "./page.css"

export interface ExtendedPageContainerProps {
  pageTitle?: React.ReactNode | false
  pageSubTitle?: React.ReactNode | false
}

export type PageProps = PageContainerProps & ExtendedPageContainerProps

const Page: React.FC<PageProps> = (props) => {
  const { initialState, setInitialState } = useModel("@@initialState")

  const colSize = useAntdMediaQuery()
  const isMobile = colSize === "sm" || colSize === "xs"

  useHotkeys("shift+m", () => {
    console.log("Shift + M has been pressed.")
    setInitialState((preInitialState) => ({
      ...preInitialState,
      sidebarCollapsed: !preInitialState?.sidebarCollapsed,
    }))
    localStorage.setItem("sidebar-collapsed", String(!initialState?.sidebarCollapsed))
  })

  return (
    <>
      {props.loading && (
        <div className={styles.loadingContainer}>
          <div className={styles.loadingWrap}>
            <Spin size="large" className={isMobile ? styles.mobileSpin : styles.spin} />
          </div>
        </div>
      )}
      {!props.loading && (
        <PageContainer
          ghost
          header={{
            title: isValidElement(props.pageTitle) ? props.pageTitle : <div className="pb-[2px]">{props.pageTitle}</div>,
            subTitle: isValidElement(props.pageSubTitle) ? props.pageSubTitle : null,
            breadcrumb: {},
            style: { marginLeft: isMobile ? "0px" : "35px", paddingBottom: "8px" },
          }}
          fixedHeader
          affixProps={{
            offsetTop: 0,
          }}
          {...props}
        >
          {props.children}
        </PageContainer>
      )}
    </>
  )
}

export default Page
