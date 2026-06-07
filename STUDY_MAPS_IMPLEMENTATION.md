# 📚 Study Maps - Editor di Mappe Concettuali con Markmap

## 🎯 Cosa è Stato Implementato

Un **editor di mappe concettuali interattivo** che consente agli utenti di:
- ✅ Creare e modificare mappe usando **markdown**
- ✅ Visualizzare in tempo reale con **Markmap**
- ✅ Autosalvataggio automatico nel database Supabase
- ✅ Esportare dati strutturati (nodi, relazioni, profondità)

## 🚀 Quick Start

### 1. Installazione dipendenze
```bash
npm install  # Include markmap-lib e markmap-view
```

### 2. Setup Database
Esegui `supabase/schema.sql` nel SQL Editor di Supabase:
```sql
-- La tabella study_maps verrà creata con:
-- - id, user_id, title, content, created_at, updated_at
-- - RLS policies per sicurezza
-- - Trigger per auto-update timestamp
```

### 3. Avvia l'app
```bash
npm run dev
# Naviga a http://localhost:3000/study-maps
```

## 📊 Struttura

### Componenti
- **StudyMapPage** - Pagina principale (layout 3 pannelli)
- **MarkmapPreview** - Visualizzazione Markmap in tempo reale
- **MarkmapEditor** - Editor markdown textarea
- **MapList** - Elenco mappe salvate

### Servizi
- **study-maps.ts** - CRUD operations su Supabase
- **export-map.ts** - Parser markdown → struttura JSON

### API
- `GET/POST /api/study-maps` - Lista e crea
- `GET/PATCH/DELETE /api/study-maps/[id]` - Leggi, aggiorna, elimina

## 💾 Salvataggio e Persistenza

```typescript
// Autosalvataggio:
// 1. User digita in editor
// 2. Debounce 2 secondi (aspetta che l'utente finisca)
// 3. API PATCH /api/study-maps/[id]
// 4. Database aggiornato
// 5. Feedback UI "Salvato" / "Salvando..."
```

## 📤 Funzione di Export

```typescript
import { exportMapData } from "@/lib/services";

const result = exportMapData("Titolo", markdownContent);

// Restituisce:
{
  title: "Titolo",
  nodes: [
    {
      id: "node-0",
      text: "Argomento",
      level: 0,
      children: [...]
    }
  ],
  totalNodes: 12,
  maxDepth: 3,
  relations: [
    { from: "node-0", to: "node-1" },
    { from: "node-1", to: "node-2" },
    ...
  ]
}
```

Pronta per **quiz generation**, **mini-giochi di connessione**, e **adattamento difficoltà**.

## �� Formato Markdown

```markdown
# Titolo Principale
- Punto 1
  - Sottopunto 1.1
  - Sottopunto 1.2
- Punto 2
```

Markmap renderizza automaticamente:
- Gerarchia visiva
- Colori per livello
- Zoom e pan interattivo

## 🔒 Sicurezza

✅ Autenticazione richiesta
✅ RLS policies (users vedono solo le proprie mappe)
✅ Verifica ownership lato server sulle API

## 📚 Documentazione Completa

Vedi [docs/STUDY_MAPS.md](docs/STUDY_MAPS.md) per:
- API reference completa
- Struttura del codice dettagliata
- Prossimi step (quiz, giochi)
- Development tips

## 🧪 Testing

```bash
npm run typecheck  # Type checking
npm run build      # Production build
npm run dev        # Development server
```

## 📂 File Creati/Modificati

```
CREATI:
src/components/study-maps/
├── StudyMapPage.tsx
├── MarkmapEditor.tsx
├── MarkmapPreview.tsx
├── MapList.tsx
└── index.ts

src/lib/services/
├── study-maps.ts
├── export-map.ts
└── index.ts

src/app/study-maps/page.tsx
src/app/api/study-maps/route.ts
src/app/api/study-maps/[id]/route.ts

docs/STUDY_MAPS.md

MODIFICATI:
src/types/database.ts (aggiunto StudyMapRow)
supabase/schema.sql (aggiunto tabella study_maps)
package.json (aggiunto markmap-lib, markmap-view)
```

## 🎨 Layout

```
┌─────────────────────────────────────────┐
│  SIDEBAR      │  EDITOR      │  PREVIEW  │
│  Mappe (300)  │  Markdown    │  Markmap  │
│               │              │           │
│  [+ Nuova]    │  Titolo      │   Live    │
│  📝 Map1      │  Input       │ Rendering │
│  📝 Map2      │              │           │
│  📝 Map3      │  Content     │   Zoom    │
│               │  Area        │   Pan     │
│  [🗑 Delete]  │  (textarea)  │           │
│               │              │           │
│  [Salvando]   │              │           │
└─────────────────────────────────────────┘
```

## ✨ Prossimi Step (non ancora implementati)

- [ ] Quiz generation da mappe
- [ ] Mini-giochi di connessione
- [ ] Sharing mappe
- [ ] Importazione da immagini
- [ ] Esportazione PDF

## 🤝 Integrazione con Altri Moduli

La funzione `exportMapData()` fornisce l'interfaccia per:
- **Quiz Module**: usa `nodes` per domande, `relations` per verifiche
- **Game Module**: usa `relations` per matching games
- **Analytics**: traccia `maxDepth` e `totalNodes` per difficulty

## 📞 Support

Per problemi:
1. Verifica che Supabase sia configurato (.env.local)
2. Esegui `npm install` per installare Markmap
3. Esegui lo schema SQL in Supabase
4. Vedi console del browser per errori

---

**Status**: ✅ Production Ready  
**Last Updated**: 2026-06-07  
**Maintainer**: StudyMate Development
