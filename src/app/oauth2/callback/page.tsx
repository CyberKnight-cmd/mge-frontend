'use client';

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { ShieldCheck, AlertCircle } from 'lucide-react';

type Status = 'authenticating' | 'success' | 'error';

export default function OAuth2CallbackPage() {
  const { setAuthFromOAuth } = useAuth();
  const [status, setStatus] = useState<Status>('authenticating');
  const processed = useRef(false);

  useEffect(() => {
    if (processed.current) return;
    processed.current = true;

    const hash = window.location.hash.substring(1);
    if (!hash) { setStatus('error'); return; }

    const params = new URLSearchParams(hash);
    const accessToken = params.get('accessToken');
    const refreshToken = params.get('refreshToken');
    const role = params.get('role');
    const profileCompleted = params.get('profileCompleted');

    if (!accessToken || !refreshToken) { setStatus('error'); return; }

    window.history.replaceState(null, '', window.location.pathname);

    fetch('/api/v1/users/me', {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
      .then(r => {
        if (!r.ok) throw new Error();
        return r.json();
      })
      .then(body => {
        const p = body.data ?? body;
        const completed = profileCompleted === 'true' || p.profileCompleted === true;
        setAuthFromOAuth(accessToken, refreshToken, {
          email: p.email,
          firstName: p.firstName ?? '',
          lastName: p.lastName ?? '',
          role: role ?? p.role,
          companyName: p.companyName ?? '',
          authProvider: 'GOOGLE',
          emailVerified: p.emailVerified,
          profileCompleted: completed,
        });
        setStatus('success');
        window.location.href = completed ? '/' : '/complete-profile';
      })
      .catch(() => setStatus('error'));
  }, [setAuthFromOAuth]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-surface">
      {status === 'authenticating' && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center gap-5"
        >
          <div className="relative">
            <div className="w-16 h-16 border-2 border-outline-variant rounded-full" />
            <div className="w-16 h-16 border-2 border-primary border-t-transparent rounded-full animate-spin absolute inset-0" />
            <ShieldCheck size={24} className="text-primary absolute inset-0 m-auto" />
          </div>
          <div className="text-center">
            <p className="text-headline-sm font-headline-sm text-primary mb-1">Logging you in</p>
            <motion.p
              className="text-body-sm text-on-surface-variant"
              animate={{ opacity: [0.4, 1, 0.4] }}
              transition={{ repeat: Infinity, duration: 2 }}
            >
              Verifying your credentials...
            </motion.p>
          </div>
        </motion.div>
      )}

      {status === 'success' && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center gap-5"
        >
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
            <ShieldCheck size={28} className="text-green-700" />
          </div>
          <div className="text-center">
            <p className="text-headline-sm font-headline-sm text-primary mb-1">Authenticated</p>
            <p className="text-body-sm text-on-surface-variant">Redirecting...</p>
          </div>
        </motion.div>
      )}

      {status === 'error' && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center gap-5"
        >
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
            <AlertCircle size={28} className="text-error" />
          </div>
          <div className="text-center">
            <p className="text-headline-sm font-headline-sm text-error mb-1">Authentication Failed</p>
            <p className="text-body-sm text-on-surface-variant mb-4">Could not verify your account. Please try again.</p>
            <a href="/login" className="bg-primary text-on-primary text-label-caps font-label-caps px-6 py-2.5 hover:opacity-90 transition-opacity">
              BACK TO LOGIN
            </a>
          </div>
        </motion.div>
      )}
    </div>
  );
}
