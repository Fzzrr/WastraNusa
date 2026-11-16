import { cn, formatIDR } from '@/lib/utils';
import type { ProductInventoryItem } from '@/types/product';
import {
  Archive,
  Droplets,
  Flame,
  Hand,
  type LucideIcon,
  Store,
  SunDim,
} from 'lucide-react';
import Link from 'next/link';
import type { ReactNode } from 'react';

export type DetailTab = 'deskripsi' | 'spesifikasi';

type CatalogDetailContentProps = {
  activeTab: DetailTab;
  product: ProductInventoryItem;
  displayPrice: number;
  onTabChange: (tab: DetailTab) => void;
};

const CARE_GUIDES: { icon: LucideIcon; text: string }[] = [
  {
    icon: Droplets,
    text: 'Cuci dengan tangan menggunakan sabun lerak atau sampo',
  },
  { icon: Hand, text: 'Jangan diperas, cukup ditekan lembut' },
  { icon: SunDim, text: 'Jangan dijemur di bawah sinar matahari langsung' },
  { icon: Flame, text: 'Setrika dengan suhu rendah dari bagian dalam kain' },
  {
    icon: Archive,
    text: 'Simpan terlipat rapi, hindari paparan cahaya berlebihan',
  },
];

const GENDER_LABELS: Record<string, string> = {
  male: 'Laki-laki',
  female: 'Perempuan',
  unisex: 'Unisex',
};

const STATUS_LABELS: Record<string, { label: string; className: string }> = {
  active: { label: 'Tersedia', className: 'bg-surface text-ink' },
  inactive: { label: 'Nonaktif', className: 'bg-surface text-ink-soft' },
  out_of_stock: {
    label: 'Stok Habis',
    className: 'bg-destructive/10 text-destructive',
  },
};

const TABS: { key: DetailTab; label: string }[] = [
  { key: 'deskripsi', label: 'Perawatan' },
  { key: 'spesifikasi', label: 'Spesifikasi' },
];

export function CatalogDetailContent({
  activeTab,
  product,
  displayPrice,
  onTabChange,
}: CatalogDetailContentProps) {
  const status = STATUS_LABELS[product.status];
  const specs: [string, ReactNode][] = [
    ['Nama Produk', product.name],
    ['Kategori', product.clothingType],
    ['Asal', `${product.province}, ${product.island}`],
    [
      'Penjual',
      product.seller ? (
        <Link
          href={`/shop/${product.seller.id}`}
          className="inline-flex items-center gap-1.5 text-ink underline-offset-2 transition-colors hover:text-ink hover:underline focus-visible:ring-2 focus-visible:ring-brand/40 focus-visible:outline-none"
        >
          <Store className="size-3.5 text-ink-soft" />
          {product.seller.shopName ?? product.seller.name}
        </Link>
      ) : (
        '—'
      ),
    ],
    ['Harga', formatIDR(displayPrice)],
    ['Total Stok', `${product.stock} Unit`],
    ['Berat', `${product.weight} gram`],
    [
      'Gender',
      product.gender ? (GENDER_LABELS[product.gender] ?? product.gender) : '—',
    ],
    [
      'Status',
      status ? (
        <span
          className={cn(
            'inline-flex rounded-full px-2.5 py-0.5 text-[13px] font-semibold',
            status.className,
          )}
        >
          {status.label}
        </span>
      ) : (
        product.status
      ),
    ],
    ['Varian', `${product.variantCount} Varian`],
  ];

  return (
    <div>
      <div
        role="tablist"
        className="inline-flex items-center gap-1 rounded-full bg-surface p-1"
      >
        {TABS.map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              role="tab"
              aria-selected={isActive}
              className={cn(
                'h-10 cursor-pointer rounded-full px-5 text-[15px] transition-colors',
                isActive
                  ? 'bg-brand font-semibold text-on-field'
                  : 'text-ink-soft hover:text-ink',
              )}
              onClick={() => onTabChange(tab.key)}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {activeTab === 'deskripsi' ? (
        <div key="deskripsi" className="mt-8 animate-in duration-300 fade-in">
          <h2 className="text-2xl font-semibold tracking-[-0.02em] text-ink">
            Perawatan
          </h2>
          <ul className="mt-5 grid gap-x-10 gap-y-4 sm:grid-cols-2">
            {CARE_GUIDES.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-start gap-3">
                <Icon
                  className="mt-0.5 size-5 shrink-0 text-brand"
                  strokeWidth={1.75}
                />
                <span className="text-base leading-relaxed text-ink">
                  {text}
                </span>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <dl
          key="spesifikasi"
          className="mt-8 animate-in text-base text-ink duration-300 fade-in"
        >
          {specs.map(([label, value]) => (
            <div
              key={label}
              className="grid grid-cols-[140px_minmax(0,1fr)] gap-4 px-4 py-3 odd:bg-surface sm:grid-cols-[180px_minmax(0,1fr)]"
            >
              <dt className="text-ink-soft">{label}</dt>
              <dd className="font-medium text-ink">{value}</dd>
            </div>
          ))}
        </dl>
      )}
    </div>
  );
}
