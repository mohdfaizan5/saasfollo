import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    "https://kjowcookmfwbeydpkqgl.supabase.co",
    "sb_publishable_nRvi2SUP2Ak_z1lyQFSrNg_IlBcCsDU"
  )
}
// export function createClient() {
//   return createBrowserClient(
//     process.env.PUBLIC_SUPABASE_URL!,
//     process.env.PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY!
//   )
// }
