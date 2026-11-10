import { Facebook, Instagram, Twitter, Youtube } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

// Labels must match existing clothingType / island values so each link filters.
const footerColumns = [
  {
    title: 'Belanja',
    href: '/catalog',
    links: ['Batik', 'Kain Tenun', 'Kain Songket', 'Kebaya'].map((type) => ({
      label: type,
      href: `/catalog?type=${encodeURIComponent(type)}`,
    })),
  },
  {
    title: 'Ensiklopedia',
    href: '/encyclopedia',
    links: ['Jawa', 'Sumatera', 'Bali', 'Sulawesi'].map((island) => ({
      label: island,
      href: `/encyclopedia?island=${encodeURIComponent(island)}`,
    })),
  },
];

type FooterProps = {
  year?: number;
};

const socialLinks = [
  { label: 'Instagram', href: 'https://www.instagram.com', Icon: Instagram },
  { label: 'Facebook', href: 'https://www.facebook.com', Icon: Facebook },
  { label: 'X (Twitter)', href: 'https://x.com', Icon: Twitter },
  { label: 'YouTube', href: 'https://www.youtube.com', Icon: Youtube },
];

export function Footer({ year = 2026 }: FooterProps) {
  return (
    <footer className="mt-16 bg-field text-on-field md:mt-20">
      <div className="mx-auto w-full max-w-[1320px] px-4 pt-14 pb-10 md:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-x-6 gap-y-10 md:grid-cols-[1.4fr_1fr_1fr]">
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="inline-flex items-center gap-3">
              <Image
                src="/logo.png"
                alt=""
                width={48}
                height={48}
                className="object-contain"
              />
              <span className="text-[clamp(1.75rem,3vw,2.25rem)] font-semibold tracking-[-0.02em]">
                WastraNusa
              </span>
            </Link>
            <p className="mt-4 max-w-xs text-base leading-relaxed text-on-field-soft">
              Wastra Nusantara, langsung dari pengrajinnya.
            </p>
          </div>

          {footerColumns.map((column) => (
            <div key={column.title}>
              <h2 className="text-lg font-semibold">
                <Link
                  href={column.href}
                  className="transition-colors hover:text-gold"
                >
                  {column.title}
                </Link>
              </h2>
              <ul className="mt-4 space-y-3">
                {column.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-[15px] text-on-field-soft transition-colors hover:text-on-field"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-wrap items-center justify-between gap-4">
          <p className="text-[13px] text-on-field-soft">© {year} WastraNusa</p>
          <div className="-mr-3 flex items-center">
            {socialLinks.map(({ label, href, Icon }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                title={label}
                className="grid size-11 place-items-center rounded-full text-on-field-soft transition-colors hover:bg-white/10 hover:text-on-field"
              >
                <Icon className="size-5" strokeWidth={1.75} />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
