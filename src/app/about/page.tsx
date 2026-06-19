import type { Metadata } from 'next';
import AboutContent from '@/components/about/AboutContent';

export const metadata: Metadata = { title: 'About Us' };

export default function AboutPage() {
  return <AboutContent />;
}
