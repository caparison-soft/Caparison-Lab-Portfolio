"use client";
// Client component: drag-and-drop reordering with dnd-kit, keyboard included.

import { DndContext, KeyboardSensor, PointerSensor, closestCenter, useSensor, useSensors, type DragEndEvent } from "@dnd-kit/core";
import { SortableContext, arrayMove, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useId, type ReactNode } from "react";
import { cx } from "@/lib/cx";

export type HandleProps = { ref: (el: HTMLElement | null) => void; attributes: Record<string, unknown>; listeners: Record<string, unknown> | undefined };

type SortableListProps<T extends { id: string }> = {
  items: T[];
  onReorder: (ids: string[]) => void;
  renderItem: (item: T, handle: ReactNode, index: number) => ReactNode;
  disabled?: boolean;
  className?: string;
  itemClassName?: string;
};

function Row<T extends { id: string }>({ item, index, renderItem, disabled, className }: { item: T; index: number; renderItem: SortableListProps<T>["renderItem"]; disabled?: boolean; className?: string }) {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } = useSortable({ id: item.id, disabled });
  const style = { transform: CSS.Transform.toString(transform), transition };
  const handle = (
    <button
      type="button"
      ref={setActivatorNodeRef}
      {...attributes}
      {...listeners}
      disabled={disabled}
      aria-label={`Reorder item ${index + 1}`}
      className={cx("inline-flex items-center justify-center w-3 h-4 rounded-sm text-ash hover:text-ink cursor-grab active:cursor-grabbing touch-none", disabled && "opacity-30 cursor-default")}
    >
      <svg width="12" height="16" viewBox="0 0 12 16" fill="currentColor" aria-hidden="true">
        <circle cx="3" cy="3" r="1.4" /><circle cx="9" cy="3" r="1.4" /><circle cx="3" cy="8" r="1.4" /><circle cx="9" cy="8" r="1.4" /><circle cx="3" cy="13" r="1.4" /><circle cx="9" cy="13" r="1.4" />
      </svg>
    </button>
  );
  return (
    <li ref={setNodeRef} style={style} className={cx(className, isDragging && "bg-paper relative z-10")}>
      {renderItem(item, handle, index)}
    </li>
  );
}

export function SortableList<T extends { id: string }>({ items, onReorder, renderItem, disabled, className, itemClassName }: SortableListProps<T>) {
  // Stable id so dnd-kit's aria-describedby matches between server and client.
  const id = useId();
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }), useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }));
  function onDragEnd(e: DragEndEvent) {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const from = items.findIndex((i) => i.id === active.id);
    const to = items.findIndex((i) => i.id === over.id);
    onReorder(arrayMove(items, from, to).map((i) => i.id));
  }
  return (
    <DndContext id={id} sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
      <SortableContext items={items.map((i) => i.id)} strategy={verticalListSortingStrategy}>
        <ol className={cx("list-none m-0 p-0", className)}>
          {items.map((item, i) => <Row key={item.id} item={item} index={i} renderItem={renderItem} disabled={disabled} className={itemClassName} />)}
        </ol>
      </SortableContext>
    </DndContext>
  );
}
