import { Card } from '@/components/ui/card';
import Image from 'next/image';

type CatalogDetailGalleryProps = {
  category: string;
  imageURL?: string | null;
};

export function CatalogDetailGallery({
  category,
  imageURL,
}: CatalogDetailGalleryProps) {
  return (
    <div className="flex flex-col gap-3">
      <Card className="group relative aspect-[4/5] w-full animate-in overflow-hidden rounded-none border-0 bg-surface p-0 duration-500 fade-in slide-in-from-bottom-2">
        {imageURL ? (
          <Image
            src={imageURL}
            alt={category}
            fill
            // Above the fold and the page's largest paint: don't lazy-load it.
            preload
            loading="eager"
            className="object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 100vw, (max-width: 1280px) 90vw, 800px"
          />
        ) : (
          <div className="absolute inset-0 grid place-items-center">
            <div className="flex flex-col items-center gap-2 text-ink-soft">
              <span className="size-4 rotate-45 border border-border" />
              <span className="text-[15px] font-medium">{category}</span>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
