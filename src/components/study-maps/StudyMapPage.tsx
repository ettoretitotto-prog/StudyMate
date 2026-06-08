"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Plus, Eye, Edit3, Menu, Home, X } from "lucide-react";
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
  const [activeTab, setActiveTab] = useState<"editor" | "preview">("editor");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
        setIsMobileMenuOpen(false);
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

  const SidebarContent = (
    <div className="flex h-full flex-col bg-muted/30">
      <div className="space-y-3 border-b p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Le mie mappe</h2>
          <Link href="/dashboard" passHref>
            <Button variant="outline" size="sm">
              <Home className="h-4 w-4 mr-2" />
              Home
            </Button>
          </Link>
        </div>
        <Button onClick={handleCreateMap} disabled={isLoading} className="w-full">
          <Plus className="mr-2 h-4 w-4" aria-hidden="true" />
          Nuova Mappa
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <MapList
          maps={maps}
          selectedMapId={selectedMapId || undefined}
          onSelectMap={(id) => {
            setSelectedMapId(id);
            setIsMobileMenuOpen(false);
          }}
          onDeleteMap={handleDeleteMap}
          isLoading={isLoading}
        />
      </div>
    </div>
  );

  return (
    <div className="flex h-screen flex-col overflow-hidden lg:grid lg:grid-cols-[300px_1fr_1fr] lg:gap-0">
      {/* Sidebar for Desktop */}
      <div className="hidden border-r lg:block">
        {SidebarContent}
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div className="fixed inset-0 bg-black/50" onClick={() => setIsMobileMenuOpen(false)} />
          <div className="relative flex w-80 flex-col bg-background shadow-xl">
            <div className="absolute right-4 top-4">
              <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(false)}>
                <X className="h-5 w-5" />
              </Button>
            </div>
            {SidebarContent}
          </div>
        </div>
      )}

      {/* Mobile Header */}
      <div className="flex items-center justify-between border-b p-3 lg:hidden">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(true)}>
            <Menu className="h-5 w-5" />
          </Button>
          <span className="font-semibold">Study Maps</span>
        </div>
        <div className="text-xs text-muted-foreground">
          {isSaving ? "Salvataggio..." : "Salvato"}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden lg:col-span-2 lg:flex-row">
        {/* Mobile Tabs Logic (Manual Implementation to avoid missing components) */}
        <div className="flex flex-1 flex-col overflow-hidden lg:hidden">
          <div className="flex-1 overflow-hidden">
            {activeTab === "editor" ? (
              <div className="flex h-full flex-col">
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
              </div>
            ) : (
              <div className="flex h-full flex-col">
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
            )}
          </div>
          
          {/* Mobile Bottom Navigation */}
          <div className="grid w-full grid-cols-2 border-t bg-background">
            <button 
              onClick={() => setActiveTab("editor")}
              className={`flex h-14 items-center justify-center gap-2 text-sm font-medium transition-colors ${activeTab === "editor" ? "bg-muted text-primary" : "text-muted-foreground hover:bg-muted/50"}`}
            >
              <Edit3 className="h-4 w-4" /> Editor
            </button>
            <button 
              onClick={() => setActiveTab("preview")}
              className={`flex h-14 items-center justify-center gap-2 text-sm font-medium transition-colors ${activeTab === "preview" ? "bg-muted text-primary" : "text-muted-foreground hover:bg-muted/50"}`}
            >
              <Eye className="h-4 w-4" /> Anteprima
            </button>
          </div>
        </div>

        {/* Desktop Panels */}
        <div className="hidden flex-1 border-r lg:flex lg:flex-col">
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

        <div className="hidden flex-1 lg:flex lg:flex-col overflow-hidden">
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
    </div>
  );
}
