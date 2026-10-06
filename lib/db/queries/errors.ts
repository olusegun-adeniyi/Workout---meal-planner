import { NextResponse } from 'next/server'

/** Thrown when a table from supabase/schema.sql hasn't been created yet. */
export class SetupRequiredError extends Error {
  constructor(table: string) {
    super(`The Supabase ${table} table is missing.`)
    this.name = 'SetupRequiredError'
  }
}

type PostgrestLikeError = { code?: string; message?: string }

export function throwIfMissingTable(error: PostgrestLikeError, table: string) {
  if (error.code === 'PGRST205' || error.code === '42P01' || error.message?.includes(`'public.${table}'`)) {
    throw new SetupRequiredError(table)
  }
}

export function queryErrorResponse(error: unknown, fallback: string) {
  if (error instanceof SetupRequiredError) {
    return NextResponse.json(
      { error: error.message, setupRequired: 'Run supabase/schema.sql in the Supabase SQL Editor.' },
      { status: 424 },
    )
  }
  if (error instanceof Error && error.message.startsWith('Missing required environment variable')) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  console.error(fallback, error)
  return NextResponse.json({ error: fallback }, { status: 500 })
}
