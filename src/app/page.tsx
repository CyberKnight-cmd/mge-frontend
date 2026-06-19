import type { Metadata } from 'next';
import HomeContent from '@/components/home/HomeContent';

export const metadata: Metadata = {
  title: 'MGE — World\'s Most Trusted Catalytic Converter Exchange',
  description: 'Real-time PGM pricing, verified seller profiles, and automated export documentation for institutional B2B metals trade.',
};

export default function HomePage() {
  return <HomeContent />;
}
