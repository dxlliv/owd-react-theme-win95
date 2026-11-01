/**
 * @owdproject/react-theme-win95
 * Windows 95 Open Web Desktop theme for React.
 *
 * Built on the headless `@owdproject/core` engine, the `@owdproject/react`
 * hooks and the `@owdproject/react-kit-react95` visual primitives.
 */

export { DesktopShell, type DesktopShellProps } from './DesktopShell'
export { DesktopWindow, type DesktopWindowProps } from './components/DesktopWindow'
export { SystemBar, type SystemBarProps } from './components/SystemBar'
export { StartMenuPanel, type StartMenuPanelProps } from './components/StartMenuPanel'
export { useDesktopRuntime, DesktopRuntimeContext, type DesktopRuntime } from './desktop-context'
export type { DesktopApp, DesktopAppRenderProps } from './types'

// Re-export the kit primitives so consumers get one entry point.
export * from '@owdproject/react-kit-react95'
