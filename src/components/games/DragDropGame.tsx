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
import { Trophy, Clock, Target, RotateCcw } from "lucide-react";
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
  const [gameResult, setGameResult] = useState<{
    score: number;
    xpAwarded: number;
    correctPlacements: number;
    totalNodes: number;
  } | null>(null);

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
    // Nel nuovo sistema, usiamo expectedNodeId per validare se il nodo trascinato è quello giusto per quello slot
    const dropZoneData = over.data.current as { 
      parentId: string | null; 
      level: number;
      expectedNodeId: string;
    };

    if (!dropZoneData) return;

    // Se l'utente trascina il nodo nello slot corretto
    if (nodeId === dropZoneData.expectedNodeId) {
      // Rimuovi il nodo dai disponibili
      setAvailableNodes((prev) => prev.filter((n) => n.id !== nodeId));

      // Aggiungi il nodo all'albero dell'utente
      setUserTree((prev) => [
        ...prev,
        {
          id: nodeId,
          parentId: dropZoneData.parentId,
          level: dropZoneData.level,
        },
      ]);
    } else {
      // Opzionale: feedback visivo di errore (vibrazione o suono se possibile, qui facciamo nulla per ora)
      console.log("Nodo errato per questo slot!");
    }
  };

  const handleRemoveNode = useCallback((nodeId: string) => {
    // Rimuovi il nodo dall'albero dell'utente
    setUserTree((prev) => prev.filter((n) => n.id !== nodeId));

    // Aggiungi il nodo di nuovo ai disponibili
    const node = gameData.shuffledNodes.find((n) => n.id === nodeId);
    if (node) {
      setAvailableNodes((prev) => [...prev, node]);
    }
  }, [gameData.shuffledNodes]);

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

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex h-screen flex-col">
        {/* Header con statistiche */}
        <div className="border-b bg-muted/30 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/dashboard" passHref>
                <Button variant="outline" size="sm">
                  Home
                </Button>
              </Link>
              <Link href="/study-maps" passHref>
                <Button variant="outline" size="sm">
                  Mappe
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold">{gameData.mapTitle}</h1>
                <p className="text-sm text-muted-foreground">
                  Ricostruisci la gerarchia della mappa
                </p>
              </div>
            </div>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-muted-foreground" />
                <span className="text-lg font-mono font-semibold">
                  {formatTime(timeSeconds)}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Target className="h-5 w-5 text-muted-foreground" />
                <span className="text-lg font-semibold">
                  {userTree.length}/{gameData.shuffledNodes.length}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Area di gioco */}
        <div className="flex flex-1 overflow-hidden">
          {/* Pannello sinistro: nodi disponibili */}
          <div className="w-80 border-r bg-muted/20 p-4">
            <h2 className="mb-4 text-lg font-semibold">Nodi Disponibili</h2>
            <div className="space-y-2">
              {availableNodes.length === 0 ? (
                <Card className="p-4 text-center text-sm text-muted-foreground">
                  Tutti i nodi sono stati posizionati!
                </Card>
              ) : (
                availableNodes.map((node) => (
                  <DraggableNode key={node.id} id={node.id} text={node.text} />
                ))
              )}
            </div>
          </div>

          {/* Pannello centrale: area di costruzione */}
          <div className="flex-1 overflow-auto p-6">
            <DropZone
              userTree={userTree}
              gameData={gameData}
              onRemoveNode={handleRemoveNode}
              availableNodes={availableNodes}
            />
          </div>
        </div>

        {/* Footer con azioni */}
        <div className="border-t bg-muted/30 px-6 py-4">
          <div className="flex items-center justify-between">
            <Button variant="outline" onClick={handleRestart}>
              <RotateCcw className="mr-2 h-4 w-4" />
              Ricomincia
            </Button>
            <Button
              onClick={handleVerify}
              disabled={userTree.length !== gameData.shuffledNodes.length}
              size="lg"
            >
              <Trophy className="mr-2 h-5 w-5" />
              Verifica Risultato
            </Button>
          </div>
        </div>
      </div>

      <DragOverlay>
        {activeNode ? (
          <Card className="cursor-grabbing border-2 border-primary bg-background p-3 shadow-lg">
            <p className="font-medium">{activeNode.text}</p>
          </Card>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
