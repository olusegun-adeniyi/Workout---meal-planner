/**
 * Component Library — Forge
 *
 * Every UI component defined in docs/design.md, implemented in one file.
 *
 * Import:
 *   import { Button, MetricCard, NextActionCard, ... } from '@/components/component-library'
 *
 * Colour tokens resolve via CSS variables defined in app/globals.css @theme.
 * Numeric tokens (for SVG, inline styles, Recharts) come from @/lib/tokens.
 *
 * Per ARCHITECTURE.md, components will be extracted into domain folders
 * (components/today/, components/plan/, etc.) as feature work begins.
 * This file is the canonical reference implementation.
 */

'use client'

import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  createContext,
  useContext,
  type ReactNode,
  type ReactElement,
  type ButtonHTMLAttributes,
  type InputHTMLAttributes,
  type TextareaHTMLAttributes,
} from 'react'
import {
  Home,
  CalendarDays,
  TrendingUp,
  PenSquare,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  X,
  Search,
  Plus,
  Minus,
  Check,
  Flame,
  Dumbbell,
  Utensils,
  AlertCircle,
  CheckCircle2,
  ArrowLeft,
  Loader2,
  RefreshCcw,
} from 'lucide-react'
import { colors, iconSize, motion as motionTokens, strokeWidth } from '@/lib/tokens'

// ─────────────────────────────────────────────────────────
// Utility
// ─────────────────────────────────────────────────────────

function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ')
}

// ─────────────────────────────────────────────────────────
// Primitive: ProgressRing
// Used by MetricCard and MacroRings — not exported for standalone use.
// ─────────────────────────────────────────────────────────

interface ProgressRingProps {
  size: number
  stroke?: number
  progress: number
  color: string
  trackColor?: string
  children?: ReactNode
  className?: string
  'aria-label'?: string
}

export function ProgressRing({
  size,
  stroke = 3,
  progress,
  color,
  trackColor = colors.data.track,
  children,
  className,
  'aria-label': ariaLabel,
}: ProgressRingProps) {
  const r = (size - stroke * 2) / 2
  const circ = 2 * Math.PI * r
  const clampedProgress = Math.min(Math.max(progress, 0), 100)
  const offset = circ - (clampedProgress / 100) * circ
  const c = size / 2

  return (
    <div
      className={cn('relative flex-shrink-0', className)}
      style={{ width: size, height: size }}
      aria-label={ariaLabel}
      role={ariaLabel ? 'meter' : undefined}
      aria-valuenow={ariaLabel ? clampedProgress : undefined}
      aria-valuemin={ariaLabel ? 0 : undefined}
      aria-valuemax={ariaLabel ? 100 : undefined}
    >
      <svg width={size} height={size} className="-rotate-90" aria-hidden="true">
        <circle cx={c} cy={c} r={r} fill="none" stroke={trackColor} strokeWidth={stroke} />
        <circle
          cx={c}
          cy={c}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeDasharray={circ}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{
            transition: `stroke-dashoffset ${motionTokens.duration.deliberate}ms ${motionTokens.easing.easeOut}`,
          }}
        />
      </svg>
      {children && (
        <div className="absolute inset-0 flex items-center justify-center">
          {children}
        </div>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────────────────
// App Shell
// ─────────────────────────────────────────────────────────

interface ScreenContainerProps {
  children: ReactNode
  className?: string
}

export function ScreenContainer({ children, className }: ScreenContainerProps) {
  return (
    <div
      className={cn('flex min-h-screen flex-col bg-[var(--color-bg-primary)]', className)}
      style={{
        paddingBottom: 'calc(env(safe-area-inset-bottom) + 56px)',
        paddingLeft: 'max(16px, env(safe-area-inset-left))',
        paddingRight: 'max(16px, env(safe-area-inset-right))',
      }}
    >
      {children}
    </div>
  )
}

// ── PageHeader ──────────────────────────────────────────

type PageHeaderVariant = 'back' | 'modal' | 'home'

interface PageHeaderProps {
  title?: string
  variant?: PageHeaderVariant
  leftLabel?: string
  rightLabel?: string
  rightDisabled?: boolean
  onLeft?: () => void
  onRight?: () => void
  className?: string
}

export function PageHeader({
  title,
  variant = 'back',
  leftLabel,
  rightLabel,
  rightDisabled = false,
  onLeft,
  onRight,
  className,
}: PageHeaderProps) {
  const leftContent = {
    back: (
      <button
        onClick={onLeft}
        className="flex items-center gap-1 text-[15px] text-[var(--color-text-secondary)] active:opacity-60"
        style={{ minHeight: 44 }}
        aria-label="Go back"
      >
        <ArrowLeft size={iconSize.md} />
        <span>{leftLabel ?? 'Back'}</span>
      </button>
    ),
    modal: (
      <button
        onClick={onLeft}
        className="text-[15px] text-[var(--color-text-secondary)] active:opacity-60"
        style={{ minHeight: 44 }}
      >
        {leftLabel ?? 'Cancel'}
      </button>
    ),
    home: null,
  }[variant]

  return (
    <header
      className={cn(
        'flex items-center justify-between border-b border-[var(--color-border-divider)] bg-[var(--color-surface-default)] px-4',
        className,
      )}
      style={{
        height: 52,
        paddingTop: variant === 'home' ? 'env(safe-area-inset-top)' : undefined,
      }}
    >
      <div className="w-20">{leftContent}</div>

      {title && (
        <span className="text-[17px] font-semibold text-[var(--color-text-primary)]">
          {title}
        </span>
      )}

      <div className="flex w-20 justify-end">
        {rightLabel && (
          <button
            onClick={onRight}
            disabled={rightDisabled}
            className={cn(
              'text-[15px] font-semibold',
              rightDisabled
                ? 'text-[var(--color-text-disabled)]'
                : 'text-[var(--color-text-accent)] active:opacity-60',
            )}
            style={{ minHeight: 44 }}
          >
            {rightLabel}
          </button>
        )}
      </div>
    </header>
  )
}

// ── BottomNav ────────────────────────────────────────────

type NavTab = 'today' | 'plan' | 'progress' | 'log'

interface BottomNavProps {
  active: NavTab
  onChange: (tab: NavTab) => void
}

const NAV_TABS: { id: NavTab; label: string; Icon: React.ElementType; FilledIcon: React.ElementType }[] = [
  { id: 'today', label: 'Today', Icon: Home, FilledIcon: Home },
  { id: 'plan', label: 'Plan', Icon: CalendarDays, FilledIcon: CalendarDays },
  { id: 'progress', label: 'Progress', Icon: TrendingUp, FilledIcon: TrendingUp },
  { id: 'log', label: 'Log', Icon: PenSquare, FilledIcon: PenSquare },
]

export function BottomNav({ active, onChange }: BottomNavProps) {
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 flex border-t border-[var(--color-border-divider)] bg-[var(--color-surface-default)]"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)', height: `calc(56px + env(safe-area-inset-bottom))` }}
    >
      {NAV_TABS.map(({ id, label, Icon }) => {
        const isActive = active === id
        return (
          <button
            key={id}
            onClick={() => onChange(id)}
            aria-label={label}
            aria-current={isActive ? 'page' : undefined}
            className="flex flex-1 flex-col items-center justify-center gap-1 active:bg-[var(--color-bg-tertiary)]"
            style={{ minHeight: 56, transition: `background ${motionTokens.duration.fast}ms` }}
          >
            <Icon
              size={iconSize.md}
              strokeWidth={isActive ? strokeWidth.bold : strokeWidth.default}
              color={isActive ? colors.action.primary : colors.text.disabled}
            />
            <span
              className="text-[11px] font-medium tracking-[0.4px]"
              style={{ color: isActive ? colors.text.accent : colors.text.disabled }}
            >
              {label}
            </span>
          </button>
        )
      })}
    </nav>
  )
}

// ─────────────────────────────────────────────────────────
// Buttons
// ─────────────────────────────────────────────────────────

type ButtonVariant = 'primary' | 'secondary' | 'tertiary' | 'ghost' | 'destructive'
type ButtonSize = 'md' | 'sm'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  loading?: boolean
  children: ReactNode
}

const BUTTON_VARIANTS: Record<ButtonVariant, string> = {
  primary:
    'bg-[var(--color-action-primary)] text-white hover:bg-[var(--color-action-primary-hover)] active:scale-[0.98] disabled:opacity-40',
  secondary:
    'bg-[var(--color-action-secondary)] text-[var(--color-text-primary)] border border-[rgba(10,10,10,0.12)] hover:bg-[var(--color-bg-secondary)] active:scale-[0.98] disabled:opacity-40',
  tertiary:
    'text-[var(--color-text-accent)] hover:underline active:opacity-60 disabled:opacity-40',
  ghost:
    'text-[var(--color-text-accent)] hover:bg-[var(--color-bg-secondary)] active:opacity-60 disabled:opacity-40',
  destructive:
    'bg-white text-[var(--color-state-error)] border border-[rgba(220,38,38,0.20)] hover:bg-[var(--color-state-error-bg)] active:scale-[0.98] disabled:opacity-40',
}

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled,
  children,
  className,
  ...props
}: ButtonProps) {
  const isMd = size === 'md'

  return (
    <button
      disabled={disabled || loading}
      className={cn(
        'relative flex w-full items-center justify-center font-normal transition-all',
        isMd ? 'h-[52px] rounded-[var(--radius-pill)] px-6 text-[15px]' : 'h-9 rounded-[var(--radius-pill)] px-4 text-[15px]',
        BUTTON_VARIANTS[variant],
        className,
      )}
      style={{ transitionDuration: `${motionTokens.duration.standard}ms` }}
      {...props}
    >
      {loading ? (
        <Loader2 size={20} className="animate-spin" />
      ) : (
        children
      )}
    </button>
  )
}

// ── IconButton ───────────────────────────────────────────

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon: ReactNode
  label: string
}

export function IconButton({ icon, label, className, ...props }: IconButtonProps) {
  return (
    <button
      aria-label={label}
      className={cn(
        'flex h-10 w-10 items-center justify-center rounded-[var(--radius-md)] text-[var(--color-text-primary)] transition-colors hover:bg-[var(--color-bg-secondary)] active:bg-[var(--color-bg-tertiary)]',
        className,
      )}
      style={{ transitionDuration: `${motionTokens.duration.fast}ms` }}
      {...props}
    >
      {icon}
    </button>
  )
}

// ── FloatingActionButton ─────────────────────────────────

interface FABProps {
  onClick: () => void
  label?: string
}

export function FloatingActionButton({ onClick, label = 'Log something' }: FABProps) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      className="fixed bottom-[72px] right-4 z-40 flex h-[52px] w-[52px] items-center justify-center rounded-full bg-[var(--color-action-primary)] text-white shadow-[0_1px_3px_rgba(0,0,0,0.06)] transition-all hover:bg-[var(--color-action-primary-hover)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.10)] active:scale-95"
      style={{
        bottom: 'calc(56px + env(safe-area-inset-bottom) + 16px)',
        transitionDuration: `${motionTokens.duration.standard}ms`,
      }}
    >
      <Plus size={iconSize.lg} strokeWidth={strokeWidth.bold} />
    </button>
  )
}

// ── MealActionRow ─────────────────────────────────────────
// "Ate it" / "Swap" / "Skip" row for the NextActionCard

interface MealActionRowProps {
  onAte: () => void
  onSwap: () => void
  onSkip: () => void
  loading?: boolean
}

export function MealActionRow({ onAte, onSwap, onSkip, loading }: MealActionRowProps) {
  return (
    <div className="flex items-center gap-2">
      <button
        onClick={onAte}
        disabled={loading}
        className="flex h-9 flex-1 items-center justify-center rounded-[var(--radius-md)] bg-[var(--color-action-primary)] text-[14px] font-semibold text-white transition-all active:scale-[0.98] active:bg-[var(--color-action-primary-hover)] disabled:opacity-40"
        style={{ transitionDuration: `${motionTokens.duration.fast}ms` }}
      >
        {loading ? <Loader2 size={16} className="animate-spin" /> : 'Ate it'}
      </button>
      <button
        onClick={onSwap}
        className="flex h-9 items-center justify-center rounded-[var(--radius-md)] bg-[var(--color-surface-sunken)] px-4 text-[14px] font-semibold text-[var(--color-text-primary)] border border-[var(--color-border-default)] active:bg-[var(--color-bg-secondary)]"
      >
        Swap
      </button>
      <button
        onClick={onSkip}
        className="flex h-9 items-center justify-center px-3 text-[14px] font-semibold text-[var(--color-text-tertiary)] active:opacity-60"
      >
        Skip
      </button>
    </div>
  )
}

// ─────────────────────────────────────────────────────────
// Inputs
// ─────────────────────────────────────────────────────────

// ── TextInput ────────────────────────────────────────────

interface TextInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
  helperText?: string
}

export function TextInput({ label, error, helperText, id, className, ...props }: TextInputProps) {
  const inputId = id ?? label.toLowerCase().replace(/\s+/g, '-')
  const errorId = `${inputId}-error`

  return (
    <div className={cn('flex flex-col gap-1', className)}>
      <label htmlFor={inputId} className="text-[13px] text-[var(--color-text-secondary)]">
        {label}
      </label>
      <input
        id={inputId}
        aria-describedby={error ? errorId : undefined}
        aria-invalid={!!error}
        className={cn(
          'h-11 w-full rounded-[var(--radius-md)] border bg-[var(--color-surface-default)] px-2 text-[15px] text-black outline-none transition-all placeholder:text-[var(--color-text-tertiary)]',
          error
            ? 'border-[var(--color-state-error)] focus:ring-1 focus:ring-[var(--color-state-error)]'
            : 'border-[var(--color-border-default)] hover:border-[var(--color-border-strong)] focus:border-[var(--color-action-primary)] focus:ring-1 focus:ring-[var(--color-action-primary)]',
          'disabled:bg-[var(--color-surface-sunken)] disabled:text-[var(--color-text-disabled)]',
        )}
        style={{ transitionDuration: `${motionTokens.duration.standard}ms` }}
        {...props}
      />
      {error && (
        <span id={errorId} role="alert" className="text-[13px] text-[var(--color-state-error)]">
          {error}
        </span>
      )}
      {!error && helperText && (
        <span className="text-[13px] text-[var(--color-text-tertiary)]">{helperText}</span>
      )}
    </div>
  )
}

// ── SearchInput ──────────────────────────────────────────

interface SearchInputProps extends InputHTMLAttributes<HTMLInputElement> {
  onClear?: () => void
}

export function SearchInput({ value, onClear, className, ...props }: SearchInputProps) {
  return (
    <div className={cn('relative flex items-center', className)}>
      <Search
        size={iconSize.md}
        className="absolute left-4 text-[var(--color-text-tertiary)]"
        aria-hidden="true"
      />
      <input
        type="search"
        value={value}
        className="h-11 w-full rounded-[var(--radius-md)] border border-[var(--color-border-default)] bg-[var(--color-surface-default)] pl-11 pr-10 text-[15px] text-black outline-none placeholder:text-[var(--color-text-tertiary)] hover:border-[var(--color-border-strong)] focus:border-[var(--color-action-primary)] focus:ring-1 focus:ring-[var(--color-action-primary)]"
        {...props}
      />
      {value && onClear && (
        <button
          onClick={onClear}
          aria-label="Clear search"
          className="absolute right-3 flex h-6 w-6 items-center justify-center rounded-full bg-[var(--color-bg-secondary)] text-[var(--color-text-tertiary)] hover:bg-[var(--color-bg-tertiary)]"
        >
          <X size={12} />
        </button>
      )}
    </div>
  )
}

// ── Textarea ─────────────────────────────────────────────

interface TextareaFieldProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string
  error?: string
  maxLength?: number
}

export function TextareaField({ label, error, maxLength, id, value, className, ...props }: TextareaFieldProps) {
  const inputId = id ?? label.toLowerCase().replace(/\s+/g, '-')
  const charCount = typeof value === 'string' ? value.length : 0
  const nearLimit = maxLength && charCount > maxLength * 0.8

  return (
    <div className={cn('flex flex-col gap-1', className)}>
      <label htmlFor={inputId} className="text-[13px] text-[var(--color-text-secondary)]">
        {label}
      </label>
      <div className="relative">
        <textarea
          id={inputId}
          value={value}
          maxLength={maxLength}
          aria-invalid={!!error}
          className={cn(
            'w-full min-h-[96px] max-h-[200px] resize-none rounded-[var(--radius-md)] border bg-[var(--color-surface-default)] px-4 py-3 text-[15px] text-black outline-none transition-all placeholder:text-[var(--color-text-tertiary)]',
            error
              ? 'border-[var(--color-state-error)] focus:ring-1 focus:ring-[var(--color-state-error)]'
              : 'border-[var(--color-border-default)] hover:border-[var(--color-border-strong)] focus:border-[var(--color-action-primary)] focus:ring-1 focus:ring-[var(--color-action-primary)]',
          )}
          style={{ transitionDuration: `${motionTokens.duration.standard}ms` }}
          {...props}
        />
        {nearLimit && maxLength && (
          <span className="absolute bottom-2 right-3 text-[11px] text-[var(--color-text-tertiary)]">
            {charCount}/{maxLength}
          </span>
        )}
      </div>
      {error && <span role="alert" className="text-[13px] text-[var(--color-state-error)]">{error}</span>}
    </div>
  )
}

// ── Stepper ──────────────────────────────────────────────

interface StepperProps {
  value: number
  onChange: (value: number) => void
  min?: number
  max?: number
  step?: number
  label?: string
  unit?: string
}

export function Stepper({ value, onChange, min = 0, max = 999, step = 1, label, unit }: StepperProps) {
  const decrement = () => onChange(Math.max(min, value - step))
  const increment = () => onChange(Math.min(max, value + step))

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex flex-col items-center gap-1">
        <span
          className="font-mono text-[40px] font-bold leading-none text-[var(--color-text-primary)]"
          aria-live="polite"
          aria-atomic="true"
        >
          {value}
        </span>
        {(label || unit) && (
          <span className="text-[15px] text-[var(--color-text-secondary)]">
            {[value === 1 ? label?.replace(/s$/, '') : label, unit].filter(Boolean).join(' ')}
          </span>
        )}
      </div>
      <div className="flex w-full overflow-hidden rounded-[var(--radius-md)] border border-[var(--color-border-divider)]">
        <button
          onClick={decrement}
          disabled={value <= min}
          aria-label="Decrease"
          className="flex h-14 flex-1 items-center justify-center bg-[var(--color-surface-sunken)] text-[var(--color-text-primary)] transition-colors active:bg-[var(--color-bg-tertiary)] disabled:text-[var(--color-text-disabled)]"
        >
          <Minus size={iconSize.lg} />
        </button>
        <div className="w-px bg-[var(--color-border-divider)]" />
        <button
          onClick={increment}
          disabled={value >= max}
          aria-label="Increase"
          className="flex h-14 flex-1 items-center justify-center bg-[var(--color-surface-sunken)] text-[var(--color-text-primary)] transition-colors active:bg-[var(--color-bg-tertiary)] disabled:text-[var(--color-text-disabled)]"
        >
          <Plus size={iconSize.lg} />
        </button>
      </div>
    </div>
  )
}

// ── Checkbox ─────────────────────────────────────────────

interface CheckboxProps {
  checked: boolean
  onChange: (checked: boolean) => void
  label: string
  id?: string
}

export function Checkbox({ checked, onChange, label, id }: CheckboxProps) {
  const checkId = id ?? label.toLowerCase().replace(/\s+/g, '-')
  return (
    <label htmlFor={checkId} className="flex cursor-pointer items-center gap-3" style={{ minHeight: 44 }}>
      <div className="relative flex-shrink-0">
        <input
          type="checkbox"
          id={checkId}
          checked={checked}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange(e.target.checked)}
          className="sr-only"
        />
        <div
          aria-hidden="true"
          className={cn(
            'flex h-5 w-5 items-center justify-center rounded-[var(--radius-sm)] border transition-all',
            checked
              ? 'border-[var(--color-action-primary)] bg-[var(--color-action-primary)]'
              : 'border-[var(--color-border-default)] bg-[var(--color-surface-default)]',
          )}
          style={{ transitionDuration: `${motionTokens.duration.fast}ms` }}
        >
          {checked && <Check size={12} color="white" strokeWidth={3} />}
        </div>
      </div>
      <span className="text-[15px] text-[var(--color-text-primary)]">{label}</span>
    </label>
  )
}

// ── Toggle ───────────────────────────────────────────────

interface ToggleProps {
  checked: boolean
  onChange: (checked: boolean) => void
  label: string
  id?: string
}

export function Toggle({ checked, onChange, label, id }: ToggleProps) {
  const toggleId = id ?? label.toLowerCase().replace(/\s+/g, '-')
  return (
    <label htmlFor={toggleId} className="flex cursor-pointer items-center justify-between gap-3" style={{ minHeight: 44 }}>
      <span className="text-[15px] text-[var(--color-text-primary)]">{label}</span>
      <div className="relative flex-shrink-0">
        <input
          type="checkbox"
          id={toggleId}
          checked={checked}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange(e.target.checked)}
          className="sr-only"
          role="switch"
        />
        <div
          aria-hidden="true"
          className={cn(
            'relative flex h-[31px] w-[51px] items-center rounded-full px-[2px] transition-colors',
            checked ? 'bg-[var(--color-action-primary)]' : 'bg-[var(--color-bg-tertiary)]',
          )}
          style={{ transitionDuration: `${motionTokens.duration.standard}ms` }}
        >
          <div
            className="h-[27px] w-[27px] rounded-full bg-white shadow-[0_1px_3px_rgba(0,0,0,0.06)] transition-transform"
            style={{
              transform: checked ? 'translateX(20px)' : 'translateX(0px)',
              transitionDuration: `${motionTokens.duration.standard}ms`,
            }}
          />
        </div>
      </div>
    </label>
  )
}

// ── SegmentedControl ─────────────────────────────────────

interface SegmentedControlProps<T extends string> {
  options: { value: T; label: string }[]
  value: T
  onChange: (value: T) => void
  className?: string
}

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  className,
}: SegmentedControlProps<T>) {
  return (
    <div
      className={cn('flex rounded-full bg-[var(--color-bg-secondary)] p-[3px]', className)}
      role="tablist"
    >
      {options.map((opt) => {
        const isActive = opt.value === value
        return (
          <button
            key={opt.value}
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(opt.value)}
            className={cn(
              'flex-1 rounded-full px-4 text-[12px] font-medium tracking-[0.4px] transition-all',
              isActive
                ? 'bg-[var(--color-surface-default)] font-semibold text-[var(--color-text-primary)] shadow-[0_1px_3px_rgba(0,0,0,0.06)]'
                : 'text-[var(--color-text-secondary)]',
            )}
            style={{ height: 30, transitionDuration: `${motionTokens.duration.standard}ms` }}
          >
            {opt.label}
          </button>
        )
      })}
    </div>
  )
}

// ─────────────────────────────────────────────────────────
// Content Components
// ─────────────────────────────────────────────────────────

// ── Card ─────────────────────────────────────────────────

type CardVariant = 'default' | 'list' | 'tinted' | 'selected' | 'elevated'

interface CardProps {
  children?: ReactNode
  variant?: CardVariant
  className?: string
  onClick?: () => void
}

export function Card({ children, variant = 'default', className, onClick }: CardProps) {
  const base = 'rounded-[var(--radius-lg)] border border-[var(--color-border-default)] bg-[var(--color-surface-default)] transition-[border-color]'
  const variants: Record<CardVariant, string> = {
    default: 'p-4',
    list: 'overflow-hidden',
    tinted: 'p-4 bg-[var(--color-action-primary-subtle)] border-[var(--color-action-primary)]',
    selected: 'p-4 bg-[var(--color-action-primary-subtle)] border-[var(--color-action-primary)]',
    elevated: 'p-4 bg-[var(--color-surface-raised)] shadow-[0_1px_3px_rgba(0,0,0,0.06)]',
  }

  return (
    <div
      className={cn(base, variants[variant], onClick && 'cursor-pointer hover:border-[var(--color-border-strong)]', className)}
      style={{ transitionDuration: `${motionTokens.duration.standard}ms` }}
      onClick={onClick}
    >
      {children}
    </div>
  )
}

// ── SectionHeader ─────────────────────────────────────────

interface SectionHeaderProps {
  title: string
  action?: string
  onAction?: () => void
  className?: string
}

export function SectionHeader({ title, action, onAction, className }: SectionHeaderProps) {
  return (
    <div className={cn('flex items-center justify-between px-0', className)}>
      <span className="text-[11px] font-medium uppercase tracking-[0.6px] text-[var(--color-text-secondary)]">
        {title}
      </span>
      {action && (
        <button
          onClick={onAction}
          className="text-[13px] text-[var(--color-text-accent)] active:opacity-60"
          style={{ minHeight: 44 }}
        >
          {action}
        </button>
      )}
    </div>
  )
}

// ── ListItem ─────────────────────────────────────────────

interface ListItemProps {
  label?: string
  sublabel?: string
  title?: string
  subtitle?: string
  leading?: ReactNode
  trailing?: 'chevron' | 'value' | ReactElement
  trailingValue?: string
  selected?: boolean
  disabled?: boolean
  divider?: boolean
  onClick?: () => void
  className?: string
}

export function ListItem({
  label,
  sublabel,
  title,
  subtitle,
  leading,
  trailing,
  trailingValue,
  selected,
  disabled,
  divider,
  onClick,
  className,
}: ListItemProps) {
  const itemLabel = label ?? title ?? ''
  const itemSublabel = sublabel ?? subtitle
  const height = itemSublabel ? 68 : 52

  return (
    <div className={cn(divider && 'border-t border-[var(--color-border-divider)]')}>
      <div
        role={onClick ? 'button' : undefined}
        tabIndex={onClick ? 0 : undefined}
        onClick={disabled ? undefined : onClick}
        onKeyDown={onClick && !disabled ? (e: React.KeyboardEvent<HTMLDivElement>) => e.key === 'Enter' && onClick() : undefined}
        className={cn(
          'flex items-center gap-3 px-4 transition-colors',
          onClick && !disabled && 'cursor-pointer active:bg-[var(--color-bg-secondary)]',
          disabled && 'opacity-50',
          className,
        )}
        style={{ minHeight: height, transitionDuration: `${motionTokens.duration.fast}ms` }}
      >
        {leading && <div className="flex-shrink-0">{leading}</div>}
        <div className="flex flex-1 flex-col justify-center overflow-hidden">
          <span className="truncate text-[15px] text-[var(--color-text-primary)]">{itemLabel}</span>
          {itemSublabel && (
            <span className="truncate text-[13px] text-[var(--color-text-secondary)]">{itemSublabel}</span>
          )}
        </div>
        {trailing === 'chevron' && (
          <ChevronRight size={16} className="flex-shrink-0 text-[var(--color-text-tertiary)]" />
        )}
        {trailing === 'value' && trailingValue && (
          <span className="flex-shrink-0 text-[15px] text-[var(--color-text-secondary)]">{trailingValue}</span>
        )}
        {selected && <Check size={iconSize.md} color={colors.action.primary} className="flex-shrink-0" />}
        {trailing !== 'chevron' && trailing !== 'value' && trailing}
      </div>
    </div>
  )
}

// ── MetricCard ────────────────────────────────────────────

type MetricCardState = 'default' | 'loading' | 'empty' | 'error'

interface MetricCardProps {
  label: string
  value: string | number
  sublabel?: string
  progress?: number
  ringColor?: string
  ringIcon?: ReactNode
  state?: MetricCardState
  onClick?: () => void
  className?: string
  'aria-label'?: string
}

export function MetricCard({
  label,
  value,
  sublabel,
  progress = 0,
  ringColor = colors.data.calories,
  ringIcon,
  state = 'default',
  onClick,
  className,
  'aria-label': ariaLabel,
}: MetricCardProps) {
  if (state === 'loading') {
    return (
      <div className={cn('rounded-[var(--radius-lg)] border border-[var(--color-border-default)] bg-[var(--color-surface-default)] p-4', className)}>
        <SkeletonPulse className="mb-2 h-3 w-16 rounded" />
        <SkeletonPulse className="mb-1 h-7 w-24 rounded" />
        <SkeletonPulse className="h-3 w-12 rounded" />
      </div>
    )
  }

  return (
    <div
      role={onClick ? 'button' : undefined}
      onClick={onClick}
      aria-label={ariaLabel}
      className={cn(
        'flex items-center gap-4 rounded-[var(--radius-lg)] border border-[var(--color-border-default)] bg-[var(--color-surface-default)] p-4 transition-[border-color]',
        onClick && 'cursor-pointer hover:border-[var(--color-border-strong)]',
        className,
      )}
      style={{ transitionDuration: `${motionTokens.duration.standard}ms` }}
    >
      <div className="flex flex-1 flex-col gap-0.5 overflow-hidden">
        <span className="text-[11px] font-medium uppercase tracking-[0.6px] text-[var(--color-text-secondary)]">
          {label}
        </span>
        {state === 'empty' ? (
          <span className="text-[15px] text-[var(--color-text-secondary)]">Get started</span>
        ) : (
          <span className="font-mono text-[28px] font-semibold leading-none text-[var(--color-text-primary)]">
            {value}
          </span>
        )}
        {sublabel && (
          <span className="text-[13px] text-[var(--color-text-secondary)]">
            {state === 'empty' ? 'Tap to set up' : sublabel}
          </span>
        )}
      </div>
      {state === 'error' ? (
        <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center">
          <span className="font-mono text-[20px] text-[var(--color-text-tertiary)]">—</span>
        </div>
      ) : (
        <ProgressRing
          size={44}
          stroke={3}
          progress={state === 'empty' ? 0 : progress}
          color={ringColor}
          aria-label={ariaLabel}
        >
          {ringIcon}
        </ProgressRing>
      )}
    </div>
  )
}

// ── NextActionCard ────────────────────────────────────────

type NextActionState = 'upcoming' | 'due-soon' | 'overdue' | 'logged' | 'skipped' | 'no-plan'

interface NextActionCardProps {
  mealName?: string
  calories?: number
  protein?: number
  timeLabel?: string
  state?: NextActionState
  onAte?: () => void
  onSwap?: () => void
  onSkip?: () => void
  onGenerate?: () => void
  loading?: boolean
  className?: string
}

export function NextActionCard({
  mealName,
  calories,
  protein,
  timeLabel,
  state = 'upcoming',
  onAte,
  onSwap,
  onSkip,
  onGenerate,
  loading,
  className,
}: NextActionCardProps) {
  const isOverdue = state === 'overdue'
  const isDueSoon = state === 'due-soon'
  const isLogged = state === 'logged'
  const isSkipped = state === 'skipped'
  const isNoPlan = state === 'no-plan'

  if (isNoPlan) {
    return (
      <Card className={cn('flex flex-col items-center gap-4 py-8', className)}>
        <EmptyState
          icon={<Utensils size={iconSize.hero} color={colors.text.disabled} />}
          title="No plan for today"
          body="Generate this week's plan to get started."
          action={onGenerate ? <Button onClick={onGenerate}>Generate plan</Button> : undefined}
        />
      </Card>
    )
  }

  if (isLogged) {
    return (
      <Card className={cn('flex items-center gap-3 py-3', className)}>
        <CheckCircle2 size={iconSize.lg} color={colors.state.success} />
        <div>
          <p className="text-[15px] font-semibold text-[var(--color-text-primary)]">{mealName} logged</p>
          {calories && (
            <p className="font-mono text-[13px] text-[var(--color-text-secondary)]">
              {calories} cal · {protein}g protein
            </p>
          )}
        </div>
      </Card>
    )
  }

  if (isSkipped) {
    return (
      <Card className={cn('flex items-center gap-3 py-3 opacity-60', className)}>
        <X size={iconSize.lg} color={colors.state.skipped} />
        <p className="text-[15px] text-[var(--color-text-secondary)]">{mealName} — skipped</p>
      </Card>
    )
  }

  return (
    <div
      className={cn(
        'rounded-[var(--radius-lg)] border bg-[var(--color-surface-default)] p-4',
        isOverdue
          ? 'border-l-4 border-[var(--color-state-error)] border-l-[var(--color-state-error)]'
          : 'border-[var(--color-border-default)]',
        className,
      )}
    >
      <div className="mb-3 flex flex-col gap-1">
        <span
          className="text-[11px] font-semibold uppercase tracking-[0.6px]"
          style={{ color: isDueSoon || isOverdue ? colors.action.primary : colors.text.secondary }}
        >
          {timeLabel ?? (isOverdue ? 'OVERDUE — LOG NOW' : 'UPCOMING')}
        </span>
        <h2 className="text-[24px] font-semibold leading-tight text-[var(--color-text-primary)]">
          {mealName}
        </h2>
        {(calories !== undefined || protein !== undefined) && (
          <p className="font-mono text-[15px] text-[var(--color-text-secondary)]">
            {calories} cal{protein !== undefined ? ` · ${protein}g protein` : ''}
          </p>
        )}
      </div>
      <MealActionRow
        onAte={onAte ?? (() => {})}
        onSwap={onSwap ?? (() => {})}
        onSkip={onSkip ?? (() => {})}
        loading={loading}
      />
    </div>
  )
}

// ── MealTimelineRow ────────────────────────────────────────

type MealSlotStatus = 'eaten' | 'upcoming' | 'due-soon' | 'skipped'

interface MealTimelineRowProps {
  time: string
  mealName: string
  calories?: number
  protein?: number
  status: MealSlotStatus
  slot: string
  onClick?: () => void
  isLast?: boolean
}

const STATUS_DOT_COLOR: Record<MealSlotStatus, string> = {
  eaten: colors.state.success,
  upcoming: colors.text.disabled,
  'due-soon': colors.action.primary,
  skipped: colors.state.skipped,
}

const STATUS_LABEL: Record<MealSlotStatus, string> = {
  eaten: 'Eaten',
  upcoming: 'Upcoming',
  'due-soon': 'Due soon',
  skipped: 'Skipped',
}

export function MealTimelineRow({
  time,
  mealName,
  calories,
  protein,
  status,
  slot,
  onClick,
  isLast,
}: MealTimelineRowProps) {
  return (
    <>
      <div
        role={onClick ? 'button' : undefined}
        onClick={onClick}
        aria-label={`${slot} · ${mealName} · ${STATUS_LABEL[status]}`}
        className={cn(
          'flex items-center gap-3 px-4',
          onClick && 'cursor-pointer active:bg-[var(--color-bg-secondary)]',
          status === 'skipped' && 'opacity-50',
        )}
        style={{ minHeight: 68 }}
      >
        <span className="w-11 flex-shrink-0 font-mono text-[11px] text-[var(--color-text-tertiary)]">
          {time}
        </span>
        <div
          className="h-2 w-2 flex-shrink-0 rounded-full"
          style={{
            backgroundColor: STATUS_DOT_COLOR[status],
            boxShadow: status === 'due-soon' ? `0 0 0 3px ${colors.action.primarySubtle}` : undefined,
          }}
        />
        <div className="flex flex-1 flex-col justify-center overflow-hidden">
          <span className="truncate text-[15px] font-semibold text-[var(--color-text-primary)]">
            {mealName}
          </span>
          {(calories !== undefined || protein !== undefined) && (
            <span className="font-mono text-[13px] text-[var(--color-text-secondary)]">
              {calories} cal{protein !== undefined ? ` · ${protein}g protein` : ''}
            </span>
          )}
        </div>
        <span
          className="flex-shrink-0 text-[13px]"
          style={{
            color: status === 'eaten' ? colors.state.success : status === 'skipped' ? colors.state.skipped : colors.text.tertiary,
          }}
        >
          {STATUS_LABEL[status]}
        </span>
      </div>
      {!isLast && <div className="mx-4 h-px bg-[var(--color-border-divider)]" />}
    </>
  )
}

// ── MacroRings ────────────────────────────────────────────

interface MacroRingsProps {
  calories: number
  calorieTarget: number
  protein: number
  proteinTarget: number
  className?: string
}

export function MacroRings({ calories, calorieTarget, protein, proteinTarget, className }: MacroRingsProps) {
  const calProgress = calorieTarget > 0 ? (calories / calorieTarget) * 100 : 0
  const proProgress = proteinTarget > 0 ? (protein / proteinTarget) * 100 : 0

  return (
    <Card className={cn('flex items-center gap-6', className)}>
      <div className="flex flex-col items-center gap-2">
        <ProgressRing
          size={72}
          stroke={5}
          progress={calProgress}
          color={colors.data.calories}
          aria-label={`Calories: ${calories} of ${calorieTarget} consumed`}
        >
          <Flame size={16} color={colors.data.calories} />
        </ProgressRing>
        <span className="text-[11px] font-medium uppercase tracking-[0.4px] text-[var(--color-text-secondary)]">
          Cal
        </span>
      </div>

      <div className="h-10 w-px flex-shrink-0 bg-[var(--color-border-divider)]" />

      <div className="flex flex-col items-center gap-2">
        <ProgressRing
          size={72}
          stroke={5}
          progress={proProgress}
          color={colors.data.protein}
          aria-label={`Protein: ${protein}g of ${proteinTarget}g consumed`}
        >
          <Dumbbell size={16} color={colors.data.protein} />
        </ProgressRing>
        <span className="text-[11px] font-medium uppercase tracking-[0.4px] text-[var(--color-text-secondary)]">
          Protein
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-1">
        <span className="font-mono text-[15px] font-medium text-[var(--color-text-primary)]">
          {calories.toLocaleString()} / {calorieTarget.toLocaleString()} cal
        </span>
        <span className="font-mono text-[15px] font-medium text-[var(--color-text-primary)]">
          {protein}g / {proteinTarget}g protein
        </span>
      </div>
    </Card>
  )
}

// ── StreakCounter ──────────────────────────────────────────

interface StreakCounterProps {
  days: number
  className?: string
}

export function StreakCounter({ days, className }: StreakCounterProps) {
  if (days === 0) {
    return (
      <span className={cn('text-[15px] text-[var(--color-text-tertiary)]', className)}>
        Start your streak
      </span>
    )
  }

  return (
    <div className={cn('flex items-center gap-1', className)}>
      <span aria-hidden="true">🔥</span>
      <span
        className="font-mono text-[20px] font-semibold"
        style={{ color: colors.text.accent }}
        aria-live="polite"
        aria-atomic="true"
      >
        {days}
      </span>
      <span className="text-[15px] text-[var(--color-text-secondary)]">
        {days === 1 ? 'day' : 'days'} streak
      </span>
    </div>
  )
}

// ── WorkoutCard ────────────────────────────────────────────

type WorkoutCardStatus = 'upcoming' | 'in-progress' | 'completed'

interface ExerciseRow {
  name: string
  target: string
}

interface WorkoutCardProps {
  splitLabel: string
  muscleGroups: string
  exerciseCount: number
  estimatedMinutes: number
  exercises?: ExerciseRow[]
  status?: WorkoutCardStatus
  completedMinutes?: number
  onComplete?: () => void
  className?: string
}

export function WorkoutCard({
  splitLabel,
  muscleGroups,
  exerciseCount,
  estimatedMinutes,
  exercises,
  status = 'upcoming',
  completedMinutes,
  onComplete,
  className,
}: WorkoutCardProps) {
  const [expanded, setExpanded] = useState(false)
  const isCompleted = status === 'completed'
  const isInProgress = status === 'in-progress'

  return (
    <Card
      variant={isInProgress ? 'tinted' : 'default'}
      className={cn('cursor-pointer', className)}
    >
      <div
        className="flex items-start justify-between"
        onClick={() => setExpanded((v) => !v)}
        role="button"
        aria-expanded={expanded}
        aria-label={`${splitLabel} workout`}
      >
        <div className="flex flex-col gap-0.5">
          <span className="text-[11px] font-medium uppercase tracking-[0.6px] text-[var(--color-text-secondary)]">
            {isCompleted ? 'COMPLETED' : splitLabel}
          </span>
          <span className="text-[15px] font-semibold text-[var(--color-text-primary)]">
            {muscleGroups}
          </span>
          <span className="font-mono text-[13px] text-[var(--color-text-secondary)]">
            {isCompleted
              ? `Completed · ${completedMinutes} min`
              : `${exerciseCount} exercises · est. ${estimatedMinutes} min`}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {isCompleted && <CheckCircle2 size={iconSize.md} color={colors.state.success} />}
          {expanded ? (
            <ChevronUp size={iconSize.md} className="text-[var(--color-text-tertiary)]" />
          ) : (
            <ChevronDown size={iconSize.md} className="text-[var(--color-text-tertiary)]" />
          )}
        </div>
      </div>

      {expanded && exercises && (
        <div className="mt-4 flex flex-col gap-0">
          <div className="h-px bg-[var(--color-border-divider)]" />
          {exercises.map((ex, i) => (
            <div key={i} className="flex items-center justify-between py-3">
              <span className="text-[15px] font-semibold text-[var(--color-text-primary)]">{ex.name}</span>
              <span className="font-mono text-[13px] text-[var(--color-text-secondary)]">{ex.target}</span>
            </div>
          ))}
          {!isCompleted && onComplete && (
            <div className="mt-3 pt-3 border-t border-[var(--color-border-divider)]">
              <Button variant="secondary" onClick={onComplete}>
                Complete workout
              </Button>
            </div>
          )}
        </div>
      )}
    </Card>
  )
}

// ── EmptyState ────────────────────────────────────────────

interface EmptyStateProps {
  icon?: ReactNode
  title: string
  body?: string
  action?: ReactNode
  className?: string
}

export function EmptyState({ icon, title, body, action, className }: EmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center gap-3 px-4 py-16 text-center', className)}>
      {icon && <div className="mb-1">{icon}</div>}
      <h3 className="text-[17px] font-semibold text-[var(--color-text-secondary)]">{title}</h3>
      {body && (
        <p className="max-w-[260px] text-[15px] leading-relaxed text-[var(--color-text-tertiary)]">{body}</p>
      )}
      {action && <div className="mt-3 w-full max-w-[240px]">{action}</div>}
    </div>
  )
}

// ── Badge ─────────────────────────────────────────────────

interface BadgeProps {
  count: number
  className?: string
}

export function Badge({ count, className }: BadgeProps) {
  if (count <= 0) return null
  return (
    <span
      className={cn(
        'absolute -right-1 -top-1 flex min-w-[18px] items-center justify-center rounded-full bg-[var(--color-state-error)] px-1 ring-2 ring-white',
        className,
      )}
      style={{ height: 18 }}
      aria-label={`${count} notifications`}
    >
      <span className="text-[11px] font-semibold leading-none text-white">
        {count > 99 ? '99+' : count}
      </span>
    </span>
  )
}

// ── Tag ───────────────────────────────────────────────────

type TagVariant = 'static' | 'removable' | 'filter' | 'filter-inactive' | 'filter-active'

interface TagProps {
  label: string
  variant?: TagVariant
  onClick?: () => void
}

export function Tag({ label, variant = 'static', onClick }: TagProps) {
  const styles: Record<TagVariant, string> = {
    static:
      'bg-[var(--color-bg-secondary)] text-[var(--color-text-secondary)]',
    removable:
      'border border-[var(--color-border-default)] bg-[var(--color-surface-default)] text-[var(--color-text-primary)]',
    filter:
      'border border-[var(--color-border-default)] text-[var(--color-text-secondary)]',
    'filter-inactive':
      'border border-[var(--color-border-default)] text-[var(--color-text-secondary)]',
    'filter-active':
      'border border-[var(--color-action-primary)] bg-[var(--color-action-primary-subtle)] text-[var(--color-text-accent)]',
  }

  return (
    <span
      role={onClick ? 'button' : undefined}
      onClick={onClick}
      className={cn(
        'inline-flex h-7 items-center rounded-[var(--radius-md)] px-[10px] text-[12px] font-medium tracking-[0.4px] transition-colors',
        styles[variant],
        onClick && 'cursor-pointer',
      )}
      style={{ transitionDuration: `${motionTokens.duration.fast}ms` }}
    >
      {label}
    </span>
  )
}

// ── LinearProgress ────────────────────────────────────────

interface LinearProgressProps {
  progress: number
  color?: string
  className?: string
  'aria-label'?: string
}

export function LinearProgress({
  progress,
  color = colors.action.primary,
  className,
  'aria-label': ariaLabel,
}: LinearProgressProps) {
  const clamped = Math.min(Math.max(progress, 0), 100)
  return (
    <div
      className={cn('h-1.5 w-full overflow-hidden rounded-full bg-[var(--color-data-track)]', className)}
      role="progressbar"
      aria-valuenow={clamped}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={ariaLabel}
    >
      <div
        className="h-full rounded-full"
        style={{
          width: `${clamped}%`,
          backgroundColor: color,
          transition: `width ${motionTokens.duration.slow}ms ${motionTokens.easing.easeOut}`,
        }}
      />
    </div>
  )
}

// ── SkeletonPulse ─────────────────────────────────────────

interface SkeletonPulseProps {
  className?: string
}

export function SkeletonPulse({ className }: SkeletonPulseProps) {
  return (
    <div
      className={cn('animate-pulse rounded bg-[var(--color-bg-secondary)]', className)}
      aria-hidden="true"
    />
  )
}

// ─────────────────────────────────────────────────────────
// Feedback Components
// ─────────────────────────────────────────────────────────

// ── Spinner ───────────────────────────────────────────────

type SpinnerSize = 'sm' | 'md' | 'lg'

interface SpinnerProps {
  size?: SpinnerSize
  color?: string
}

const SPINNER_SIZE: Record<SpinnerSize, number> = { sm: 16, md: 24, lg: 32 }

export function Spinner({ size = 'md', color }: SpinnerProps) {
  return (
    <Loader2
      size={SPINNER_SIZE[size]}
      className="animate-spin"
      style={{ color: color ?? colors.action.primary }}
      aria-label="Loading"
    />
  )
}

// ── Toast ─────────────────────────────────────────────────

type ToastVariant = 'success' | 'error' | 'neutral' | 'info'

interface ToastData {
  id: string
  message: string
  type?: ToastVariant
  variant?: ToastVariant
}

interface ToastContextValue {
  show: (message: string, variant?: ToastVariant) => void
  toast: (toast: Omit<ToastData, 'id'>) => void
}

const ToastContext = createContext<ToastContextValue>({
  show: () => {},
  toast: () => {},
})

export function useToast() {
  return useContext(ToastContext)
}

const TOAST_BG: Record<ToastVariant, string> = {
  success: 'bg-[var(--color-state-success-bg)] border-[rgba(22,163,74,0.20)]',
  error: 'bg-[var(--color-state-error-bg)] border-[rgba(220,38,38,0.20)]',
  neutral: 'bg-[var(--color-surface-default)] border-[var(--color-border-default)]',
  info: 'bg-[var(--color-surface-default)] border-[var(--color-border-default)]',
}

const TOAST_ICON: Record<ToastVariant, ReactNode> = {
  success: <CheckCircle2 size={16} color={colors.state.success} />,
  error: <AlertCircle size={16} color={colors.state.error} />,
  neutral: null,
  info: null,
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastData[]>([])
  const timers = useRef<Record<string, ReturnType<typeof setTimeout>>>({})

  const show = useCallback((message: string, variant: ToastVariant = 'neutral') => {
    const id = Math.random().toString(36).slice(2)
    setToasts((prev) => [...prev.slice(-1), { id, message, variant }])
    timers.current[id] = setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
      delete timers.current[id]
    }, 3000)
  }, [])

  const toast = useCallback((data: Omit<ToastData, 'id'>) => {
    show(data.message, data.variant ?? data.type ?? 'neutral')
  }, [show])

  useEffect(() => () => Object.values(timers.current).forEach(clearTimeout), [])

  return (
    <ToastContext.Provider value={{ show, toast }}>
      {children}
      <div
        className="fixed left-1/2 top-4 z-50 flex -translate-x-1/2 flex-col gap-2"
        style={{ top: 'calc(env(safe-area-inset-top) + 16px)' }}
        aria-live="polite"
        aria-atomic="true"
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={cn(
              'flex min-w-[240px] max-w-[340px] items-center gap-2 rounded-[var(--radius-lg)] border px-4 py-3 shadow-[0_4px_12px_rgba(0,0,0,0.10)]',
              TOAST_BG[toast.variant ?? 'neutral'],
            )}
          >
            {TOAST_ICON[toast.variant ?? 'neutral']}
            <span className="text-[15px] text-[var(--color-text-primary)]">{toast.message}</span>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

// ── ErrorState ────────────────────────────────────────────

interface ErrorStateProps {
  title?: string
  message: string
  onRetry?: () => void
  className?: string
}

export function ErrorState({
  title = 'Something went wrong',
  message,
  onRetry,
  className,
}: ErrorStateProps) {
  return (
    <div className={cn('flex flex-col items-center gap-3 px-4 py-12 text-center', className)}>
      <AlertCircle size={32} color={colors.state.error} />
      <h3 className="text-[17px] font-semibold text-[var(--color-text-secondary)]">{title}</h3>
      <p className="max-w-[280px] text-[15px] text-[var(--color-text-tertiary)]">{message}</p>
      {onRetry && (
        <Button variant="secondary" onClick={onRetry} className="mt-2 max-w-[200px]">
          <RefreshCcw size={16} className="mr-2" />
          Retry
        </Button>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────────────────
// Overlays
// ─────────────────────────────────────────────────────────

// ── Modal ─────────────────────────────────────────────────

interface ModalProps {
  open: boolean
  onClose: () => void
  title: string
  body?: string
  primaryLabel: string
  secondaryLabel?: string
  onPrimary: () => void
  onSecondary?: () => void
  destructive?: boolean
  loading?: boolean
}

export function Modal({
  open,
  onClose,
  title,
  body,
  primaryLabel,
  secondaryLabel,
  onPrimary,
  onSecondary,
  destructive,
  loading,
}: ModalProps) {
  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [open])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-8"
      style={{ backgroundColor: colors.surface.overlay }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div
        className="relative w-full max-w-[360px] rounded-[var(--radius-xl)] bg-[var(--color-surface-raised)] p-8 shadow-[0_8px_32px_rgba(0,0,0,0.12)]"
        role="document"
      >
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-[var(--radius-sm)] text-[var(--color-text-tertiary)] hover:bg-[var(--color-bg-secondary)]"
        >
          <X size={iconSize.sm} />
        </button>

        <h2 id="modal-title" className="mb-3 text-[24px] font-semibold text-[var(--color-text-primary)]">
          {title}
        </h2>
        {body && (
          <p className="mb-6 text-[15px] leading-relaxed text-[var(--color-text-secondary)]">{body}</p>
        )}

        <div className="flex flex-col gap-3">
          <Button
            variant={destructive ? 'destructive' : 'primary'}
            onClick={onPrimary}
            loading={loading}
          >
            {primaryLabel}
          </Button>
          {secondaryLabel && (
            <Button
              variant="secondary"
              onClick={onSecondary ?? onClose}
              disabled={loading}
            >
              {secondaryLabel}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

// ── BottomSheet ───────────────────────────────────────────

type BottomSheetProps = React.PropsWithChildren<{
  open: boolean
  onClose: () => void
  title?: string
}>

export function BottomSheet({ open, onClose, title, children }: BottomSheetProps) {
  const sheetRef = useRef<HTMLDivElement>(null)
  const dragStart = useRef<number | null>(null)

  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [open])

  const handleDragStart = (y: number) => { dragStart.current = y }
  const handleDragEnd = (y: number) => {
    if (dragStart.current !== null && y - dragStart.current > 80) onClose()
    dragStart.current = null
  }

  if (!open) return null

  return (
    <>
      <style>{`@keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }`}</style>
      <div
        className="fixed inset-0 z-50 flex items-end"
        style={{ backgroundColor: colors.surface.overlay }}
        onClick={(e: React.MouseEvent<HTMLDivElement>) => e.target === e.currentTarget && onClose()}
        role="dialog"
        aria-modal="true"
      >
        <div
          ref={sheetRef}
          className="w-full rounded-t-[var(--radius-xl)] bg-[var(--color-surface-raised)] shadow-[0_8px_32px_rgba(0,0,0,0.12)]"
          style={{
            maxHeight: '85vh',
            paddingBottom: 'env(safe-area-inset-bottom)',
            animation: `slideUp ${motionTokens.duration.slow}ms ${motionTokens.easing.easeInOut}`,
          }}
          onTouchStart={(e: React.TouchEvent<HTMLDivElement>) => handleDragStart(e.touches[0].clientY)}
          onTouchEnd={(e: React.TouchEvent<HTMLDivElement>) => handleDragEnd(e.changedTouches[0].clientY)}
          onMouseDown={(e: React.MouseEvent<HTMLDivElement>) => handleDragStart(e.clientY)}
          onMouseUp={(e: React.MouseEvent<HTMLDivElement>) => handleDragEnd(e.clientY)}
        >
          <div className="flex justify-center pt-3 pb-2">
            <div className="h-1 w-8 rounded-full bg-[var(--color-bg-tertiary)]" />
          </div>
          {title && (
            <div className="border-b border-[var(--color-border-divider)] px-4 pb-3">
              <h3 className="text-[17px] font-semibold text-[var(--color-text-primary)]">{title}</h3>
            </div>
          )}
          <div className="overflow-y-auto px-4 py-4">{children}</div>
        </div>
      </div>
    </>
  )
}

// ── ActionSheet ───────────────────────────────────────────

interface ActionSheetAction {
  label: string
  destructive?: boolean
  onClick?: () => void
  onPress?: () => void
}

interface ActionSheetProps {
  open: boolean
  onClose: () => void
  actions: ActionSheetAction[]
}

export function ActionSheet({ open, onClose, actions }: ActionSheetProps) {
  return (
    <BottomSheet open={open} onClose={onClose}>
      <div className="flex flex-col">
        {actions.map((action, i) => (
          <React.Fragment key={i}>
            <button
              onClick={() => { (action.onClick ?? action.onPress)?.(); onClose() }}
              className={cn(
                'flex h-[52px] w-full items-center justify-center text-[15px] active:bg-[var(--color-bg-secondary)]',
                action.destructive
                  ? 'text-[var(--color-state-error)]'
                  : 'text-[var(--color-text-primary)]',
              )}
            >
              {action.label}
            </button>
            {i < actions.length - 1 && <div className="h-px bg-[var(--color-border-divider)]" />}
          </React.Fragment>
        ))}
        <div className="mt-4 pt-4 border-t border-[var(--color-border-divider)]">
          <button
            onClick={onClose}
            className="flex h-[52px] w-full items-center justify-center text-[15px] font-semibold text-[var(--color-text-primary)] active:bg-[var(--color-bg-secondary)]"
          >
            Cancel
          </button>
        </div>
      </div>
    </BottomSheet>
  )
}

// ─────────────────────────────────────────────────────────
// Navigation Components
// ─────────────────────────────────────────────────────────

// ── HorizontalFilterTabs ──────────────────────────────────

interface FilterTabsProps<T extends string> {
  tabs?: { value: T; label: string }[]
  options?: { value: T; label: string }[]
  active?: T
  value?: T
  onChange: (value: T) => void
  className?: string
}

export function HorizontalFilterTabs<T extends string>({
  tabs,
  options,
  active,
  value,
  onChange,
  className,
}: FilterTabsProps<T>) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const items = tabs ?? options ?? []
  const current = active ?? value

  return (
    <div
      ref={scrollRef}
      className={cn('flex gap-2 overflow-x-auto px-4 scrollbar-hide', className)}
      role="tablist"
      style={{ scrollbarWidth: 'none' }}
    >
      {items.map((tab) => {
        const isActive = tab.value === current
        return (
          <button
            key={tab.value}
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(tab.value)}
            className={cn(
              'flex h-8 flex-shrink-0 items-center rounded-full px-[14px] text-[12px] font-medium tracking-[0.4px] transition-all',
              isActive
                ? 'border border-[var(--color-border-default)] bg-[var(--color-surface-default)] font-semibold text-[var(--color-text-primary)]'
                : 'text-[var(--color-text-secondary)]',
            )}
            style={{ transitionDuration: `${motionTokens.duration.standard}ms` }}
          >
            {tab.label}
          </button>
        )
      })}
    </div>
  )
}
