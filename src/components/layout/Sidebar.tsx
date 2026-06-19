'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import {
  LayoutGrid, Grid2X2, Layers, Settings2, Square, Cylinder, CircleDot, Settings,
} from 'lucide-react';

const categories = [
  { href: '/catalog',                  icon: LayoutGrid, label: 'All Types'     },
  { href: '/catalog?type=CERAMIC',     icon: Grid2X2,    label: 'Ceramic'       },
  { href: '/catalog?type=DPF',         icon: Settings2,  label: 'Diesel (DPF)'  },
  { href: '/catalog?type=CERAMIC_DPF', icon: Layers,     label: 'Ceramic + DPF' },
  { href: '/catalog?type=FOIL',        icon: Cylinder,   label: 'Metallic Foil' },
  { href: '/catalog?type=STEEL',       icon: Square,     label: 'Steel'         },
  { href: '/catalog?type=SET',         icon: CircleDot,  label: 'Sets'          },
  { href: '/catalog?type=OTHER',       icon: CircleDot,  label: 'Other'         },
];

const utilities = [
  { href: '/dashboard', icon: Settings, label: 'Settings' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const activeType = searchParams.get('type');

  return (
    <aside className="hidden lg:flex flex-col fixed left-0 top-16 h-[calc(100vh-64px)] w-[240px] bg-surface-container border-r border-outline-variant overflow-y-auto">
      {/* Header */}
      <div className="px-4 py-5 border-b border-outline-variant">
        <p className="text-label-caps font-label-caps text-on-surface-variant/60">CONVERTER TYPES</p>
        <p className="text-body-sm text-on-surface-variant mt-0.5">CRG Catalog</p>
      </div>

      {/* Categories */}
      <div className="flex flex-col py-2">
        {categories.map(({ href, icon: Icon, label }) => {
          const typeParam = new URL(href, 'http://x').searchParams.get('type');
          const isAllTypes = !typeParam;
          const active = isAllTypes
            ? pathname === '/catalog' && !activeType
            : activeType === typeParam;
          return (
            <Link
              key={label}
              href={href}
              className={`flex items-center gap-3 px-4 py-3 text-label-caps font-label-caps transition-colors ${
                active ? 'sidebar-item-active' : 'sidebar-item'
              }`}
            >
              <Icon size={16} />
              {label}
            </Link>
          );
        })}
      </div>

      {/* Utility links */}
      <div className="mt-auto border-t border-outline-variant">
        <div className="pb-4 px-4 pt-4 flex flex-col gap-1">
          {utilities.map(({ href, icon: Icon, label }) => (
            <Link
              key={label}
              href={href}
              className="flex items-center gap-3 py-2 text-body-sm text-on-surface-variant hover:text-primary transition-colors"
            >
              <Icon size={16} />
              {label}
            </Link>
          ))}
        </div>
      </div>
    </aside>
  );
}
