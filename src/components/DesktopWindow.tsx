import { useReducer, useRef, type CSSProperties } from 'react'
import type { ResizeDirection, WindowBounds, WindowInstance, WindowState } from '@owdproject/core'
import { useDesktopDrag, useDesktopResize, useWindowInstance } from '@owdproject/react'
import { OwdWindow } from '@owdproject/react-kit-react95'
import { useDesktopRuntime } from '../desktop-context'
import type { DesktopApp } from '../types'

const FALLBACK_SIZE = { width: 480, height: 340 }

function readBounds(state: WindowState, fallback: { width: number; height: number }): WindowBounds {
  const pos = state.position ?? {}
  const size = state.size ?? {}
  return {
    x: pos.x ?? 0,
    y: pos.y ?? 0,
    width: typeof size.width === 'number' ? size.width : fallback.width,
    height: typeof size.height === 'number' ? size.height : fallback.height,
  }
}

export interface DesktopWindowProps {
  window: WindowInstance
  app?: DesktopApp
}

/**
 * A single desktop window: reads live state from `@owdproject/react`'s
 * `useWindowInstance`, drives move/resize through `@owdproject/core`'s pointer
 * sessions (`useDesktopDrag` / `useDesktopResize`) and renders React95 window
 * chrome via the kit's `OwdWindow`.
 *
 * While dragging, geometry is kept in local state for smoothness and committed
 * back to the core engine on release.
 */
export function DesktopWindow({ window: instance, app }: DesktopWindowProps) {
  const { desktop, getWorkarea } = useDesktopRuntime()
  const { state } = useWindowInstance(instance)
  const fallback = app?.defaultSize ?? FALLBACK_SIZE

  const liveBounds = useRef<WindowBounds | null>(null)
  const [, forceRender] = useReducer((n: number) => n + 1, 0)

  const commit = (bounds: WindowBounds) => {
    liveBounds.current = null
    instance.setPosition({ x: bounds.x, y: bounds.y })
    instance.setSize({ width: bounds.width, height: bounds.height })
    forceRender()
  }

  const { startDrag } = useDesktopDrag({
    getBounds: () => readBounds(instance.getSnapshot(), fallback),
    getWorkarea,
    onMove: (bounds) => {
      liveBounds.current = bounds
      forceRender()
    },
    onEnd: commit,
    onCancel: () => {
      liveBounds.current = null
      forceRender()
    },
  })

  const { startResize } = useDesktopResize({
    getBounds: () => readBounds(instance.getSnapshot(), fallback),
    minWidth: 180,
    minHeight: 120,
    onMove: (bounds) => {
      liveBounds.current = bounds
      forceRender()
    },
    onEnd: commit,
    onCancel: () => {
      liveBounds.current = null
      forceRender()
    },
  })

  const bounds = liveBounds.current ?? readBounds(state, fallback)
  const maximized = state.maximized === true

  const style: CSSProperties = {
    left: bounds.x,
    top: bounds.y,
    width: bounds.width,
    height: bounds.height,
    zIndex: state.position?.z ?? 0,
  }

  const focus = () => desktop.windows.focusWindow(instance.id)
  const AppComponent = app?.component

  return (
    <OwdWindow
      title={app?.title ?? instance.config.title ?? instance.id}
      icon={app?.icon}
      active={state.focused}
      maximized={maximized}
      resizable={state.resizable !== false}
      minimizable={state.minimizable !== false}
      maximizable={state.maximizable !== false}
      closable={state.destroyable !== false}
      style={style}
      onPointerDownCapture={focus}
      onTitlePointerDown={(event) => {
        if (event.button !== 0) return
        focus()
        startDrag(event.nativeEvent)
      }}
      onTitleDoubleClick={() => {
        if (state.maximizable === false) return
        instance.setLayout(maximized ? 'normal' : 'maximize', getWorkarea())
      }}
      onResizePointerDown={(event, direction) => {
        if (event.button !== 0) return
        focus()
        startResize(event.nativeEvent, direction as ResizeDirection)
      }}
      onClose={() => desktop.windows.closeWindow(instance.id)}
      onMinimize={() => instance.minimize()}
      onToggleMaximize={() => {
        if (state.maximizable === false) return
        instance.setLayout(maximized ? 'normal' : 'maximize', getWorkarea())
      }}
    >
      {AppComponent ? (
        <AppComponent window={instance} desktop={desktop} />
      ) : (
        <div className="owd-window__empty">No component registered for “{instance.model}”.</div>
      )}
    </OwdWindow>
  )
}
