import type { SVGProps } from 'react'

// Bundled from Iconify (mingcute, fa7-solid, tabler, foundation) to match the
// handoff exactly without adding an icon dependency. Colour via `currentColor`.

type IconProps = Omit<SVGProps<SVGSVGElement>, 'viewBox'> & { size?: number }

function base({ size = 16, ...props }: IconProps) {
  return { width: size, height: size, 'aria-hidden': true, focusable: false, ...props }
}

export function StreakIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" {...base(props)}>
      <path fill="currentColor" d="M17.42 3a2 2 0 0 1 1.736 1.008L22.49 9.84a2 2 0 0 1-.322 2.406l-9.283 9.283a1.25 1.25 0 0 1-1.768 0l-9.283-9.283a2 2 0 0 1-.322-2.406l3.333-5.833A2 2 0 0 1 6.58 3zm-.713 6.293a1 1 0 0 0-1.414 0L12 12.586L8.707 9.293a1 1 0 1 0-1.414 1.414l3.823 3.823a1.25 1.25 0 0 0 1.768 0l3.823-3.823a1 1 0 0 0 0-1.414" />
    </svg>
  )
}

export function CalendarIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" {...base(props)}>
      <path fill="currentColor" d="M18 3a2 2 0 0 1 2 2v2h.191a1.5 1.5 0 0 1 1.342 2.17L20 12.237V19a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-6.764L2.467 9.171A1.5 1.5 0 0 1 3.81 7h.192V5a2 2 0 0 1 2-2zm-7.5 9.017c0-.751-.79-1.240-1.461-.904l-.986.492a1 1 0 0 0 .448 1.895V16a1 1 0 0 0 2 0zm3-1.017a2 2 0 0 0-2 2v2a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-2a2 2 0 0 0-2-2zm1 4h-1v-2h1zM6 7h12V5H6z" />
    </svg>
  )
}

export function ClockIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" {...base(props)}>
      <path fill="currentColor" d="M12 2c5.523 0 10 4.477 10 10s-4.477 10-10 10S2 17.523 2 12S6.477 2 12 2m0 4a1 1 0 0 0-1 1v5a1 1 0 0 0 .293.707l3 3a1 1 0 1 0 1.414-1.414L13 11.586V7a1 1 0 0 0-1-1" />
    </svg>
  )
}

export function ProteinIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" {...base(props)}>
      <path fill="currentColor" fillRule="evenodd" clipRule="evenodd" d="M6.757 6.757c-2.4 2.401-3.565 5.077-3.872 7.436c-.299 2.301.21 4.458 1.397 5.645c.791.791 1.711 1.18 2.72 1.161c.961-.018 1.894-.406 2.764-.938c1.697-1.04 3.532-2.874 5.4-4.743l.152-.152c1.870-1.868 3.704-3.703 4.743-5.4c.533-.87.92-1.803.939-2.765c.02-1.008-.37-1.928-1.161-2.719c-1.187-1.187-3.344-1.696-5.645-1.397c-2.36.306-5.035 1.47-7.437 3.872m-1.066 4.907a9.8 9.8 0 0 0-.742 2.284q.631.54 1.492.829a1 1 0 0 0 .633-1.898c-.667-.222-1.112-.611-1.383-1.215m7.420-6.515c-.618.178-1.259.43-1.907.768c.52.846 1.299 1.452 2.308 1.789a1 1 0 1 0 .633-1.898c-.434-.144-.774-.36-1.034-.66m-3.790 3.287a5 5 0 0 1-.63-.758a14 14 0 0 0-1.406 1.469c.194.25.406.488.621.703c.585.585 1.333 1.145 2.07 1.391a1 1 0 1 0 .633-1.897c-.323-.108-.812-.431-1.288-.908" />
    </svg>
  )
}

export function ProgressIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" {...base(props)}>
      <path fill="currentColor" d="M21 3a1 1 0 0 1 .102 1.995L21 5v11a2 2 0 0 1-2 2h-5.056l2.294 2.293a1 1 0 0 1-1.414 1.414l-2.829-2.828l-2.828 2.828a1 1 0 1 1-1.414-1.414L10.046 18H5a2 2 0 0 1-2-2V5a1 1 0 0 1 0-2zm-3.343 4.172a1 1 0 0 0-1.414 0l-3.536 3.535l-2.113-2.113a1.010 1.010 0 0 0-1.428 0l-2.821 2.822a1 1 0 0 0 1.414 1.414l2.12-2.122l2.114 2.113a1.010 1.010 0 0 0 1.429 0l4.235-4.235a1 1 0 0 0 0-1.414" />
    </svg>
  )
}

export function FireIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 640 640" {...base(props)}>
      <path fill="currentColor" d="M256.5 37.6c9.3-7.8 23-7.5 31.9.9c12.3 11.6 23.3 24.4 33.9 37.4c13.5 16.5 29.7 38.3 45.3 64.2c5.2-6.8 10-12.8 14.2-17.9c1.1-1.3 2.2-2.7 3.3-4.1c7.9-9.8 17.7-22.1 30.8-22.1c13.4 0 22.8 11.9 30.8 22.1q1.95 2.55 3.9 4.8c10.3 12.4 24 30.3 37.7 52.4c27.2 43.9 55.6 106.4 55.6 176.6c0 123.7-100.3 224-224 224S96 475.7 96 352c0-91.1 41.1-170 80.5-225c19.9-27.7 39.7-49.9 54.6-65.1c8.2-8.4 16.5-16.7 25.5-24.2zM321.7 480c25.3 0 47.7-7 68.8-21c42.1-29.4 53.4-88.2 28.1-134.4c-4.5-9-16-9.6-22.5-2l-25.2 29.3c-6.6 7.6-18.5 7.4-24.7-.5c-17.3-22.1-49.1-62.4-65.3-83c-5.4-6.9-15.2-8-21.5-1.9c-18.3 17.8-51.5 56.8-51.5 104.3c0 68.6 50.6 109.2 113.7 109.2z" />
    </svg>
  )
}

function StrokeIcon({ d, ...props }: IconProps & { d: string }) {
  return (
    <svg viewBox="0 0 24 24" {...base(props)}>
      <path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={d} />
    </svg>
  )
}

export function CloseIcon(props: IconProps) {
  return <StrokeIcon d="M18 6L6 18M6 6l12 12" {...props} />
}

export function CheckIcon(props: IconProps) {
  return <StrokeIcon d="m5 12l5 5L20 7" {...props} />
}

export function ChevronDownIcon(props: IconProps) {
  return <StrokeIcon d="m6 9l6 6l6-6" {...props} />
}

export function HomeIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 100 100" {...base(props)}>
      <path fill="currentColor" d="M83.505 37.85L51.013 12.688a2.51 2.51 0 0 0-3.1.025L16.46 37.874a2.5 2.5 0 0 0-.939 1.956v45.5a2.504 2.504 0 0 0 2.505 2.505h18.697a2.506 2.506 0 0 0 2.505-2.505V57.471h21.54V85.33a2.505 2.505 0 0 0 2.505 2.505h18.7a2.506 2.506 0 0 0 2.505-2.505v-45.5a2.5 2.5 0 0 0-.973-1.98" />
    </svg>
  )
}

export function SwapIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" {...base(props)}>
      <path fill="currentColor" d="M20 15.5a1 1 0 1 0 2 0zM3.418 12.706a1 1 0 1 0 1.911.588L4.373 13zm7.035.237a1 1 0 1 0-.348-1.97l.174.985zM4.37 13l-.985.174a1 1 0 0 0 1.159.81zm-.057-6.082a1 1 0 1 0-1.970.347l.985-.174zM12.5 7v1a7.5 7.5 0 0 1 7.5 7.5h2A9.5 9.5 0 0 0 12.5 6zm-8.127 6l.956.294A7.5 7.5 0 0 1 12.5 8V6a9.5 9.5 0 0 0-9.081 6.706zm5.906-1.042l-.174-.985l-5.909 1.042l.174.985l.174.985l5.909-1.042zM4.37 13l.985-.174l-1.042-5.908l-.985.173l-.985.174l1.042 5.909z" />
    </svg>
  )
}

export function PlusIcon(props: IconProps) {
  return <StrokeIcon d="M12 5v14m-7-7h14" {...props} />
}

export function CameraIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" {...base(props)}>
      <path fill="currentColor" d="M12 11a2 2 0 1 0 0 4a2 2 0 1 0 0-4" />
      <path fill="currentColor" d="M20 5h-3l-2.32-1.790a.98.98 0 0 0-.61-.21H9.930c-.22 0-.44.07-.61.21L7 5H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2m-8 12c-2.17 0-4-1.830-4-4s1.830-4 4-4s4 1.830 4 4s-1.830 4-4 4m7-8c-.55 0-1-.45-1-1s.45-1 1-1s1 .45 1 1s-.45 1-1 1" />
    </svg>
  )
}

export function EditIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" {...base(props)}>
      <path fill="currentColor" d="m18.777 16.468l-4.243 4.243a1 1 0 0 1-.707.293H11a1 1 0 0 1-1-1v-2.830c0-.264.106-.519.293-.706l4.242-4.242zM17 2a2 2 0 0 1 2 2v4.020a5 5 0 0 0-4.466 1.377l-5.656 5.657a3 3 0 0 0-.879 2.120v2.830c0 .343.062.679.174.996H5a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2zm-1.052 8.812a3 3 0 0 1 4.243 4.242zM7 6a1 1 0 0 0 0 2h4a1 1 0 1 0 0-2z" />
    </svg>
  )
}
