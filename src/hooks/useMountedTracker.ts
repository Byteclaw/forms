import { useEffect, useRef } from 'react';

/**
 * Tracks if component is mounted
 */
export function useMountedTracker() {
  const ref = useRef(false);

  useEffect(() => {
    ref.current = true;

    return () => {
      ref.current = false;
    };
  }, []);

  return ref;
}
