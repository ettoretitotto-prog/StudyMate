// Example usage of exportMapData function
import { exportMapData } from "@/lib/services/export-map";

// Example 1: Simple biology hierarchy
const markdownContent = `
- Biologia
  - Anatomia
    - Sistema nervoso
    - Sistema circolatorio
  - Genetica
    - DNA
    - Eredità
- Chimica
  - Chimica organica
    - Alcoli
    - Acidi
  - Chimica inorganica
`;

const result = exportMapData("Scienze", markdownContent);

console.log("Export Result:", {
  title: result.title,
  totalNodes: result.totalNodes,
  maxDepth: result.maxDepth,
  nodeStructure: result.nodes,
  relations: result.relations
});

// Output structure example:
// {
//   "title": "Scienze",
//   "nodes": [
//     {
//       "id": "node-0",
//       "text": "Biologia",
//       "level": 0,
//       "children": [
//         {
//           "id": "node-1",
//           "text": "Anatomia",
//           "level": 1,
//           "children": [...]
//         },
//         ...
//       ]
//     },
//     ...
//   ],
//   "totalNodes": 11,
//   "maxDepth": 2,
//   "relations": [
//     { "from": "node-0", "to": "node-1" },
//     { "from": "node-1", "to": "node-2" },
//     ...
//   ]
// }
