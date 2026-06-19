import type { Metadata } from 'next';
import CatalogContent from '@/components/catalog/CatalogContent';

export const metadata: Metadata = { title: 'Technical Catalog' };

export default function CatalogPage() {
  return <CatalogContent />;
}
