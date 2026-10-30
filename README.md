# @owdproject/react-theme-win95

Windows 95 theme for **Open Web Desktop**, built with **React** and
[React95](https://react95.io).

- **Engine**: [`@owdproject/core`](https://github.com/owdproject/core) — headless windows/apps/workspaces.
- **Bridges**: [`@owdproject/react`](https://github.com/owdproject/core) — `useSyncExternalStore` hooks.
- **UI**: [`@owdproject/react-kit-react95`](../owd-kit-react95) — [React95](https://react95.io) `@react95/core` integration.

This is a **minimal vertical slice**: a working desktop shell (background, draggable/resizable
React95 windows, task bar, start menu) plus two demo apps. It proves the whole React chain works
end-to-end on top of the OWD engine.

## Run it

```bash
# from the repo root (client/)
pnpm install
pnpm --filter @owdproject/react-theme-win95 dev
# open http://localhost:5173
```

## Use it

```tsx
import { createDesktop } from '@owdproject/core'
import { DesktopShell } from '@owdproject/react-theme-win95'
import '@owdproject/react-kit-react95/styles.css'
import '@owdproject/react-theme-win95/styles.css'

const desktop = createDesktop()

export default function App() {
  return <DesktopShell desktop={desktop} watermark="React win95" />
}
```

### Custom apps

```tsx
import type { DesktopApp } from '@owdproject/react-theme-win95'
import { Notepad } from '@react95/icons'

const apps: DesktopApp[] = [
  {
    id: 'hello',
    title: 'Hello',
    icon: <Notepad variant="16x16_4" />,
    defaultSize: { width: 420, height: 300 },
    component: ({ window, desktop }) => (
      <div style={{ padding: 8 }}>
        <p>Window {window.id}</p>
        <button onClick={() => desktop.windows.closeWindow(window.id)}>Close</button>
      </div>
    ),
  },
]
```

## Architecture

| File | Role |
| --- | --- |
| `src/DesktopShell.tsx` | Root shell: workarea, background, windows, start menu, task bar. |
| `src/components/DesktopWindow.tsx` | One window. Reads state from `useWindowInstance`, moves/resizes via `useDesktopDrag` / `useDesktopResize`. Commits geometry back to the core on release. |
| `src/components/SystemBar.tsx` | Task bar (React95 `Frame` + `Button`), driven by `useWindowManager`. |
| `src/components/StartMenuPanel.tsx` | Start menu (React95 `List`). |
| `src/apps/*` | Demo apps (`About`, `Notepad`). |
| `src/theme.css` | Layout + app styles (visual primitives come from the kit). |
| `playground/` | Vite + React playground app. |

`@owdproject/core` is the single source of truth for window geometry and focus; React95 only
renders the chrome, and `@owdproject/react` bridges the immutable core snapshots to React.

> ℹ️ The playground Vite config includes a `build.rollupOptions.treeshake.moduleSideEffects`
> rule for `@react95/*` (they ship no `sideEffects: false`), otherwise all 1000+ React95 icons
> get bundled. Copy it into your own app's Vite config.

## License

MIT
