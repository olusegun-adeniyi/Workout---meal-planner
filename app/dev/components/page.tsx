'use client'

import { useState, type ReactNode } from 'react'
import {
  ToastProvider,
  useToast,
  ProgressRing,
  Button,
  IconButton,
  FloatingActionButton,
  MealActionRow,
  TextInput,
  SearchInput,
  TextareaField,
  Stepper,
  Checkbox,
  Toggle,
  SegmentedControl,
  Card,
  SectionHeader,
  ListItem,
  MetricCard,
  NextActionCard,
  MealTimelineRow,
  MacroRings,
  StreakCounter,
  WorkoutCard,
  EmptyState,
  Badge,
  Tag,
  LinearProgress,
  SkeletonPulse,
  Spinner,
  ErrorState,
  Modal,
  BottomSheet,
  ActionSheet,
  HorizontalFilterTabs,
  PageHeader,
} from '@/components/component-library'
import { Flame, Plus, Settings } from 'lucide-react'
import { colors, fontSize, lineHeight, spacing } from '@/lib/tokens'

type NavTab = 'today' | 'plan' | 'progress' | 'log'
type MuscleGroup = 'all' | 'push' | 'pull' | 'legs' | 'core'

// ─────────────────────────────────────────────────────────
// Section wrapper
// ─────────────────────────────────────────────────────────

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="px-4 pb-10">
      <h2 className="mb-5 text-[11px] font-semibold uppercase tracking-[0.6px] text-[var(--color-text-tertiary)]">
        {title}
      </h2>
      <div className="flex flex-col gap-4">{children}</div>
    </section>
  )
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-2 text-[12px] text-[var(--color-text-tertiary)]">{label}</p>
      <div className="flex flex-wrap items-center gap-3">{children}</div>
    </div>
  )
}

const COLOR_SWATCHES = [
  ['bg.primary', colors.bg.primary],
  ['bg.secondary', colors.bg.secondary],
  ['surface.default', colors.surface.default],
  ['text.primary', colors.text.primary],
  ['text.secondary', colors.text.secondary],
  ['action.primary', colors.action.primary],
  ['data.protein', colors.data.protein],
  ['state.success', colors.state.success],
  ['state.error', colors.state.error],
] as const

const TYPE_SAMPLES = [
  ['display', fontSize.display, lineHeight.display, '2,430'],
  ['title', fontSize.title, lineHeight.title, 'Weekly plan'],
  ['heading', fontSize.heading, lineHeight.heading, 'Lunch due now'],
  ['body', fontSize.body, lineHeight.body, 'Jollof rice with chicken'],
  ['caption', fontSize.caption, lineHeight.caption, 'NUTRITION'],
] as const

function TokenBoard() {
  return (
    <section className="px-4 pb-10 pt-6">
      <div className="mb-5">
        <h1 className="text-[24px] font-semibold leading-[28px] text-[var(--color-text-primary)]">
          Forge component library
        </h1>
        <p className="mt-1 text-[13px] leading-[18px] text-[var(--color-text-secondary)]">
          Components from docs/design.md, rendered with tokens from lib/tokens.ts.
        </p>
      </div>

      <div className="grid gap-3">
        <Card className="p-4">
          <SectionHeader title="Colour tokens" />
          <div className="mt-3 grid grid-cols-3 gap-2">
            {COLOR_SWATCHES.map(([name, value]) => (
              <div key={name} className="overflow-hidden rounded-[var(--radius-md)] border border-[var(--color-border-default)] bg-[var(--color-surface-default)]">
                <div className="h-10 border-b border-[var(--color-border-divider)]" style={{ background: value }} />
                <div className="p-2">
                  <p className="truncate text-[11px] font-medium text-[var(--color-text-primary)]">{name}</p>
                  <p className="truncate font-mono text-[11px] text-[var(--color-text-tertiary)]">{value}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-4">
          <SectionHeader title="Type scale" />
          <div className="mt-3 flex flex-col divide-y divide-[var(--color-border-divider)]">
            {TYPE_SAMPLES.map(([name, size, height, sample]) => (
              <div key={name} className="flex items-center justify-between gap-4 py-2">
                <div>
                  <p className="text-[12px] font-medium text-[var(--color-text-primary)]">{name}</p>
                  <p className="font-mono text-[11px] text-[var(--color-text-tertiary)]">{size}/{height}</p>
                </div>
                <p
                  className={name === 'display' ? 'font-mono font-bold' : 'font-semibold'}
                  style={{ fontSize: size, lineHeight: `${height}px` }}
                >
                  {sample}
                </p>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-4">
          <SectionHeader title="Spacing rhythm" />
          <div className="mt-3 flex items-end gap-3">
            {[2, 4, 6, 8, 10, 12].map((key) => (
              <div key={key} className="flex flex-col items-center gap-2">
                <div
                  className="w-6 rounded-[var(--radius-sm)] bg-[var(--color-bg-tertiary)]"
                  style={{ height: spacing[key as keyof typeof spacing] }}
                />
                <span className="font-mono text-[11px] text-[var(--color-text-tertiary)]">{key}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </section>
  )
}

// ─────────────────────────────────────────────────────────
// Toast trigger — must live inside ToastProvider
// ─────────────────────────────────────────────────────────

function ToastTriggers() {
  const { toast } = useToast()
  return (
    <Row label="Toast variants">
      <Button size="sm" onClick={() => toast({ message: 'Meal logged', type: 'success' })}>
        Success
      </Button>
      <Button size="sm" variant="secondary" onClick={() => toast({ message: 'Could not connect', type: 'error' })}>
        Error
      </Button>
      <Button size="sm" variant="ghost" onClick={() => toast({ message: 'Reminder set for 13:00', type: 'info' })}>
        Info
      </Button>
    </Row>
  )
}

// ─────────────────────────────────────────────────────────
// Main gallery
// ─────────────────────────────────────────────────────────

function Gallery() {
  // Inputs
  const [textValue, setTextValue] = useState('')
  const [searchValue, setSearchValue] = useState('Chicken rice')
  const [textareaValue, setTextareaValue] = useState('')
  const [stepperValue, setStepperValue] = useState(3)
  const [checked, setChecked] = useState(false)
  const [toggled, setToggled] = useState(true)
  const [segment, setSegment] = useState<'week' | 'month' | 'year'>('week')

  // Filters
  const [muscleFilter, setMuscleFilter] = useState<MuscleGroup>('all')

  // Overlays
  const [modalOpen, setModalOpen] = useState(false)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [actionSheetOpen, setActionSheetOpen] = useState(false)

  // Meal action row
  const [mealLoading, setMealLoading] = useState(false)

  function handleAte() {
    setMealLoading(true)
    setTimeout(() => setMealLoading(false), 1500)
  }

  return (
    <div className="mx-auto max-w-[430px] pb-24 pt-6">
      <TokenBoard />

      {/* ── 1. Foundations ─────────────────────────────── */}
      <Section title="01 · Foundations">
        <Row label="ProgressRing">
          <ProgressRing size={44} progress={72} color={colors.data.calories} aria-label="72% calories" />
          <ProgressRing size={44} progress={45} color={colors.data.protein} aria-label="45% protein" />
          <ProgressRing size={44} progress={100} color={colors.data.volume} aria-label="100% volume" />
          <ProgressRing size={64} stroke={5} progress={60} color={colors.data.calories} aria-label="60% large">
            <span className="font-mono text-[11px] font-semibold">60%</span>
          </ProgressRing>
        </Row>

        <Row label="MacroRings">
          <MacroRings calories={1840} calorieTarget={2500} protein={112} proteinTarget={160} />
        </Row>

        <Row label="LinearProgress — calories">
          <div className="w-full">
            <LinearProgress progress={72} color={colors.data.calories} aria-label="72% calories" />
          </div>
        </Row>
        <Row label="LinearProgress — protein">
          <div className="w-full">
            <LinearProgress progress={45} color={colors.data.protein} aria-label="45% protein" />
          </div>
        </Row>

        <Row label="StreakCounter">
          <StreakCounter days={14} />
          <StreakCounter days={1} />
          <StreakCounter days={0} />
        </Row>

        <Row label="Badge">
          <div className="relative inline-flex">
            <div className="h-8 w-8 rounded-full bg-[var(--color-bg-tertiary)]" />
            <Badge count={3} />
          </div>
          <div className="relative inline-flex">
            <div className="h-8 w-8 rounded-full bg-[var(--color-bg-tertiary)]" />
            <Badge count={99} />
          </div>
        </Row>

        <Row label="Tag">
          <Tag label="High protein" />
          <Tag label="Quick" />
          <Tag label="Nigerian" variant="removable" onClick={() => {}} />
          <Tag label="Breakfast" variant="filter" onClick={() => {}} />
        </Row>
      </Section>

      {/* ── 2. Buttons & Actions ───────────────────────── */}
      <Section title="02 · Buttons & Actions">
        <Row label="Button — primary">
          <Button>Log meal</Button>
          <Button size="sm">Log meal</Button>
        </Row>
        <Row label="Button — secondary + ghost">
          <Button variant="secondary">Skip</Button>
          <Button variant="ghost">Cancel</Button>
          <Button variant="destructive">Delete</Button>
        </Row>
        <Row label="Button — loading + disabled">
          <Button loading>Saving…</Button>
          <Button disabled>Unavailable</Button>
        </Row>

        <Row label="IconButton">
          <IconButton icon={<Plus size={20} />} label="Add item" />
          <IconButton icon={<Settings size={20} />} label="Settings" />
        </Row>

        <Row label="FloatingActionButton">
          <div className="relative h-16 w-16">
            <FloatingActionButton onClick={() => {}} label="Log something" />
          </div>
        </Row>

        <Row label="MealActionRow">
          <div className="w-full">
            <MealActionRow
              onAte={handleAte}
              onSwap={() => {}}
              onSkip={() => {}}
              loading={mealLoading}
            />
          </div>
        </Row>
      </Section>

      {/* ── 3. Inputs ──────────────────────────────────── */}
      <Section title="03 · Inputs">
        <Row label="TextInput — at rest">
          <div className="w-full">
            <TextInput
              label="Meal name"
              placeholder="e.g. Jollof rice with chicken"
              value={textValue}
              onChange={(e) => setTextValue(e.target.value)}
            />
          </div>
        </Row>
        <Row label="TextInput — error state">
          <div className="w-full">
            <TextInput label="Calories" value="abc" onChange={() => {}} error="Must be a number" />
          </div>
        </Row>
        <Row label="TextInput — helper text">
          <div className="w-full">
            <TextInput
              label="Body weight"
              value="78"
              onChange={() => {}}
              helperText="Measured fasted, in kg"
            />
          </div>
        </Row>

        <Row label="SearchInput">
          <div className="w-full">
            <SearchInput
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              onClear={() => setSearchValue('')}
              placeholder="Search foods…"
            />
          </div>
        </Row>

        <Row label="TextareaField">
          <div className="w-full">
            <TextareaField
              label="Notes"
              value={textareaValue}
              onChange={(e) => setTextareaValue(e.target.value)}
              placeholder="How did this meal feel?"
              maxLength={200}
            />
          </div>
        </Row>

        <Row label="Stepper">
          <Stepper value={stepperValue} onChange={setStepperValue} label="Servings" unit="x" />
        </Row>

        <Row label="Checkbox">
          <Checkbox checked={checked} onChange={setChecked} label="Mark as completed" />
        </Row>
        <Row label="Checkbox — checked">
          <Checkbox checked={true} onChange={() => {}} label="Protein target met" />
        </Row>

        <Row label="Toggle">
          <div className="w-full">
            <Toggle checked={toggled} onChange={setToggled} label="Push notifications" />
          </div>
        </Row>

        <Row label="SegmentedControl">
          <SegmentedControl<'week' | 'month' | 'year'>
            options={[
              { value: 'week', label: 'Week' },
              { value: 'month', label: 'Month' },
              { value: 'year', label: 'Year' },
            ]}
            value={segment}
            onChange={setSegment}
          />
        </Row>

        <Row label="HorizontalFilterTabs">
          <HorizontalFilterTabs<MuscleGroup>
            options={[
              { value: 'all', label: 'All' },
              { value: 'push', label: 'Push' },
              { value: 'pull', label: 'Pull' },
              { value: 'legs', label: 'Legs' },
              { value: 'core', label: 'Core' },
            ]}
            value={muscleFilter}
            onChange={setMuscleFilter}
          />
        </Row>
      </Section>

      {/* ── 4. Cards ───────────────────────────────────── */}
      <Section title="04 · Cards">
        <Row label="Card — default">
          <Card className="w-full p-4">
            <p className="text-[15px] text-[var(--color-text-primary)]">Default card</p>
            <p className="text-[13px] text-[var(--color-text-secondary)]">Subtle border, no shadow</p>
          </Card>
        </Row>
        <Row label="Card — interactive">
          <Card className="w-full p-4" onClick={() => {}}>
            <p className="text-[15px] text-[var(--color-text-primary)]">Tappable card</p>
            <p className="text-[13px] text-[var(--color-text-secondary)]">Pressed state darkens bg</p>
          </Card>
        </Row>
        <Row label="Card — selected">
          <Card variant="selected" className="w-full p-4">
            <p className="text-[15px] text-[var(--color-text-primary)]">Selected card</p>
            <p className="text-[13px] text-[var(--color-text-secondary)]">Black border, tinted bg</p>
          </Card>
        </Row>
        <Row label="Card — elevated">
          <Card variant="elevated" className="w-full p-4">
            <p className="text-[15px] text-[var(--color-text-primary)]">Elevated card</p>
          </Card>
        </Row>

        <Row label="SectionHeader — with action">
          <div className="w-full">
            <SectionHeader title="Today's meals" action="See all" onAction={() => {}} />
          </div>
        </Row>
        <Row label="SectionHeader — no action">
          <div className="w-full">
            <SectionHeader title="Workout plan" />
          </div>
        </Row>
      </Section>

      {/* ── 5. Lists ───────────────────────────────────── */}
      <Section title="05 · Lists">
        <Row label="ListItem variants">
          <div className="w-full overflow-hidden rounded-[var(--radius-lg)] border border-[var(--color-border-default)] bg-[var(--color-surface-default)]">
            <ListItem
              title="Breakfast"
              subtitle="07:30 · 620 kcal"
              leading={<Flame size={20} color={colors.data.calories} />}
              trailing="chevron"
              onClick={() => {}}
            />
            <ListItem
              title="Jollof rice with chicken"
              subtitle="Lunch · 480 kcal · 42g protein"
              trailing="value"
              trailingValue="480 kcal"
              divider
            />
            <ListItem
              title="Evening workout"
              subtitle="Push day · 45 min"
              trailing="chevron"
              onClick={() => {}}
              divider
            />
            <ListItem title="Disabled item" subtitle="Not available today" disabled />
          </div>
        </Row>
      </Section>

      {/* ── 6. Meal & Macros ───────────────────────────── */}
      <Section title="06 · Meal & Macros">
        <Row label="MetricCard — calories">
          <MetricCard
            label="Calories"
            value="1,840"
            sublabel="of 2,500 kcal"
            progress={73.6}
            ringColor={colors.data.calories}
          />
        </Row>
        <Row label="MetricCard — protein">
          <MetricCard
            label="Protein"
            value="112g"
            sublabel="of 160g"
            progress={70}
            ringColor={colors.data.protein}
          />
        </Row>
        <Row label="MetricCard — loading state">
          <MetricCard label="Calories" value={0} state="loading" />
        </Row>

        <Row label="MealTimelineRow — all statuses">
          <div className="w-full overflow-hidden rounded-[var(--radius-lg)] border border-[var(--color-border-default)] bg-[var(--color-surface-default)]">
            <MealTimelineRow
              time="07:30"
              slot="Breakfast"
              mealName="Oats with banana"
              calories={480}
              protein={22}
              status="eaten"
              onClick={() => {}}
            />
            <MealTimelineRow
              time="12:00"
              slot="Lunch"
              mealName="Jollof rice & chicken"
              calories={620}
              protein={45}
              status="due-soon"
              onClick={() => {}}
            />
            <MealTimelineRow
              time="15:00"
              slot="Snack"
              mealName="Greek yoghurt"
              calories={200}
              protein={18}
              status="skipped"
            />
            <MealTimelineRow
              time="19:00"
              slot="Dinner"
              mealName="Egusi soup & eba"
              calories={700}
              protein={38}
              status="upcoming"
              isLast
            />
          </div>
        </Row>

        <Row label="NextActionCard — upcoming">
          <div className="w-full">
            <NextActionCard
              mealName="Lunch"
              timeLabel="12:00 · DUE SOON"
              calories={620}
              protein={45}
              state="due-soon"
              onAte={() => {}}
              onSwap={() => {}}
              onSkip={() => {}}
            />
          </div>
        </Row>
        <Row label="NextActionCard — logged">
          <div className="w-full">
            <NextActionCard
              mealName="Breakfast"
              calories={480}
              protein={22}
              state="logged"
            />
          </div>
        </Row>
        <Row label="NextActionCard — no plan">
          <div className="w-full">
            <NextActionCard state="no-plan" onGenerate={() => {}} />
          </div>
        </Row>
      </Section>

      {/* ── 7. Navigation ──────────────────────────────── */}
      <Section title="07 · Navigation">
        <Row label="PageHeader — home variant">
          <div className="w-full overflow-hidden rounded-[var(--radius-lg)] border border-[var(--color-border-default)]">
            <PageHeader title="Today" variant="home" />
          </div>
        </Row>
        <Row label="PageHeader — back variant">
          <div className="w-full overflow-hidden rounded-[var(--radius-lg)] border border-[var(--color-border-default)]">
            <PageHeader title="Meal detail" variant="back" onLeft={() => {}} />
          </div>
        </Row>
        <Row label="PageHeader — modal variant (Save / Cancel)">
          <div className="w-full overflow-hidden rounded-[var(--radius-lg)] border border-[var(--color-border-default)]">
            <PageHeader
              title="Edit meal"
              variant="modal"
              onLeft={() => {}}
              rightLabel="Save"
              onRight={() => {}}
            />
          </div>
        </Row>
      </Section>

      {/* ── 8. Feedback & Loading ──────────────────────── */}
      <Section title="08 · Feedback & Loading">
        <Row label="Spinner — sizes">
          <Spinner size="sm" />
          <Spinner size="md" />
          <Spinner size="lg" />
        </Row>
        <Row label="Spinner — custom color">
          <Spinner size="md" color={colors.data.calories} />
          <Spinner size="md" color={colors.data.protein} />
        </Row>

        <Row label="SkeletonPulse — text lines">
          <SkeletonPulse className="h-4 w-32 rounded-full" />
          <SkeletonPulse className="h-4 w-20 rounded-full" />
        </Row>
        <Row label="SkeletonPulse — card">
          <div className="w-full space-y-3 rounded-[var(--radius-lg)] border border-[var(--color-border-default)] bg-[var(--color-surface-default)] p-4">
            <SkeletonPulse className="h-4 w-1/3 rounded-full" />
            <SkeletonPulse className="h-3 w-2/3 rounded-full" />
            <SkeletonPulse className="h-3 w-1/2 rounded-full" />
          </div>
        </Row>

        <ToastTriggers />
      </Section>

      {/* ── 9. Empty & Error ───────────────────────────── */}
      <Section title="09 · Empty & Error">
        <Row label="EmptyState">
          <div className="w-full rounded-[var(--radius-lg)] border border-[var(--color-border-default)] bg-[var(--color-surface-default)]">
            <EmptyState
              icon={<Flame size={48} color={colors.text.tertiary} />}
              title="No meals planned"
              body="Generate a weekly plan to see your meals here."
              action={<Button onClick={() => {}}>Generate plan</Button>}
            />
          </div>
        </Row>

        <Row label="EmptyState — no action">
          <div className="w-full rounded-[var(--radius-lg)] border border-[var(--color-border-default)] bg-[var(--color-surface-default)]">
            <EmptyState title="Nothing here yet" body="Check back after your first log." />
          </div>
        </Row>

        <Row label="ErrorState">
          <div className="w-full rounded-[var(--radius-lg)] border border-[var(--color-border-default)] bg-[var(--color-surface-default)]">
            <ErrorState
              title="Couldn't load meals"
              message="Check your connection and try again."
              onRetry={() => {}}
            />
          </div>
        </Row>
      </Section>

      {/* ── 10. Workouts & Overlays ────────────────────── */}
      <Section title="10 · Workouts & Overlays">
        <Row label="WorkoutCard — upcoming (expandable)">
          <div className="w-full">
            <WorkoutCard
              splitLabel="Push day"
              muscleGroups="Chest · Shoulders · Triceps"
              exerciseCount={4}
              estimatedMinutes={45}
              exercises={[
                { name: 'Bench press', target: '4 × 8 @ 80kg' },
                { name: 'Overhead press', target: '3 × 10 @ 50kg' },
                { name: 'Tricep dips', target: '3 × 12' },
                { name: 'Cable flys', target: '3 × 15 @ 15kg' },
              ]}
              status="upcoming"
              onComplete={() => {}}
            />
          </div>
        </Row>
        <Row label="WorkoutCard — completed">
          <div className="w-full">
            <WorkoutCard
              splitLabel="Pull day"
              muscleGroups="Back · Biceps"
              exerciseCount={3}
              estimatedMinutes={40}
              exercises={[
                { name: 'Pull-ups', target: '4 × 8' },
                { name: 'Barbell rows', target: '3 × 10 @ 60kg' },
                { name: 'Face pulls', target: '3 × 15 @ 20kg' },
              ]}
              status="completed"
              completedMinutes={38}
            />
          </div>
        </Row>

        <Row label="Modal">
          <Button onClick={() => setModalOpen(true)}>Open modal</Button>
          <Modal
            open={modalOpen}
            onClose={() => setModalOpen(false)}
            title="Confirm skip"
            body="Are you sure you want to skip lunch? This will affect your daily targets."
            primaryLabel="Skip meal"
            secondaryLabel="Cancel"
            onPrimary={() => setModalOpen(false)}
            onSecondary={() => setModalOpen(false)}
          />
        </Row>

        <Row label="BottomSheet">
          <Button onClick={() => setSheetOpen(true)}>Open bottom sheet</Button>
          <BottomSheet open={sheetOpen} onClose={() => setSheetOpen(false)} title="Swap meal">
            <div className="flex flex-col gap-3 pb-4">
              {[
                'Egusi soup with eba',
                'Grilled salmon + rice',
                'Chicken stew + pasta',
                'Greek yoghurt + granola',
              ].map((meal) => (
                <Card key={meal} className="p-4" onClick={() => setSheetOpen(false)}>
                  <p className="text-[15px] text-[var(--color-text-primary)]">{meal}</p>
                </Card>
              ))}
            </div>
          </BottomSheet>
        </Row>

        <Row label="ActionSheet">
          <Button variant="secondary" onClick={() => setActionSheetOpen(true)}>
            Open action sheet
          </Button>
          <ActionSheet
            open={actionSheetOpen}
            onClose={() => setActionSheetOpen(false)}
            actions={[
              { label: 'Edit meal', onPress: () => setActionSheetOpen(false) },
              { label: 'Swap meal', onPress: () => setActionSheetOpen(false) },
              { label: 'Skip meal', onPress: () => setActionSheetOpen(false) },
              {
                label: 'Delete from plan',
                onPress: () => setActionSheetOpen(false),
                destructive: true,
              },
            ]}
          />
        </Row>
      </Section>
    </div>
  )
}

// ─────────────────────────────────────────────────────────
// Page export — wraps gallery in ToastProvider
// ─────────────────────────────────────────────────────────

export default function ComponentGalleryPage() {
  return (
    <ToastProvider>
      <Gallery />
    </ToastProvider>
  )
}
