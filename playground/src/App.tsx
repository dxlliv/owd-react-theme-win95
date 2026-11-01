import { useEffect, useRef } from 'react'
import { createDesktop, type Desktop } from '@owdproject/core'
import { DesktopShell } from '../../src'
import { demoMenu, registerDemoApplications } from './apps'

export function App() {
  const desktopRef = useRef<Desktop | null>(null)
  const welcomeLaunched = useRef(false)
  if (!desktopRef.current) {
    desktopRef.current = createDesktop({
      workspaces: ['workspace-1'],
      workarea: { x: 0, y: 0, width: 0, height: 0 },
    })
    registerDemoApplications(desktopRef.current)
  }
  const desktop = desktopRef.current

  // Launch through the engine.
  useEffect(() => {
    if (welcomeLaunched.current) return
    welcomeLaunched.current = true
    void desktop.applications.launch('about')
  }, [desktop])

  return <DesktopShell desktop={desktop} apps={demoMenu} watermark="React win95" />
}
