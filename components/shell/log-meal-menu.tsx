'use client' // focus management and Escape handling

import { type ComponentType, type CSSProperties, type Ref, useEffect, useRef } from 'react'
import { CameraIcon, EditIcon } from '@/components/today/icons'

/** Matches the tab bar: 12 top + 40 button + max(28, home indicator). */
export const TAB_BAR_HEIGHT = 'calc(52px + max(28px, env(safe-area-inset-bottom)))'

function MenuOption({
  label,
  Icon,
  iconClass,
  onSelect,
  autoFocusRef,
}: {
  label: string
  Icon: ComponentType<{ size?: number }>
  iconClass: string
  onSelect: () => void
  autoFocusRef?: Ref<HTMLButtonElement>
}) {
  return (
    <button
      ref={autoFocusRef}
      type="button"
      role="menuitem"
      onClick={onSelect}
      className="flex h-[72px] flex-none items-center gap-3 rounded-[12px] bg-[var(--today-cell)] p-2 text-left transition-colors duration-150 active:bg-[var(--today-segment-track)]"
    >
      <span className={`flex size-14 flex-none items-center justify-center ${iconClass}`}>
        <Icon size={24} />
      </span>
      <span className="whitespace-nowrap text-[12px] font-medium leading-4 text-[var(--today-text-primary)]">{label}</span>
    </button>
  )
}

export function LogMealMenu({
  open,
  onClose,
  onTakePicture,
  onLogManually,
}: {
  open: boolean
  onClose: () => void
  onTakePicture: () => void
  onLogManually: () => void
}) {
  const firstOption = useRef<HTMLButtonElement>(null)
  // Callers pass a fresh onClose each render; keep the effect keyed on `open` only
  // so focus isn't pulled back to the first option on every re-render.
  const onCloseRef = useRef(onClose)
  useEffect(() => { onCloseRef.current = onClose })

  useEffect(() => {
    if (!open) return
    firstOption.current?.focus({ preventScroll: true })
    const onKey = (event: KeyboardEvent) => { if (event.key === 'Escape') onCloseRef.current() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  return (
    <>
      {/* Scrim covers the content panel only; the tab bar stays crisp. */}
      <div
        aria-hidden
        onClick={onClose}
        className="absolute inset-x-0 top-0 z-[4] rounded-b-[40px] bg-[rgba(255,255,255,0.14)] backdrop-blur-[16px] transition-opacity duration-[220ms] ease-[ease]"
        style={{ bottom: TAB_BAR_HEIGHT, opacity: open ? 1 : 0, pointerEvents: open ? 'auto' : 'none' }}
      />
      <div
        role="menu"
        aria-label="Log meal"
        inert={!open}
        className="absolute right-4 z-[5] flex w-[231px] origin-[85%_100%] flex-col justify-center gap-3 overflow-hidden rounded-[20px] bg-[var(--today-surface)] p-3 shadow-[0_8px_20px_rgba(0,0,0,0.13)] [transition:var(--menu-transition)] motion-reduce:[transition:none]"
        style={{
          bottom: `calc(${TAB_BAR_HEIGHT} - 4px)`,
          opacity: open ? 1 : 0,
          transform: open ? 'none' : 'translateY(12px) scale(0.92)',
          // Overshooting curve so the card pops out of the Log meal button.
          '--menu-transition': 'opacity 200ms ease, transform 280ms cubic-bezier(.2,.9,.3,1.15)',
          pointerEvents: open ? 'auto' : 'none',
        } as CSSProperties}
      >
        <MenuOption
          label="Take a picture"
          Icon={CameraIcon}
          iconClass="text-[var(--today-brand)]"
          onSelect={onTakePicture}
          autoFocusRef={firstOption}
        />
        <MenuOption label="Log manually" Icon={EditIcon} iconClass="text-[var(--today-icon-accent)]" onSelect={onLogManually} />
      </div>
    </>
  )
}
