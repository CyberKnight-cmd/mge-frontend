'use client';

import { usePathname } from 'next/navigation';
import Footer from './Footer';

const SIDEBAR_ROUTES = ['/about', '/metals-pricing', '/dashboard', '/catalog'];

export default function FooterWrapper() {
  const pathname = usePathname();
  const hasSidebar = SIDEBAR_ROUTES.some((r) => pathname === r || pathname.startsWith(r + '/'));

  return (
    <div className={hasSidebar ? 'lg:ml-[240px]' : ''}>
      <Footer />
    </div>
  );
}
