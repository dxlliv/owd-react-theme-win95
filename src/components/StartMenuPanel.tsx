import { PowerOff } from '@react95/icons'
import { List } from '@owdproject/react-kit-react95'
import type { DesktopApp } from '../types'

export interface StartMenuPanelProps {
  apps: DesktopApp[]
  onLaunch: (app: DesktopApp) => void
}

/** Start menu built with React95 `List` + `List.Item`. */
export function StartMenuPanel({ apps, onLaunch }: StartMenuPanelProps) {
  return (
    <div className="owd-startmenu">
      <div className="owd-startmenu__rail">
        <span>
          Open Web <strong>Desktop</strong>
        </span>
      </div>
      <List className="owd-startmenu__list">
        {apps.map((app) => (
          <List.Item key={app.id} icon={app.icon} onClick={() => onLaunch(app)}>
            {app.title}
          </List.Item>
        ))}
        <List.Divider />
        <List.Item icon={<PowerOff variant="16x16_4" />} disabled>
          Shut Down…
        </List.Item>
      </List>
    </div>
  )
}
