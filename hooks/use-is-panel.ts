import { useState, useEffect } from "react"

// Detects whether the current page is being rendered inside the split-pane
// Split-pane parent embeds the project page with `?panel=1` on the iframe src;
// which lets child pages hide elements like the footer that look wrong in a panel.
//
// Why useState + useEffect instead of reading the URL directly?
// `window` doesn't exist during server-side rendering, so we must defer the
// read to a useEffect (which only runs in the browser).
export function useIsPanel() {
    const [isPanel, setIsPanel] = useState(false)
    useEffect(() => { setIsPanel(window.location.search.includes("panel=1")) }, [])
    return isPanel
}

