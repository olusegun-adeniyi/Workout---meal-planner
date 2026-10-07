'use client' // measures the panel and renders per-frame transforms

import { type ReactNode, useLayoutEffect, useRef, useState } from 'react'
import { LogMealMenu, TAB_BAR_HEIGHT } from './log-meal-menu'
import { SHELL_TABS, type ShellTab, TabBar } from './tab-bar'
import { useTabSprings } from './use-tab-springs'

const DESIGN_WIDTH = 393
const MAX_STRETCH = 0.06
const STRETCH_PER_VELOCITY = 0.011

/**
 * The mobile app frame: a white content panel holding one page per tab, the dark
 * tab bar, and the Log meal menu. Only this component re-renders during a tab
 * transition — `pages` keep their element identity, so React skips them.
 */
export function TabStage({
  activeTab,
  onSelectTab,
  pages,
  logOpen,
  onLogOpenChange,
  onTakePicture,
  onLogManually,
}: {
  activeTab: ShellTab
  onSelectTab: (tab: ShellTab) => void
  /** One element per navigable tab, in SHELL_TABS order. */
  pages: ReactNode[]
  logOpen: boolean
  onLogOpenChange: (open: boolean) => void
  onTakePicture: () => void
  onLogManually: () => void
}) {
  const panelRef = useRef<HTMLDivElement>(null)
  const [width, setWidth] = useState(DESIGN_WIDTH)
  const motion = useTabSprings(SHELL_TABS.findIndex((tab) => tab.id === activeTab))

  useLayoutEffect(() => {
    const node = panelRef.current
    if (!node) return
    const observer = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width))
    observer.observe(node)
    setWidth(node.clientWidth)
    return () => observer.disconnect()
  }, [])

  // The page stretches with speed and thins slightly to keep its area.
  const stretch = 1 + Math.min(MAX_STRETCH, Math.abs(motion.pageVelocity) * STRETCH_PER_VELOCITY)
  const isMoving = motion.pageVelocity !== 0

  return (
    <div className="relative mx-auto flex h-full max-w-[430px] flex-col bg-[var(--today-shell-bg)]">
      <div ref={panelRef} className="relative flex-1 overflow-hidden rounded-b-[40px] bg-[var(--today-surface)]">
        {pages.map((page, index) => {
          const offset = index - motion.page
          const offscreen = !isMoving && Math.abs(offset) >= 1
          return (
            <div
              key={SHELL_TABS[index].id}
              inert={offscreen}
              aria-hidden={offscreen}
              className="absolute inset-0 origin-center will-change-transform"
              style={{
                transform: `translateX(${offset * width}px) scale(${stretch}, ${1 - (stretch - 1) * 0.5})`,
                visibility: offscreen ? 'hidden' : 'visible',
              }}
            >
              {page}
            </div>
          )
        })}
      </div>

      <div className="flex-none" style={{ height: TAB_BAR_HEIGHT }}>
        <TabBar
          motion={motion}
          activeTab={activeTab}
          onSelect={onSelectTab}
          logOpen={logOpen}
          onToggleLog={() => onLogOpenChange(!logOpen)}
        />
      </div>

      <LogMealMenu
        open={logOpen}
        onClose={() => onLogOpenChange(false)}
        onTakePicture={onTakePicture}
        onLogManually={onLogManually}
      />
    </div>
  )
}
