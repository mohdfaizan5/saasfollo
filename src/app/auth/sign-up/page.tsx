import { SignUpForm } from '@/components/sign-up-form'
import { AnimatedRoles } from '@/components/auth/animated-roles'
import Image from 'next/image'
import Logo from '@/components/logo'

export const metadata = {
  title: 'Sign Up | SaaSFollo',
}

export default function Page() {
  return (
    <div className="grid min-h-svh w-full lg:grid-cols-6">
      <div className="flex items-center col-span-2 justify-center p-6 md:p-10">
        <div className="w-full max-w-sm">
          <SignUpForm />
        </div>
      </div>
      <div className='col-span-4 relative overflow-hidden'>
        <Image className="absolute -bottom-32 -left-30 -rotate-6" src="/macintosh-rightfacing.png" alt="Login Background" width={400} height={400} />
        <Logo height={24} width={24} full className='hidden md:flex absolute top-4 left-4' textClassName="text-foreground ml-[1px] text-base font-medium text-white" />

        <span className='text-[10rem] text-[#F6F1EA] absolute -right-6 -top-[4.8rem]'>*</span>
        <AnimatedRoles outerClassName="" />
      </div>
    </div>
  )
}
