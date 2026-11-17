import { ImgIcon } from './Icons';
import { mediaUrl } from '@/lib/data';

type M = Record<string, { file: string; alt: string; v: number }>;

/** Renders an uploaded image for a media slot, or a tasteful placeholder until one is uploaded. */
export function Slot({ media, slot, label, className = '', style, priority = false }: {
  media: M; slot: string; label: string; className?: string; style?: React.CSSProperties; priority?: boolean;
}) {
  const m = media[slot];
  const url = mediaUrl(m);
  return (
    <div className={`slot ${className}`} style={style}>
      {url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={url} alt={m.alt || label} loading={priority ? 'eager' : 'lazy'} decoding="async" />
      ) : (
        <>
          <ImgIcon />
          <span>{label}</span>
        </>
      )}
    </div>
  );
}
