'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Phone, Building2, AlertTriangle, ArrowRight, User as UserIcon } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function CompleteProfilePage() {
  const router = useRouter();
  const { user, authFetch, updateUser } = useAuth();

  const [firstName, setFirstName] = useState(user?.firstName ?? '');
  const [lastName, setLastName] = useState(user?.lastName ?? '');
  const [phone, setPhone] = useState('');
  const [company, setCompany] = useState(user?.companyName ?? '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!phone.trim()) {
      setError('Phone number is required');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const res = await authFetch('/api/v1/users/me/complete-profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          phoneNumber: phone.trim(),
          companyName: company.trim() || null,
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error((body as any).message || 'Failed to save profile');
      }
      updateUser({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        companyName: company.trim(),
        profileCompleted: true,
      });
      router.push('/');
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="bg-surface-container-lowest border border-outline-variant overflow-hidden">
          <div className="bg-primary px-6 py-5">
            <div className="flex items-center gap-2 text-on-primary mb-2">
              <UserIcon size={18} />
              <h1 className="text-headline-sm font-headline-sm">Complete Your Profile</h1>
            </div>
            <p className="text-on-primary/70 text-body-sm">
              Just a few details before you get started.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-label-caps font-label-caps text-[10px] text-on-surface-variant mb-1.5">FIRST NAME</label>
                <input
                  type="text"
                  value={firstName}
                  onChange={e => setFirstName(e.target.value)}
                  className="w-full bg-surface-container border border-outline-variant px-3 py-2.5 text-[13px] focus:border-primary focus:outline-none transition-colors"
                />
              </div>
              <div>
                <label className="block text-label-caps font-label-caps text-[10px] text-on-surface-variant mb-1.5">LAST NAME</label>
                <input
                  type="text"
                  value={lastName}
                  onChange={e => setLastName(e.target.value)}
                  className="w-full bg-surface-container border border-outline-variant px-3 py-2.5 text-[13px] focus:border-primary focus:outline-none transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-label-caps font-label-caps text-[10px] text-on-surface-variant mb-1.5">EMAIL</label>
              <input
                type="email"
                value={user?.email ?? ''}
                disabled
                className="w-full bg-surface-container-high border border-outline-variant px-3 py-2.5 text-[13px] text-outline cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-label-caps font-label-caps text-[10px] text-on-surface-variant mb-1.5 flex items-center gap-1.5">
                <Phone size={11} /> PHONE NUMBER *
              </label>
              <input
                type="tel"
                required
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="+91"
                className="w-full bg-surface-container border border-outline-variant px-3 py-2.5 text-[13px] font-mono focus:border-primary focus:outline-none transition-colors"
              />
              <div className="flex items-start gap-2 mt-2 bg-yellow-50 border border-yellow-200 px-3 py-2">
                <AlertTriangle size={12} className="text-yellow-600 shrink-0 mt-0.5" />
                <p className="text-[11px] text-yellow-800 leading-relaxed">
                  This phone number will be used to contact you for quote requests and bids. Providing an incorrect number may restrict your account from receiving responses.
                </p>
              </div>
            </div>

            <div>
              <label className="block text-label-caps font-label-caps text-[10px] text-on-surface-variant mb-1.5 flex items-center gap-1.5">
                <Building2 size={11} /> COMPANY NAME <span className="text-outline">(optional)</span>
              </label>
              <input
                type="text"
                value={company}
                onChange={e => setCompany(e.target.value)}
                placeholder="Your company or business name"
                className="w-full bg-surface-container border border-outline-variant px-3 py-2.5 text-[13px] focus:border-primary focus:outline-none transition-colors"
              />
            </div>

            {error && (
              <div className="bg-error/10 border border-error/30 px-3 py-2 text-[12px] text-error">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={saving}
              className="w-full bg-primary text-on-primary text-label-caps font-label-caps py-3.5 flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {saving ? 'SAVING...' : 'CONTINUE'}
              {!saving && <ArrowRight size={14} />}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
