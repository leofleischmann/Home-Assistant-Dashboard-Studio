# <img src="https://raw.githubusercontent.com/leofleischmann/Home-Assistant-Dashboard-Studio/main/images/icon.png" width="36" align="top" alt=""> Home Assistant Dashboard Studio für Home Assistant

![Home Assistant Dashboard Studio — Code-Editor mit Live-Vorschau](https://raw.githubusercontent.com/leofleischmann/Home-Assistant-Dashboard-Studio/main/images/preview.png)

Ein **Custom Panel** für Home Assistant, in dem du dein Dashboard **direkt in HA
mit React programmierst** – wie der normale Dashboard-Editor, nur mit voller
Code-Freiheit (JSX, eigenes CSS, deine Komponenten). Installierbar über **HACS**.

Kein lokales Node, kein Build, kein Re-Deploy: Du tippst React, ein Transpiler im
Browser (Sucrase) macht daraus live JS, die Vorschau aktualisiert sich sofort,
und dein Code wird **in Home Assistant gespeichert**.

---

## Workflow für dich als Nutzer

1. Integration über HACS installieren und einrichten (siehe unten).
2. In der Seitenleiste auf **„Dashboard Studio"** klicken.
3. Oben rechts **„✎ Bearbeiten"** → links Datei-Panel + Code-Editor, rechts die Live-Vorschau.
4. React schreiben. Sensoren holst du dir als reaktive Variablen:
   ```tsx
   import { useEntity, callService } from '@ha';
   import { Card, Stat, Section } from '@ha/ui';
   import { num } from '@ha/format';

   export default function Dashboard() {
     const temp = useEntity('sensor.aussentemperatur');
     return <Stat label="Außen" value={num(temp?.state)} unit="°C" />;
   }
   ```
5. **Strg/⌘ + S** speichert in HA. **„◀ Ansicht"** zeigt das Dashboard im Vollbild.

Das mitgelieferte Start-Dashboard erkennt deine Geräte automatisch:

![Start-Dashboard mit automatisch erkannten Geräten](https://raw.githubusercontent.com/leofleischmann/Home-Assistant-Dashboard-Studio/main/images/dashboard.png)

> **Mobil:** Auf dem Handy ist das Studio reine **Anzeige** – der Code-Editor
> (Desktop-Werkzeug) ist ausgeblendet. Über das **☰-Symbol** oben links blendest
> du die Home-Assistant-Seitenleiste jederzeit wieder ein.

### Mehrere Dateien (modulare Codebasis)

Im Datei-Panel legst du beliebig viele Dateien an (z. B. `components/Karte.tsx`) und
importierst sie relativ – wie in einem echten Projekt:

```tsx
import { Overview } from './components/Overview';
```

Die Einstiegsdatei (⌂) braucht die Komponente als `export default`; alle anderen
exportierst du normal (`export function …`). Das ganze Projekt wird zusammen in HA gespeichert.

> **Drag & Drop:** Du kannst `.tsx`/`.ts`/`.jsx`/`.js`-Dateien auch direkt vom
> Computer ins Datei-Panel ziehen. Trägt die abgelegte Datei den Namen einer
> vorhandenen, wird diese ersetzt – sonst wird sie neu hinzugefügt.

**Ordner** entstehen automatisch aus dem Pfad (z. B. `components/Card.tsx`, beliebig
tief verschachtelbar) und werden im Datei-Panel als **aufklappbarer Baum** angezeigt.
Unten im Panel: **⬇ ZIP** lädt das komplette Projekt als Archiv herunter, **✕ Alle**
löscht alle Dateien (mit Sicherheitsabfrage).

### Sensoren & Aktionen einfügen

Klick auf **„⚡ Sensor / Aktion"** öffnet eine durchsuchbare Liste deiner echten
Entities. Wähle den Einfügemodus und klick auf einen Eintrag – das passende Snippet
landet am Cursor:

| Modus | fügt ein |
| --- | --- |
| **Wert** | `useEntity('sensor.aussentemperatur')?.state` |
| **Aktion** | `callService('light', 'toggle', { entity_id: 'light.kino' })` |
| **nur ID** | `'sensor.aussentemperatur'` |

### Eingebaute API (per `import` verfügbar)

| Modul | Inhalt |
| --- | --- |
| `@ha` | `useEntity`, `useEntityState`, `useEntitiesByDomain`, `useHassReady`, `callService`, `states` |
| `@ha/ui` | `Card`, `Stat`, `Section`, `RoomCard`, `DeviceCard`, `BatteryRow`, `LightTile` |
| `@ha/format` | `num`, `euro`, `isAvailable`, `stateNumber`, `weatherIcon`, `greeting`, `batteryColor` |
| `react` | das volle React (Hooks, `useState`, …) |

> Sucrase transpiliert nur (kein Bundler). Du nutzt also die hier bereitgestellten
> Module – beliebige npm-Pakete `import`en geht in diesem Modus nicht.

---

## Installation in Home Assistant (HACS)

Die Integration registriert das Sidebar-Panel **automatisch** — **kein** `panel_custom`-Eintrag in der `configuration.yaml` nötig.

### 1. HACS — Custom Repository (einmalig)

1. [HACS](https://hacs.xyz/) installieren (falls noch nicht vorhanden).
2. **HACS → Integrations → ⋮ → Custom repositories**
3. URL: `https://github.com/leofleischmann/Home-Assistant-Dashboard-Studio`
4. Kategorie: **Integration** (nicht Dashboard)
5. **Add**

### 2. Integration installieren

1. **HACS → Integrations** → **Home Assistant Dashboard Studio** suchen → **Download**
2. **Home Assistant neu starten**

### 3. Integration einrichten

1. **Einstellungen → Geräte & Dienste → Integration hinzufügen**
2. **Home Assistant Dashboard Studio** suchen → bestätigen
3. In der Sidebar erscheint **Dashboard Studio**

### Bleibt mein Code bei einem Update erhalten?

**Ja.** Dein Dashboard-Code wird pro HA-Benutzer in Home Assistants
`frontend/user_data` gespeichert (in HAs internem `.storage`) — **nicht** in den
Integrations-Dateien. Ein HACS-Update ersetzt nur die Integration unter
`custom_components/homeassistant_dashboard_studio/`; dein Code bleibt davon unberührt.
Auch ein normales HA-Backup sichert ihn automatisch mit.

---

## Lokal in VS Code entwickeln & mit HA synchronisieren (optional)

Wer lieber in **VS Code** (mit echten TS-Typen, Git, eigenen Tools) statt im
Browser-Editor arbeitet, bearbeitet die Dashboard-Dateien lokal und gleicht sie
per Befehl mit Home Assistant ab. Gespeichert wird am **selben Ort wie im Studio**
(`frontend/user_data`) – du kannst also jederzeit zwischen lokal und Browser wechseln.

**Einmalig einrichten:**

1. Repo klonen, `npm install`.
2. `.env.local` anlegen (Vorlage: `.env.local.example`):
   ```
   VITE_HASS_URL=http://homeassistant.local:8123
   VITE_HASS_TOKEN=<Long-Lived Access Token>
   ```
   Token: HA → Profil (unten links) → Tab **Sicherheit** → **Long-Lived Access Tokens** → erstellen.

**Benutzen:**

| Befehl | macht |
| --- | --- |
| `npm run sync:pull` | lädt dein aktuelles Dashboard aus HA nach `./dashboard/` |
| `npm run sync:push` | lädt `./dashboard/` einmalig zu HA hoch |
| `npm run sync:watch` | lädt bei **jedem Speichern** automatisch hoch (Live-Workflow) |

Windows: Doppelklick auf **`sync.bat`** (startet `watch`). macOS/Linux: **`./sync.sh`**.
Danach das Studio/Dashboard im Browser neu laden, um die Änderungen zu sehen.

> Bearbeite ein Dashboard nicht gleichzeitig lokal **und** im Browser-Editor –
> es gewinnt, wer zuletzt speichert. Der Einstiegspunkt (Default `dashboard.tsx`)
> wird in `dashboard/.studio.json` gemerkt.

---

## Das Panel selbst weiterentwickeln (optional)

Nur nötig, wenn du die *eingebaute API* oder das Studio selbst erweitern willst –
für normales Dashboard-Bauen brauchst du das nicht.

```bash
npm install
cp .env.local.example .env.local   # HA-URL + Long-Lived-Token eintragen
npm run dev                        # Studio lokal, verbunden mit echter HA
npm run build                      # → custom_components/homeassistant_dashboard_studio/dashboard.js
```

### Struktur

```
custom_components/homeassistant_dashboard_studio/   HACS-Integration (Panel-Registrierung)
src/
├─ panel.tsx              Custom-Element (Prod-Entry) → rendert Studio
├─ dev.tsx                Lokaler Dev-Entry via WebSocket
├─ studio/                Editor, Vorschau, Compile-Pipeline
├─ hass/                  Sensor-Schicht (@ha Hooks)
├─ components/widgets.tsx UI-Komponenten (@ha/ui)
└─ lib/format.ts          Formatierungs-Helfer (@ha/format)
scripts/
├─ copy-dashboard.mjs        Kopiert Build → custom_components/
├─ check-default-project.mjs Prüft, dass das Standard-Dashboard kompiliert (npm run check:default)
├─ sync.mjs                  Lokal ⇄ HA Sync der Dashboard-Dateien (npm run sync:pull/push/watch)
└─ gen-entity-types.mjs      Typen für lokale Entwicklung (npm run gen:types)
```

Neue API ergänzen = in `widgets.tsx`/`format.ts`/`hooks.ts` exportieren und in
[`runtime.ts`](src/studio/runtime.ts) der passenden Registry zuordnen.
