import {
  CategoryFilter,
  EncyclopediaSection,
  FeaturedCards,
  HeroSection,
  IslandCards,
  ProductCatalog,
} from '@/components/landing-page';
import { AdminFaqWidget } from '@/components/landing-page/admin-faq-widget';

export default function HomePage() {
  return (
    <main>
      <section className="mx-auto w-full max-w-[1320px] px-4 pt-4 md:px-6 lg:px-8">
        <div className="grid animate-in gap-4 fade-in duration-700 lg:grid-cols-[minmax(0,1fr)_300px]">
          <HeroSection />
          <FeaturedCards />
        </div>
      </section>

      <section className="mx-auto mt-4 w-full max-w-[1320px] px-4 md:px-6 lg:px-8">
        <CategoryFilter />
      </section>

      <ProductCatalog />

      <EncyclopediaSection />

      <IslandCards />

      <AdminFaqWidget />
    </main>
  );
}
