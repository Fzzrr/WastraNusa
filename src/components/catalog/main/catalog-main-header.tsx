import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Home, type LucideIcon, Map, Package } from 'lucide-react';

type CatalogMainHeaderProps = {
  totalProducts: number;
  totalIslands: number;
};

type HeaderStat = {
  icon: LucideIcon;
  value: number;
  label: string;
};

export function CatalogMainHeader({
  totalProducts,
  totalIslands,
}: CatalogMainHeaderProps) {
  const stats: HeaderStat[] = [
    { icon: Package, value: totalProducts, label: 'Produk Autentik' },
    { icon: Map, value: totalIslands, label: 'Pulau Asal' },
  ];

  return (
    <section className="relative overflow-hidden">
      {/* Decorative motif: soft radial glow + woven dot grid to fill the
          otherwise empty right side of the header. */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-16 right-0 h-64 w-64 rounded-full bg-[radial-gradient(circle_at_center,rgba(202,168,106,0.18),transparent_70%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute right-6 top-6 hidden h-24 w-44 opacity-[0.18] lg:block"
        style={{
          backgroundImage:
            'radial-gradient(circle, #2f5b49 1.2px, transparent 1.2px)',
          backgroundSize: '14px 14px',
        }}
      />

      <div className="relative mx-auto w-full max-w-[1320px] px-4 pb-5 pt-6 md:px-6 lg:px-8">
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
                Catalog Produk
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="mt-4 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-[#2f5b49] sm:text-5xl">
              Katalog Produk Wastra
            </h1>
            <div className="mt-3 h-1.5 w-20 rounded-full bg-gradient-to-r from-[#2f5b49] to-[#caa86a]" />
            <p className="mt-3 max-w-xl text-base leading-relaxed text-[#4f6458]">
              Jelajahi ragam kain tradisional Indonesia, mulai dari tenun,
              batik, hingga songket, hasil karya pengrajin lokal terpercaya.
            </p>
          </div>

          {/* Stat chips */}
          <div className="flex shrink-0 gap-3">
            {stats.map((stat) => {
              const Icon = stat.icon;

              return (
                <div
                  key={stat.label}
                  className="group flex items-center gap-3 rounded-xl border border-[#ddd3c2] bg-[#f7f3ea]/70 px-4 py-3 transition-all duration-300 ease-out hover:-translate-y-0.5 hover:border-[#c7b59b] hover:bg-[#f7f3ea] hover:shadow-[0_14px_28px_-20px_rgba(47,91,73,0.6)]"
                >
                  <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-[#2f5b49]/10 text-[#2f5b49] transition-colors duration-300 group-hover:bg-[#2f5b49] group-hover:text-[#f3ede2]">
                    <Icon className="size-5" />
                  </span>
                  <p className="flex items-center gap-1.5 whitespace-nowrap">
                    <span className="text-2xl font-extrabold leading-none tracking-tight text-[#2f5b49]">
                      {stat.value}
                    </span>
                    <span className="text-xs font-medium text-[#586f62]">
                      {stat.label}
                    </span>
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
