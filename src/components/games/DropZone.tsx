"use client";

import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { MinusCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { DragDropGameData, UserTreeNode, ShuffledNode } from "@/lib/services/games";

interface DropZoneProps {
  userTree: UserTreeNode[];
  gameData: DragDropGameData;
  onRemoveNode: (nodeId: string) => void;
  availableNodes: ShuffledNode[];
}

function NodeSlot({
  nodeId,
  correctParentId,
  level,
  text,
  userPlacedNodeId,
  onRemove,
  allShuffledNodes,
}: {
  nodeId: string;
  correctParentId: string | null;
  level: number;
  text: string;
  userPlacedNodeId: string | null;
  onRemove: (id: string) => void;
  allShuffledNodes: ShuffledNode[];
}) {
  // Il droppable ID è legato alla posizione strutturale fissa (il nodeId originale)
  const { setNodeRef, isOver } = useDroppable({
    id: `slot-${nodeId}`,
    data: { 
      parentId: correctParentId, 
      level: level,
      expectedNodeId: nodeId // Informazione extra per debug/validazione se servisse
    },
  });

  const userNode = userPlacedNodeId 
    ? allShuffledNodes.find(n => n.id === userPlacedNodeId) 
    : null;

  return (
    <div className="space-y-2">
      <div className="relative flex items-center gap-2 group">
        {/* Linea di connessione visiva */}
        {level > 0 && (
          <div 
            className="absolute border-l-2 border-b-2 border-primary/20 h-10 w-6 -left-6 -top-5 rounded-bl-md"
          />
        )}
        
        <div
          ref={setNodeRef}
          style={{ marginLeft: `${level * 40}px` }}
          className={cn(
            "min-w-[180px] max-w-[400px] min-h-[50px] rounded-lg border-2 p-3 text-sm font-semibold transition-all flex items-center justify-between",
            !userNode && "border-dashed border-muted-foreground/30 bg-muted/20 text-transparent",
            userNode && "border-solid shadow-md",
            userNode && level === 0 && "bg-primary text-primary-foreground border-primary shadow-primary/20",
            userNode && level === 1 && "bg-secondary text-secondary-foreground border-secondary",
            userNode && level > 1 && "bg-background border-muted-foreground/30",
            isOver && !userNode && "bg-primary/10 border-primary border-solid scale-[1.02]"
          )}
        >
          {userNode ? (
            <>
              <span>{userNode.text}</span>
              <button
                onClick={() => onRemove(userNode.id)}
                className="ml-2 rounded-full bg-destructive text-destructive-foreground opacity-0 group-hover:opacity-100 transition-opacity p-0.5 shadow-sm"
                aria-label="Rimuovi"
              >
                <MinusCircle className="h-4 w-4" />
              </button>
            </>
          ) : (
            <span className="text-muted-foreground/50 text-xs italic">Trascina qui...</span>
          )}
        </div>
      </div>
    </div>
  );
}

export function DropZone({ userTree, gameData, onRemoveNode }: DropZoneProps) {
  // Renderizziamo la struttura FISSA della mappa originale, ma con i contenuti vuoti (Slot)
  const renderStructure = (shuffledNodes: ShuffledNode[], parentId: string | null = null, level = 0) => {
    // Troviamo i nodi che dovrebbero stare qui in base alla struttura corretta
    const children = shuffledNodes.filter((n) => n.correctParentId === parentId);
    
    // Ordiniamo per mantenere l'aspetto originale della mappa
    children.sort((a, b) => {
       const idxA = gameData.correctTree.relations.findIndex(r => r.to === a.id);
       const idxB = gameData.correctTree.relations.findIndex(r => r.to === b.id);
       return idxA - idxB;
    });

    return children.map((node) => {
      // Controlliamo se l'utente ha inserito qualcosa in QUESTO specifico slot strutturale
      // In questo nuovo approccio, lo slot è identificato dall'ID del nodo che DEVE andarci
      const userAssignment = userTree.find(ut => ut.parentId === node.correctParentId && ut.id === node.id);
      
      // Nota: nel nuovo gioco l'utente deve indovinare QUALE nodo va in QUALE slot.
      // Per semplicità, lo slot è legato all'ID del nodo corretto.
      
      return (
        <div key={node.id} className="space-y-2">
          <NodeSlot
            nodeId={node.id}
            correctParentId={node.correctParentId}
            level={node.correctLevel}
            text={node.text}
            userPlacedNodeId={userAssignment ? userAssignment.id : null}
            onRemove={onRemoveNode}
            allShuffledNodes={gameData.shuffledNodes}
          />
          {renderStructure(shuffledNodes, node.id, level + 1)}
        </div>
      );
    });
  };

  return (
    <SortableContext items={userTree.map((node) => node.id)} strategy={verticalListSortingStrategy}>
      <div className="min-h-full space-y-6 p-8 border rounded-2xl bg-card shadow-inner max-w-4xl mx-auto">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-foreground mb-1">Completa la Struttura</h2>
          <p className="text-sm text-muted-foreground">Trascina i concetti negli slot corretti per ricostruire la logica della mappa.</p>
        </div>
        
        <div className="flex flex-col gap-4">
          {renderStructure(gameData.shuffledNodes)}
        </div>
      </div>
    </SortableContext>
  );
}
