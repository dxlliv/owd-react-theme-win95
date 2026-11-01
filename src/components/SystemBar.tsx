import { useEffect, useState } from 'react'
import { Logo } from '@react95/icons'
import { Button, Frame } from '@owdproject/react-kit-react95'
import { useWindowManager } from '@owdproject/react'
import { useDesktopRuntime } from '../desktop-context'
import type { DesktopApp } from '../types'

function useClock() {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 10_000)
    return () => clearInterval(id)
  }, [])
  return now
}

export interface SystemBarProps {
  apps: DesktopApp[]
  onStartClick: () => void
  startActive: boolean
}

/**
 * Bottom system bar built from React95 `Frame` + `Button` primitives.
 * Unlike React95's own `TaskBar`, it is driven by the OWD window manager
 * (`useWindowManager`), so it lists real `@owdproject/core` windows.
 */
export function SystemBar({ apps, onStartClick, startActive }: SystemBarProps) {
  const { desktop } = useDesktopRuntime()
  const { windows, focused } = useWindowManager(desktop.windows)
  const now = useClock()

  const appById = new Map(apps.map((app) => [app.id, app]))
  const clock = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

  return (
    <Frame className="owd-taskbar">
      <Button
        className={`owd-taskbar__start${startActive ? ' is-active' : ''}`}
        onClick={onStartClick}
        aria-pressed={startActive}
      >
        <Logo variant="16x16_4" />
        <span className="owd-taskbar__start-label">Start</span>
      </Button>

      <Frame className="owd-taskbar__tasks">
        {windows.map((win) => {
          const app = appById.get(win.applicationId ?? '')
          const title = win.config.title ?? app?.title ?? win.id
          const isActive = focused?.id === win.id
          return (
            <Button
              key={win.id}
              className={`owd-task${isActive ? ' is-active' : ''}`}
              title={title}
              onClick={() => {
                if (win.state.active === false) win.unminimize()
                desktop.windows.focusWindow(win.id)
              }}
            >
              <span className="owd-task__label">{title}</span>
            </Button>
          )
        })}
      </Frame>

      <Frame className="owd-taskbar__tray">
        <span className="owd-taskbar__clock">{clock}</span>
      </Frame>
    </Frame>
  )
}
