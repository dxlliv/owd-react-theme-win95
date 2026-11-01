import type { ComponentType, ReactElement } from 'react'
import type { ReactApplicationConfig, ReactApplicationWindowProps } from '@owdproject/react'

/** Props passed to every application window component. */
export type DesktopAppRenderProps = ReactApplicationWindowProps

/** A React application that can be launched from the start menu / task bar. */
export interface DesktopApp {
  id: string
  title: string
  /** React95 icon used in the start menu, window title bar and task bar. */
  icon?: ReactElement
  defaultSize?: { width: number; height: number }
  /** Optional shorthand for a single `main` window. Registered apps need no component here. */
  component?: ComponentType<DesktopAppRenderProps>
  /** Engine options, including entries, models, singleton and lifecycle callbacks. */
  config?: Omit<ReactApplicationConfig, 'id' | 'title' | 'entries'> & {
    entries?: ReactApplicationConfig['entries']
  }
  entryKey?: string
  argument?: string
}
