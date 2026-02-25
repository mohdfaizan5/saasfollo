import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Test | SaaSFollo',
};

export default function TestLayout({ children }: { children: React.ReactNode }) {
  return children;
}
