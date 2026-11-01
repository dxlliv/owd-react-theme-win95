import type { Desktop } from '@owdproject/core'
import { registerReactApplication } from '@owdproject/react'
import type { DesktopApp } from './types'

/** Register shorthand apps once. Existing registrations remain owned by the consumer. */
export function registerDesktopApps(desktop: Desktop, apps: readonly DesktopApp[]): void {
  for (const app of apps) {
    if (desktop.applications.get(app.id) || (!app.component && !app.config)) continue
    const { entries = {}, ...config } = app.config ?? {}
    registerReactApplication(desktop, {
      ...config,
      id: app.id,
      title: app.title,
      entries,
      windows: config.windows ?? (app.component ? {
        main: {
          title: app.title,
          size: app.defaultSize ?? { width: 480, height: 340 },
          position: { x: 48, y: 40 },
          component: app.component,
        },
      } : undefined),
    })
  }
}
