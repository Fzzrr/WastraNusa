/**
 * Client-side helpers for Wikipedia page summary REST API.
 * @see https://en.wikipedia.org/api/rest_v1/
 */

const SUMMARY_PATH = '/api/rest_v1/page/summary';

export type WikipediaSummaryThumbnail = {
  source: string;
  width?: number;
  height?: number;
};

/** Minimal shape we consume from GET .../page/summary/{title} */
export type WikipediaSummarySuccess = {
  type?: string;
  title: string;
  displaytitle?: string;
  extract?: string;
  extract_html?: string;
  thumbnail?: WikipediaSummaryThumbnail;
};

export type WikipediaSummaryErrorBody = {
  type?: string;
  title?: string;
  detail?: string;
};

export type ParsedWikimediaArticleUrl = {
  apiOrigin: string;
  pageTitle: string;
};

export type MappedArticleFieldsFromWikipedia = {
  title: string;
  excerpt: string;
  summary: string;
  description: string;
  imageURL?: string;
  sections?: Array<{ title: string; content: string; imageURL?: string }>;
};

function isWikipediaHost(hostname: string): boolean {
  const h = hostname.toLowerCase();
  return h === 'wikipedia.org' || h.endsWith('.wikipedia.org');
}

/**
 * Validates URL shape only (no network). Returns user-facing hint or null if OK-looking.
 */
export function validateWikimediaArticleUrlShape(raw: string): string | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  try {
    const url = new URL(trimmed);
    if (!['http:', 'https:'].includes(url.protocol)) {
      return 'Gunakan tautan http atau https.';
    }
    if (!isWikipediaHost(url.hostname)) {
      return 'Hanya URL artikel Wikipedia (hostname *.wikipedia.org) yang didukung.';
    }
    const parsed = extractTitleFromWikipediaUrl(url);
    if (!parsed) {
      return 'Gunakan tautan artikel wiki, misalnya …/wiki/Judul_Artikel atau ?title=Judul.';
    }
    return null;
  } catch {
    return 'Format URL tidak valid.';
  }
}

function extractTitleFromWikipediaUrl(url: URL): string | null {
  const titleParam =
    url.searchParams.get('title') ?? url.searchParams.get('Title');
  if (url.pathname.includes('index.php') && titleParam && titleParam.trim()) {
    return decodeURIComponent(titleParam.replace(/\+/g, ' ')).trim();
  }

  const wikiMatch = url.pathname.match(/^\/wiki\/(.+)$/);
  if (wikiMatch?.[1]) {
    try {
      const decoded = decodeURIComponent(wikiMatch[1]);
      return decoded.replace(/_/g, ' ').trim();
    } catch {
      return null;
    }
  }

  return null;
}

export function parseWikimediaArticleUrl(
  raw: string,
): ParsedWikimediaArticleUrl | null {
  try {
    const url = new URL(raw.trim());
    if (!['http:', 'https:'].includes(url.protocol)) return null;
    if (!isWikipediaHost(url.hostname)) return null;

    const pageTitle = extractTitleFromWikipediaUrl(url);
    if (!pageTitle) return null;

    const apiOrigin = `${url.protocol}//${url.hostname}`;
    return { apiOrigin, pageTitle };
  } catch {
    return null;
  }
}

function truncateForExcerpt(text: string, maxLen: number): string {
  const normalized = text.replace(/\s+/g, ' ').trim();
  if (normalized.length <= maxLen) return normalized;
  const slice = normalized.slice(0, maxLen);
  const lastSpace = slice.lastIndexOf(' ');
  const base = lastSpace > maxLen * 0.6 ? slice.slice(0, lastSpace) : slice;
  return `${base.trim()}…`;
}

/**
 * Returns the first complete sentence (ends at . ! or ?) from text.
 * Falls back to truncateForExcerpt when no sentence boundary is found.
 */
function extractFirstSentence(text: string, maxLen: number = 220): string {
  const normalized = text.replace(/\s+/g, ' ').trim();
  // Find the first sentence-ending punctuation followed by a space or end-of-string
  const match = normalized.match(/^.+?[.!?](?=\s|$)/);
  if (match) {
    const sentence = match[0].trim();
    // Only use it if it's meaningfully shorter than the full text
    if (sentence.length < normalized.length && sentence.length <= maxLen) {
      return sentence;
    }
  }
  return truncateForExcerpt(normalized, maxLen);
}

export function mapWikipediaSummaryToArticleFields(
  data: WikipediaSummarySuccess,
): MappedArticleFieldsFromWikipedia {
  const rawTitle = data.displaytitle ?? data.title ?? '';
  const title = stripHtml(rawTitle);
  const extractRaw = stripHtml(data.extract_html ?? data.extract ?? '');

  const excerpt =
    extractRaw.length > 0 ? extractFirstSentence(extractRaw) : title;

  const summary = extractRaw.length > 0 ? extractRaw : title;

  const description =
    extractRaw.length > 0
      ? `Ringkasan dari Wikipedia (${title}). Disarankan mengedit dan melengkapi konteks lokal sebelum mempublikasikan.`
      : '';

  const thumb = data.thumbnail?.source?.trim();
  let imageURL: string | undefined;
  if (thumb) {
    try {
      imageURL = new URL(thumb).href;
    } catch {
      imageURL = undefined;
    }
  }

  return {
    title: title.trim(),
    excerpt,
    summary,
    description,
    imageURL,
  };
}

export class WikipediaSummaryFetchError extends Error {
  constructor(
    message: string,
    readonly status?: number,
    readonly body?: WikipediaSummaryErrorBody,
  ) {
    super(message);
    this.name = 'WikipediaSummaryFetchError';
  }
}

export async function fetchWikipediaPageSummary(
  apiOrigin: string,
  pageTitle: string,
  signal?: AbortSignal,
): Promise<WikipediaSummarySuccess> {
  const enc = encodeURIComponent(pageTitle);
  const res = await fetch(`${apiOrigin}${SUMMARY_PATH}/${enc}`, {
    method: 'GET',
    headers: { Accept: 'application/json' },
    signal,
  });

  const text = await res.text();
  let json: unknown;
  try {
    json = text ? JSON.parse(text) : {};
  } catch {
    throw new WikipediaSummaryFetchError(
      'Respons Wikipedia tidak dapat dibaca (bukan JSON).',
      res.status,
    );
  }

  if (!res.ok) {
    const errBody = json as WikipediaSummaryErrorBody;
    const detail =
      errBody.detail?.trim() || res.statusText || 'Permintaan gagal';
    if (res.status === 404) {
      throw new WikipediaSummaryFetchError(
        `Artikel tidak ditemukan: ${detail}`,
        res.status,
        errBody,
      );
    }
    throw new WikipediaSummaryFetchError(detail, res.status, errBody);
  }

  const data = json as WikipediaSummarySuccess;
  if (!data.title && !data.extract) {
    throw new WikipediaSummaryFetchError(
      'Data ringkasan kosong atau tidak dikenali.',
      res.status,
    );
  }

  return data;
}

/** Plain text of an HTML snippet, via the DOM parser (no regex tag stripping). */
function stripHtml(html?: string): string {
  if (!html) return '';

  const doc = new DOMParser().parseFromString(html, 'text/html');
  const text = doc.body?.textContent ?? '';
  return text.replace(/\s+/g, ' ').trim();
}
