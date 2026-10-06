// Geometry for the Today calendar sheet. Every element is a pure function of a
// single progress value p ∈ [0, 1], so collapsing replays expansion exactly.
// Numbers come from the design handoff (393pt frame); horizontal positions are
// derived from the live width so the morph holds on wider phones.

/** Sheet height excluding the device status bar / safe-area inset. */
export const COLLAPSED_BODY = 115
const ROW_PITCH = 52
const GRID_TOP = 76
/** Badge row (9 + 20) and the gap to the calendar region. */
export const REGION_TOP = 38
const REGION_BOTTOM_GAP = 19
const COLLAPSED_LEFT = 68
const COLLAPSED_RIGHT = 21
const EXPANDED_LEFT = 16
const EXPANDED_RIGHT = 18
const GAP = 4

export function getSheetBounds(rowCount: number) {
  // Four rows → 339, i.e. the handoff's 401 minus the 62pt status bar.
  const max = REGION_TOP + REGION_BOTTOM_GAP + GRID_TOP + ROW_PITCH * rowCount - 2
  return { min: COLLAPSED_BODY, max }
}

const clamp01 = (x: number) => Math.max(0, Math.min(1, x))
const lerp = (a: number, b: number, t: number) => a + (b - a) * t
function smoothstep(a: number, b: number, x: number) {
  const t = clamp01((x - a) / (b - a))
  return t * t * (3 - 2 * t)
}

export type CellFrame = {
  x: number
  y: number
  width: number
  opacity: number
  scale: number
  zIndex: number
  interactive: boolean
}

export type HeaderFrame = {
  x: number
  y: number
  width: number
  height: number
  bgAlpha: number
  /** 0 → tertiary text, 1 → secondary text */
  colorMix: number
  shortOpacity: number
  longOpacity: number
}

export type CalendarMorph = {
  progress: number
  isOpen: boolean
  regionHeight: number
  numberY: number
  rows: CellFrame[][]
  headers: HeaderFrame[]
  monthPill: { width: number; height: number; y: number; labelOpacity: number; labelX: number }
  close: { opacity: number; scale: number }
}

export function getCalendarMorph({
  height,
  width,
  rowCount,
  activeRow,
}: {
  height: number
  width: number
  rowCount: number
  activeRow: number
}): CalendarMorph {
  const { min, max } = getSheetBounds(rowCount)
  const p = clamp01((height - min) / (max - min))
  const isOpen = p >= 0.5

  const collapsedCellWidth = (width - COLLAPSED_LEFT - COLLAPSED_RIGHT - GAP * 6) / 7
  const expandedCellWidth = (width - EXPANDED_LEFT - EXPANDED_RIGHT - GAP * 6) / 7
  const columnX = (column: number, t: number) => lerp(
    COLLAPSED_LEFT + (collapsedCellWidth + GAP) * column,
    EXPANDED_LEFT + (expandedCellWidth + GAP) * column,
    t,
  )

  const q = smoothstep(0, 0.9, p)
  const cellWidth = lerp(collapsedCellWidth, expandedCellWidth, q)
  const activeY = lerp(4, GRID_TOP + ROW_PITCH * activeRow, q)

  const rows = Array.from({ length: rowCount }, (_, row) => {
    const distance = Math.abs(row - activeRow)
    // Handoff staggers rows 1–3 by 0.1; capped so 5- and 6-week months still land at p = 1.
    const emerge = distance === 0
      ? 1
      : smoothstep(Math.min(0.18 + 0.1 * (distance - 1), 0.45), Math.min(0.72 + 0.1 * (distance - 1), 1), p)

    return Array.from({ length: 7 }, (_, column): CellFrame => ({
      x: columnX(column, q),
      y: activeY + ROW_PITCH * (row - activeRow) * emerge,
      width: cellWidth,
      opacity: distance === 0 ? 1 : Math.pow(emerge, 1.4),
      scale: distance === 0 ? 1 : 0.94 + 0.06 * emerge,
      zIndex: 10 - distance,
      interactive: distance === 0 || isOpen,
    }))
  })

  const qh = smoothstep(0, 0.85, p)
  const headers = Array.from({ length: 7 }, (_, column): HeaderFrame => ({
    x: columnX(column, qh),
    y: lerp(12, 48, qh),
    width: lerp(collapsedCellWidth, expandedCellWidth, qh),
    height: lerp(16, 24, qh),
    bgAlpha: smoothstep(0.25, 0.8, p),
    colorMix: qh,
    shortOpacity: 1 - smoothstep(0.2, 0.6, p),
    longOpacity: smoothstep(0.35, 0.85, p),
  }))

  const bq = smoothstep(0, 0.8, p)
  const labelOpacity = smoothstep(0.35, 0.85, p)
  const closeOpacity = smoothstep(0.45, 1, p)

  return {
    progress: p,
    isOpen,
    regionHeight: Math.max(height - REGION_TOP - REGION_BOTTOM_GAP, COLLAPSED_BODY - REGION_TOP - REGION_BOTTOM_GAP),
    numberY: lerp(24, 16, q),
    rows,
    headers,
    monthPill: {
      width: lerp(40, 131, bq),
      height: lerp(40, 36, bq),
      y: lerp(8, 0, bq),
      labelOpacity,
      labelX: (1 - labelOpacity) * -6,
    },
    close: { opacity: closeOpacity, scale: 0.7 + 0.3 * closeOpacity },
  }
}
