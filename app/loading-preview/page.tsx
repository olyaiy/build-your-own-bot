'use client';

import { Suspense } from 'react';
import ChatLoadingSkeleton from '../(chat)/[agent]/loading';

export default function LoadingPreviewPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ChatLoadingSkeleton />
    </Suspense>
  );
} 