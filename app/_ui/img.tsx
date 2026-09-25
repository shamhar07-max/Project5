import type { ImgHTMLAttributes } from "react";

/**
 * A plain <img> with next/image's defaults (lazy, async decode). Public pages use
 * pre-sized assets, so this keeps the next/image client runtime off them.
 */
export function Img({ loading = "lazy", decoding = "async", alt = "", ...props }: ImgHTMLAttributes<HTMLImageElement>) {
  // eslint-disable-next-line @next/next/no-img-element
  return <img loading={loading} decoding={decoding} alt={alt} {...props} />;
}
