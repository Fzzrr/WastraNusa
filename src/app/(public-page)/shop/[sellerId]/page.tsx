import { ShopMain } from '@/components/shop/shop-main';

type Props = {
  params: Promise<{ sellerId: string }>;
};

export default async function PublicShopPage({ params }: Props) {
  const { sellerId } = await params;

  return <ShopMain sellerId={sellerId} />;
}
