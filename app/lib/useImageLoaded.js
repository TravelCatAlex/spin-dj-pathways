'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Tracks whether an image has finished loading, so a skeleton can sit in its
 * place until it has.
 *
 * `onLoad` alone is not enough: an image the browser already has cached is
 * complete before React attaches its listener, so the event never fires and
 * the skeleton shimmers forever over a picture that is already there — with
 * the image held at opacity 0 behind it. That is the common case on a repeat
 * visit, exactly when a placeholder is least wanted.
 *
 * The fix has to come from the DOM rather than a ref on the image itself:
 * `ref` handed to next/image through a props spread does not reliably reach
 * the underlying <img>. So the caller attaches `holderRef` to the wrapper it
 * already has, and after mount we look inside it for the real element and ask
 * whether it is done.
 *
 * A failed load counts as finished too. Leaving the shimmer running would
 * promise an image that is never coming; `failed` lets the caller show
 * something honest instead.
 */
export function useImageLoaded() {
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  const holderRef = useRef(null);

  useEffect(() => {
    const img = holderRef.current?.querySelector('img');

    if (img?.complete) {
      // naturalWidth separates a cached success from a cached error: both
      // report complete, only one has pixels behind it.
      if (img.naturalWidth > 0) {
        setLoaded(true);
      } else {
        setFailed(true);
        setLoaded(true);
      }
      return undefined;
    }

    // Fail-safe. The image is held at opacity 0 until this flips, so anything
    // that swallows both the load event and the complete check — a detached
    // node, a paused tab resuming oddly — would leave it invisible for good.
    // A picture nobody can see is a worse outcome than a placeholder that
    // clears a moment early, so after this long we reveal it regardless.
    const timer = setTimeout(() => setLoaded(true), 3000);
    return () => clearTimeout(timer);
  }, []);

  const onLoad = useCallback(() => setLoaded(true), []);
  const onError = useCallback(() => {
    setFailed(true);
    setLoaded(true);
  }, []);

  return { loaded, failed, holderRef, imgProps: { onLoad, onError } };
}
