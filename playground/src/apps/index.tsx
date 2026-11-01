import { InfoBubble, Notepad } from '@react95/icons'
import { registerReactApplication, type Desktop, type ReactApplicationConfig } from '@owdproject/react'
import type { DesktopApp } from '../../../src'
import { AboutApp } from './About'
import { NotepadApp } from './Notepad'

// Consumer-owned applications. They depend on the engine/adapter, not on a theme catalog.
export const demoApplications: ReactApplicationConfig[] = [
  {
    id: 'about',
    title: 'About Open Web Desktop',
    singleton: true,
    entries: {},
    windows: {
      main: {
        title: 'About Open Web Desktop',
        size: { width: 380, height: 240 },
        position: { x: 72, y: 56 },
        component: AboutApp,
      },
    },
  },
  {
    id: 'notepad',
    title: 'Notepad',
    entries: {},
    windows: {
      main: {
        title: 'Untitled - Notepad',
        size: { width: 480, height: 340 },
        position: { x: 120, y: 92 },
        component: NotepadApp,
      },
    },
  },
]

// The shell only needs presentation data for apps registered by the consumer.
export const demoMenu: DesktopApp[] = [
  { id: 'about', title: 'About Open Web Desktop', icon: <InfoBubble variant="32x32_4" /> },
  { id: 'notepad', title: 'Notepad', icon: <Notepad variant="16x16_4" /> },
]

export function registerDemoApplications(desktop: Desktop): void {
  for (const application of demoApplications) registerReactApplication(desktop, application)
}
