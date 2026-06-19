'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import CatalogManager from '@/components/admin/CatalogManager';

export default function AdminCatalogPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated) { router.replace('/login'); return; }
    if (user?.role !== 'ADMIN') { router.replace('/dashboard'); }
  }, [isLoading, isAuthenticated, user, router]);

  if (isLoading || !user || user.role !== 'ADMIN') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface">
      <div className="max-w-[1400px] mx-auto px-6 py-8">
        <div className="mb-2">
          <p className="text-label-caps font-label-caps text-outline text-[10px]">ADMIN PANEL</p>
        </div>
        <CatalogManager />
      </div>
    </div>
  );
}
