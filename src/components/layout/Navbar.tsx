'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Menu, X, LogOut, LayoutDashboard, ShoppingCart, User as UserIcon } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import CatalogSearchBox from '@/components/search/CatalogSearchBox';

const navLinks = [
  { href: '/',               label: 'Home'           },
  { href: '/catalog',        label: 'Products'       },
  { href: '/marketplace',    label: 'Marketplace'    },
  { href: '/metals-pricing', label: 'Metals Pricing' },
  { href: '/about',          label: 'About Us'       },
];

export default function Navbar() {
  const pathname    = usePathname();
  const router      = useRouter();
  const { user, isAuthenticated, logout, authFetch } = useAuth();
  const canViewDashboard = user?.role === 'ADMIN' || user?.role === 'OWNER';
  const [mobileOpen, setMobileOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    if (!isAuthenticated) { setCartCount(0); return; }
    authFetch('/api/v1/cart/count')
      .then(r => r.ok ? r.json() : null)
      .then(body => { if (body?.data?.count != null) setCartCount(body.data.count); })
      .catch(() => {});
  }, [isAuthenticated, authFetch]);

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const initials = user
    ? `${user.firstName?.[0] ?? ''}${user.lastName?.[0] ?? ''}`.toUpperCase()
    : '';

  return (
    <nav className="sticky top-0 z-50 bg-surface border-b border-outline-variant">
      <div className="max-w-container mx-auto px-margin-mobile md:px-margin-desktop h-16 flex items-center justify-between">

        {/* Logo + Desktop Links */}
        <div className="flex items-center gap-4 md:gap-8">
          <Link href="/" className="text-headline-sm font-bold text-primary tracking-tight whitespace-nowrap">
            <span className="hidden sm:inline">Mayank Global Exports</span>
            <span className="sm:hidden">MGE</span>
          </Link>
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map(({ href, label }) => {
              const active = pathname === href || (href !== '/' && pathname.startsWith(href));
              return (
                <Link
                  key={href}
                  href={href}
                  className={`text-label-caps font-label-caps transition-colors pb-0.5 ${
                    active
                      ? 'text-primary border-b-2 border-primary'
                      : 'text-secondary hover:text-primary'
                  }`}
                >
                  {label}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Desktop right side */}
        <div className="hidden md:flex items-center gap-4">
          <CatalogSearchBox variant="navbar" />

          {isAuthenticated && user ? (
            <>
              {canViewDashboard && (
                <Link
                  href="/dashboard"
                  className="flex items-center gap-1.5 text-label-caps font-label-caps text-secondary hover:text-primary transition-colors px-3 py-2"
                >
                  <LayoutDashboard size={14} />
                  Dashboard
                </Link>
              )}
              <Link
                href="/cart"
                className="relative flex items-center text-secondary hover:text-primary transition-colors px-2 py-2"
                aria-label="Cart"
              >
                <ShoppingCart size={16} />
                {cartCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-error text-white text-[9px] font-bold w-4 h-4 flex items-center justify-center rounded-full">
                    {cartCount > 9 ? '9+' : cartCount}
                  </span>
                )}
              </Link>
              <div className="flex items-center gap-2 bg-primary-container border border-outline-variant px-3 py-1.5">
                <div className="w-7 h-7 bg-primary flex items-center justify-center text-on-primary font-bold text-[11px]">
                  {initials || <UserIcon size={14} />}
                </div>
                <span className="text-[13px] font-semibold text-on-primary-container">{user.firstName || user.email?.split('@')[0] || 'User'}</span>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 text-label-caps font-label-caps text-outline hover:text-error transition-colors px-2 py-2"
                aria-label="Sign out"
              >
                <LogOut size={14} />
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="text-label-caps font-label-caps text-secondary hover:text-primary transition-colors px-3 py-2"
              >
                Login
              </Link>
              <Link
                href="/login"
                className="bg-primary text-on-primary text-label-caps font-label-caps px-4 py-2 hover:opacity-80 transition-opacity"
              >
                Register
              </Link>
            </>
          )}
        </div>

        {/* Mobile Hamburger */}
        <button
          className="md:hidden text-primary p-1"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
        >
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden bg-surface border-t border-outline-variant px-margin-mobile py-5 flex flex-col gap-4">
          {navLinks.map(({ href, label }) => {
            const active = pathname === href || (href !== '/' && pathname.startsWith(href));
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setMobileOpen(false)}
                className={`text-label-caps font-label-caps ${active ? 'text-primary' : 'text-secondary'}`}
              >
                {label}
              </Link>
            );
          })}
          <hr className="border-outline-variant" />
          {isAuthenticated && user ? (
            <>
              {canViewDashboard && (
                <Link href="/dashboard" onClick={() => setMobileOpen(false)} className="text-label-caps font-label-caps text-secondary">
                  Dashboard ({user.firstName || user.email?.split('@')[0] || 'User'})
                </Link>
              )}
              <Link href="/cart" onClick={() => setMobileOpen(false)} className="text-label-caps font-label-caps text-secondary flex items-center gap-2">
                <ShoppingCart size={14} />
                Cart{cartCount > 0 && ` (${cartCount})`}
              </Link>
              <button onClick={() => { setMobileOpen(false); handleLogout(); }} className="text-label-caps font-label-caps text-error text-left">
                Sign Out
              </button>
            </>
          ) : (
            <>
              <Link href="/login" onClick={() => setMobileOpen(false)} className="text-label-caps font-label-caps text-secondary">Login</Link>
              <Link href="/login" onClick={() => setMobileOpen(false)} className="bg-primary text-on-primary text-label-caps font-label-caps px-4 py-2 text-center">Register</Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
