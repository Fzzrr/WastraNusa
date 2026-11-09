import { ShopMain } from '@/components/shop/shop-main';
import { shopProfileRepository } from '@/repositories/shopProfile.repository';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { cache } from 'react';

type Props = {
  params: Promise<{ sellerId: string }>;
};

// Shared by generateMetadata and the page, so the shop is read once.
const getShop = cache((sellerId: string) =>
  shopProfileRepository.findPublicByUserId(sellerId),
);

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const shop = await getShop((await params).sellerId);
  if (!shop) return {};

  const description = shop.description || `Toko ${shop.shopName} di WastraNusa`;
  return {
    title: shop.shopName,
    description,
    openGraph: {
      title: shop.shopName,
      description,
      images: shop.logoURL ? [shop.logoURL] : undefined,
    },
  };
}

export default async function PublicShopPage({ params }: Props) {
  const { sellerId } = await params;

  // The shop is fetched client-side; check it exists so a bad id is a real 404.
  if (!(await getShop(sellerId))) {
    notFound();
  }

  return <ShopMain sellerId={sellerId} />;
}
