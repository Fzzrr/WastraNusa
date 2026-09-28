'use client';

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Home } from 'lucide-react';
import { usePathname } from 'next/navigation';

const breadcrumbMap: Record<string, { label: string; href?: string }[]> = {
  '/profile': [{ label: 'Profil Saya' }],
  '/profile/liked-article': [
    { label: 'Profil Saya', href: '/profile' },
    { label: 'Artikel Disukai' },
  ],
  '/profile/saved-address': [
    { label: 'Profil Saya', href: '/profile' },
    { label: 'Alamat Tersimpan' },
  ],
  '/profile/my-order': [
    { label: 'Profil Saya', href: '/profile' },
    { label: 'Pesanan Saya' },
  ],
  '/profile/seller-application': [
    { label: 'Profil Saya', href: '/profile' },
    { label: 'Buka Toko' },
  ],
};

export default function ProfileBreadcrumb() {
  const pathname = usePathname();
  const items =
    breadcrumbMap[pathname] ??
    (pathname.startsWith('/profile/my-order/')
      ? [
          { label: 'Profil Saya', href: '/profile' },
          { label: 'Pesanan Saya', href: '/profile/my-order' },
          { label: 'Detail Pesanan' },
        ]
      : [{ label: 'Profil Saya' }]);

  return (
    <Breadcrumb>
      <BreadcrumbList className="text-sm font-medium text-[#6e8276]">
        <BreadcrumbItem>
          <BreadcrumbLink
            href="/"
            className="flex items-center gap-1.5 hover:text-[#2f5b49]"
          >
            <Home className="size-3.5" />
            Beranda
          </BreadcrumbLink>
        </BreadcrumbItem>

        {items.flatMap((item, index) => [
          <BreadcrumbSeparator key={`separator-${item.label}-${index}`} />,
          <BreadcrumbItem key={`item-${item.label}-${index}`}>
            {item.href ? (
              <BreadcrumbLink href={item.href} className="hover:text-[#2f5b49]">
                {item.label}
              </BreadcrumbLink>
            ) : (
              <BreadcrumbPage className="text-[#2f5b49]">
                {item.label}
              </BreadcrumbPage>
            )}
          </BreadcrumbItem>,
        ])}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
