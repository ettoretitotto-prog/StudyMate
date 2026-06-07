# Study Maps - Editor di Mappe Concettuali

## 📋 Overview

Il modulo Study Maps consente agli utenti di creare e modificare mappe concettuali interattive usando il formato markdown. Le mappe vengono visualizzate in tempo reale con Markmap e salvate automaticamente nel database.

## 🎯 Funzionalità

### Editor Principale (`/study-maps`)
- **Layout a tre pannelli**:
  - **Sinistra (300px)**: Lista delle mappe salvate con pulsante "Nuova Mappa"
  - **Centro**: Editor markdown con textarea
  - **Destra**: Anteprima in tempo reale con Markmap

### Operazioni Supportate
- ✅ Creare una nuova mappa
- ✅ Modificare titolo e contenuto
- ✅ Visualizzare anteprima in tempo reale
- ✅ Eliminare mappe
- ✅ Autosalvataggio automatico (2 secondi di debounce)
- ✅ Esportare dati strutturati (nodi, relazioni, profondità)

## 📁 Struttura del Codice

### Componenti (`src/components/study-maps/`)

#### `StudyMapPage.tsx`
Componente principale che gestisce lo stato globale e il layout a tre pannelli.
- Mantiene lo stato di: maps, selectedMapId, content, title
- Implementa autosalvataggio con debounce
- Gestisce creazione, aggiornamento e eliminazione

```tsx
<StudyMapPage initialMaps={maps} />
```

#### `MarkmapPreview.tsx`
Visualizza l'anteprima Markmap in tempo reale.
```tsx
<MarkmapPreview content={content} title={title} />
```

#### `MarkmapEditor.tsx`
Editor markdown semplice con textarea.
```tsx
<MarkmapEditor content={content} onChange={handleChange} />
```

#### `MapList.tsx`
Elenco delle mappe salvate con pulsante di eliminazione.
```tsx
<MapList maps={maps} selectedMapId={id} onSelectMap={fn} onDeleteMap={fn} />
```

### Servizi (`src/lib/services/`)

#### `study-maps.ts`
CRUD operations su Supabase.
```typescript
- getStudyMaps(supabase, userId): StudyMapRow[]
- getStudyMap(supabase, mapId): StudyMapRow
- createStudyMap(supabase, userId, title, content)
- updateStudyMap(supabase, mapId, {title, content})
- deleteStudyMap(supabase, mapId)
```

#### `export-map.ts`
Parsing markdown e estrazione della struttura.
```typescript
exportMapData(title, markdownContent): MapExportData
```

Restituisce:
```typescript
{
  title: string;
  nodes: MapNode[];        // Struttura ad albero
  totalNodes: number;      // Conteggio totale nodi
  maxDepth: number;        // Profondità massima
  relations: Array<{       // Relazioni nodo-a-nodo
    from: string;
    to: string;
  }>;
}
```

### API Routes (`src/app/api/study-maps/`)

#### `route.ts`
- `GET`: Restituisce tutte le mappe dell'utente
- `POST`: Crea una nuova mappa

#### `[id]/route.ts`
- `GET`: Ottiene una mappa specifica
- `PATCH`: Aggiorna titolo/contenuto
- `DELETE`: Elimina una mappa

Tutte le rotte verificano l'ownership tramite RLS di Supabase.

### Database (`supabase/schema.sql`)

Tabella `study_maps`:
```sql
CREATE TABLE study_maps (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL (FK users),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ (auto)
);
```

## 🚀 Utilizzo

### Creare una Mappa
```bash
POST /api/study-maps
{
  "title": "Biologia",
  "content": "- Cellula\n  - Nucleo\n  - Mitocondrio"
}
```

### Formato Markdown Supportato

```markdown
# Titolo Principale
- Punto 1
  - Sottopunto 1.1
  - Sottopunto 1.2
- Punto 2
  - Sottopunto 2.1
```

### Esportare Dati Strutturati

```typescript
import { exportMapData } from "@/lib/services";

const exported = exportMapData("Titolo", markdownContent);
// Usa per: quiz generation, mini-games, data analysis
```

## 🔄 Autosalvataggio

- **Debounce**: 2 secondi di attesa dopo l'ultima modifica
- **Trigger**: Quando titolo o contenuto cambiano
- **Feedback**: Indicatore "Salvando..." nella UI

## 🔒 Sicurezza

- ✅ Autenticazione richiesta
- ✅ RLS policies su Supabase (users vedono solo le proprie mappe)
- ✅ Verifica ownership lato server sulle API

## 📈 Preparazione per Fase 2

La funzione `exportMapData()` fornisce:
- **Nodi strutturati**: per generare domande target
- **Relazioni**: per mini-giochi di connessione
- **Profondità**: per adattare difficoltà quiz

## 📚 Prossimi Step

- [ ] Integrazione quiz generation
- [ ] Mini-giochi di connessione
- [ ] Sharing mappe tra utenti
- [ ] Importazione da immagini
- [ ] Esportazione PDF

## 🐛 Development Tips

Per testare localmente:
```bash
npm run dev
# Vai a http://localhost:3000/study-maps

# Se ottieni errore Supabase, configura .env.local:
# NEXT_PUBLIC_SUPABASE_URL=...
# NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```
