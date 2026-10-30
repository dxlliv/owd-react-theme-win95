import { useEffect, useRef } from 'react'
import { createDesktop, type Desktop } from '@owdproject/core'
import { DesktopShell } from '../../src'

export function App() {
  const desktopRef = useRef<Desktop | null>(null)
  if (!desktopRef.current) {
    desktopRef.current = createDesktop({
      workspaces: ['workspace-1'],
      workarea: { x: 0, y: 0, width: 0, height: 0 },
    })
  }
  const desktop = desktopRef.current

  // Open a welcome window on first mount.
  useEffect(() => {
    desktop.windows.createWindow({
      id: 'about-welcome',
      model: 'about',
      applicationId: 'about',
      config: {
        title: 'About Open Web Desktop',
        size: { width: 380, height: 240 },
        position: { x: 72, y: 56 },
      },
    })
  }, [desktop])

  return <DesktopShell desktop={desktop} watermark="React win95" />
}
