'use client'

import { cn } from '@/lib/utils'
import { createClient } from '@/lib/client'
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
import { FacebookLogoIcon, GithubLogoIcon, GoogleLogoIcon, TwitterLogoIcon } from '@phosphor-icons/react/dist/ssr'
import { EyeIcon, EyeOffIcon } from "lucide-react"

function getAuthErrorMessage(error: unknown): string {
  const message = error instanceof Error ? error.message : ''
  if (/failed to fetch|fetch failed|network|timeout/i.test(message)) {
    return 'Unable to reach authentication server. Please check your internet connection and try again.'
  }
  return error instanceof Error ? error.message : 'An error occurred'
}

export function SignUpForm({ className, ...props }: React.ComponentPropsWithoutRef<'div'>) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [repeatPassword, setRepeatPassword] = useState('')
  const [isVisible, setIsVisible] = useState<boolean>(false)
  const [isRepeatVisible, setIsRepeatVisible] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const toggleVisibility = () => setIsVisible((prevState) => !prevState)
  const toggleRepeatVisibility = () => setIsRepeatVisible((prevState) => !prevState)

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    if (password !== repeatPassword) {
      setError('Passwords do not match')
      setIsLoading(false)
      return
    }

    try {
      const { error, data } = await supabase.auth.signUp({
        email,
        password,
      })
      if (error) throw error
      // If email verification is disabled, session is returned immediately.
      // Use full navigation so the fresh auth cookie reaches the server.
      if (data.session) {
        window.location.href = '/onboarding'
      } else {
        // Fallback: email verification is enabled
        router.push('/auth/sign-up-success')
      }
    } catch (error: unknown) {
      setError(getAuthErrorMessage(error))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className={cn('flex flex-col gap-6', className)} {...props}>

      <div>
        <CardTitle className="text-2xl">Sign up</CardTitle>
        <CardDescription>Create a new account</CardDescription>
      </div>

      <form onSubmit={handleSignUp}>
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
          <div className="grid gap-2">
            <div className="flex items-center">
              <Label htmlFor="repeat-password">Repeat Password</Label>
            </div>
            <div className="relative">
              <Input
                id="repeat-password"
                type={isRepeatVisible ? "text" : "password"}
                required
                value={repeatPassword}
                onChange={(e) => setRepeatPassword(e.target.value)}
                className="pe-9"
              />
              <button
                aria-controls="repeat-password"
                aria-label={isRepeatVisible ? "Hide password" : "Show password"}
                aria-pressed={isRepeatVisible}
                className="absolute inset-y-0 end-0 flex h-full w-9 items-center justify-center rounded-e-md text-muted-foreground/80 outline-none transition-[color,box-shadow] hover:text-foreground focus:z-10 focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
                onClick={toggleRepeatVisibility}
                type="button"
              >
                {isRepeatVisible ? (
                  <EyeOffIcon aria-hidden="true" size={16} />
                ) : (
                  <EyeIcon aria-hidden="true" size={16} />
                )}
              </button>
            </div>
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Creating an account...' : 'Sign up'}
          </Button>
        </div>
        <div className="mt-4 text-center text-sm">
          Already have an account?{' '}
          <Link href="/auth/login" className="underline underline-offset-4">
            Login
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
