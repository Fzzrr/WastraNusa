'use client';

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
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
  const items = breadcrumbMap[pathname] ?? [{ label: 'Profil Saya' }];

  return (
    <Breadcrumb>
      <BreadcrumbList className="text-muted-foreground text-[13px]">
        <BreadcrumbItem>
          <BreadcrumbLink href="/" className="text-brand hover:text-brand-dark">
            Beranda
          </BreadcrumbLink>
        </BreadcrumbItem>

        {items.flatMap((item, index) => [
          <BreadcrumbSeparator key={`separator-${item.label}-${index}`} />,
          <BreadcrumbItem key={`item-${item.label}-${index}`}>
            {item.href ? (
              <BreadcrumbLink
                href={item.href}
                className="text-brand hover:text-brand-dark"
              >
                {item.label}
              </BreadcrumbLink>
            ) : (
              <BreadcrumbPage>{item.label}</BreadcrumbPage>
            )}
          </BreadcrumbItem>,
        ])}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
