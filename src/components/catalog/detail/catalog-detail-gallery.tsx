import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Sparkles } from 'lucide-react';
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
      <Card className="group relative h-64 animate-in overflow-hidden rounded-3xl border-0 bg-[#ebe2d4] p-0 shadow-[0_24px_48px_-28px_rgba(74,60,47,0.55)] ring-1 ring-[#ddd4c5] duration-500 fade-in slide-in-from-bottom-2 sm:h-80 md:h-[430px]">
        <Badge className="absolute top-4 left-4 z-10 gap-1 rounded-full bg-[#2f5f49]/90 px-3 py-1 text-[#edf4ec] shadow-lg ring-1 ring-white/20 backdrop-blur-md">
          <Sparkles className="size-3 text-[#e8cb8d]" />
          {category}
        </Badge>
        {imageURL ? (
          <Image
            src={imageURL}
            alt={category}
            fill
            className="object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 100vw, (max-width: 1280px) 90vw, 800px"
          />
        ) : (
          <div className="absolute inset-0 grid place-items-center">
            <div className="flex flex-col items-center gap-2 text-[#7f715c]">
              <span className="size-4 rotate-45 border border-[#cebda2]" />
              <span className="text-sm font-medium">{category}</span>
            </div>
          </div>
        )}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#2c241c]/30 to-transparent" />
      </Card>
    </div>
  );
}
