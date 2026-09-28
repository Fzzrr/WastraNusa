'use client';

import { Input } from '@/components/ui/input';
import type { EncyclopediaArticle } from '@/types/encyclopedia';
import { Search, X } from 'lucide-react';
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';

interface EncyclopediaSearchResultsProps {
  articles: EncyclopediaArticle[];
  onArticleClick?: (article: EncyclopediaArticle) => void;
  placeholder?: string;
}

export function EncyclopediaSearchResults({
  articles,
  onArticleClick,
  placeholder = 'Cari artikel ensiklopedia...',
}: EncyclopediaSearchResultsProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [searchResults, setSearchResults] = useState<EncyclopediaArticle[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  // Filter articles based on search query
  useEffect(() => {
    const query = searchQuery.toLowerCase().trim();

    if (query.length === 0) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSearchResults([]);
      setIsOpen(false);
      return;
    }

    const filtered = articles.filter(
      (article) =>
        article.title.toLowerCase().includes(query) ||
        article.motifLabel.toLowerCase().includes(query) ||
        article.topic.toLowerCase().includes(query) ||
        article.region.toLowerCase().includes(query),
    );

    setSearchResults(filtered);
    setIsOpen(filtered.length > 0);
  }, [searchQuery, articles]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleArticleClick = (article: EncyclopediaArticle) => {
    onArticleClick?.(article);
    setSearchQuery('');
    setIsOpen(false);
  };

  const handleClear = () => {
    setSearchQuery('');
    setSearchResults([]);
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className="relative w-full">
      {/* Search Input */}
      <div className="flex items-center overflow-hidden rounded-xl border border-[#ddd3c2] bg-[#f3ede2] transition-all duration-300 focus-within:border-[#2f5b49]/40 focus-within:bg-white focus-within:shadow-[0_0_0_4px_rgba(47,91,73,0.08)]">
        <Search className="ml-4 h-4 w-4 text-[#9f9a8d]" />
        <Input
          className="h-12 w-full border-0 bg-transparent px-3 text-sm text-[#445f50] placeholder:text-[#b2ad9f] focus-visible:ring-0 focus-visible:ring-offset-0"
          placeholder={placeholder}
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={() =>
            searchQuery && searchResults.length > 0 && setIsOpen(true)
          }
        />
        {searchQuery && (
          <button
            onClick={handleClear}
            className="mr-3 text-[#9f9a8d] hover:text-[#445f50] transition"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Dropdown Results */}
      {isOpen && searchResults.length > 0 && (
        <div className="absolute top-full left-0 right-0 z-50 mt-2 max-h-96 overflow-y-auto rounded-xl border border-[#ddd3c2] bg-white shadow-lg">
          <div className="divide-y divide-[#f0ebe2]">
            {searchResults.slice(0, 8).map((article) => (
              <button
                key={article.slug}
                onClick={() => handleArticleClick(article)}
                className="flex w-full gap-3 px-4 py-3 text-left transition hover:bg-[#f9f7f2]"
              >
                {/* Article Image */}
                <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border border-[#e5dccf] bg-[#ece1d0]">
                  {article.imageURL ? (
                    <Image
                      src={article.imageURL}
                      alt={article.title}
                      fill
                      className="object-cover"
                      sizes="64px"
                    />
                  ) : (
                    <div className="grid h-full w-full place-items-center">
                      <span className="h-3 w-3 rotate-45 border border-[#ccbda4]" />
                    </div>
                  )}
                </div>

                {/* Article Info */}
                <div className="flex flex-1 flex-col gap-1 overflow-hidden">
                  <p className="line-clamp-2 text-sm font-semibold text-[#2f5b49]">
                    {article.title}
                  </p>
                  <p className="line-clamp-1 text-xs text-[#7a8d7f]">
                    {article.motifLabel}
                  </p>
                  <p className="text-xs text-[#a8b5ab]">
                    {article.region} • {article.topic}
                  </p>
                </div>
              </button>
            ))}

            {/* Show more indicator */}
            {searchResults.length > 8 && (
              <div className="px-4 py-2 text-center text-xs text-[#9a9289]">
                +{searchResults.length - 8} Artikel Lainnya
              </div>
            )}
          </div>
        </div>
      )}

      {/* No results message */}
      {searchQuery && searchResults.length === 0 && isOpen && (
        <div className="absolute top-full left-0 right-0 z-50 mt-2 rounded-xl border border-[#ddd3c2] bg-white px-4 py-6 text-center shadow-lg">
          <p className="text-sm text-[#7a8d7f]">
            Tidak ada artikel yang cocok dengan &quot;{searchQuery}&quot;
          </p>
        </div>
      )}
    </div>
  );
}
