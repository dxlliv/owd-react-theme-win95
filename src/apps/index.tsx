import type { DesktopApp } from '../types'
import { InfoBubble, Notepad } from '@react95/icons'
import { AboutApp } from './About'
import { NotepadApp } from './Notepad'

/** Built-in apps shipped with the win95 React theme. */
export const builtinApps: DesktopApp[] = [
  {
    id: 'about',
    title: 'About Open Web Desktop',
    icon: <InfoBubble variant="32x32_4" />,
    defaultSize: { width: 380, height: 240 },
    component: AboutApp,
  },
  {
    id: 'notepad',
    title: 'Untitled - Notepad',
    icon: <Notepad variant="16x16_4" />,
    defaultSize: { width: 480, height: 340 },
    component: NotepadApp,
  },
]

export { AboutApp, NotepadApp }
