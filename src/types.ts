import type { ComponentType, ReactElement } from 'react'
import type { Desktop, WindowInstance } from '@owdproject/core'

/** Props passed to every application window component. */
export interface DesktopAppRenderProps {
  window: WindowInstance
  desktop: Desktop
}

/** A React application that can be launched from the start menu / task bar. */
export interface DesktopApp {
  id: string
  title: string
  /** React95 icon used in the start menu, window title bar and task bar. */
  icon?: ReactElement
  defaultSize?: { width: number; height: number }
  component: ComponentType<DesktopAppRenderProps>
}
