import { createContext, useContext } from 'react'
import type { Desktop, DesktopWorkareaRect } from '@owdproject/core'

export interface DesktopRuntime {
  desktop: Desktop
  /** Current usable desktop area (excluding the system bar), in shell coordinates. */
  getWorkarea: () => DesktopWorkareaRect
}

export const DesktopRuntimeContext = createContext<DesktopRuntime | null>(null)

export function useDesktopRuntime(): DesktopRuntime {
  const runtime = useContext(DesktopRuntimeContext)
  if (!runtime) {
    throw new Error('[owd-react-theme-win95] useDesktopRuntime() must be used inside <DesktopShell>.')
  }
  return runtime
}
