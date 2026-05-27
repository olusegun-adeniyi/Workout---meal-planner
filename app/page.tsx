'use client'

import { useMemo, useState } from 'react'
import { CheckCircle2 } from 'lucide-react'
import Link from 'next/link'
import { Button, Card, TextInput } from '@/components/component-library'

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

  function updateField(field: keyof FormValues, value: string) {
    setValues((current) => ({ ...current, [field]: value }))
    setErrors((current) => ({ ...current, [field]: undefined }))
    setServerError(null)
    setSubmitted(false)
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
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
    <main className="min-h-screen bg-[var(--color-bg-primary)] px-4 py-8">
      <div className="mx-auto flex min-h-[calc(100vh-64px)] w-full max-w-[430px] flex-col justify-center">
        <div className="mb-6">
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.6px] text-[var(--color-text-tertiary)]">
            Forge setup
          </p>
          <h1 className="text-[32px] font-bold leading-[36px] text-[var(--color-text-primary)]">
            Tell Forge who to chase.
          </h1>
          <p className="mt-3 text-[15px] leading-[22px] text-[var(--color-text-secondary)]">
            Contact details and body targets for meal planning, reminders, and workout recommendations.
          </p>
        </div>

        <Card className="p-4">
          <form className="flex flex-col gap-5" onSubmit={handleSubmit} noValidate>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <TextInput
                label="First name"
                autoComplete="given-name"
                value={values.firstName}
                error={errors.firstName}
                onChange={(event) => updateField('firstName', event.target.value)}
              />
              <TextInput
                label="Last name"
                autoComplete="family-name"
                value={values.lastName}
                error={errors.lastName}
                onChange={(event) => updateField('lastName', event.target.value)}
              />
            </div>

            <TextInput
              label="Email"
              type="email"
              inputMode="email"
              autoComplete="email"
              value={values.email}
              error={errors.email}
              onChange={(event) => updateField('email', event.target.value)}
            />

            <TextInput
              label="Phone number"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              value={values.phone}
              error={errors.phone}
              helperText="Use international format if possible"
              onChange={(event) => updateField('phone', event.target.value)}
            />

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <TextInput
                label="Height"
                type="number"
                inputMode="decimal"
                value={values.heightCm}
                error={errors.heightCm}
                helperText="cm"
                onChange={(event) => updateField('heightCm', event.target.value)}
              />
              <TextInput
                label="Current weight"
                type="number"
                inputMode="decimal"
                value={values.currentWeightKg}
                error={errors.currentWeightKg}
                helperText="kg"
                onChange={(event) => updateField('currentWeightKg', event.target.value)}
              />
              <TextInput
                label="Target weight"
                type="number"
                inputMode="decimal"
                value={values.targetWeightKg}
                error={errors.targetWeightKg}
                helperText="kg"
                onChange={(event) => updateField('targetWeightKg', event.target.value)}
              />
            </div>

            {serverError && (
              <div className="rounded-[var(--radius-lg)] border border-[rgba(220,38,38,0.20)] bg-[var(--color-state-error-bg)] p-3">
                <p className="text-[13px] leading-[18px] text-[var(--color-text-error)]">{serverError}</p>
              </div>
            )}

            <Button type="submit" loading={saving}>
              Continue
            </Button>
          </form>
        </Card>

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
      </div>
    </main>
  )
}
