import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import type { Desktop } from '@owdproject/core'
import { useWindowManager } from '@owdproject/react'
import { React95Provider } from '@owdproject/react-kit-react95'
import { DesktopRuntimeContext } from './desktop-context'
import { DesktopWindow } from './components/DesktopWindow'
import { SystemBar } from './components/SystemBar'
import { StartMenuPanel } from './components/StartMenuPanel'
import { registerDesktopApps } from './applications'
import type { DesktopApp } from './types'

const SYSTEMBAR_HEIGHT = 28
const EMPTY_APPS: DesktopApp[] = []

export interface DesktopShellProps {
  /** A `@owdproject/core` Desktop instance. */
  desktop: Desktop
  /** Menu entries; components/configs register with the engine on mount. */
  apps?: DesktopApp[]
  /** Centered desktop watermark text. */
  watermark?: ReactNode
}

/**
 * Root Windows 95 desktop shell for React.
 * Composes `@owdproject/react-kit-react95` chrome with `@owdproject/react` hooks
 * and the headless `@owdproject/core` engine.
 */
export function DesktopShell({ desktop, apps = EMPTY_APPS, watermark = 'Open Web Desktop' }: DesktopShellProps) {
  const rootRef = useRef<HTMLDivElement>(null)
  const [startOpen, setStartOpen] = useState(false)
  const { windows } = useWindowManager(desktop.windows)

  useEffect(() => {
    registerDesktopApps(desktop, apps)
  }, [desktop, apps])

  const getWorkarea = useCallback(() => {
    const el = rootRef.current
    const width = el?.clientWidth ?? (typeof window !== 'undefined' ? window.innerWidth : 1024)
    const height = (el?.clientHeight ?? (typeof window !== 'undefined' ? window.innerHeight : 768)) - SYSTEMBAR_HEIGHT
    return { x: 0, y: 0, width, height }
  }, [])

  useEffect(() => {
    const sync = () => desktop.workspaces.setWorkarea(getWorkarea())
    sync()
    window.addEventListener('resize', sync)
    return () => window.removeEventListener('resize', sync)
  }, [desktop, getWorkarea])

  const runtime = useMemo(() => ({ desktop, getWorkarea }), [desktop, getWorkarea])

  const launch = (app: DesktopApp) => {
    void desktop.applications.launch(app.id, app.entryKey, app.argument)
    setStartOpen(false)
  }

  const activeWindows = windows.filter((win) => win.state.active !== false)
  const appById = new Map(apps.map((app) => [app.id, app]))

  return (
    <DesktopRuntimeContext.Provider value={runtime}>
      <React95Provider>
        <div ref={rootRef} className="owd-shell" onPointerDown={() => setStartOpen(false)}>
          <div className="owd-shell__desktop r95-owd-desktop">
            {watermark ? <div className="owd-shell__watermark">{watermark}</div> : null}
            {activeWindows.map((win) => (
              <DesktopWindow key={win.id} window={win} app={appById.get(win.applicationId ?? '')} />
            ))}
          </div>

          {startOpen ? (
            <div className="owd-shell__startmenu" onPointerDown={(event) => event.stopPropagation()}>
              <StartMenuPanel apps={apps} onLaunch={launch} />
            </div>
          ) : null}

          <SystemBar apps={apps} startActive={startOpen} onStartClick={() => setStartOpen((open) => !open)} />
        </div>
      </React95Provider>
    </DesktopRuntimeContext.Provider>
  )
}
