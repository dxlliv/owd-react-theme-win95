import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import type { Desktop } from '@owdproject/core'
import { useWindowManager } from '@owdproject/react'
import { React95Provider } from '@owdproject/react-kit-react95'
import { DesktopRuntimeContext } from './desktop-context'
import { DesktopWindow } from './components/DesktopWindow'
import { SystemBar } from './components/SystemBar'
import { StartMenuPanel } from './components/StartMenuPanel'
import { builtinApps } from './apps'
import type { DesktopApp } from './types'

const SYSTEMBAR_HEIGHT = 28

export interface DesktopShellProps {
  /** A `@owdproject/core` Desktop instance. */
  desktop: Desktop
  /** Applications exposed in the start menu / task bar. */
  apps?: DesktopApp[]
  /** Centered desktop watermark text. */
  watermark?: ReactNode
}

/**
 * Root Windows 95 desktop shell for React.
 * Composes `@owdproject/react-kit-react95` chrome with `@owdproject/react` hooks
 * and the headless `@owdproject/core` engine.
 */
export function DesktopShell({ desktop, apps = builtinApps, watermark = 'Open Web Desktop' }: DesktopShellProps) {
  const rootRef = useRef<HTMLDivElement>(null)
  const [startOpen, setStartOpen] = useState(false)
  const idRef = useRef(0)
  const { windows } = useWindowManager(desktop.windows)

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
    idRef.current += 1
    const count = windows.length
    const size = app.defaultSize ?? { width: 480, height: 340 }
    desktop.windows.createWindow({
      id: `${app.id}-${idRef.current}`,
      model: app.id,
      applicationId: app.id,
      config: {
        title: app.title,
        size,
        position: { x: 48 + (count % 7) * 26, y: 40 + (count % 7) * 26 },
      },
    })
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
              <DesktopWindow key={win.id} window={win} app={appById.get(win.model)} />
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
