import NextImage, { type ImageProps } from 'next/image';

// Wikimedia rate-limits (429) the server-side optimizer, which downloads the
// original once per requested width. Browsers may hotlink it directly.
const WIKIMEDIA = /^https:\/\/(upload|thumb)\.wikimedia\.org\//;

export function isWikimediaUrl(src: ImageProps['src']) {
  return typeof src === 'string' && WIKIMEDIA.test(src);
}

/** `next/image`, except Wikimedia images skip the optimizer. */
export default function Image(props: ImageProps) {
  return (
    <NextImage
      {...props}
      unoptimized={props.unoptimized || isWikimediaUrl(props.src)}
    />
  );
}
