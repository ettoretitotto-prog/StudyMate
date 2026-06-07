"use client";

import { Card } from "@/components/ui/card";
import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";

interface DraggableNodeProps {
  id: string;
  text: string;
}

export function DraggableNode({ id, text }: DraggableNodeProps) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: id,
    data: { text },
  });

  const style = {
    transform: CSS.Translate.toString(transform),
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className="cursor-grab border-gray-300 bg-background p-3 shadow-sm hover:border-primary"
    >
      <p className="font-medium">{text}</p>
    </Card>
  );
}
