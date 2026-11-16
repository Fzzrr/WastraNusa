import { SavedAddressMain } from '@/components/profile/saved-address/saved-address-main';
import { requireUser } from '@/lib/auth/auth-page-helper';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Alamat Tersimpan' };

export default async function SavedAddressPage() {
  await requireUser();

  return <SavedAddressMain />;
}
