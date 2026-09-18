'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { m } from 'motion/react';

import Icon from '../atoms/Icon';
import Skeleton from '../atoms/Skeleton';
import { useImageLoaded } from '../../lib/useImageLoaded';
import { group, liftCard, rise, spring } from '../../lib/motion';

/**
 * ORGANISM — ProjectUploads
 *
 * Files a student has uploaded. Two places, one component:
 *   tone="dark"  — the recordings strip at the foot of the hero, five at a time
 *   tone="light" — the My Creations tab, the whole lot
 *
 * ONE COMPONENT BECAUSE THE TILE IS THE SAME TILE. The alternative was a strip
 * and a grid that drift apart the first time a file type is added to one of
 * them. What actually differs is the surface underneath and how many rows fit,
 * and both of those are props.
 *
 * THE FILE NEVER PASSES THROUGH OUR SERVER. `POST /api/v1/uploads` returns a
 * signed URL and the browser PUTs straight to storage — a route handler would
 * otherwise buffer the whole file in memory before forwarding it, which is what
 * serverless body limits exist to stop.
 *
 * THE PUT RESPONSE IS CHECKED, and that is not defensive habit. Storage enforces
 * the bucket's size and MIME limits at this exact step, not at the signing step,
 * so a file the bucket refuses gets a perfectly good signed URL and then fails
 * here. Without `res.ok` the upload appears to succeed and the file is simply
 * absent, which is the worst of both.
 *
 * PLAIN `<img>`, NOT `next/image`. The sources are signed URLs that expire and
 * change, and next/image would need the storage host written into
 * next.config.js — a host in source, for a thumbnail already at its final size.
 */

const EYEBROW =
  'text-[10px] font-semibold uppercase tracking-[1.1px]';

const TONES = {
  dark: {
    eyebrow: `${EYEBROW} text-white/[0.72]`,
    rule: 'border-t-white/[0.09]',
    tile: 'border-white/[0.14] bg-white/[0.06] hover:border-white/30 hover:bg-white/[0.12]',
    thumb: 'bg-black/30',
    name: 'text-white/85',
    meta: 'text-white/55',
    muted: 'text-white/70',
    button:
      'border-white/20 bg-white/[0.12] text-white hover:border-white/35 hover:bg-white/20 focus-visible:outline-white',
    skeleton: 'dark',
  },
  light: {
    eyebrow: `${EYEBROW} text-ink/60`,
    rule: 'border-t-black/[0.07]',
    tile: 'border-black/[0.08] bg-black/[0.02] hover:border-black/20 hover:bg-black/[0.04]',
    thumb: 'bg-black/[0.05]',
    name: 'text-ink',
    meta: 'text-ink/50',
    muted: 'text-ink/60',
    button:
      'border-black/10 bg-ink/[0.06] text-ink hover:border-black/25 hover:bg-ink/[0.12] focus-visible:outline-ink',
    skeleton: 'light',
  },
};

/**
 * What kind of file this is, for the icon and the label.
 *
 * MIME first, EXTENSION AS A FALLBACK — not the other way round. The content
 * type is what the browser sent and is usually right; the extension is only a
 * name. But `contentType` comes back null for anything uploaded before the
 * bucket knew better, and a file with no icon reads as a broken tile.
 */
function fileKind(file) {
  const type = (file.contentType ?? '').toLowerCase();
  const ext = ((file.name ?? file.path).split('.').pop() ?? '').toLowerCase();

  if (type.startsWith('image/') || ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext))
    return { icon: 'image', label: 'Image', isImage: true };
  if (type.startsWith('video/') || ['mp4', 'mov', 'webm', 'avi'].includes(ext))
    return { icon: 'video', label: 'Video', isImage: false };
  if (type.startsWith('audio/') || ['mp3', 'wav', 'm4a', 'aac', 'ogg'].includes(ext))
    return { icon: 'audio', label: 'Audio', isImage: false };
  if (type === 'application/pdf' || ext === 'pdf')
    return { icon: 'pdf', label: 'PDF', isImage: false };
  if (type.startsWith('text/') || ['txt', 'md', 'csv', 'doc', 'docx', 'rtf'].includes(ext))
    return { icon: 'document', label: 'Document', isImage: false };
  if (['zip', 'rar', '7z', 'tar', 'gz'].includes(ext))
    return { icon: 'archive', label: 'Archive', isImage: false };

  return { icon: 'note', label: 'File', isImage: false };
}

/** Bytes as something a person reads. Null stays null — "unknown" is not "0 B". */
function readableSize(bytes) {
  if (typeof bytes !== 'number') return null;
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/** The thumbnail, with the skeleton the rest of the app uses while it loads. */
function Thumb({ file, kind, tone }) {
  const t = TONES[tone];
  const { loaded, failed, holderRef, imgProps } = useImageLoaded();
  const showImage = kind.isImage && file.signedUrl !== null && !failed;

  return (
    <span
      ref={holderRef}
      className={`relative flex aspect-[16/10] w-full items-center justify-center overflow-hidden rounded-[7px] ${t.thumb}`}
    >
      {showImage ? (
        <>
          {!loaded && <Skeleton tone={t.skeleton} rounded="rounded-[7px]" />}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={file.signedUrl}
            alt=""
            loading="lazy"
            {...imgProps}
            className={`h-full w-full object-cover transition-opacity duration-300 ${
              loaded ? 'opacity-100' : 'opacity-0'
            }`}
          />
        </>
      ) : (
        <Icon name={kind.icon} size={18} aria-hidden="true" />
      )}
    </span>
  );
}

/**
 * The grid, so the skeleton and the real thing occupy identical space.
 *
 * AUTO-FILL, NOT A COLUMN COUNT PER BREAKPOINT. A fixed `grid-cols-2 sm:3 md:4`
 * ladder counts the VIEWPORT, and this component lives in two containers of very
 * different widths - a narrow hero column and a full-width card. At the same
 * breakpoint one of them was showing tiles twice the size of the other.
 *
 * `minmax(124px, 1fr)` asks for the tile size instead and lets the row fit
 * whatever it can. One rule, correct in both places and at every width in
 * between, with no breakpoints to keep in step.
 */
const GRID =
  'grid gap-2 [grid-template-columns:repeat(auto-fill,minmax(124px,1fr))]';

export default function ProjectUploads({
  /**
   * WHOSE FILES. Passed in rather than imported, so the page's live dashboard
   * call is the ONE place that decides who the student is - this component used
   * to reach for DEMO_STUDENT_ID itself, which meant a second answer to that
   * question sitting in a component that has no business having one.
   *
   * NULL until that call lands, and nothing is fetched until it does. Firing
   * with the fixture's id would be a request for a student that does not exist,
   * answered with an error the user would see as "could not load your files".
   */
  studentId = null,
  limit = 5,
  tone = 'dark',
  title = 'Recordings',
  onViewAll = null,
  showRule = true,
}) {
  const t = TONES[tone] ?? TONES.dark;

  const [files, setFiles] = useState([]);
  const [state, setState] = useState('loading'); // loading | ready | failed
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const inputRef = useRef(null);

  const refresh = useCallback(async () => {
    if (studentId === null) return;
    try {
      const res = await fetch(
        `/api/v1/uploads?studentId=${encodeURIComponent(studentId)}&limit=${limit}`,
        { cache: 'no-store' },
      );
      if (!res.ok) throw new Error(`list failed: ${res.status}`);
      const body = await res.json();
      setFiles(body.files ?? []);
      setState('ready');
    } catch (err) {
      console.error(err);
      setState('failed');
    }
  }, [studentId, limit]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  async function upload(file) {
    setBusy(true);
    setError(null);
    try {
      const signRes = await fetch('/api/v1/uploads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId,
          filename: file.name,
          contentType: file.type || null,
          size: file.size,
        }),
      });
      if (!signRes.ok) throw new Error('Could not start the upload.');
      const { signedUrl, creationId } = await signRes.json();

      const putRes = await fetch(signedUrl, {
        method: 'PUT',
        headers: { 'Content-Type': file.type || 'application/octet-stream' },
        body: file,
      });

      // See the header: this is where the bucket's limits actually bite.
      if (!putRes.ok) {
        throw new Error(
          putRes.status === 413
            ? 'That file is larger than the bucket allows.'
            : `Storage refused the file (${putRes.status}).`,
        );
      }

      // Only now does the row count as uploaded. Until this lands it reads as
      // an abandoned attempt, which is exactly what it would be if the browser
      // closed between the PUT and here.
      await fetch('/api/v1/uploads', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ creationId }),
      });

      await refresh();
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'Upload failed.');
    } finally {
      setBusy(false);
      // Let the same file be picked again after a failure; without this the
      // input still holds it and onChange never fires a second time.
      if (inputRef.current) inputRef.current.value = '';
    }
  }

  return (
    <section className={showRule ? `mt-6 border-t ${t.rule} pt-5` : ''}>
      <header className="mb-2.5 flex flex-wrap items-center justify-between gap-3">
        <p className={`m-0 ${t.eyebrow}`}>{title}</p>

        <div className="flex items-center gap-2">
          {onViewAll !== null && (
            <button
              type="button"
              onClick={onViewAll}
              className={`inline-flex items-center gap-1.5 rounded-[10px] px-2.5 py-[7px] text-[12px] font-semibold transition-colors duration-150 ${t.muted} hover:underline focus-visible:outline-2 focus-visible:outline-offset-2`}
            >
              View All
              <Icon name="arrowRight" size={13} aria-hidden="true" />
            </button>
          )}

          <input
            ref={inputRef}
            type="file"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void upload(file);
            }}
          />

          <m.button
            type="button"
            disabled={busy || studentId === null}
            onClick={() => inputRef.current?.click()}
            whileTap={{ scale: 0.98, transition: spring }}
            className={`inline-flex items-center gap-2 rounded-[10px] border px-[13px] py-[8px] text-[12px] font-semibold transition-colors duration-150 ease-out disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 ${t.button}`}
          >
            <Icon name="creations" size={13} aria-hidden="true" />
            {busy ? 'Uploading…' : 'Upload'}
          </m.button>
        </div>
      </header>

      {error !== null && (
        <p role="alert" className="mb-3 text-[12.5px] text-rose-400">
          {error}
        </p>
      )}

      {/* SKELETON TILES, NOT A SPINNER OR A WORD. They occupy the exact grid the
          files will, so nothing below jumps when the request lands — which is
          the only reason a skeleton beats "Loading…". */}
      {state === 'loading' && (
        <ul className={`${GRID} m-0 list-none p-0`} aria-hidden="true">
          {Array.from({ length: Math.min(limit, 5) }).map((_, i) => (
            <li key={i} className={`rounded-[10px] border p-1.5 ${t.tile}`}>
              <span className={`relative block aspect-[16/10] w-full overflow-hidden rounded-[7px] ${t.thumb}`}>
                <Skeleton tone={t.skeleton} rounded="rounded-[7px]" />
              </span>
              <span className="relative mt-1.5 block h-[9px] w-4/5 overflow-hidden rounded">
                <Skeleton tone={t.skeleton} rounded="rounded" />
              </span>
              <span className="relative mt-1 block h-[8px] w-1/2 overflow-hidden rounded">
                <Skeleton tone={t.skeleton} rounded="rounded" />
              </span>
            </li>
          ))}
        </ul>
      )}

      {state === 'failed' && (
        <p className={`text-[12.5px] ${t.muted}`}>
          Could not load your files. Try again in a moment.
        </p>
      )}

      {/* An empty bucket is a real state and says so, rather than an empty row
          that reads as a loading bug. */}
      {state === 'ready' && files.length === 0 && (
        <p className={`text-[12.5px] ${t.muted}`}>Nothing uploaded yet.</p>
      )}

      {/* THE SAME MOTION THE REST OF THE PAGE USES, not a new one invented here:
          `group` releases the children in sequence, `rise` is the 14px travel
          every card on this dashboard arrives on, and `liftCard` is its hover.
          Importing them rather than hand-rolling a fade is the whole reason
          lib/motion exists - a bespoke curve here would read as a different
          app the moment it sits under the hero.

          `initial`/`animate` rather than `whileInView`: these tiles appear when
          a fetch lands, not when the section is scrolled to, so there is no
          viewport crossing to hang the animation on. */}
      {state === 'ready' && files.length > 0 && (
        <m.ul
          variants={group(0.045)}
          initial="hidden"
          animate="show"
          className={`${GRID} m-0 list-none p-0`}
        >
          {files.map((f) => {
            const kind = fileKind(f);
            const size = readableSize(f.size);
            return (
              <m.li key={f.path} variants={rise}>
                <m.a
                  href={f.signedUrl ?? '#'}
                  target="_blank"
                  rel="noreferrer"
                  title={f.name}
                  {...liftCard}
                  className={`flex h-full flex-col rounded-[10px] border p-1.5 transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 ${t.tile}`}
                >
                  <Thumb file={f} kind={kind} tone={tone} />

                  <span className={`mt-1.5 block truncate text-[10.5px] font-medium ${t.name}`}>
                    {f.name}
                  </span>
                  <span className={`mt-0.5 flex items-center gap-1 truncate whitespace-nowrap text-[9.5px] ${t.meta}`}>
                    <Icon name={kind.icon} size={10} aria-hidden="true" />
                    {kind.label}
                    {size !== null && <span aria-hidden="true">·</span>}
                    {size !== null && <span>{size}</span>}
                  </span>
                </m.a>
              </m.li>
            );
          })}
        </m.ul>
      )}
    </section>
  );
}
