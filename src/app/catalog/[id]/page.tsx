import type { Metadata } from 'next';
import CatalogDetailContent from '@/components/catalog/CatalogDetailContent';

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  return { title: `Catalog — ${params.id}` };
}

export default function CatalogDetailPage({ params }: { params: { id: string } }) {
  return <CatalogDetailContent code={params.id} />;
}
