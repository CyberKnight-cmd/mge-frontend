'use client';

import { Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

function CallbackHandler() {
  const router = useRouter();
  const params = useSearchParams();
  const { setAuthFromOAuth } = useAuth();

  useEffect(() => {
    const accessToken = params.get('accessToken');
    const refreshToken = params.get('refreshToken');
    const role = params.get('role');

    if (!accessToken || !refreshToken) {
      router.replace('/login?error=oauth_failed');
      return;
    }

    // Fetch full user profile with the token we just got
    fetch('/api/v1/users/me', {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
      .then((r) => r.json())
      .then((body) => {
        const p = body.data ?? body;
        setAuthFromOAuth(accessToken, refreshToken, {
          email: p.email,
          firstName: p.firstName ?? '',
          lastName: p.lastName ?? '',
          role: role ?? p.role,
          companyName: p.companyName ?? '',
          authProvider: 'GOOGLE',
          emailVerified: p.emailVerified,
        });
        router.replace('/dashboard');
      })
      .catch(() => router.replace('/login?error=oauth_failed'));
  }, [params, router, setAuthFromOAuth]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-surface gap-4">
      <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      <p className="text-body-md text-on-surface-variant">Completing sign-in…</p>
    </div>
  );
}

export default function OAuth2CallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <CallbackHandler />
    </Suspense>
  );
}
