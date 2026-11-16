import NextImage, { type ImageProps } from 'next/image';

/**
 * Remote images are URLs admins/sellers paste from any site, so they can't be
 * allow-listed for the optimizer. They load straight from their host instead;
 * only images from /public go through `/_next/image`. This keeps the server
 * from being an open image proxy (and from spending CPU/memory resizing).
 */
export function isRemoteUrl(src: ImageProps['src']) {
  return typeof src === 'string' && /^(https?:)?\/\//.test(src);
}

/** `next/image`, except remote images skip the optimizer. */
export default function Image(props: ImageProps) {
  return (
    <NextImage
      {...props}
      unoptimized={props.unoptimized || isRemoteUrl(props.src)}
    />
  );
}
