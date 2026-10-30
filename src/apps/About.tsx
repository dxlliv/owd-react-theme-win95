import { Computer } from '@react95/icons'
import { Button } from '@owdproject/react-kit-react95'
import type { DesktopAppRenderProps } from '../types'

export function AboutApp({ window, desktop }: DesktopAppRenderProps) {
  return (
    <div className="owd-about">
      <div className="owd-about__banner">
        <Computer variant="32x32_4" />
        <div>
          <strong>Open Web Desktop</strong>
          <div className="owd-about__small">React theme — win95 (React95)</div>
        </div>
      </div>
      <hr className="owd-about__divider" />
      <p className="owd-about__text">
        Running on <code>@owdproject/core</code> + <code>@owdproject/react</code> +{' '}
        <code>@react95/core</code>
        <br />
        Window <code>{window.id}</code> · model <code>{window.model}</code>
      </p>
      <div className="owd-about__actions">
        <Button onClick={() => desktop.windows.closeWindow(window.id)}>OK</Button>
      </div>
    </div>
  )
}
