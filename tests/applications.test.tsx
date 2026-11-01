import { act, useEffect } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createDesktop, DesktopPointerSession, type Desktop } from '@owdproject/core'
import { registerReactApplication, type ReactApplicationWindowProps } from '@owdproject/react'
import { DesktopShell, type DesktopApp } from '../src'

// Chrome is irrelevant to this check: exercise the real shell, adapter and engine.
vi.mock('@owdproject/react-kit-react95', () => {
  const Frame = ({ children, ...props }: any) => <div {...props}>{children}</div>
  const Button = ({ children, ...props }: any) => <button {...props}>{children}</button>
  const List = Object.assign(Frame, { Item: Button, Divider: () => <hr /> })
  return {
    React95Provider: Frame,
    Frame,
    Button,
    List,
    OwdWindow: ({ title, children, onClose, onTitlePointerDown }: any) => (
      <section aria-label={title}>
        <div onPointerDown={onTitlePointerDown}><button onClick={onClose}>Close {title}</button></div>
        {children}
      </section>
    ),
  }
})
vi.mock('@react95/icons', () => ({ Logo: () => null, PowerOff: () => null }))

let container: HTMLDivElement
let root: Root
let desktop: Desktop

beforeEach(() => {
  ;(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true
  container = document.createElement('div')
  document.body.append(container)
  root = createRoot(container)
  desktop = createDesktop()
})

afterEach(async () => {
  await act(async () => root.unmount())
  container.remove()
})

async function render(apps?: DesktopApp[]) {
  await act(async () => root.render(<DesktopShell desktop={desktop} apps={apps} watermark={null} />))
}

async function click(label: string) {
  const button = Array.from(container.querySelectorAll('button')).find((item) => item.textContent === label)
  expect(button, `button ${label}`).toBeDefined()
  await act(async () => {
    button!.dispatchEvent(new MouseEvent('pointerdown', { bubbles: true, button: 0 }))
    button!.click()
  })
}

describe('registered React applications in the win95 shell', () => {
  it('renders a consumer-owned singleton and honors launch/close hooks and component cleanup', async () => {
    const lifecycle: string[] = []
    let cleanups = 0
    let allowClose = false
    const onLaunch = vi.fn()
    const onClose = vi.fn()
    function ConsumerApp({ application, window, close }: ReactApplicationWindowProps) {
      useEffect(() => () => { cleanups += 1 }, [])
      return <button onClick={() => { void close() }}>Consumer {application.id}/{window.model}</button>
    }
    desktop.hooks.hook('app:before-launch', () => { lifecycle.push('before-launch') })
    desktop.hooks.hook('app:launched', () => { lifecycle.push('launched') })
    desktop.hooks.hook('window:before-close', (context) => {
      lifecycle.push('before-close')
      context.cancel = !allowClose
    })
    desktop.hooks.hook('window:closed', () => { lifecycle.push('closed') })
    const application = registerReactApplication(desktop, {
      id: 'consumer', title: 'Consumer', singleton: true, entries: {}, onLaunch, onClose,
      windows: { main: { title: 'Consumer model', size: { width: 300, height: 200 }, component: ConsumerApp } },
    })
    await render([{ id: 'consumer', title: 'Launch consumer' }])
    await click('Start')
    await click('Launch consumer')
    const first = desktop.windows.getSnapshot()[0]!
    expect(container.textContent).toContain('Consumer consumer/main')
    expect(application.getSnapshot().windowIds).toEqual([first.id])
    expect(application.pid).not.toBeNull()
    expect(application.isRunning).toBe(true)
    expect(lifecycle.slice(0, 2)).toEqual(['before-launch', 'launched'])

    await act(async () => {
      first.minimize()
      await desktop.applications.launch('consumer')
    })
    expect(desktop.windows.getSnapshot()).toHaveLength(1)
    expect(first.state.active).toBe(true)
    expect(first.state.focused).toBe(true)
    expect(onLaunch).toHaveBeenCalledTimes(2)

    // Chrome and in-app close use the same cancellable engine path.
    const drag = vi.spyOn(DesktopPointerSession, 'startDrag')
    await click('Close Consumer model')
    expect(drag).not.toHaveBeenCalled()
    drag.mockRestore()
    expect(desktop.windows.getSnapshot()).toHaveLength(1)
    expect(cleanups).toBe(0)
    allowClose = true
    await click('Consumer consumer/main')
    expect(desktop.windows.getSnapshot()).toHaveLength(0)
    expect(application.getSnapshot().windowIds).toEqual([])
    expect(application.pid).toBeNull()
    expect(application.stateValue).toBe('ready')
    expect(cleanups).toBe(1)
    expect(lifecycle.slice(-2)).toEqual(['before-close', 'closed'])

    await act(async () => { await desktop.applications.launch('consumer') })
    const relaunched = desktop.windows.getSnapshot()[0]!
    expect(relaunched.id).not.toBe(first.id)
    expect(application.getSnapshot().windowIds).toEqual([relaunched.id])
    await act(async () => { await desktop.applications.terminate('consumer') })
    expect(onClose).toHaveBeenCalledTimes(1)
    expect(cleanups).toBe(2)
    expect(container.textContent).not.toContain('Consumer consumer/main')
  })

  it('keeps apps customization, entry arguments and per-application model rendering', async () => {
    const received: string[] = []
    const apps: DesktopApp[] = [{
      id: 'custom', title: 'Custom app', defaultSize: { width: 321, height: 234 },
      component: ({ application }) => <p>Custom {application.id}</p>,
      config: { singleton: true, onLaunch: () => { received.push('onLaunch') } },
    }]
    registerReactApplication(desktop, {
      id: 'external', title: 'External',
      entries: { edit: { title: 'Edit', command: async (application, argument) => {
        received.push(argument ?? '')
        await application.openWindow('main')
      } } },
      windows: { main: { size: { width: 200, height: 150 }, component: () => <p>External main</p> } },
    })
    apps.push({ id: 'external', title: 'Edit external', entryKey: 'edit', argument: 'consumer.txt' })
    await render(apps)
    await click('Start')
    await click('Custom app')
    await click('Start')
    await click('Edit external')
    expect(received).toEqual(['onLaunch', 'consumer.txt'])
    expect(container.textContent).toContain('Custom custom')
    expect(container.textContent).toContain('External main')
    expect(desktop.windows.getSnapshot()[0]!.config.size).toEqual({ width: 321, height: 234 })
    expect(desktop.applications.getSnapshot()).toHaveLength(2)
  })

  it('does not register demo applications by default', async () => {
    await render()
    expect(desktop.applications.getSnapshot()).toHaveLength(0)
    await click('Start')
    expect(container.textContent).not.toMatch(/Notepad|About Open Web Desktop/)
  })
})
