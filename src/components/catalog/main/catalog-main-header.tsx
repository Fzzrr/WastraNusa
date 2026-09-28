import { StatCard } from '@/components/encyclopedia/encyclopedia-stats';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { WastraHeroPanel } from '@/components/wastra-hero';
import { Home } from 'lucide-react';

type CatalogMainHeaderProps = {
  totalProducts: number;
  totalIslands: number;
  /** Product photos for the hero collage. */
  images?: Array<string | null | undefined>;
};

export function CatalogMainHeader({
  totalProducts,
  totalIslands,
  images = [],
}: CatalogMainHeaderProps) {
  const stats = [
    { value: totalProducts, label: 'Produk Autentik' },
    { value: totalIslands, label: 'Pulau Asal' },
  ];

  return (
    <section className="mx-auto w-full max-w-[1320px] px-4 pt-6 pb-5 md:px-6 lg:px-8">
      <Breadcrumb>
        <BreadcrumbList className="text-[#66786d] text-sm font-medium">
          <BreadcrumbItem>
            <BreadcrumbLink
              href="/"
              className="flex items-center gap-1.5 hover:text-[#2f5b49]"
            >
              <Home className="size-3.5" />
              Beranda
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage className="text-[#2f5b49]">
              Katalog Produk
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <WastraHeroPanel
        className="mt-4"
        eyebrow="Karya Pengrajin Nusantara"
        title="Katalog Produk"
        accent="Wastra"
        description="Jelajahi ragam kain tradisional Indonesia, mulai dari tenun, batik, hingga songket, hasil karya pengrajin lokal terpercaya."
        images={images}
      >
        <div className="mt-8 grid grid-cols-2 gap-3 border-t border-white/10 pt-6 md:gap-4 lg:max-w-2xl">
          {stats.map((stat, index) => (
            <StatCard
              key={stat.label}
              stat={{ value: String(stat.value), label: stat.label }}
              index={index}
            />
          ))}
        </div>
      </WastraHeroPanel>
    </section>
  );
}
