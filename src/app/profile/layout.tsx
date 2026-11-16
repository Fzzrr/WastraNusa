import { Footer } from '@/components/footer';
import { Header } from '@/components/header';
import ProfileBreadcrumb from '@/components/profile/ProfileBreadcrumb';
import ProfileCard from '@/components/profile/ProfileCard';
import Sidebar from '@/components/profile/Sidebar';

export default async function ProfileLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex min-h-dvh flex-col bg-ground font-sans">
      <Header homeHref="/" />

      <div className="px-4 pt-5 md:px-8">
        <ProfileBreadcrumb />
      </div>

      <ProfileCard />

      <div className="flex flex-1 flex-col items-stretch gap-6 px-4 pt-2 pb-10 md:flex-row md:items-start md:px-8">
        <Sidebar />

        <div className="flex w-full flex-1 flex-col gap-5">{children}</div>
      </div>

      <Footer />
    </div>
  );
}
