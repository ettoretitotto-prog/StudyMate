"use client";

import { useState, useEffect, useCallback } from "react";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import Link from "next/link";
import { Trophy, Clock, Target, RotateCcw, Layout, Menu, Home, X } from "lucide-react";
import type { DragDropGameData, UserTreeNode } from "@/lib/services/games";
import { validateNodePlacement, calculateGameScore } from "@/lib/services/games";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { DraggableNode } from "./DraggableNode";
import { DropZone } from "./DropZone";
import { GameComplete } from "./GameComplete";

interface DragDropGameProps {
  gameData: DragDropGameData;
  onComplete: (score: number, timeSeconds: number, xpAwarded: number) => void;
  onRestart: () => void;
}

export function DragDropGame({ gameData, onComplete, onRestart }: DragDropGameProps) {
  const [userTree, setUserTree] = useState<UserTreeNode[]>([]);
  const [availableNodes, setAvailableNodes] = useState(gameData.shuffledNodes);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [timeSeconds, setTimeSeconds] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [activeMobileTab, setActiveMobileTab] = useState<"nodes" | "dropzone">("nodes");
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [gameResult, setGameResult] = useState<{
    score: number;
    xpAwarded: number;
    correctPlacements: number;
    totalNodes: number;
  } | null>(null);

  // Solo PointerSensor per evitare problemi con TouchSensor e scroll su computer/mobile
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  // Timer
  useEffect(() => {
    if (isComplete) return;

    const interval = setInterval(() => {
      setTimeSeconds((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [isComplete]);

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const nodeId = active.id as string;
    const dropZoneData = over.data.current as { 
      parentId: string | null; 
      level: number;
      expectedNodeId: string;
    };

    if (!dropZoneData) return;

    if (nodeId === dropZoneData.expectedNodeId) {
      setAvailableNodes((prev) => prev.filter((n) => n.id !== nodeId));
      setUserTree((prev) => [
        ...prev,
        {
          id: nodeId,
          parentId: dropZoneData.parentId,
          level: dropZoneData.level,
        },
      ]);
    }
  };

  const handleRemoveNode = useCallback((nodeId: string) => {
    setUserTree((prev) => prev.filter((n) => n.id !== nodeId));
    const node = gameData.shuffledNodes.find((n) => n.id === nodeId);
    if (node) {
      setAvailableNodes((prev) => [...prev, node]);
    }
    if (selectedNodeId === nodeId) {
      setSelectedNodeId(null);
    }
  }, [gameData.shuffledNodes, selectedNodeId]);

  const handleNodeClick = (nodeId: string) => {
    setSelectedNodeId((prev) => (prev === nodeId ? null : nodeId));
  };

  const handleSlotClick = (slotNodeId: string, expectedNodeId: string, parentId: string | null, level: number) => {
    if (!selectedNodeId) return;

    // Se il nodo selezionato corrisponde a quello previsto per questo slot
    if (selectedNodeId === expectedNodeId) {
      setAvailableNodes((prev) => prev.filter((n) => n.id !== selectedNodeId));
      setUserTree((prev) => [
        ...prev,
        {
          id: selectedNodeId,
          parentId: parentId,
          level: level,
        },
      ]);
      setSelectedNodeId(null);
    } else {
      console.log("Nodo errato per questo slot!");
      // Deseleziona per feedback visivo di errore
      setSelectedNodeId(null);
    }
  };

  const handleVerify = () => {
    const validation = validateNodePlacement(userTree, gameData);
    const { score, xpAwarded } = calculateGameScore(
      validation.correctPlacements,
      validation.totalNodes,
      timeSeconds
    );

    setGameResult({
      score,
      xpAwarded,
      correctPlacements: validation.correctPlacements,
      totalNodes: validation.totalNodes,
    });
    setIsComplete(true);
    onComplete(score, timeSeconds, xpAwarded);
  };

  const handleRestart = () => {
    setUserTree([]);
    setAvailableNodes(gameData.shuffledNodes);
    setTimeSeconds(0);
    setIsComplete(false);
    setGameResult(null);
    setSelectedNodeId(null);
    onRestart();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const activeNode = availableNodes.find((n) => n.id === activeId);

  if (isComplete && gameResult) {
    return (
      <GameComplete
        score={gameResult.score}
        xpAwarded={gameResult.xpAwarded}
        timeSeconds={timeSeconds}
        correctPlacements={gameResult.correctPlacements}
        totalNodes={gameResult.totalNodes}
        onRestart={handleRestart}
      />
    );
  }

  const Header = (
    <div className="border-b bg-muted/30 px-4 py-3 lg:px-6 lg:py-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Link href="/dashboard" passHref>
              <Button variant="outline" size="sm" className="h-8 w-8 p-0 lg:h-9 lg:w-auto lg:px-3">
                <Home className="h-4 w-4" />
                <span className="ml-2 hidden lg:inline">Home</span>
              </Button>
            </Link>
            <Link href="/study-maps" passHref>
              <Button variant="outline" size="sm" className="h-8 w-8 p-0 lg:h-9 lg:w-auto lg:px-3">
                <Layout className="h-4 w-4" />
                <span className="ml-2 hidden lg:inline">Mappe</span>
              </Button>
            </Link>
          </div>
          <div className="text-right lg:text-left">
            <h1 className="text-lg font-bold leading-tight lg:text-2xl">{gameData.mapTitle}</h1>
            <p className="hidden text-sm text-muted-foreground lg:block">
              Ricostruisci la gerarchia della mappa
            </p>
          </div>
        </div>
        
        <div className="flex items-center justify-between border-t pt-3 lg:border-t-0 lg:pt-0 lg:gap-6">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground lg:h-5 lg:w-5" />
            <span className="text-base font-mono font-semibold lg:text-lg">
              {formatTime(timeSeconds)}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Target className="h-4 w-4 text-muted-foreground lg:h-5 lg:w-5" />
            <span className="text-base font-semibold lg:text-lg">
              {userTree.length}/{gameData.shuffledNodes.length}
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex h-screen flex-col overflow-hidden">
        {Header}

        {/* Area di gioco Mobile: Tabbed View */}
        <div className="flex flex-1 flex-col overflow-hidden lg:hidden">
          <div className="flex-1 overflow-auto p-4">
            {activeMobileTab === "nodes" ? (
              <div className="space-y-3">
                <h2 className="text-lg font-semibold">Nodi Disponibili</h2>
                <p className="text-xs text-muted-foreground">
                  Clicca su un nodo per selezionarlo, poi vai alla scheda "Struttura" e tocca lo slot desiderato.
                </p>
                <div className="grid grid-cols-1 gap-2">
                  {availableNodes.length === 0 ? (
                    <Card className="p-8 text-center text-muted-foreground">
                      Tutti i nodi posizionati! Passa alla struttura per verificare.
                    </Card>
                  ) : (
                    availableNodes.map((node) => (
                      <DraggableNode 
                        key={node.id} 
                        id={node.id} 
                        text={node.text} 
                        onClick={() => handleNodeClick(node.id)}
                        isSelected={selectedNodeId === node.id}
                      />
                    ))
                  )}
                </div>
              </div>
            ) : (
              <DropZone
                userTree={userTree}
                gameData={gameData}
                onRemoveNode={handleRemoveNode}
                availableNodes={availableNodes}
                selectedNodeId={selectedNodeId}
                onSlotClick={handleSlotClick}
              />
            )}
          </div>

          <div className="grid w-full grid-cols-2 border-t bg-background">
            <button
              onClick={() => setActiveMobileTab("nodes")}
              className={`flex h-16 items-center justify-center gap-2 font-medium transition-colors ${activeMobileTab === "nodes" ? "bg-muted text-primary" : "text-muted-foreground"}`}
            >
              <Menu className="h-5 w-5" /> Nodi ({availableNodes.length})
            </button>
            <button
              onClick={() => setActiveMobileTab("dropzone")}
              className={`flex h-16 items-center justify-center gap-2 font-medium transition-colors ${activeMobileTab === "dropzone" ? "bg-muted text-primary" : "text-muted-foreground"}`}
            >
              <Layout className="h-5 w-5" /> Struttura {selectedNodeId && <span className="h-2 w-2 rounded-full bg-primary animate-ping" />}
            </button>
          </div>
        </div>

        {/* Area di gioco Desktop: Two Panels (With both Drag & Drop AND Click-to-Select supported) */}
        <div className="hidden flex-1 overflow-hidden lg:flex">
          <div className="w-80 border-r bg-muted/20 p-4 overflow-y-auto">
            <h2 className="mb-2 text-lg font-semibold">Nodi Disponibili</h2>
            <p className="mb-4 text-xs text-muted-foreground">
              Puoi trascinare i nodi oppure cliccare su un nodo e poi sullo slot desiderato.
            </p>
            <div className="space-y-2">
              {availableNodes.length === 0 ? (
                <Card className="p-4 text-center text-sm text-muted-foreground">
                  Tutti i nodi sono stati posizionati!
                </Card>
              ) : (
                availableNodes.map((node) => (
                  <DraggableNode 
                    key={node.id} 
                    id={node.id} 
                    text={node.text} 
                    onClick={() => handleNodeClick(node.id)}
                    isSelected={selectedNodeId === node.id}
                  />
                ))
              )}
            </div>
          </div>

          <div className="flex-1 overflow-auto p-6">
            <DropZone
              userTree={userTree}
              gameData={gameData}
              onRemoveNode={handleRemoveNode}
              availableNodes={availableNodes}
              selectedNodeId={selectedNodeId}
              onSlotClick={handleSlotClick}
            />
          </div>
        </div>

        {/* Footer con azioni */}
        <div className="border-t bg-muted/30 px-4 py-3 lg:px-6 lg:py-4">
          <div className="flex items-center justify-between gap-4">
            <Button variant="outline" size="sm" onClick={handleRestart} className="lg:size-default">
              <RotateCcw className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Ricomincia</span>
              <span className="sm:hidden">Reset</span>
            </Button>
            <Button
              onClick={handleVerify}
              disabled={userTree.length !== gameData.shuffledNodes.length}
              className="flex-1 lg:flex-none"
              size="lg"
            >
              <Trophy className="mr-2 h-5 w-5" />
              Verifica
            </Button>
          </div>
        </div>
      </div>

      <DragOverlay dropAnimation={null}>
        {activeNode ? (
          <Card className="border-2 border-primary bg-background p-3 shadow-lg max-w-[280px]">
            <p className="font-medium text-sm">{activeNode.text}</p>
          </Card>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
