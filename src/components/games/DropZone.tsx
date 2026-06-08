"use client";

import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { MinusCircle, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { DragDropGameData, UserTreeNode, ShuffledNode } from "@/lib/services/games";

interface DropZoneProps {
  userTree: UserTreeNode[];
  gameData: DragDropGameData;
  onRemoveNode: (nodeId: string) => void;
  availableNodes: ShuffledNode[];
  selectedNodeId?: string | null;
  onSlotClick?: (slotNodeId: string, expectedNodeId: string, parentId: string | null, level: number) => void;
}

function NodeSlot({
  nodeId,
  correctParentId,
  level,
  text,
  userPlacedNodeId,
  onRemove,
  allShuffledNodes,
  selectedNodeId,
  onSlotClick,
}: {
  nodeId: string;
  correctParentId: string | null;
  level: number;
  text: string;
  userPlacedNodeId: string | null;
  onRemove: (id: string) => void;
  allShuffledNodes: ShuffledNode[];
  selectedNodeId?: string | null;
  onSlotClick?: (slotNodeId: string, expectedNodeId: string, parentId: string | null, level: number) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: `slot-${nodeId}`,
    data: { 
      parentId: correctParentId, 
      level: level,
      expectedNodeId: nodeId 
    },
  });

  const userNode = userPlacedNodeId 
    ? allShuffledNodes.find(n => n.id === userPlacedNodeId) 
    : null;

  return (
    <div className="space-y-2">
      <div className="relative flex items-center gap-2 group">
        {/* Connection line */}
        {level > 0 && (
          <div 
            className="absolute border-l-2 border-b-2 border-primary/20 h-8 w-4 -left-4 -top-4 rounded-bl-md lg:h-10 lg:w-6 lg:-left-6 lg:-top-5"
          />
        )}
        
        <div
          ref={setNodeRef}
          style={{ marginLeft: `${level * 20}px` }}
          onClick={() => {
            if (onSlotClick && !userNode) {
              onSlotClick(nodeId, nodeId, correctParentId, level);
            }
          }}
          className={cn(
            "min-w-[140px] max-w-[300px] min-h-[44px] lg:min-w-[180px] lg:max-w-[400px] lg:min-h-[50px] rounded-lg border-2 p-2 lg:p-3 text-xs lg:text-sm font-semibold transition-all flex items-center justify-between",
            !userNode && "border-dashed border-muted-foreground/30 bg-muted/10 text-transparent cursor-pointer",
            !userNode && selectedNodeId && "hover:bg-primary/5 hover:border-primary/50 animate-pulse",
            userNode && "border-solid shadow-md",
            userNode && level === 0 && "bg-primary text-primary-foreground border-primary shadow-primary/20",
            userNode && level === 1 && "bg-secondary text-secondary-foreground border-secondary",
            userNode && level > 1 && "bg-background border-muted-foreground/30",
            isOver && !userNode && "bg-primary/10 border-primary border-solid scale-[1.02]"
          )}
        >
          {userNode ? (
            <>
              <span className="truncate pr-2">{userNode.text}</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onRemove(userNode.id);
                }}
                className="flex-shrink-0 rounded-full bg-destructive text-destructive-foreground p-1 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity shadow-sm"
                aria-label="Rimuovi"
              >
                <MinusCircle className="h-3 w-3 lg:h-4 lg:w-4" />
              </button>
            </>
          ) : (
            <span className={cn(
              "text-xs italic truncate",
              selectedNodeId ? "text-primary font-medium" : "text-muted-foreground/50"
            )}>
              {selectedNodeId ? "Seleziona questo slot..." : "Trascina qui..."}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export function DropZone({ 
  userTree, 
  gameData, 
  onRemoveNode, 
  selectedNodeId, 
  onSlotClick 
}: DropZoneProps) {
  const renderStructure = (shuffledNodes: ShuffledNode[], parentId: string | null = null, level = 0) => {
    const children = shuffledNodes.filter((n) => n.correctParentId === parentId);
    
    children.sort((a, b) => {
       const idxA = gameData.correctTree.relations.findIndex(r => r.to === a.id);
       const idxB = gameData.correctTree.relations.findIndex(r => r.to === b.id);
       return idxA - idxB;
    });

    return children.map((node) => {
      const userAssignment = userTree.find(ut => ut.parentId === node.correctParentId && ut.id === node.id);
      
      return (
        <div key={node.id} className="space-y-1 lg:space-y-2">
          <NodeSlot
            nodeId={node.id}
            correctParentId={node.correctParentId}
            level={node.correctLevel}
            text={node.text}
            userPlacedNodeId={userAssignment ? userAssignment.id : null}
            onRemove={onRemoveNode}
            allShuffledNodes={gameData.shuffledNodes}
            selectedNodeId={selectedNodeId}
            onSlotClick={onSlotClick}
          />
          {renderStructure(shuffledNodes, node.id, level + 1)}
        </div>
      );
    });
  };

  return (
    <SortableContext items={userTree.map((node) => node.id)} strategy={verticalListSortingStrategy}>
      <div className="min-h-full space-y-4 p-4 lg:space-y-6 lg:p-8 border rounded-xl lg:rounded-2xl bg-card shadow-inner max-w-4xl mx-auto">
        <div className="mb-4 lg:mb-6">
          <h2 className="text-lg lg:text-xl font-bold text-foreground mb-1">Struttura</h2>
          <p className="text-xs lg:text-sm text-muted-foreground">
            {selectedNodeId ? "Clicca sullo slot vuoto corretto per posizionare il nodo selezionato." : "Trascina i nodi qui o clicca su un nodo e poi sullo slot per posizionarlo."}
          </p>
        </div>
        
        <div className="flex flex-col gap-2 lg:gap-4 overflow-x-auto pb-4">
          <div className="min-w-fit">
            {renderStructure(gameData.shuffledNodes)}
          </div>
        </div>
      </div>
    </SortableContext>
  );
}
