import Navbar from '@/components/landingpage/navbar';
import Navbar2 from '@/components/landingpage/navbar2';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Startup Perks | SaaSFollo',
};

export default function StartupPerksLayout({ children }: { children: React.ReactNode }) {
  return (<div className="min-h-screen bg-background">
    <Navbar2/> 
    {children}
  </div>);
}
