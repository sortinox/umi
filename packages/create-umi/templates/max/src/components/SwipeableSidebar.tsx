import { useModel } from "@sortinox/umi-max"
import React, { PropsWithChildren } from "react"
import { SwipeEventData, useSwipeable } from "react-swipeable"

const SwipeableSidebar: React.FC<PropsWithChildren> = ({ children }) => {
  const { setInitialState } = useModel("@@initialState")

  const swipeHandlers = useSwipeable({
    onSwipedLeft: (eventData: SwipeEventData) => {
      console.log("User swiped left!", eventData)
      setInitialState((preInitialState) => ({
        ...preInitialState,
        sidebarCollapsed: true,
      }))
    },
  })

  return (
    <div {...swipeHandlers} style={{ width: "100%", height: "100vh" }}>
      {children}
    </div>
  )
}

export default SwipeableSidebar
