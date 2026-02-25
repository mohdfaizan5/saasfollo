[MDX] started dev server
✓ Ready in 1459ms
 GET /auth/login 200 in 839ms (compile: 240ms, proxy.ts: 188ms, render: 411ms)       
 GET /projects 200 in 4.0s (compile: 2.7s, proxy.ts: 642ms, render: 586ms)
 GET /projects/HdJz7hwz0YEVtwQM8Q/dashboard 200 in 4.9s (compile: 3.0s, proxy.ts: 10ms, render: 1853ms)
 GET /projects/DetgRecEV5lqQvXNYG/dashboard 200 in 1121ms (compile: 23ms, proxy.ts: 8ms, render: 1090ms)
 GET /projects/DetgRecEV5lqQvXNYG/build 200 in 3.7s (compile: 2.5s, proxy.ts: 13ms, render: 1176ms)
⨯ Error: Your project's URL and Key are required to create a Supabase client!

Check your Supabase project's API settings to find these values

https://supabase.com/dashboard/project/_/settings/api
    at <unknown> (https://supabase.com/dashboard/project/_/settings/api)
    at updateSession (src\lib\supabase-middleware.ts:11:38)
    at proxy (src\proxy.ts:5:29)
   9 |   // With Fluid compute, don't put this client in a global environment        
  10 |   // variable. Always create a new one on each request.
> 11 |   const supabase = createServerClient(
     |                                      ^
  12 |     process.env.PUBLIC_SUPABASE_URL!,
  13 |     process.env.PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY!,
  14 |     {
✓ Compiled in 1672ms
⨯ Error: Your project's URL and Key are required to create a Supabase client!

Check your Supabase project's API settings to find these values

https://supabase.com/dashboard/project/_/settings/api
    at <unknown> (https://supabase.com/dashboard/project/_/settings/api)
    at updateSession (src\lib\supabase-middleware.ts:11:38)
    at proxy (src\proxy.ts:5:29)
   9 |   // With Fluid compute, don't put this client in a global environment        
  10 |   // variable. Always create a new one on each request.
> 11 |   const supabase = createServerClient(
     |                                      ^
  12 |     process.env.PUBLIC_SUPABASE_URL!,
  13 |     process.env.PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY!,
  14 |     {
 GET /projects/DetgRecEV5lqQvXNYG/build 404 in 432ms (compile: -162742µs, proxy.ts: 407ms, render: 188ms)
 GET /projects/DetgRecEV5lqQvXNYG/build 404 in 764ms (compile: -15830µs, proxy.ts: 757ms, render: 23ms)
⨯ Error: Your project's URL and Key are required to create a Supabase client!

Check your Supabase project's API settings to find these values

https://supabase.com/dashboard/project/_/settings/api
    at <unknown> (https://supabase.com/dashboard/project/_/settings/api)
    at updateSession (src\lib\supabase-middleware.ts:11:38)
    at proxy (src\proxy.ts:5:29)
   9 |   // With Fluid compute, don't put this client in a global environment        
  10 |   // variable. Always create a new one on each request.
> 11 |   const supabase = createServerClient(
     |                                      ^
  12 |     process.env.PUBLIC_SUPABASE_URL!,
  13 |     process.env.PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY!,
  14 |     {
✓ Compiled in 449ms