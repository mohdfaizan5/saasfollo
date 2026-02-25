'use client';

import { useEffect } from 'react';

interface LoadingTitleProps {
  title?: string;
}

export function LoadingTitle({ title = 'SaaSFollo' }: LoadingTitleProps) {
  useEffect(() => {
    document.title = title;
  }, [title]);

  return null;
}
