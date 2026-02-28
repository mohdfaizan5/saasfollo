'use client'

import { cn } from '@/lib/utils'
// import { createClient } from '@/lib/client'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { createClient } from '@/lib/client'
import { FacebookLogoIcon, GithubLogoIcon, GoogleLogoIcon, TwitterLogoIcon } from '@phosphor-icons/react/dist/ssr'
import { EyeIcon, EyeOffIcon } from "lucide-react"
import Logo from './logo'

export function LoginForm({ className, ...props }: React.ComponentPropsWithoutRef<'div'>) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isVisible, setIsVisible] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const toggleVisibility = () => setIsVisible((prevState) => !prevState)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (error) throw error
      // Update this route to redirect to an authenticated route. The user already has an active session.
      router.push('/projects')
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className={cn('flex flex-col gap-6', className)} {...props}>
      <Logo height={24} width={24} className='flex md:hidden justify-end mb-10' full textClassName="text-foreground ml-[1px] text-base font-medium" />

      <div>
        <CardTitle className="text-2xl">Login</CardTitle>
        <CardDescription>Enter your email below to login to your account</CardDescription>
      </div>

      <form onSubmit={handleLogin}>
        <div className="flex flex-col gap-6">
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="m@example.com"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <div className="flex items-center">
              <Label htmlFor="password">Password</Label>
              <Link
                href="/auth/forgot-password"
                className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
              >
                Forgot your password?
              </Link>
            </div>
            <div className="relative">
              <Input
                id="password"
                type={isVisible ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pe-9"
              />
              <button
                aria-controls="password"
                aria-label={isVisible ? "Hide password" : "Show password"}
                aria-pressed={isVisible}
                className="absolute inset-y-0 end-0 flex h-full w-9 items-center justify-center rounded-e-md text-muted-foreground/80 outline-none transition-[color,box-shadow] hover:text-foreground focus:z-10 focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
                onClick={toggleVisibility}
                type="button"
              >
                {isVisible ? (
                  <EyeOffIcon aria-hidden="true" size={16} />
                ) : (
                  <EyeIcon aria-hidden="true" size={16} />
                )}
              </button>
            </div>
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Logging in...' : 'Login'}
          </Button>
        </div>
        <div className="mt-4 text-center text-sm">
          Don&apos;t have an account?{' '}
          <Link href="/auth/sign-up" className="underline underline-offset-4">
            Sign up
          </Link>
        </div>
      </form>
      <div className=''>
        <p className="text-xs text-center text-foreground/60">
          (or)
        </p>
        <div className="flex flex-wrap gap-2 mt-2">
          <Button
            aria-label="Sign up with Google"
            className="flex-1  relative h-10"
            variant="outline"
            disabled
          >
            {/* Google */}
            <GoogleLogoIcon
              aria-hidden="true"
              // className="text-[#DB4437] -"
              size={16}
            />
            <span className='-ml-2'>
              oogle
            </span>
            <span className="absolute text-[10px] top-0 right-0 font-medium text-foreground/80">Coming soon</span>
          </Button>
          <Button
            aria-label="Sign up with GitHub"
            className="flex-1 relative h-10"
            variant="outline"
            disabled
          >
            <GithubLogoIcon
              aria-hidden="true"
              className="text-black dark:text-primary opacity-30"
              size={16}
            /> <span className='-ml-2'>
              Github
            </span>
            <span className="absolute top-0 right-0 text-[10px] font-medium text-foreground/80">Coming soon</span>
          </Button>
        </div>
      </div>

    </div>
  )
}
