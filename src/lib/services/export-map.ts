export interface MapNode {
  id: string;
  text: string;
  level: number;
  children: MapNode[];
}

export interface MapExportData {
  title: string;
  nodes: MapNode[];
  totalNodes: number;
  maxDepth: number;
  relations: Array<{
    from: string;
    to: string;
  }>;
}

/**
 * Parses markdown content in Markmap format and extracts nodes, relations, and depth
 * Markmap format uses indentation levels:
 * # Title (level 0)
 * - Child (level 1)
 *   - Grandchild (level 2)
 */
export function exportMapData(title: string, markdownContent: string): MapExportData {
  const lines = markdownContent.split("\n").filter((line) => line.trim());

  const nodes: MapNode[] = [];
  const nodeStack: MapNode[] = [];
  let nodeIdCounter = 0;
  let maxDepth = 0;
  const relations: Array<{ from: string; to: string }> = [];

  for (const line of lines) {
    // Skip empty lines
    if (!line.trim()) continue;

    // Calculate indentation level
    const indentation = line.search(/\S/);

    // Parse markdown headers and list items
    let text = line.trim();
    let level = 0;

    // Handle markdown headers (# = level 0, ## = level 1, etc.)
    const headerMatch = text.match(/^#+\s+(.+)$/);
    if (headerMatch) {
      level = text.search(/#/) + 1; // Number of # symbols + 1
      text = headerMatch[1];
    } else {
      // Handle bullet points (-, *, +)
      const bulletMatch = text.match(/^[-*+]\s+(.+)$/);
      if (bulletMatch) {
        text = bulletMatch[1];
        // Level based on indentation
        level = Math.floor(indentation / 2) + 1;
      } else {
        // Plain text gets a level based on indentation
        level = Math.floor(indentation / 2);
      }
    }

    // Create node
    const nodeId = `node-${nodeIdCounter++}`;
    const newNode: MapNode = {
      id: nodeId,
      text: text,
      level: level,
      children: []
    };

    // Adjust depth tracking
    if (level > maxDepth) {
      maxDepth = level;
    }

    // Add to appropriate parent
    if (level === 0 || nodeStack.length === 0) {
      nodes.push(newNode);
      nodeStack.length = 0;
      nodeStack.push(newNode);
    } else {
      // Find the correct parent node
      while (nodeStack.length > 0 && nodeStack[nodeStack.length - 1].level >= level) {
        nodeStack.pop();
      }

      if (nodeStack.length > 0) {
        const parent = nodeStack[nodeStack.length - 1];
        parent.children.push(newNode);

        // Add relation
        relations.push({
          from: parent.id,
          to: nodeId
        });
      } else {
        nodes.push(newNode);
      }

      nodeStack.push(newNode);
    }
  }

  // Flatten the tree to get all nodes for counting
  function flattenNodes(nodeList: MapNode[]): MapNode[] {
    return nodeList.reduce<MapNode[]>((acc, node) => {
      acc.push(node);
      if (node.children.length > 0) {
        acc.push(...flattenNodes(node.children));
      }
      return acc;
    }, []);
  }

  const allNodes = flattenNodes(nodes);

  return {
    title,
    nodes,
    totalNodes: allNodes.length,
    maxDepth,
    relations
  };
}
