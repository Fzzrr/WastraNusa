import { SellerApplicationMain } from '@/components/profile/seller-application/seller-application-main';
import { requireUser } from '@/lib/auth/auth-page-helper';

export default async function SellerApplicationPage() {
  await requireUser();

  return <SellerApplicationMain />;
}
