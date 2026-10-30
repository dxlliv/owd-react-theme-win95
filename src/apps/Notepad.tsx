import { useState } from 'react'
import type { DesktopAppRenderProps } from '../types'

export function NotepadApp(_props: DesktopAppRenderProps) {
  const [text, setText] = useState(
    'Hello from a React window.\r\n\r\nDrag the title bar to move me, or grab an edge to resize.',
  )
  return (
    <div className="owd-notepad">
      <div className="owd-notepad__menu">
        <span>File</span>
        <span>Edit</span>
        <span>Search</span>
        <span>Help</span>
      </div>
      <textarea
        className="owd-notepad__area"
        value={text}
        spellCheck={false}
        onChange={(event) => setText(event.target.value)}
      />
    </div>
  )
}
