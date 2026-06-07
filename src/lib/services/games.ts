import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, GameSessionRow } from "@/types/database";
import { exportMapData, type MapNode, type MapExportData } from "./export-map";

export interface ShuffledNode {
  id: string;
  text: string;
  correctParentId: string | null;
  correctLevel: number;
}

export interface DragDropGameData {
  mapId: string;
  mapTitle: string;
  shuffledNodes: ShuffledNode[];
  correctTree: MapExportData;
}

/**
 * Genera i dati per il gioco Drag & Drop
 * Mescola i nodi mantenendo le informazioni sulla struttura corretta
 */
export function generateDragDropGame(
  mapId: string,
  mapTitle: string,
  markdownContent: string
): DragDropGameData {
  const correctTree = exportMapData(mapTitle, markdownContent);
  
  // Flatten dell'albero per ottenere tutti i nodi con le loro relazioni
  const shuffledNodes: ShuffledNode[] = [];
  
  function flattenTree(nodes: MapNode[], parentId: string | null = null) {
    for (const node of nodes) {
      shuffledNodes.push({
        id: node.id,
        text: node.text,
        correctParentId: parentId,
        correctLevel: node.level
      });
      
      if (node.children.length > 0) {
        flattenTree(node.children, node.id);
      }
    }
  }
  
  flattenTree(correctTree.nodes);
  
  // Mescola i nodi (Fisher-Yates shuffle)
  for (let i = shuffledNodes.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffledNodes[i], shuffledNodes[j]] = [shuffledNodes[j], shuffledNodes[i]];
  }
  
  return {
    mapId,
    mapTitle,
    shuffledNodes,
    correctTree
  };
}

export interface UserTreeNode {
  id: string;
  parentId: string | null;
  level: number;
}

/**
 * Valida il posizionamento dei nodi da parte dell'utente
 * Restituisce il numero di nodi posizionati correttamente
 */
export function validateNodePlacement(
  userTree: UserTreeNode[],
  gameData: DragDropGameData
): { correctPlacements: number; totalNodes: number; accuracy: number } {
  const totalNodes = gameData.shuffledNodes.length;
  let correctPlacements = 0;
  
  for (const userNode of userTree) {
    const correctNode = gameData.shuffledNodes.find(n => n.id === userNode.id);
    
    if (correctNode) {
      // Nel nuovo sistema, se il nodo è nell'userTree, significa che è stato messo nello slot giusto
      // poiché handleDragEnd permette l'inserimento solo se nodeId === expectedNodeId
      correctPlacements++;
    }
  }
  
  const accuracy = totalNodes > 0 ? (correctPlacements / totalNodes) * 100 : 0;
  
  return {
    correctPlacements,
    totalNodes,
    accuracy
  };
}

/**
 * Calcola il punteggio del gioco basato su correttezza e tempo
 */
export function calculateGameScore(
  correctPlacements: number,
  totalNodes: number,
  timeSeconds: number
): { score: number; xpAwarded: number } {
  const accuracy = totalNodes > 0 ? (correctPlacements / totalNodes) * 100 : 0;
  
  // Bonus tempo: max 20 punti, diminuisce con il tempo
  // Ogni 10 secondi toglie 1 punto dal bonus
  const timeBonus = Math.max(0, Math.min(20, 20 - Math.floor(timeSeconds / 10)));
  
  // Punteggio finale (max 100)
  const score = Math.min(100, Math.round(accuracy * 0.8 + timeBonus));
  
  // XP assegnati: proporzionali al punteggio (0-20 XP)
  const xpAwarded = Math.round((score / 100) * 20);
  
  return { score, xpAwarded };
}

/**
 * Salva una sessione di gioco nel database
 */
export async function saveGameSession(
  supabase: SupabaseClient<Database>,
  userId: string,
  studyMapId: string,
  score: number,
  timeSeconds: number,
  xpAwarded: number
): Promise<GameSessionRow | null> {
  const { data, error } = await supabase
    .from("game_sessions")
    .insert({
      user_id: userId,
      study_map_id: studyMapId,
      game_type: "drag_drop",
      score,
      time_seconds: timeSeconds,
      completed: true,
      xp_awarded: xpAwarded
    })
    .select()
    .single();
  
  if (error) {
    console.error("Error saving game session:", error);
    return null;
  }
  
  return data;
}

/**
 * Aggiorna gli XP dell'utente dopo aver completato un gioco
 */
export async function awardGameXP(
  supabase: SupabaseClient<Database>,
  userId: string,
  xpAwarded: number
): Promise<boolean> {
  // Ottieni gli XP attuali dell'utente
  const { data: user } = await supabase
    .from("users")
    .select("total_xp")
    .eq("id", userId)
    .single();
  
  if (!user) {
    return false;
  }
  
  // Aggiorna gli XP
  const { error: updateError } = await supabase
    .from("users")
    .update({ total_xp: user.total_xp + xpAwarded })
    .eq("id", userId);
  
  return !updateError;
}

/**
 * Ottiene il best score per una mappa specifica
 */
export async function getBestScore(
  supabase: SupabaseClient<Database>,
  userId: string,
  studyMapId: string
): Promise<number> {
  const { data, error } = await supabase
    .from("game_sessions")
    .select("score")
    .eq("user_id", userId)
    .eq("study_map_id", studyMapId)
    .eq("game_type", "drag_drop")
    .order("score", { ascending: false })
    .limit(1)
    .single();
  
  if (error || !data) {
    return 0;
  }
  
  return data.score;
}

/**
 * Ottiene tutte le sessioni di gioco per una mappa
 */
export async function getGameSessions(
  supabase: SupabaseClient<Database>,
  userId: string,
  studyMapId: string
): Promise<GameSessionRow[]> {
  const { data, error } = await supabase
    .from("game_sessions")
    .select("*")
    .eq("user_id", userId)
    .eq("study_map_id", studyMapId)
    .order("created_at", { ascending: false });
  
  if (error) {
    console.error("Error fetching game sessions:", error);
    return [];
  }
  
  return data || [];
}
