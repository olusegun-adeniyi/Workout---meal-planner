'use client' // useId for per-instance SVG filter ids

import { useId } from 'react'
import { getFoodIllustrationSrc } from '@/lib/food-illustrations'
import type { RecommendedMeal } from '@/lib/recommendations'

function MealIllustration({
  slot,
  className = '',
}: {
  slot: string
  className?: string
}) {
  const filterId = `watercolor-${slot}-${useId().replace(/:/g, '')}`
  const palette = {
    breakfast: {
      wash: '#fff4c7',
      accent: '#d97706',
      green: '#83c56b',
      red: '#f97316',
      title: 'Porridge bowl illustration',
    },
    brunch: {
      wash: '#f8e8ff',
      accent: '#7c3aed',
      green: '#a3e635',
      red: '#dc2626',
      title: 'Yoghurt bowl illustration',
    },
    lunch: {
      wash: '#ffe8c7',
      accent: '#dc2626',
      green: '#22c55e',
      red: '#f97316',
      title: 'Rice and chicken illustration',
    },
    dinner: {
      wash: '#fde2c4',
      accent: '#92400e',
      green: '#65a30d',
      red: '#dc2626',
      title: 'Stew rice and plantain illustration',
    },
  }[slot] ?? {
    wash: '#f2f2f0',
    accent: '#9a9a98',
    green: '#16a34a',
    red: '#d97706',
    title: 'Meal illustration',
  }

  return (
    <svg
      viewBox="0 0 220 150"
      role="img"
      aria-label={palette.title}
      className={className}
    >
      <filter id={filterId} x="-20%" y="-20%" width="140%" height="140%">
        <feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="2" seed="8" />
        <feDisplacementMap in="SourceGraphic" scale="1.4" />
      </filter>
      <ellipse cx="106" cy="124" rx="76" ry="13" fill="#dbeafe" opacity="0.45" filter={`url(#${filterId})`} />
      <path
        d="M55 93c22-32 89-37 124-11 13 10 15 24 3 32-32 20-119 21-145 2-10-8-5-17 18-23Z"
        fill={palette.wash}
        opacity="0.75"
        filter={`url(#${filterId})`}
      />
      <path
        d="M51 86c21-25 92-32 126-9 14 9 13 25-2 34-32 19-112 19-142 1-14-8-6-19 18-26Z"
        fill="none"
        stroke="#7c3f18"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.72"
      />
      {slot === 'breakfast' && (
        <>
          <ellipse cx="106" cy="78" rx="58" ry="31" fill="#fff7d6" opacity="0.9" />
          <ellipse cx="106" cy="76" rx="44" ry="20" fill="#f8dca4" opacity="0.75" filter={`url(#${filterId})`} />
          <path d="M78 66c18 8 34 8 57 0" fill="none" stroke={palette.accent} strokeWidth="4" strokeLinecap="round" opacity="0.55" />
          <circle cx="137" cy="82" r="11" fill="#facc15" opacity="0.82" />
          <path d="M131 77c8 3 12 7 14 12" fill="none" stroke="#854d0e" strokeWidth="2" opacity="0.45" />
        </>
      )}
      {slot === 'brunch' && (
        <>
          <path d="M72 65h88l-10 45H82L72 65Z" fill="#f8fafc" stroke="#7c3f18" strokeWidth="3" opacity="0.88" />
          <path d="M84 76c23 10 45 10 66 0l-5 24H88Z" fill="#f5d0fe" opacity="0.8" filter={`url(#${filterId})`} />
          <circle cx="94" cy="77" r="6" fill={palette.red} opacity="0.78" />
          <circle cx="124" cy="83" r="5" fill="#2563eb" opacity="0.7" />
          <path d="M104 68c13 8 27 8 41 0" fill="none" stroke="#b45309" strokeWidth="4" strokeLinecap="round" opacity="0.45" />
        </>
      )}
      {slot === 'lunch' && (
        <>
          <ellipse cx="113" cy="82" rx="57" ry="29" fill="#fff7ed" stroke="#7c3f18" strokeWidth="3" opacity="0.9" />
          <path d="M75 82c22-12 57-14 77-1-20 18-55 21-77 1Z" fill="#f97316" opacity="0.75" filter={`url(#${filterId})`} />
          <path d="M132 62c18 7 28 19 27 34-20 0-33-8-39-22 4-6 8-10 12-12Z" fill="#f8d9b0" stroke="#7c3f18" strokeWidth="2.5" opacity="0.9" />
          <path d="M73 99c12-11 27-14 43-8" fill="none" stroke={palette.green} strokeWidth="7" strokeLinecap="round" opacity="0.58" />
        </>
      )}
      {slot === 'dinner' && (
        <>
          <ellipse cx="105" cy="83" rx="58" ry="29" fill="#fff7ed" stroke="#7c3f18" strokeWidth="3" opacity="0.9" />
          <path d="M72 78c28-15 60-13 90 2-16 23-70 29-90-2Z" fill="#b45309" opacity="0.7" filter={`url(#${filterId})`} />
          <path d="M142 96c13-10 27-10 41-1-9 12-24 16-40 10Z" fill="#facc15" stroke="#92400e" strokeWidth="2.5" opacity="0.85" />
          <circle cx="95" cy="76" r="7" fill={palette.red} opacity="0.65" />
          <path d="M70 99c17 7 36 9 57 4" fill="none" stroke={palette.green} strokeWidth="5" strokeLinecap="round" opacity="0.55" />
        </>
      )}
      <path
        d="M56 91c24-20 86-27 123-8M44 107c33 20 111 22 141 2"
        fill="none"
        stroke="#7c3f18"
        strokeWidth="1.6"
        strokeLinecap="round"
        opacity="0.42"
      />
    </svg>
  )
}

export function FoodArtwork({
  meal,
  className = '',
  imageClassName = '',
}: {
  meal: Pick<RecommendedMeal, 'id' | 'name'>
  className?: string
  imageClassName?: string
}) {
  const illustrationSrc = getFoodIllustrationSrc(meal)

  if (illustrationSrc) {
    return (
      <img
        src={illustrationSrc}
        alt={`Watercolor illustration of ${meal.name}`}
        className={`object-contain ${className} ${imageClassName}`}
      />
    )
  }

  return <MealIllustration slot={meal.id} className={className} />
}
