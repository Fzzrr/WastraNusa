import { Facebook, Instagram, Twitter, Youtube } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

// Labels for the catalog links must match existing clothingType values.
const footerColumns = [
  {
    title: 'Belanja',
    links: [
      { label: 'Semua Produk', href: '/catalog' },
      ...['Batik', 'Kain Tenun', 'Kain Songket', 'Kebaya'].map((type) => ({
        label: type,
        href: `/catalog?type=${encodeURIComponent(type)}`,
      })),
    ],
  },
  {
    title: 'Ensiklopedia',
    links: [
      'Jelajahi Artikel',
      'Per Wilayah',
      'Per Topik',
      'Kontribusi',
      'Pengrajin',
    ].map((label) => ({ label, href: '/encyclopedia' })),
  },
];

type FooterProps = {
  year?: number;
};

const socialLinks = [
  {
    label: 'Instagram',
    href: 'https://www.instagram.com',
    Icon: Instagram,
  },
  {
    label: 'Facebook',
    href: 'https://www.facebook.com',
    Icon: Facebook,
  },
  {
    label: 'X (Twitter)',
    href: 'https://x.com',
    Icon: Twitter,
  },
  {
    label: 'YouTube',
    href: 'https://www.youtube.com',
    Icon: Youtube,
  },
];

export function Footer({ year = 2026 }: FooterProps) {
  return (
    <footer className="mt-4 bg-[#2d5b48] text-[#d4dfd1]">
      <div className="mx-auto w-full max-w-[1320px] px-4 pb-8 pt-14 md:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-2 xl:grid-cols-[1.35fr_1fr_1fr]">
          <div>
            <Link href="/" className="flex items-center gap-3">
              <Image
                src="/logo.png"
                alt="WastraNusa"
                width={60}
                height={60}
                className="object-contain"
              />
              <span className="text-3xl font-extrabold text-[#edf4e8]">
                WastraNusa
              </span>
            </Link>

            <p className="mt-5 max-w-sm leading-relaxed text-sm text-[#baccbf]">
              Platform terpercaya untuk wastra tradisional Indonesia
              menghubungkan pengrajin lokal dengan pecinta budaya Nusantara.
            </p>

            <div className="mt-6 flex items-center gap-2.5">
              {socialLinks.map(({ label, href, Icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  title={label}
                  className="grid h-8 w-8 place-items-center rounded-full border border-white/15 bg-white/6 text-xs font-semibold text-[#d5e0d3] transition hover:bg-white/14"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {footerColumns.map((column) => (
            <div key={column.title}>
              <h4 className="text-lg font-bold text-[#edf4e8]">
                {column.title === 'Ensiklopedia' ? (
                  <Link
                    href="/encyclopedia"
                    className="transition hover:text-white"
                  >
                    {column.title}
                  </Link>
                ) : (
                  column.title
                )}
              </h4>
              <ul className="mt-4 space-y-2.5 text-[#c3d2c6]">
                {column.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-left text-sm transition hover:text-white"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-6 text-sm text-[#bfd0c1]">
          <p>
            © {year} WastraNusa. <br /> Hak cipta dilindungi undang-undang.
          </p>
        </div>
      </div>
    </footer>
  );
}
