"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import type { StudyMapRow } from "@/types/database";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { MarkmapEditor } from "./MarkmapEditor";
import { MarkmapPreview } from "./MarkmapPreview";
import { MapList } from "./MapList";

interface StudyMapPageProps {
  initialMaps: StudyMapRow[];
}

export function StudyMapPage({ initialMaps }: StudyMapPageProps) {
  const [maps, setMaps] = useState<StudyMapRow[]>(initialMaps);
  const [selectedMapId, setSelectedMapId] = useState<string | null>(initialMaps[0]?.id || null);
  const [content, setContent] = useState("");
  const [title, setTitle] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveTimeout, setSaveTimeout] = useState<NodeJS.Timeout | null>(null);

  // Get current map
  const currentMap = useMemo(() => maps.find((m) => m.id === selectedMapId), [maps, selectedMapId]);

  // Load map content when selected map changes
  useEffect(() => {
    if (currentMap) {
      setTitle(currentMap.title);
      setContent(currentMap.content);
    }
  }, [currentMap]);

  // Auto-save with debounce
  useEffect(() => {
    if (saveTimeout) clearTimeout(saveTimeout);

    if (!selectedMapId || !isSaving) return;

    const timeout = setTimeout(async () => {
      try {
        const response = await fetch(`/api/study-maps/${selectedMapId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title, content })
        });

        if (response.ok) {
          const updatedMap = await response.json();
          setMaps((prev) => prev.map((m) => (m.id === selectedMapId ? updatedMap : m)));
        }
      } catch (error) {
        console.error("Error saving map:", error);
      }
    }, 2000);

    setSaveTimeout(timeout);

    return () => clearTimeout(timeout);
  }, [content, title, selectedMapId, isSaving]);

  const handleCreateMap = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/study-maps", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: "Nuova Mappa",
          content: "- Argomento principale\n  - Sottotema\n  - Sottotema"
        })
      });

      if (response.ok) {
        const newMap = await response.json();
        setMaps((prev) => [newMap, ...prev]);
        setSelectedMapId(newMap.id);
      }
    } catch (error) {
      console.error("Error creating map:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteMap = async (mapId: string) => {
    try {
      const response = await fetch(`/api/study-maps/${mapId}`, {
        method: "DELETE"
      });

      if (response.ok) {
        setMaps((prev) => prev.filter((m) => m.id !== mapId));
        if (selectedMapId === mapId) {
          setSelectedMapId(maps[0]?.id || null);
        }
      }
    } catch (error) {
      console.error("Error deleting map:", error);
    }
  };

  const handleTitleChange = (newTitle: string) => {
    setTitle(newTitle);
    setIsSaving(true);
  };

  const handleContentChange = (newContent: string) => {
    setContent(newContent);
    setIsSaving(true);
  };

  return (
    <div className="grid h-screen grid-cols-[300px_1fr_1fr] gap-0 overflow-hidden">
      {/* Sidebar */}
      <div className="flex flex-col border-r bg-muted/30">
        <div className="space-y-3 border-b p-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Le mie mappe</h2>
            <Link href="/dashboard" passHref>
              <Button variant="outline" size="sm">
                Home
              </Button>
            </Link>
          </div>
          <Button onClick={handleCreateMap} disabled={isLoading} className="w-full">
            <Plus className="h-4 w-4 mr-2" aria-hidden="true" />
            Nuova Mappa
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <MapList
            maps={maps}
            selectedMapId={selectedMapId || undefined}
            onSelectMap={setSelectedMapId}
            onDeleteMap={handleDeleteMap}
            isLoading={isLoading}
          />
        </div>
      </div>

      {/* Editor Panel */}
      <div className="flex flex-col border-r">
        <div className="border-b p-3">
          <Input
            value={title}
            onChange={(e) => handleTitleChange(e.target.value)}
            placeholder="Titolo della mappa..."
            className="text-sm font-medium"
          />
        </div>
        <div className="flex-1 overflow-hidden">
          <MarkmapEditor
            content={content}
            onChange={handleContentChange}
            placeholder="# Argomento principale&#10;- Punto chiave 1&#10;  - Dettaglio 1.1&#10;  - Dettaglio 1.2&#10;- Punto chiave 2"
          />
        </div>
        <div className="border-t bg-muted/50 px-3 py-2 text-xs text-muted-foreground">
          {isSaving ? "Salvataggio..." : "Salvato"}
        </div>
      </div>

      {/* Preview Panel */}
      <div className="flex flex-col overflow-hidden">
        <div className="border-b px-4 py-3">
          <h3 className="text-sm font-medium">Anteprima</h3>
        </div>
        <div className="flex-1 overflow-hidden">
          {selectedMapId ? (
            <MarkmapPreview content={content} title={title} />
          ) : (
            <Card className="m-4 flex items-center justify-center p-8 text-center text-muted-foreground">
              Crea una nuova mappa per visualizzare l'anteprima
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
