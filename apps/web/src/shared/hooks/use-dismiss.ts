import { useEffect, type RefObject } from 'react';

/**
 * Close a dropdown/popover when the user clicks outside or presses Escape.
 *
 * Attaches `mousedown` and `keydown` listeners only while `open` is true,
 * and cleans them up automatically.
 */
export function useDismiss(
  ref: RefObject<HTMLElement | null>,
  open: boolean,
  onClose: () => void,
): void {
  useEffect(() => {
    if (!open) return;

    function handleMouseDown(e: MouseEvent): void {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose();
      }
    }

    function handleKeyDown(e: KeyboardEvent): void {
      if (e.key === 'Escape') onClose();
    }

    document.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [ref, open, onClose]);
}
