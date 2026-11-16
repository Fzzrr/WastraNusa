import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

interface EncyclopediaSearchProps {
  placeholder?: string;
  onSearch?: (query: string) => void;
}

export function EncyclopediaSearch({
  placeholder = 'Cari artikel ensiklopedia...',
  onSearch,
}: EncyclopediaSearchProps) {
  return (
    <div className="flex items-center overflow-hidden rounded-xl border border-[#ddd3c2] bg-[#f3ede2]">
      <Search className="ml-4 h-4 w-4 text-[#9f9a8d]" />
      <Input
        className="h-12 w-full border-0 bg-transparent px-3 text-sm text-[#445f50] placeholder:text-[#b2ad9f] focus-visible:ring-0 focus-visible:ring-offset-0"
        placeholder={placeholder}
        type="text"
        onChange={(e) => onSearch?.(e.target.value)}
      />
    </div>
  );
}
