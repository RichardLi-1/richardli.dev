import { useState, useEffect } from "react"

export function useIsPanel() {
    const [isPanel, setIsPanel] = useState(false)
    useEffect(() => { setIsPanel(window.location.search.includes("panel=1")) }, [])
    return isPanel
}

