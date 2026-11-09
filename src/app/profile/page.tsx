import ProfileInfoSection from '@/components/profile/ProfileInfoSection';
import SecuritySection from '@/components/profile/SecuritySection';
import { requireUser } from '@/lib/auth/auth-page-helper';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Profil',
};

export default async function Profile() {
  await requireUser();

  return (
    <>
      <ProfileInfoSection />
      <SecuritySection />
    </>
  );
}
