import * as React from "react"

const MOBILE_BREAKPOINT = 768 // px cutoff for mobile

export function useIsMobile() {
  // track if screen is small
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    // media query for when window < mobile breakpoint
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)

    // handler that updates state when screen size changes
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }

    // listen for changes
    mql.addEventListener("change", onChange)

    // also run it once on mount
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)

    // cleanup listener on unmount
    return () => mql.removeEventListener("change", onChange)
  }, [])

  // force boolean (undefined → false)
  return !!isMobile
}
