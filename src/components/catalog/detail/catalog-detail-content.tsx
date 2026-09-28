import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn, formatIDR } from '@/lib/utils';
import type { ProductInventoryItem } from '@/types/product';
import {
  Archive,
  Droplets,
  FileText,
  Flame,
  Hand,
  ListChecks,
  type LucideIcon,
  Sparkles,
  SunDim,
} from 'lucide-react';
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
  active: { label: 'Tersedia', className: 'bg-[#e3ece5] text-[#2f5f49]' },
  inactive: { label: 'Nonaktif', className: 'bg-[#efe8dd] text-[#6e7a70]' },
  out_of_stock: {
    label: 'Stok Habis',
    className: 'bg-[#f6e1dd] text-[#b04a3a]',
  },
};

const TABS: { key: DetailTab; label: string; icon: LucideIcon }[] = [
  { key: 'deskripsi', label: 'Deskripsi', icon: FileText },
  { key: 'spesifikasi', label: 'Spesifikasi', icon: ListChecks },
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
    ['Harga', formatIDR(displayPrice)],
    ['Total Stok', `${product.stock} unit`],
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
            'inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold',
            status.className,
          )}
        >
          {status.label}
        </span>
      ) : (
        product.status
      ),
    ],
    ['Varian', `${product.variantCount} varian`],
  ];

  return (
    <Card className="gap-0 rounded-2xl border-0 bg-[#fbf8f2] p-0 shadow-[0_1px_2px_rgba(60,41,15,0.04),0_12px_28px_rgba(89,69,38,0.06)] ring-1 ring-[#e3d9c7]">
      <div className="border-b border-[#ece3d4] p-3">
        <div
          role="tablist"
          className="inline-flex items-center gap-1 rounded-xl bg-[#f1ebdf] p-1"
        >
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;
            return (
              <Button
                key={tab.key}
                type="button"
                role="tab"
                aria-selected={isActive}
                variant="ghost"
                className={cn(
                  'h-9 cursor-pointer gap-1.5 rounded-lg px-4 text-sm font-medium text-[#54685c] transition-all hover:bg-white/60 hover:text-[#2f5f49]',
                  isActive &&
                    'bg-[#2f5f49] text-[#edf4ec] shadow-[0_6px_14px_-6px_rgba(47,95,73,0.6)] hover:bg-[#2f5f49] hover:text-[#edf4ec]',
                )}
                onClick={() => onTabChange(tab.key)}
              >
                <Icon className="size-4" />
                {tab.label}
              </Button>
            );
          })}
        </div>
      </div>

      {activeTab === 'deskripsi' ? (
        <div
          key="deskripsi"
          className="flex animate-in flex-col gap-5 p-6 duration-300 fade-in"
        >
          <div>
            <h3 className="text-3xl font-bold text-[#2f5b49]">
              Tentang Produk
            </h3>
            <div className="mt-2 h-1 w-14 rounded-full bg-gradient-to-r from-[#2f5b49] to-[#caa86a]" />
          </div>

          <div>
            <h4 className="flex items-center gap-2 text-xl font-bold text-[#315745]">
              <Sparkles className="size-4 text-[#caa86a]" />
              Panduan Perawatan
            </h4>
            <div className="mt-3 grid gap-2.5 sm:grid-cols-2">
              {CARE_GUIDES.map(({ icon: Icon, text }, index) => (
                <div
                  key={text}
                  className="group flex items-start gap-3 rounded-xl bg-[#f5f0e7] p-3 ring-1 ring-[#ece3d4] transition-all duration-300 hover:-translate-y-0.5 hover:bg-white hover:shadow-[0_12px_24px_-16px_rgba(47,91,73,0.5)]"
                >
                  <span className="relative flex size-9 shrink-0 items-center justify-center rounded-lg bg-[#f5ead3] text-[#a07a2c] transition-colors group-hover:bg-[#2f5f49] group-hover:text-[#e8cb8d]">
                    <Icon className="size-4" />
                    <span className="absolute -top-1.5 -right-1.5 flex size-4 items-center justify-center rounded-full bg-[#2f5f49] text-[10px] font-semibold text-white ring-2 ring-[#fbf8f2]">
                      {index + 1}
                    </span>
                  </span>
                  <p className="pt-1.5 text-sm leading-relaxed text-[#495f54]">
                    {text}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div
          key="spesifikasi"
          className="animate-in p-5 text-sm text-[#41594d] duration-300 fade-in"
        >
          <div className="overflow-hidden rounded-xl ring-1 ring-[#ece3d4]">
            {specs.map(([label, value]) => (
              <div
                key={label}
                className="grid grid-cols-[160px_minmax(0,1fr)] gap-3 px-4 py-3 transition-colors odd:bg-[#f5f0e7] hover:bg-[#f5ead3]/60"
              >
                <p className="text-[#6e7a70]">{label}</p>
                <div className="font-semibold text-[#2f5a48]">{value}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}
