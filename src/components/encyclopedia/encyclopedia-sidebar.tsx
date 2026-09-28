import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import type { IslandFilter } from '@/types/encyclopedia';
import {
  ChevronDown,
  ChevronUp,
  Filter,
  MapPin,
  RotateCcw,
  Tags,
} from 'lucide-react';
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
            <Card className="gap-3 rounded-2xl border-0 bg-[#fbf8f2] p-4 shadow-[0_1px_2px_rgba(60,41,15,0.04),0_12px_28px_rgba(89,69,38,0.06)] ring-1 ring-[#e3d9c7]">
              <div className="flex items-center gap-2 text-sm font-bold text-[#2f5b49]">
                <span className="grid size-7 place-items-center rounded-lg bg-[#f5ead3] text-[#a07a2c]">
                  <MapPin className="size-3.5" />
                </span>
                Filter Pulau
              </div>
              <div>
                <ul className="space-y-1.5">
                  {visibleIslands.map((island) => (
                    <li key={island.name}>
                      <Button
                        variant="ghost"
                        className={`relative flex h-auto w-full cursor-pointer items-center justify-between overflow-hidden rounded-xl px-3 py-2 text-sm font-medium transition-all duration-200 ${
                          island.active
                            ? 'bg-gradient-to-r from-[#2f5f49] to-[#3f7359] text-[#eef3ea] shadow-[0_8px_18px_-10px_rgba(47,95,73,0.8)] hover:text-[#eef3ea] before:absolute before:inset-y-1.5 before:left-0 before:w-1 before:rounded-full before:bg-[#e8cb8d]'
                            : 'text-[#4c6457] hover:translate-x-0.5 hover:bg-[#e3ece5] hover:text-[#2f5f49]'
                        }`}
                        onClick={() => onIslandClick?.(island.name)}
                      >
                        <span>{island.name}</span>
                        <Badge
                          variant="secondary"
                          className={`rounded-full px-2 py-0.5 text-xs font-bold ${
                            island.active
                              ? 'bg-white/20 text-[#f4f7f1]'
                              : 'bg-[#efe8dd] text-[#839386]'
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
            <Card className="gap-3 rounded-2xl border-0 bg-[#fbf8f2] p-4 shadow-[0_1px_2px_rgba(60,41,15,0.04),0_12px_28px_rgba(89,69,38,0.06)] ring-1 ring-[#e3d9c7]">
              <div className="flex items-center gap-2 text-sm font-bold text-[#2f5b49]">
                <span className="grid size-7 place-items-center rounded-lg bg-[#f5ead3] text-[#a07a2c]">
                  <Tags className="size-3.5" />
                </span>
                Topik
              </div>
              <div>
                <div className="flex flex-wrap gap-2">
                  {visibleTopics.map((topic) => (
                    <Button
                      key={topic}
                      variant="outline"
                      size="sm"
                      className={`h-auto cursor-pointer rounded-full px-3 py-1 text-xs font-semibold transition-all duration-200 ${
                        selectedTopic === topic
                          ? 'border-[#2f5f49] bg-[#2f5f49] text-[#eef3ea] shadow-[0_6px_14px_-8px_rgba(47,95,73,0.8)] hover:bg-[#2f5f49] hover:text-[#eef3ea]'
                          : 'border-[#e6d6b8] bg-[#fbf8f2] text-[#6f6a62] hover:-translate-y-px hover:border-[#caa86a] hover:bg-[#f5ead3] hover:text-[#7a5a2c]'
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
              className="group/reset w-full cursor-pointer gap-2 rounded-xl border-[#e3d9c7] bg-[#fbf8f2] px-4 py-2 text-sm font-bold text-[#5d6f62] transition-all hover:border-[#2f5f49]/40 hover:bg-[#e3ece5] hover:text-[#2f5f49]"
              onClick={onResetFilters}
            >
              <RotateCcw className="size-4 transition-transform duration-500 group-hover/reset:-rotate-180" />
              Reset Semua Filter
            </Button>
          </div>
        </div>
      </div>
    </aside>
  );
}
