'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, type Variants } from 'framer-motion';
import {
  Eye, EyeOff, TrendingUp, TrendingDown,
  ShieldCheck, Lock, Building2, Phone, AlertCircle,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const panelAnim: Variants = { hidden: { opacity: 0, x: 40 }, visible: { opacity: 1, x: 0, transition: { duration: 0.5 } } };
const stagger: Variants   = { visible: { transition: { staggerChildren: 0.08, delayChildren: 0.15 } } };
const fieldAnim: Variants = { hidden: { opacity: 0, y: 14 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

const marketData = [
  { label: 'PLATINUM / USD',  price: '942.30',   chg: '+1.4%', up: true  },
  { label: 'PALLADIUM / USD', price: '1,014.15', chg: '−0.8%', up: false },
  { label: 'RHODIUM / USD',   price: '4,500.00', chg: '0.0%',  up: null  },
  { label: 'Pt INDEX (30d)',  price: '958.20',   chg: '+3.2%', up: true  },
];

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL ?? 'http://localhost:8080';

export default function LoginPage() {
  const router = useRouter();
  const { login, register } = useAuth();

  const [tab, setTab]           = useState<'login' | 'register'>('login');
  const [showPwd, setShowPwd]   = useState(false);
  const [showPwd2, setShowPwd2] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');

  // Login fields
  const [loginEmail, setLoginEmail]       = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register fields
  const [reg, setReg] = useState({
    firstName: '', lastName: '', companyName: '', email: '',
    phoneNumber: '', password: '', country: '', gstNumber: '',
  });
  const setR = (field: keyof typeof reg) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setReg((prev) => ({ ...prev, [field]: e.target.value }));

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(loginEmail, loginPassword);
      router.push('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed. Check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!reg.firstName || !reg.lastName || !reg.email || !reg.password || !reg.phoneNumber || !reg.companyName) {
      setError('Please fill in all required fields.');
      return;
    }
    setLoading(true);
    try {
      await register({
        firstName:   reg.firstName,
        lastName:    reg.lastName,
        email:       reg.email,
        password:    reg.password,
        phoneNumber: reg.phoneNumber,
        companyName: reg.companyName,
        country:     reg.country   || undefined,
        gstNumber:   reg.gstNumber || undefined,
      });
      router.push('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleOAuth = () => {
    window.location.href = `${BACKEND_URL}/oauth2/authorization/google`;
  };

  const switchTab = (t: 'login' | 'register') => {
    setTab(t);
    setError('');
  };

  return (
    <div className="flex min-h-screen">

      {/* Left panel */}
      <div
        className="hidden lg:flex lg:w-[55%] flex-col justify-center items-center relative overflow-hidden"
        style={{ backgroundImage: 'url(/hero-metal.jpg)', backgroundSize: 'cover', backgroundPosition: 'center' }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-black/80 via-black/70 to-primary-container/90" />
        <div
          className="absolute inset-0 opacity-5 pointer-events-none"
          style={{ backgroundImage: 'radial-gradient(#ffffff 0.5px, transparent 0.5px)', backgroundSize: '32px 32px' }}
        />
        <div className="relative z-10 flex flex-col items-center max-w-xl text-center px-8">
          <div className="w-28 h-28 border-2 border-primary-fixed-dim flex items-center justify-center mb-8">
            <span className="text-[42px] font-bold text-primary-fixed-dim tracking-widest">MGE</span>
          </div>
          <h1 className="text-headline-lg font-headline-lg text-on-primary mb-4">Mayank Global Exports</h1>
          <p className="text-body-lg text-on-primary-container mb-10 max-w-md">
            The institutional bridge for high-density precious metal trade and verified global commodity liquidation.
          </p>
          <div className="grid grid-cols-2 gap-4 w-full">
            {marketData.map(({ label, price, chg, up }) => (
              <div key={label} className="bg-white/5 border border-white/10 p-4 accent-left text-left">
                <span className="block text-label-caps font-label-caps text-primary-fixed-dim mb-1">{label}</span>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[15px] text-on-primary">{price}</span>
                  {up !== null && (
                    up
                      ? <span className="flex items-center gap-0.5 text-green-400 text-[11px] font-bold"><TrendingUp size={12} />{chg}</span>
                      : <span className="flex items-center gap-0.5 text-red-400 text-[11px] font-bold"><TrendingDown size={12} />{chg}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
          <p className="text-label-caps font-label-caps text-on-primary-container/50 mt-8">
            DATA PROVIDED BY LPPM · LME SETTLEMENT
          </p>
        </div>
      </div>

      {/* Right panel */}
      <motion.div
        className="w-full lg:w-[45%] bg-surface flex flex-col justify-center px-margin-mobile md:px-12 py-12 overflow-y-auto"
        variants={panelAnim}
        initial="hidden"
        animate="visible"
      >
        <div className="max-w-md w-full mx-auto">

          {/* Mobile logo */}
          <div className="lg:hidden mb-10 flex items-center gap-3">
            <span className="text-headline-sm font-bold text-primary tracking-tight">Mayank Global Exports</span>
            <span className="h-5 w-px bg-outline-variant" />
            <span className="text-label-caps font-label-caps text-on-surface-variant">AUTH</span>
          </div>

          <motion.div className="mb-8" variants={fieldAnim}>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 bg-primary flex items-center justify-center shrink-0">
                <Lock size={16} className="text-on-primary" />
              </div>
              <h2 className="text-headline-md font-headline-md text-primary">Professional Portal</h2>
            </div>
            <p className="text-body-md text-on-surface-variant">Access the verified marketplace for commodity trade.</p>
          </motion.div>

          {/* Tabs */}
          <motion.div className="flex gap-8 mb-8 border-b border-outline-variant" variants={fieldAnim}>
            {(['login', 'register'] as const).map((t) => (
              <button
                key={t}
                onClick={() => switchTab(t)}
                className={`text-label-caps font-label-caps pb-3 transition-colors ${
                  tab === t
                    ? 'text-primary border-b-2 border-primary'
                    : 'text-on-surface-variant hover:text-primary'
                }`}
              >
                {t === 'login' ? 'SIGN IN' : 'REGISTER COMPANY'}
              </button>
            ))}
          </motion.div>

          {/* Error banner */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-start gap-2 bg-error/10 border border-error/30 px-4 py-3 mb-5"
            >
              <AlertCircle size={14} className="text-error mt-0.5 shrink-0" />
              <p className="text-body-sm text-error">{error}</p>
            </motion.div>
          )}

          {tab === 'login' ? (
            <motion.form
              className="space-y-5"
              onSubmit={handleLogin}
              variants={stagger}
              initial="hidden"
              animate="visible"
              key="login-form"
            >
              {/* Google */}
              <motion.div variants={fieldAnim}>
                <motion.button
                  type="button"
                  onClick={handleGoogleOAuth}
                  disabled={loading}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  className="w-full flex items-center justify-center gap-3 border border-outline-variant py-3 hover:bg-surface-container transition-colors text-body-sm font-semibold disabled:opacity-50"
                >
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                    <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.616Z" fill="#4285F4"/>
                    <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18Z" fill="#34A853"/>
                    <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332Z" fill="#FBBC05"/>
                    <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58Z" fill="#EA4335"/>
                  </svg>
                  SIGN IN WITH GOOGLE
                </motion.button>
              </motion.div>

              <motion.div className="relative py-3" variants={fieldAnim}>
                <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-outline-variant" /></div>
                <div className="relative flex justify-center">
                  <span className="bg-surface px-3 text-label-caps font-label-caps text-on-surface-variant">OR CORPORATE ACCOUNT</span>
                </div>
              </motion.div>

              <motion.div variants={fieldAnim}>
                <label className="block text-label-caps font-label-caps text-on-surface-variant mb-1.5">CORPORATE EMAIL</label>
                <input
                  type="email"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="trade@company.com"
                  required
                  className="w-full border border-outline-variant bg-surface px-4 py-3 text-body-md focus:border-primary focus:ring-0 focus:outline-none transition-colors"
                />
              </motion.div>

              <motion.div variants={fieldAnim}>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-label-caps font-label-caps text-on-surface-variant">SECURE PASSWORD</label>
                  <Link href="#" className="text-[10px] font-bold text-primary hover:underline">Forgot?</Link>
                </div>
                <div className="relative">
                  <input
                    type={showPwd ? 'text' : 'password'}
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••••••"
                    required
                    className="w-full border border-outline-variant bg-surface px-4 py-3 text-body-md focus:border-primary focus:ring-0 focus:outline-none transition-colors pr-12"
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface"
                    onClick={() => setShowPwd(!showPwd)}
                    aria-label={showPwd ? 'Hide password' : 'Show password'}
                  >
                    {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </motion.div>

              <motion.div variants={fieldAnim}>
                <motion.button
                  type="submit"
                  disabled={loading}
                  whileHover={{ opacity: 0.85 }}
                  whileTap={{ scale: 0.99 }}
                  className="w-full bg-primary text-on-primary py-4 text-label-caps font-label-caps tracking-widest transition-opacity disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {loading && <span className="w-4 h-4 border-2 border-on-primary border-t-transparent rounded-full animate-spin" />}
                  {loading ? 'AUTHORIZING…' : 'AUTHORIZE & ACCESS TERMINAL'}
                </motion.button>
              </motion.div>
            </motion.form>
          ) : (
            <motion.form
              className="space-y-5"
              onSubmit={handleRegister}
              variants={stagger}
              initial="hidden"
              animate="visible"
              key="register-form"
            >
              <motion.div className="grid grid-cols-2 gap-4" variants={fieldAnim}>
                <div>
                  <label className="block text-label-caps font-label-caps text-on-surface-variant mb-1.5">FIRST NAME <span className="text-error">*</span></label>
                  <input type="text" value={reg.firstName} onChange={setR('firstName')} required className="w-full border border-outline-variant bg-surface px-4 py-3 text-body-md focus:border-primary focus:ring-0 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-label-caps font-label-caps text-on-surface-variant mb-1.5">LAST NAME <span className="text-error">*</span></label>
                  <input type="text" value={reg.lastName} onChange={setR('lastName')} required className="w-full border border-outline-variant bg-surface px-4 py-3 text-body-md focus:border-primary focus:ring-0 focus:outline-none" />
                </div>
              </motion.div>

              <motion.div variants={fieldAnim}>
                <label className="block text-label-caps font-label-caps text-on-surface-variant mb-1.5">COMPANY NAME <span className="text-error">*</span></label>
                <div className="relative">
                  <Building2 size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-outline" />
                  <input type="text" value={reg.companyName} onChange={setR('companyName')} placeholder="Acme Metals Ltd." required className="w-full border border-outline-variant bg-surface pl-9 pr-4 py-3 text-body-md focus:border-primary focus:ring-0 focus:outline-none" />
                </div>
              </motion.div>

              <motion.div variants={fieldAnim}>
                <label className="block text-label-caps font-label-caps text-on-surface-variant mb-1.5">CORPORATE EMAIL <span className="text-error">*</span></label>
                <input type="email" value={reg.email} onChange={setR('email')} placeholder="trade@company.com" required className="w-full border border-outline-variant bg-surface px-4 py-3 text-body-md focus:border-primary focus:ring-0 focus:outline-none" />
              </motion.div>

              <motion.div variants={fieldAnim}>
                <label className="block text-label-caps font-label-caps text-on-surface-variant mb-1.5">PHONE NUMBER <span className="text-error">*</span></label>
                <div className="relative">
                  <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-outline" />
                  <input type="tel" value={reg.phoneNumber} onChange={setR('phoneNumber')} placeholder="+91 98765 43210" required className="w-full border border-outline-variant bg-surface pl-9 pr-4 py-3 text-body-md focus:border-primary focus:ring-0 focus:outline-none" />
                </div>
              </motion.div>

              <motion.div variants={fieldAnim}>
                <label className="block text-label-caps font-label-caps text-on-surface-variant mb-1.5">PASSWORD <span className="text-error">*</span></label>
                <div className="relative">
                  <input
                    type={showPwd2 ? 'text' : 'password'}
                    value={reg.password}
                    onChange={setR('password')}
                    placeholder="Min. 8 characters"
                    required
                    minLength={8}
                    className="w-full border border-outline-variant bg-surface px-4 py-3 text-body-md focus:border-primary focus:ring-0 focus:outline-none pr-12"
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface"
                    onClick={() => setShowPwd2(!showPwd2)}
                  >
                    {showPwd2 ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </motion.div>

              {/* Optional fields */}
              <motion.div className="grid grid-cols-2 gap-4" variants={fieldAnim}>
                <div>
                  <label className="block text-label-caps font-label-caps text-on-surface-variant mb-1.5">COUNTRY</label>
                  <input type="text" value={reg.country} onChange={setR('country')} placeholder="India" className="w-full border border-outline-variant bg-surface px-4 py-3 text-body-md focus:border-primary focus:ring-0 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-label-caps font-label-caps text-on-surface-variant mb-1.5">GST / TAX ID</label>
                  <input type="text" value={reg.gstNumber} onChange={setR('gstNumber')} placeholder="22AAAAA0000A1Z5" className="w-full border border-outline-variant bg-surface px-4 py-3 font-mono text-[13px] uppercase focus:border-primary focus:ring-0 focus:outline-none" />
                </div>
              </motion.div>

              <motion.div className="flex items-start gap-2" variants={fieldAnim}>
                <input type="checkbox" id="terms" required className="w-4 h-4 mt-0.5 border-outline-variant text-primary focus:ring-0 rounded-none shrink-0" />
                <label htmlFor="terms" className="text-body-sm text-on-surface-variant select-none">
                  I agree to Mayank Global Exports&apos;{' '}
                  <Link href="#" className="text-primary hover:underline font-semibold">Terms of Trade</Link>{' '}
                  and{' '}
                  <Link href="#" className="text-primary hover:underline font-semibold">Privacy Policy</Link>
                </label>
              </motion.div>

              <motion.div variants={fieldAnim}>
                <motion.button
                  type="submit"
                  disabled={loading}
                  whileHover={{ opacity: 0.85 }}
                  whileTap={{ scale: 0.99 }}
                  className="w-full bg-primary text-on-primary py-4 text-label-caps font-label-caps tracking-widest transition-opacity disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {loading && <span className="w-4 h-4 border-2 border-on-primary border-t-transparent rounded-full animate-spin" />}
                  {loading ? 'CREATING ACCOUNT…' : 'CREATE INSTITUTIONAL ACCOUNT'}
                </motion.button>
              </motion.div>
            </motion.form>
          )}

          <motion.footer
            className="mt-8 pt-6 border-t border-outline-variant text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            <div className="flex items-center justify-center gap-2 text-label-caps font-label-caps text-on-surface-variant">
              <ShieldCheck size={12} />
              256-bit SSL encrypted · ISO 27001 compliant
            </div>
          </motion.footer>

        </div>
      </motion.div>
    </div>
  );
}
