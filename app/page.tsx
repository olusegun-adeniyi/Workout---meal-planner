'use client'

import { useMemo, useState } from 'react'
import type { FormEvent, HTMLAttributes, HTMLInputTypeAttribute } from 'react'
import { CheckCircle2 } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/component-library'

type FormValues = {
  firstName: string
  lastName: string
  email: string
  phone: string
  heightCm: string
  currentWeightKg: string
  targetWeightKg: string
}

type FormErrors = Partial<Record<keyof FormValues, string>>

const initialValues: FormValues = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  heightCm: '',
  currentWeightKg: '',
  targetWeightKg: '',
}

const fieldLabels: Record<keyof FormValues, string> = {
  firstName: 'First name',
  lastName: 'Last name',
  email: 'Email',
  phone: 'Phone number',
  heightCm: 'Height',
  currentWeightKg: 'Current weight',
  targetWeightKg: 'Target weight',
}

function OnboardingField({
  field,
  value,
  error,
  type = 'text',
  inputMode,
  autoComplete,
  placeholder,
  onChange,
}: {
  field: keyof FormValues
  value: string
  error?: string
  type?: HTMLInputTypeAttribute
  inputMode?: HTMLAttributes<HTMLInputElement>['inputMode']
  autoComplete?: string
  placeholder?: string
  onChange: (value: string) => void
}) {
  const id = `onboarding-${field}`
  const isNumeric = type === 'number'

  return (
    <div>
      <label className="sr-only" htmlFor={id}>
        {fieldLabels[field]}
      </label>
      <div className="relative">
        <input
          id={id}
          type={isNumeric ? 'text' : type}
          inputMode={inputMode}
          autoComplete={autoComplete}
          value={value}
          placeholder={placeholder ?? fieldLabels[field]}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : undefined}
          onChange={(event) => onChange(event.target.value)}
          className="h-11 w-full rounded-[var(--radius-md)] border border-[var(--color-border-default)] bg-[var(--color-surface-default)] px-3 text-[15px] text-black outline-none transition-all placeholder:text-[var(--color-text-tertiary)] hover:border-[var(--color-border-strong)] focus:border-[var(--color-action-primary)] focus:ring-1 focus:ring-[var(--color-action-primary)]"
        />
      </div>
      {error && (
        <p id={`${id}-error`} className="mt-1 px-4 text-[12px] text-[var(--color-state-error)]">
          {error}
        </p>
      )}
    </div>
  )
}

function validate(values: FormValues): FormErrors {
  const errors: FormErrors = {}

  if (!values.firstName.trim()) errors.firstName = 'Enter your first name'
  if (!values.lastName.trim()) errors.lastName = 'Enter your last name'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())) {
    errors.email = 'Enter a valid email'
  }
  if (!/^\+?[0-9\s()-]{8,}$/.test(values.phone.trim())) {
    errors.phone = 'Enter a valid phone number'
  }
  const heightCm = Number(values.heightCm)
  const currentWeightKg = Number(values.currentWeightKg)
  const targetWeightKg = Number(values.targetWeightKg)

  if (!Number.isFinite(heightCm) || heightCm < 120 || heightCm > 230) {
    errors.heightCm = 'Enter height between 120 and 230 cm'
  }
  if (!Number.isFinite(currentWeightKg) || currentWeightKg < 30 || currentWeightKg > 250) {
    errors.currentWeightKg = 'Enter weight between 30 and 250 kg'
  }
  if (!Number.isFinite(targetWeightKg) || targetWeightKg < 30 || targetWeightKg > 250) {
    errors.targetWeightKg = 'Enter target between 30 and 250 kg'
  }
  if (
    Number.isFinite(currentWeightKg)
    && Number.isFinite(targetWeightKg)
    && targetWeightKg <= currentWeightKg
  ) {
    errors.targetWeightKg = 'Target should be above current weight'
  }

  return errors
}

export default function OnboardingPage() {
  const [values, setValues] = useState<FormValues>(initialValues)
  const [errors, setErrors] = useState<FormErrors>({})
  const [serverError, setServerError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const fullName = useMemo(() => {
    return [values.firstName.trim(), values.lastName.trim()].filter(Boolean).join(' ')
  }, [values.firstName, values.lastName])

  const isFormFilled = Object.values(values).every((value) => value.trim().length > 0)

  function updateField(field: keyof FormValues, value: string) {
    setValues((current) => ({ ...current, [field]: value }))
    setErrors((current) => ({ ...current, [field]: undefined }))
    setServerError(null)
    setSubmitted(false)
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const nextErrors = validate(values)
    setErrors(nextErrors)
    setServerError(null)

    if (Object.keys(nextErrors).length > 0) return

    setSaving(true)
    const payload = {
      firstName: values.firstName.trim(),
      lastName: values.lastName.trim(),
      email: values.email.trim(),
      phone: values.phone.trim(),
      heightCm: Number(values.heightCm),
      currentWeightKg: Number(values.currentWeightKg),
      targetWeightKg: Number(values.targetWeightKg),
    }

    const response = await fetch('/api/onboarding', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    const result = await response.json().catch(() => null)
    setSaving(false)

    if (!response.ok) {
      if (result?.fields) {
        setErrors({
          firstName: result.fields.firstName?.[0],
          lastName: result.fields.lastName?.[0],
          email: result.fields.email?.[0],
          phone: result.fields.phone?.[0],
          heightCm: result.fields.heightCm?.[0],
          currentWeightKg: result.fields.currentWeightKg?.[0],
          targetWeightKg: result.fields.targetWeightKg?.[0],
        })
      }
      setServerError(result?.error ?? 'Could not save profile')
      return
    }

    window.localStorage.setItem('forge:onboarding', JSON.stringify({
      ...payload,
      profileId: result.profile.id,
      completedAt: new Date().toISOString(),
    }))
    setSubmitted(true)
  }

  return (
    <main className="min-h-screen bg-[#F6F5F3] bg-[url('/images/desktop-background.png')] bg-cover bg-center bg-no-repeat">
      <div className="flex min-h-screen flex-col items-center px-6">
        <section className="flex w-full max-w-[400px] flex-1 flex-col justify-center pb-[12vh] pt-[10vh]">
          <img
            src="/icons/forge-icon.svg"
            alt=""
            className="mx-auto mb-8 h-8 w-8"
          />

          <div className="mb-8 text-center">
            <h1 className="text-[24px] font-semibold leading-[28px] text-black">
              Tell Forge who to chase
            </h1>
            <p className="mt-2 text-[15px] font-normal leading-[22px] text-[var(--color-text-tertiary)]">
              Set up your meal and training profile
            </p>
          </div>

          <form className="flex flex-col gap-4" onSubmit={handleSubmit} noValidate>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <OnboardingField
                field="firstName"
                autoComplete="given-name"
                value={values.firstName}
                error={errors.firstName}
                onChange={(value) => updateField('firstName', value)}
              />
              <OnboardingField
                field="lastName"
                autoComplete="family-name"
                value={values.lastName}
                error={errors.lastName}
                onChange={(value) => updateField('lastName', value)}
              />
            </div>

            <OnboardingField
              field="email"
              type="email"
              inputMode="email"
              autoComplete="email"
              value={values.email}
              error={errors.email}
              onChange={(value) => updateField('email', value)}
            />

            <OnboardingField
              field="phone"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              placeholder="Phone number"
              value={values.phone}
              error={errors.phone}
              onChange={(value) => updateField('phone', value)}
            />

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <OnboardingField
                field="heightCm"
                type="number"
                inputMode="decimal"
                placeholder="Height cm"
                value={values.heightCm}
                error={errors.heightCm}
                onChange={(value) => updateField('heightCm', value)}
              />
              <OnboardingField
                field="currentWeightKg"
                type="number"
                inputMode="decimal"
                placeholder="Weight kg"
                value={values.currentWeightKg}
                error={errors.currentWeightKg}
                onChange={(value) => updateField('currentWeightKg', value)}
              />
              <OnboardingField
                field="targetWeightKg"
                type="number"
                inputMode="decimal"
                placeholder="Target kg"
                value={values.targetWeightKg}
                error={errors.targetWeightKg}
                onChange={(value) => updateField('targetWeightKg', value)}
              />
            </div>

            {serverError && (
              <div className="rounded-[var(--radius-lg)] border border-[rgba(220,38,38,0.20)] bg-[var(--color-state-error-bg)] p-3">
                <p className="text-[13px] leading-[18px] text-[var(--color-text-error)]">{serverError}</p>
              </div>
            )}

            <Button type="submit" loading={saving} disabled={!isFormFilled || saving} className="mt-3">
              Continue
            </Button>
          </form>

          {submitted && (
            <div
              className="mt-4 flex items-start gap-3 rounded-[var(--radius-lg)] border border-[rgba(22,163,74,0.20)] bg-[var(--color-state-success-bg)] p-4"
              role="status"
            >
              <CheckCircle2 className="mt-0.5 flex-shrink-0 text-[var(--color-state-success)]" size={20} />
              <div>
                <p className="text-[15px] font-semibold text-[var(--color-text-primary)]">
                  Profile started{fullName ? ` for ${fullName}` : ''}
                </p>
                <p className="mt-1 text-[13px] leading-[18px] text-[var(--color-text-secondary)]">
                  Saved to Supabase. Next step is the Today screen.
                </p>
                <Link
                  href="/today"
                  className="mt-3 inline-flex text-[13px] font-semibold text-[var(--color-text-accent)]"
                >
                  Open Today
                </Link>
              </div>
            </div>
          )}
        </section>

        <footer className="pb-6 text-center text-[13px] text-[var(--color-text-tertiary)]">
          Language: English (US)
        </footer>
      </div>
    </main>
  )
}
