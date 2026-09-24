import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import type { IslandFilter } from '@/types/encyclopedia';
import { ChevronDown, ChevronUp, Filter } from 'lucide-react';
import { useMemo, useState } from 'react';

const MAX_VISIBLE_ISLANDS = 9;
const MAX_VISIBLE_TOPICS = 8;

interface EncyclopediaSidebarProps {
  islands: IslandFilter[];
  topics: string[];
  selectedIsland?: string;
  selectedTopic?: string;
  onIslandClick?: (island: string) => void;
  onTopicClick?: (topic: string) => void;
  onResetFilters?: () => void;
}

export function EncyclopediaSidebar({
  islands,
  topics,
  selectedIsland,
  selectedTopic,
  onIslandClick,
  onTopicClick,
  onResetFilters,
}: EncyclopediaSidebarProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isTopicsExpanded, setIsTopicsExpanded] = useState(false);
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);

  const activeFilterCount = (selectedIsland ? 1 : 0) + (selectedTopic ? 1 : 0);

  const hasMoreIslands = islands.length > MAX_VISIBLE_ISLANDS;
  const activeIslandIsHidden = useMemo(() => {
    if (!selectedIsland) {
      return false;
    }

    return islands
      .slice(MAX_VISIBLE_ISLANDS)
      .some((island) => island.name === selectedIsland);
  }, [islands, selectedIsland]);

  const shouldShowAllIslands = isExpanded || activeIslandIsHidden;
  const visibleIslands = shouldShowAllIslands
    ? islands
    : islands.slice(0, MAX_VISIBLE_ISLANDS);

  const hasMoreTopics = topics.length > MAX_VISIBLE_TOPICS;
  const activeTopicIsHidden = useMemo(() => {
    if (!selectedTopic) {
      return false;
    }

    return topics.slice(MAX_VISIBLE_TOPICS).includes(selectedTopic);
  }, [topics, selectedTopic]);

  const shouldShowAllTopics = isTopicsExpanded || activeTopicIsHidden;
  const visibleTopics = shouldShowAllTopics
    ? topics
    : topics.slice(0, MAX_VISIBLE_TOPICS);

  return (
    <aside>
      {/* Mobile-only toggle: keeps the filter panel collapsed by default on
          small screens so the article content isn't buried below it. Hidden
          from xl up where the sidebar sits alongside the content. */}
      <Button
        variant="outline"
        className="group flex h-auto w-full items-center gap-3 rounded-2xl border-[#d4cbbc] bg-[#f7f3ea] p-2.5 pr-3 text-left shadow-sm transition-all duration-200 hover:border-[#bfae8e] hover:bg-[#f3eee2] hover:shadow active:scale-[0.99] xl:hidden"
        onClick={() => setIsFilterPanelOpen((value) => !value)}
        aria-expanded={isFilterPanelOpen}
      >
        <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#357456] to-[#234b38] text-[#eef3ea] shadow-sm ring-1 ring-[#234b38]/20 transition-transform duration-200 group-hover:scale-105">
          <Filter className="size-[18px]" />
        </span>
        <span className="flex min-w-0 flex-1 flex-col">
          <span className="flex items-center gap-2 text-sm font-bold text-[#3f5b4c]">
            Filter Pulau &amp; Topik
            {activeFilterCount > 0 ? (
              <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-[#caa86a] px-1.5 text-xs font-semibold text-[#3c2e14]">
                {activeFilterCount}
              </span>
            ) : null}
          </span>
          <span className="text-xs font-medium text-[#86917f]">
            {activeFilterCount > 0
              ? `${activeFilterCount} filter aktif`
              : 'Pilih pulau & topik'}
          </span>
        </span>
        <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-[#ece5d8] text-[#5d6f62] transition-colors duration-200 group-hover:bg-[#e2dac9]">
          <ChevronDown
            className={`size-4 transition-transform duration-300 ${
              isFilterPanelOpen ? 'rotate-180' : ''
            }`}
          />
        </span>
      </Button>

      {/* Collapsible on mobile (smooth height + fade), always open from xl up. */}
      <div
        className={`grid transition-[grid-template-rows,opacity] duration-300 ease-out xl:!grid-rows-[1fr] xl:!opacity-100 ${
          isFilterPanelOpen
            ? 'grid-rows-[1fr] opacity-100'
            : 'grid-rows-[0fr] opacity-0'
        }`}
      >
        <div className="overflow-hidden">
          <div className="space-y-3 pt-3 xl:pt-0">
            {/* Region Filters */}
            <Card className="gap-2 rounded-2xl border border-[#d4cbbc] bg-[#f7f3ea] p-4">
              <div className="flex items-center gap-2 text-sm font-bold text-[#587061]">
                <Filter className="h-4 w-4" />
                Filter Pulau
              </div>
              <div>
                <ul className="space-y-1.5">
                  {visibleIslands.map((island) => (
                    <li key={island.name}>
                      <Button
                        variant="ghost"
                        className={`flex h-auto w-full cursor-pointer items-center justify-between rounded-md px-3 py-2 text-sm font-medium ${
                          island.active
                            ? 'bg-[#2f5f49] text-[#eef3ea] shadow-sm hover:bg-[#2f5f49] hover:text-[#eef3ea]'
                            : 'text-[#4c6457] hover:bg-[#2f5f49] hover:text-[#eef3ea]'
                        }`}
                        onClick={() => onIslandClick?.(island.name)}
                      >
                        <span>{island.name}</span>
                        <Badge
                          variant="secondary"
                          className={`rounded-full px-2 py-0.5 text-xs font-bold ${
                            island.active
                              ? 'bg-white/20 text-[#f4f7f1]'
                              : 'bg-[#e5decf] text-[#839386]'
                          }`}
                        >
                          {island.count}
                        </Badge>
                      </Button>
                    </li>
                  ))}
                </ul>

                {hasMoreIslands ? (
                  <Button
                    variant="ghost"
                    className="mt-2 h-auto w-full cursor-pointer justify-between rounded-md px-3 py-2 text-sm font-semibold text-[#5d6f62]"
                    onClick={() => setIsExpanded((value) => !value)}
                    aria-expanded={shouldShowAllIslands}
                  >
                    <span>
                      {shouldShowAllIslands
                        ? 'Sembunyikan lainnya'
                        : 'Tampilkan lainnya'}
                    </span>
                    {shouldShowAllIslands ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </Button>
                ) : null}
              </div>
            </Card>

            {/* Topics */}
            <Card className="gap-2 rounded-2xl border border-[#d4cbbc] bg-[#f7f3ea] p-4">
              <div className="text-sm font-bold text-[#587061]">Topic</div>
              <div>
                <div className="flex flex-wrap gap-2">
                  {visibleTopics.map((topic) => (
                    <Button
                      key={topic}
                      variant="outline"
                      size="sm"
                      className={`h-auto cursor-pointer rounded-md border-[#d8cfbf] px-2.5 py-1 text-xs font-semibold ${
                        selectedTopic === topic
                          ? 'bg-[#2f5f49] text-[#eef3ea] shadow-sm hover:bg-[#2f5f49] hover:text-[#eef3ea]'
                          : 'bg-[#efeadf] text-[#5d6f62] hover:bg-[#2f5f49] hover:text-[#eef3ea]'
                      }`}
                      onClick={() => onTopicClick?.(topic)}
                    >
                      {topic}
                    </Button>
                  ))}
                </div>

                {hasMoreTopics ? (
                  <Button
                    variant="ghost"
                    className="mt-2 h-auto w-full cursor-pointer justify-between rounded-md px-3 py-2 text-sm font-semibold text-[#5d6f62]"
                    onClick={() => setIsTopicsExpanded((value) => !value)}
                    aria-expanded={shouldShowAllTopics}
                  >
                    <span>
                      {shouldShowAllTopics
                        ? 'Sembunyikan lainnya'
                        : 'Tampilkan lainnya'}
                    </span>
                    {shouldShowAllTopics ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </Button>
                ) : null}
              </div>
            </Card>

            {/* Reset Button */}
            <Button
              variant="outline"
              className="w-full cursor-pointer rounded-xl border-[#d4cbbc] bg-[#f7f3ea] px-4 py-2 text-sm font-bold text-[#5d6f62]"
              onClick={onResetFilters}
            >
              Reset Semua Filter
            </Button>
          </div>
        </div>
      </div>
    </aside>
  );
}
