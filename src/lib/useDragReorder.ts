import { useState } from 'react';

/** Returns a copy of `list` with the item at `from` moved to `to`. */
export function moveItem<T>(list: T[], from: number, to: number): T[] {
  if (to < 0 || to >= list.length || from === to) return list;
  const next = [...list];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
}

/**
 * Native drag-and-drop reordering (same approach as the Media Ads sort screen): items swap as the
 * dragged one passes over them. Pair it with up/down buttons — HTML drag-and-drop has no keyboard
 * or touch support.
 */
export function useDragReorder<T extends { id: string }>(items: T[], onReorder: (next: T[]) => void, enabled = true) {
  const [dragId, setDragId] = useState<string | null>(null);

  const itemProps = (item: T) =>
    enabled
      ? {
          draggable: true,
          onDragStart: (e: React.DragEvent) => {
            setDragId(item.id);
            e.dataTransfer.effectAllowed = 'move';
            // Firefox won't start a drag without data.
            e.dataTransfer.setData('text/plain', item.id);
          },
          onDragOver: (e: React.DragEvent) => {
            e.preventDefault();
            if (!dragId || dragId === item.id) return;
            const from = items.findIndex((x) => x.id === dragId);
            const to = items.findIndex((x) => x.id === item.id);
            if (from >= 0 && to >= 0) onReorder(moveItem(items, from, to));
          },
          onDrop: (e: React.DragEvent) => e.preventDefault(),
          onDragEnd: () => setDragId(null),
        }
      : {};

  return { dragId, itemProps };
}
