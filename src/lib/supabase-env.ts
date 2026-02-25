function readEnv(name: string): string | undefined {
  const value = process.env[name]
  return value && value.length > 0 ? value : undefined
}

export function getSupabaseUrl(): string {
  const url = readEnv('NEXT_PUBLIC_SUPABASE_URL') ?? 'https://kjowcookmfwbeydpkqgl.supabase.co'
  if (!url) {
    throw new Error('Missing Supabase URL. Set NEXT_PUBLIC_SUPABASE_URL.')
  }
  return url
}

export function getSupabasePublishableKey(): string {
  const key = readEnv('NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY') ?? 'sb_publishable_nRvi2SUP2Ak_z1lyQFSrNg_IlBcCsDU'

  if (!key) {
    throw new Error('Missing Supabase publishable key. Set NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY.')
  }

  return key
}