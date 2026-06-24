'use client';

import { Suspense } from 'react';
import MarketplaceContent from '@/components/marketplace/MarketplaceContent';

export default function MarketplacePage() {
  return (
    <div className="w-full min-h-[calc(100vh-64px)] bg-surface">
      <Suspense fallback={
        <div className="min-h-[calc(100vh-64px)] flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      }>
        <MarketplaceContent />
      </Suspense>
    </div>
  );
}
