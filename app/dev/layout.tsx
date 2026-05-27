import { notFound } from 'next/navigation'
import type { ReactNode } from 'react'

export default function DevLayout({ children }: { children: ReactNode }) {
  if (process.env.NODE_ENV !== 'development') {
    notFound()
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg-secondary)]">
      <header className="sticky top-0 z-40 flex items-center justify-between border-b border-[var(--color-border-default)] bg-[var(--color-surface-default)] px-4 py-3">
        <span className="font-semibold text-[17px] text-[var(--color-text-primary)] leading-[22px]">
          Component Gallery
        </span>
        <span
          className="rounded-full px-2 py-0.5 text-[11px] font-medium uppercase tracking-[0.6px] text-white"
          style={{ backgroundColor: 'var(--color-action-primary)' }}
        >
          dev only
        </span>
      </header>
      <main>{children}</main>
    </div>
  )
}
