import { withApiAdmin } from '@/lib/api-handler';
import { logError } from '@/lib/logger';
import { HTMLStateMachineParser } from '@/lib/wikimedia/html-parser';
import { NextResponse } from 'next/server';

const BOILERPLATE_SECTION_TITLES = new Set([
  'references',
  'see also',
  'external links',
  'further reading',
  'notes',
  'footnotes',
  'citations',
  'sources',
  'bibliography',
  'weblinks',
  'links',
  'references and sources',
  'external references',
]);

export const GET = withApiAdmin(async ({ req }) => {
  try {
    const { searchParams } = new URL(req.url);
    const origin = searchParams.get('origin');
    const title = searchParams.get('title');
    if (!origin || !title) {
      return NextResponse.json(
        { error: 'Missing origin or title' },
        { status: 400 },
      );
    }

    const ALLOWED_ORIGINS = new Set([
      'https://en.wikipedia.org',
      'https://id.wikipedia.org',
      'https://commons.wikimedia.org',
    ]);

    let safeOrigin: string;
    try {
      const parsedOrigin = new URL(origin);
      if (
        (parsedOrigin.protocol !== 'https:' &&
          parsedOrigin.protocol !== 'http:') ||
        !ALLOWED_ORIGINS.has(parsedOrigin.origin)
      ) {
        return NextResponse.json({ error: 'Invalid origin' }, { status: 400 });
      }
      safeOrigin = parsedOrigin.origin;
    } catch {
      return NextResponse.json({ error: 'Invalid origin' }, { status: 400 });
    }

    const enc = encodeURIComponent(title);
    const ua =
      'WastraNusa/1.0 (wastranusa.example; contact: dev@wastranusa.example)';

    // 1) get section list via action=parse&prop=sections
    const sectionsUrl = `${safeOrigin}/w/api.php?action=parse&page=${enc}&prop=sections&format=json`;
    const secRes = await fetch(sectionsUrl, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'User-Agent': ua,
        Referer: safeOrigin,
      },
    });

    const secText = await secRes.text();
    if (!secRes.ok) {
      return new Response(secText, {
        status: secRes.status,
        headers: {
          'Content-Type':
            secRes.headers.get('content-type') ?? 'application/json',
        },
      });
    }

    interface WikiApiResponse {
      parse?: {
        sections?: Array<{ index?: string | number; line?: string }>;
        text?: { '*'?: string };
      };
    }

    let secJson: WikiApiResponse;
    try {
      secJson = secText ? JSON.parse(secText) : {};
    } catch {
      return NextResponse.json(
        { error: 'Invalid JSON from wiki' },
        { status: 502 },
      );
    }

    const sections = secJson.parse?.sections ?? [];

    // helper to strip HTML using secure state machine parser
    const stripHtml = (html?: string) => {
      return HTMLStateMachineParser.extractText(html ?? '');
    };

    // For each section, fetch its HTML via action=parse&section=index&prop=text
    const outSections: Array<{
      title: string;
      content: string;
      line: string;
      text: string;
      imageURL?: string;
    }> = [];
    for (const s of sections) {
      const idx = s.index;
      if (typeof idx === 'undefined') continue;
      const secHtmlUrl = `${safeOrigin}/w/api.php?action=parse&page=${enc}&section=${idx}&prop=text&format=json`;
      try {
        const r = await fetch(secHtmlUrl, {
          headers: {
            Accept: 'application/json',
            'User-Agent': ua,
            Referer: safeOrigin,
          },
        });
        if (!r.ok) continue;
        const t = await r.text();
        const j = t ? JSON.parse(t) : {};
        const rawHtml = j.parse?.text?.['*'] ?? '';
        const titleClean = stripHtml(s.line);

        // Skip boilerplate sections (References, See Also, External Links, etc.)
        if (BOILERPLATE_SECTION_TITLES.has(titleClean.toLowerCase())) continue;

        let contentClean = stripHtml(rawHtml);

        // MediaWiki embeds the section heading inside the HTML, so after
        // tag-stripping the title appears verbatim at the start of the content.
        // Remove it to avoid duplication.
        if (
          titleClean &&
          contentClean.toLowerCase().startsWith(titleClean.toLowerCase())
        ) {
          contentClean = contentClean.slice(titleClean.length).trimStart();
        }

        // Skip sections whose content is empty after cleaning
        if (!contentClean) continue;

        let imageURL: string | undefined;
        try {
          const extractedUrl =
            HTMLStateMachineParser.extractFirstImageUrl(rawHtml);
          if (extractedUrl) {
            let src = extractedUrl;
            // Handle relative URLs
            if (src.startsWith('/') && !src.startsWith('//')) {
              src = safeOrigin + src;
            }
            imageURL = src;
          }
        } catch (imgErr) {
          // ignore image extraction errors
          console.debug('image extraction error', imgErr);
        }

        outSections.push({
          title: titleClean,
          line: titleClean,
          content: contentClean,
          text: contentClean,
          ...(imageURL ? { imageURL } : {}),
        });
      } catch (e) {
        // ignore individual section failures

        console.debug('section fetch fail', e);
      }
    }

    return NextResponse.json({ sections: outSections });
  } catch (err) {
    logError(err, { action: 'GET /api/wikimedia/mobile-sections' });
    return NextResponse.json(
      { error: 'Gagal mengambil data' },
      { status: 500 },
    );
  }
});
