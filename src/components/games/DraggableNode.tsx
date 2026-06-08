"use client";

import { Card } from "@/components/ui/card";
import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { cn } from "@/lib/utils";

interface DraggableNodeProps {
  id: string;
  text: string;
  onClick?: () => void;
  isSelected?: boolean;
}

export function DraggableNode({ id, text, onClick, isSelected }: DraggableNodeProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: id,
    data: { text },
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      onClick={(e) => {
        if (onClick) {
          e.preventDefault();
          e.stopPropagation();
          onClick();
        }
      }}
      className={cn(
        "cursor-grab border-2 bg-background p-3 shadow-sm transition-all",
        isSelected ? "border-primary ring-2 ring-primary/20 scale-[1.02]" : "border-gray-200 hover:border-primary/50",
        isDragging && "z-50 cursor-grabbing"
      )}
    >
      <p className="font-medium text-sm lg:text-base">{text}</p>
    </Card>
  );
}
