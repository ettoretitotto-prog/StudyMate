"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import type { StudyMapRow } from "@/types/database";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface MapListProps {
  maps: StudyMapRow[];
  selectedMapId?: string;
  onSelectMap: (mapId: string) => void;
  onDeleteMap: (mapId: string) => Promise<void>;
  isLoading?: boolean;
}

export function MapList({ maps, selectedMapId, onSelectMap, onDeleteMap, isLoading }: MapListProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (mapId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm("Sei sicuro di voler eliminare questa mappa?")) return;

    setDeletingId(mapId);
    try {
      await onDeleteMap(mapId);
    } finally {
      setDeletingId(null);
    }
  };

  if (maps.length === 0) {
    return (
      <Card className="border-dashed p-4 text-center text-sm text-muted-foreground">
        Nessuna mappa creata. Crea una nuova mappa per iniziare.
      </Card>
    );
  }

  return (
    <div className="space-y-2">
      {maps.map((map) => (
        <Card
          key={map.id}
          onClick={() => onSelectMap(map.id)}
          className={`flex items-center justify-between p-3 cursor-pointer transition-colors ${
            selectedMapId === map.id ? "bg-primary text-primary-foreground" : "hover:bg-accent"
          }`}
        >
          <div className="flex-1 min-w-0">
            <p className="font-medium truncate">{map.title}</p>
            <p className="text-xs opacity-75">
              {new Date(map.created_at).toLocaleDateString("it-IT", {
                month: "short",
                day: "numeric"
              })}
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => handleDelete(map.id, e)}
            disabled={deletingId === map.id || isLoading}
            className="ml-2 h-8 w-8 p-0"
          >
            <Trash2 className="h-4 w-4" aria-hidden="true" />
          </Button>
        </Card>
      ))}
    </div>
  );
}
