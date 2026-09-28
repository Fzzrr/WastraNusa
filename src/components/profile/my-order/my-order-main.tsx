'use client';

import { ProfileSection } from '@/components/profile/profile-section';
import { cn } from '@/lib/utils';
import { LayoutList, ShoppingBag } from 'lucide-react';
import { useState } from 'react';

import { MyOrderList } from './my-order-list';
import { ORDER_STATUS_STYLES } from './order-status';

export type OrderStatus =
  | 'Semua'
  | 'Menunggu Bayar'
  | 'Dikonfirmasi'
  | 'Pengemasan' // pengemasan = processing
  | 'Dikirim'
  | 'Diterima'
  | 'Dibatalkan';

const tabs: OrderStatus[] = [
  'Semua',
  'Menunggu Bayar',
  'Dikonfirmasi',
  'Pengemasan',
  'Dikirim',
  'Diterima',
  'Dibatalkan',
];

export function MyOrderMain() {
  const [activeTab, setActiveTab] = useState<OrderStatus>('Semua');
  const [page, setPage] = useState(1);

  return (
    <ProfileSection
      icon={ShoppingBag}
      title="Pesanan Saya"
      description="Lacak status dan riwayat belanja Anda"
      bodyClassName="p-0"
    >
      <div className="border-b border-[#efe8dd] px-5 py-3 md:px-6">
        <div
          role="tablist"
          aria-label="Filter status pesanan"
          className="flex gap-1 overflow-x-auto rounded-xl bg-[#f4efe5] p-1 scrollbar-none"
        >
          {tabs.map((tab) => {
            const isActive = activeTab === tab;
            const Icon =
              tab === 'Semua' ? LayoutList : ORDER_STATUS_STYLES[tab].icon;
            return (
              <button
                key={tab}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => {
                  setActiveTab(tab);
                  setPage(1);
                }}
                className={cn(
                  'inline-flex cursor-pointer items-center gap-1.5 rounded-lg px-3 py-1.5 text-[13px] font-semibold whitespace-nowrap transition-all duration-200',
                  isActive
                    ? 'bg-gradient-to-r from-[#2f5f49] to-[#3f7359] text-white shadow-[0_6px_14px_-8px_rgba(47,95,73,0.8)]'
                    : 'text-[#6f6a62] hover:bg-white/70 hover:text-[#2f5f49]',
                )}
              >
                <Icon className="size-3.5" />
                {tab}
              </button>
            );
          })}
        </div>
      </div>
      <div className="p-5 md:p-6">
        <MyOrderList activeTab={activeTab} page={page} setPage={setPage} />
      </div>
    </ProfileSection>
  );
}
