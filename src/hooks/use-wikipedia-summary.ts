'use client';

import {
  type MappedArticleFieldsFromWikipedia,
  WikipediaSummaryFetchError,
  fetchWikipediaPageSummary,
  mapWikipediaSummaryToArticleFields,
  parseWikimediaArticleUrl,
  validateWikimediaArticleUrlShape,
} from '@/lib/wikimedia/wikipedia-summary';
import { useCallback, useEffect, useRef, useState } from 'react';

export type WikipediaSummaryPreview = {
  mapped: MappedArticleFieldsFromWikipedia;
  pageUrl: string;
  wikiType?: string;
  sectionsFetchError?: string | null;
  sectionsFetched?: boolean;
};

/**
 * Client-side Wikipedia page summary import: URL state, debounced validation,
 * fetch with abort, loading/error/preview. Reset when `isActive` becomes false (e.g. modal closed).
 */
export function useWikipediaSummaryImport(isActive: boolean) {
  const [url, setUrl] = useState('');
  const [urlHint, setUrlHint] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<WikipediaSummaryPreview | null>(null);

  const abortRef = useRef<AbortController | null>(null);

  // Opening the panel starts from a clean slate. Reset while rendering when
  // `isActive` flips, instead of in an effect (no extra render pass).
  const [wasActive, setWasActive] = useState(isActive);
  if (isActive !== wasActive) {
    setWasActive(isActive);
    if (isActive) {
      setUrl('');
      setUrlHint(null);
      setError(null);
      setPreview(null);
      setIsLoading(false);
    }
  }

  // Closing the panel or unmounting cancels a request in flight (its
  // `finally` clears the loading state).
  useEffect(() => () => abortRef.current?.abort(), [isActive]);

  useEffect(() => {
    const id = window.setTimeout(() => {
      setUrlHint(validateWikimediaArticleUrlShape(url));
    }, 400);
    return () => window.clearTimeout(id);
  }, [url]);

  const urlLooksValid =
    url.trim().length > 0 && parseWikimediaArticleUrl(url) !== null;

  const fetchSummary = useCallback(async () => {
    const trimmed = url.trim();
    const parsed = parseWikimediaArticleUrl(trimmed);
    if (!parsed) {
      setError(
        'URL tidak valid atau bukan halaman artikel Wikipedia (*.wikipedia.org, jalur /wiki/… atau ?title=…).',
      );
      setPreview(null);
      return;
    }

    abortRef.current?.abort();
    const ac = new AbortController();
    abortRef.current = ac;

    setIsLoading(true);
    setError(null);
    setPreview(null);

    try {
      const summary = await fetchWikipediaPageSummary(
        parsed.apiOrigin,
        parsed.pageTitle,
        ac.signal,
      );
      const mapped = mapWikipediaSummaryToArticleFields(summary);
      // Sections are optional: the summary is still usable without them.
      let sectionsError: string | null = null;
      let sectionsFetched = false;
      try {
        // Server-side proxy avoids CORS / 403 issues from the browser.
        const proxyUrl = `/api/wikimedia/mobile-sections?origin=${encodeURIComponent(
          parsed.apiOrigin,
        )}&title=${encodeURIComponent(parsed.pageTitle)}`;
        const resp = await fetch(proxyUrl, { signal: ac.signal });
        const sectionsResp = resp.ok ? await resp.json() : null;
        if (sectionsResp?.sections && sectionsResp.sections.length > 0) {
          mapped.sections = sectionsResp.sections
            .filter((s: { line?: string; text?: string }) => s.line && s.text)
            .map((s: { line: string; text: string; imageURL?: string }) => ({
              title: s.line,
              content: s.text,
              ...(s.imageURL ? { imageURL: s.imageURL } : {}),
            }));
        }
        sectionsFetched = true;
      } catch (e: unknown) {
        if (ac.signal.aborted) throw e;
        sectionsError = e instanceof Error ? e.message : String(e);
      }

      setPreview({
        mapped,
        pageUrl: trimmed,
        wikiType: summary.type,
        sectionsFetchError: sectionsError,
        sectionsFetched,
      });
    } catch (err: unknown) {
      if (err instanceof DOMException && err.name === 'AbortError') return;
      const message =
        err instanceof WikipediaSummaryFetchError
          ? err.message
          : err instanceof TypeError
            ? 'Koneksi gagal atau diblokir. Periksa jaringan atau CORS browser.'
            : err instanceof Error
              ? err.message
              : 'Gagal mengambil ringkasan Wikipedia.';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [url]);

  const discardPreview = useCallback(() => setPreview(null), []);

  return {
    url,
    setUrl,
    urlHint,
    isLoading,
    error,
    preview,
    urlLooksValid,
    fetchSummary,
    discardPreview,
  };
}
