import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { IslandFilter } from '@/types/encyclopedia';
import { ChevronDown, ChevronUp, Filter, RotateCcw } from 'lucide-react';
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
        className="flex h-12 w-full items-center gap-3 rounded-full border-0 bg-surface px-5 text-left text-ink transition-colors hover:bg-border active:scale-[0.99] xl:hidden"
        onClick={() => setIsFilterPanelOpen((value) => !value)}
        aria-expanded={isFilterPanelOpen}
      >
        <Filter className="size-5 shrink-0" strokeWidth={1.75} />
        <span className="flex min-w-0 flex-1 flex-col">
          <span className="flex items-center gap-2 text-[15px] font-semibold">
            Filter
            {activeFilterCount > 0 ? (
              <span className="text-[15px] font-normal text-ink-soft tabular-nums">
                {activeFilterCount}
              </span>
            ) : null}
          </span>
        </span>
        <span className="text-ink-soft">
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
            <Card className="gap-2 rounded-none border-0 bg-transparent p-0 py-2">
              <h3 className="px-3 text-base font-semibold text-ink">Pulau</h3>
              <div>
                <ul className="space-y-1.5">
                  {visibleIslands.map((island) => (
                    <li key={island.name}>
                      <Button
                        variant="ghost"
                        className={`relative flex h-auto w-full cursor-pointer items-center justify-between overflow-hidden rounded-full px-3 py-2 text-[15px] font-normal transition-colors duration-200 ${
                          island.active
                            ? 'bg-brand text-on-field hover:text-on-field'
                            : 'text-ink hover:bg-surface hover:text-ink'
                        }`}
                        onClick={() => onIslandClick?.(island.name)}
                      >
                        <span>{island.name}</span>
                        <span
                          className={cn(
                            'text-[13px] tabular-nums',
                            island.active
                              ? 'text-on-field-soft'
                              : 'text-ink-soft',
                          )}
                        >
                          {island.count}
                        </span>
                      </Button>
                    </li>
                  ))}
                </ul>

                {hasMoreIslands ? (
                  <Button
                    variant="ghost"
                    className="mt-2 h-auto w-full cursor-pointer justify-between rounded-full px-3 py-2 text-[15px] font-semibold text-ink-soft"
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
            <Card className="gap-2 rounded-none border-0 bg-transparent p-0 py-2">
              <h3 className="px-3 text-base font-semibold text-ink">Topik</h3>
              <div>
                <div className="flex flex-wrap gap-2">
                  {visibleTopics.map((topic) => (
                    <Button
                      key={topic}
                      variant="outline"
                      size="sm"
                      className={`h-9 cursor-pointer rounded-full border-0 px-3.5 text-[15px] font-normal transition-colors duration-200 ${
                        selectedTopic === topic
                          ? 'bg-brand font-semibold text-on-field hover:bg-brand-strong hover:text-on-field'
                          : 'bg-surface text-ink hover:bg-brand hover:text-on-field'
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
                    className="mt-2 h-auto w-full cursor-pointer justify-between rounded-full px-3 py-2 text-[15px] font-semibold text-ink-soft"
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
              className="group/reset h-10 w-full cursor-pointer gap-2 rounded-full border-0 bg-transparent px-3 text-[15px] font-semibold text-ink-soft transition-colors hover:bg-surface hover:text-ink"
              onClick={onResetFilters}
            >
              <RotateCcw className="size-4 transition-transform duration-500 group-hover/reset:-rotate-180" />
              Reset filter
            </Button>
          </div>
        </div>
      </div>
    </aside>
  );
}
