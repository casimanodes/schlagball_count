# Schlagball – Punkte-Zählapp

Eine moderne, lokal laufende Web-App zum Punktezählen für den Sport
**Schlagball**. Optimiert für Schiedsrichter auf dem **Smartphone** – mit
Spielern, echter Schlagball-Punktelogik, Timer und einem **Spielarchiv** für
ganze Turniere.

---

## 1. Analyse der Referenz-App

Grundlage ist die bestehende App unter `https://schlagball-vercel.vercel.app/`.

**Was die Referenz-App bietet:**

- Setup mit Teamnamen, Spieleranzahl, konfigurierbaren Punktwerten und Timer.
- Spiel-Screen mit Timer, Gesamt-Score, „Spiel löschen" und „undo".
- Für **beide** Teams werden **alle vier** Punkt-Buttons gleichzeitig angezeigt
  – ohne Trennung nach Angriff / Verteidigung und ohne Regel-Logik.

**Behobene Schwächen in dieser Neufassung:**

| Referenz-App | Diese App |
|---|---|
| Alle 4 Buttons für jedes Team sichtbar | Pro Spieler nur die zur Rolle passenden Punktarten |
| Punkte ohne Regelprüfung | **Punkte nur im regelkonformen Moment** (Schlag-Logik) |
| Punkte ohne Spielerbezug | Jeder Punkt wird einem **Spieler** zugeordnet |
| Kein automatischer Rollenwechsel | **Automatischer Rollenwechsel** beim Abwurfpunkt |
| Unübersichtliches Desktop-Layout | **Smartphone-Portrait**, große Touch-Flächen |
| Kein Spielarchiv | **Übersicht & Detailansicht** aller Spiele |

---

## 2. Schnellstart

**Voraussetzung:** [Node.js](https://nodejs.org/) ≥ 18 (getestet mit Node 20).

```bash
npm install     # Abhängigkeiten installieren
npm run dev     # Entwicklungs-Server starten
```

Anschließend die angezeigte Adresse öffnen – standardmäßig:

```
http://localhost:5173
```

Weitere Befehle:

```bash
npm run build     # Produktions-Build (Ordner dist/)
npm run preview   # Produktions-Build lokal testen
```

---

## 3. Funktionsüberblick

- **Setup** – Teamnamen, je Team bis zu 12 Spieler (Name + Nummer),
  Startaufstellung und Timer-Länge.
- **Schlag-Logik** – ein Angreifer muss erst schlagen, bevor Punkte möglich
  sind; Punkte können nur im regelkonformen Moment erfasst werden.
- **Spieler-Buttons** – jeder Spieler ist ein zweigeteilter Button; jede Hälfte
  ordnet den Punkt diesem Spieler zu.
- **Rollen** – automatischer Rollenwechsel beim Abwurfpunkt.
- **Timer** – einstellbar; läuft er ab, wird das Spiel automatisch beendet.
- **Spielübersicht & Detail** – alle beendeten Spiele mit Ergebnis und Punkten
  je Spieler; alle Spiele lassen sich als Datei exportieren.

---

## 4. Bedienung durch den Schiedsrichter

### Spiel einrichten
1. Namen für **Team 1** und **Team 2** eingeben.
2. Je Team die **Spieler** mit Nummer und Name eintragen (bis zu 12). Jedes
   Team braucht mindestens einen Spieler.
3. Antippen, welches Team **zuerst angreift**.
4. **Spieldauer** über den Stepper einstellen, dann **„Spiel starten"**.

### Während des Spiels
Jeder Spieler hat eine Karte mit einem **zweigeteilten Button**. Welche Hälften
aktiv sind, folgt der Schlagball-Logik (siehe Abschnitt 5):

- **Angriff:** linke Hälfte zuerst `Geschlagen` (Schlag eintragen) und danach
  `Weitschlag`; rechte Hälfte `Laufpunkt`.
- **Verteidigung:** linke Hälfte `Fangpunkt`, rechte Hälfte `Abwurfpunkt`.
- **Gesperrte Hälften sind ausgegraut** – der Punkt ist dann gerade nicht
  erlaubt.
- Ein Tipp auf eine aktive Hälfte erfasst den Punkt für **genau diesen Spieler**.
- Die **Timer-Leiste**: `Start` / `Pause` / `Reset`.
- **Undo** macht die letzte Aktion rückgängig (auch Schlag und Rollenwechsel).

### Spiel beenden, Übersicht & Details
- **„Spiel beenden"** (oder Timer-Ablauf) speichert das Spiel und öffnet die
  **Spielübersicht** mit allen Partien.
- Ein Tippen auf ein Spiel zeigt die **Detailansicht**: Ergebnis, Eckdaten,
  Punkte je Spieler und den vollständigen Verlauf.
- Über **„Spiele als Datei speichern"** lädst du alle beendeten Spiele als
  JSON-Datei herunter, um die Ergebnisse zu sichern.

> Der Zustand wird lokal gespeichert – Neuladen verliert nichts.

---

## 5. Punktelogik

### Die vier Punktarten

| Rolle | Punktart | Bedingung | Wirkung |
|---|---|---|---|
| Angriff | **Laufpunkt** | Spieler hat geschlagen | +1 Punkt |
| Angriff | **Weitschlagpunkt** | Spieler ist der letzte Schläger | +1 Punkt |
| Verteidigung | **Fangpunkt** | seit dem letzten Schlag noch nicht gefangen | +1 Punkt |
| Verteidigung | **Abwurfpunkt** | jederzeit | +1 Punkt + Rollenwechsel |

Jeder Punkt zählt **1** und wird dem Spieler gutgeschrieben, der ihn erzielt.
Die Team-Punktzahl ist die Summe aller Spielerpunkte.

### Der Schlag ("Geschlagen")

Bevor ein Angriffsspieler laufen darf, muss er den Ball schlagen:

- Die linke Hälfte einer Angriffskarte zeigt anfangs **„Geschlagen"** – das ist
  ein Knopf, **kein Punkt**. Ein Tipp trägt ein, dass dieser Spieler den Ball
  geschlagen hat.
- Danach wird aus „Geschlagen" die Punktart **„Weitschlag"**, und die rechte
  Hälfte **„Laufpunkt"** wird für diesen Spieler freigeschaltet.
- **Pro Schlag genau ein Punkt:** Sobald der Spieler einen Lauf- oder
  Weitschlagpunkt erzielt hat, ist der Schlag verbraucht – die Hälften werden
  wieder gesperrt und es erscheint erneut „Geschlagen". Er muss neu schlagen,
  bevor er wieder punkten kann.
- Ein Spieler ohne offenen Schlag kann **keinen Laufpunkt** erzielen.

### Wann welcher Punkt möglich ist

- **Laufpunkt:** nur für einen Spieler mit offenem Schlag (er hat geschlagen
  und den Schlag noch nicht verwertet).
- **Weitschlagpunkt:** nur unmittelbar für den Spieler, der **zuletzt**
  geschlagen hat. Schlägt danach ein anderer Spieler, verliert der vorige
  seinen Weitschlag (den Laufpunkt behält er).
- **Fangpunkt:** nur, wenn der Gegner geschlagen hat – und genau **einmal je
  Schlag**. Jeder Verteidiger kann ihn erzielen; danach ist er gesperrt, bis
  erneut geschlagen wird.
- **Abwurfpunkt:** jederzeit für die Verteidigung.

Ein Schlag ist also genau **einmal verwertbar**: Der Schläger erzielt entweder
einen Laufpunkt **oder** einen Weitschlag – danach ist sein Schlag verbraucht und
er muss neu schlagen. Erzielt die Verteidigung stattdessen einen Fangpunkt, ist
die Fang-Chance dieses Schlags ebenfalls verbraucht.

### Automatischer Rollenwechsel

Ein **Abwurfpunkt** der Verteidigung tauscht die Rollen: das Verteidigungsteam
greift danach an. Es beginnt eine neue Angriffsphase – **alle Schlag-Status
werden zurückgesetzt**, jeder Angreifer muss neu schlagen.

### Timer

Der Timer wird im Setup eingestellt und im Spiel manuell gestartet. Er nutzt
einen festen Endzeitpunkt und bleibt damit auch nach einem Neuladen exakt.
Erreicht er `00:00`, wird das Spiel automatisch beendet.

### Undo

Jede Aktion – Punkt **und** Schlag – wird mit einem Snapshot des Schlag-Status
gespeichert. „Undo" stellt den Zustand davor vollständig wieder her: inklusive
Schlägen, Sperren, Fang-Chancen und Rollenwechseln.

Die gesamte Logik liegt zentral im Reducer
[`src/gameReducer.ts`](src/gameReducer.ts).

---

## 6. Projektstruktur

```
src/
  types.ts                 Datenmodell: Punktarten, Spieler, Schlag-Status, Timer
  gameReducer.ts           Zentrale State-Logik (Schlag, Punkte-Gating, Timer)
  App.tsx                  Wurzelkomponente, Ansichtswahl, Persistenz
  main.tsx                 Einstiegspunkt
  index.css                Styling (mobil-optimiert, Farbkonzept)
  components/
    SetupScreen.tsx        Teamnamen, Spieler, Startaufstellung, Timer
    PlayerEditor.tsx       Spieler-Eingabe (Name + Nummer) im Setup
    GameScreen.tsx         Haupt-Spielansicht + Timer-Ticker
    Scoreboard.tsx         Kopf: Namen, Rollen, Gesamtpunkte
    TimerBar.tsx           Timer-Anzeige mit Start / Pause / Reset
    TeamPanel.tsx          Team mit Rolle und Spielerliste
    PlayerCard.tsx         Spieler-Karte mit Geschlagen-/Punkt-Hälften
    Controls.tsx           Kontrollleiste (Undo / Spiel beenden)
    ScoreHistory.tsx       Aufklappbarer Verlauf (Punkte + Schläge)
    OverviewScreen.tsx     Liste aller beendeten Spiele
    GameDetail.tsx         Detailansicht eines Spiels (Punkte je Spieler)
```

## 7. Technik

- **React 18** + **TypeScript**, Build-Tool **Vite**
- Zentrale State-Verwaltung über `useReducer` mit Ereignis-History
- Snapshot-basiertes Undo für zuverlässige Rücknahme komplexer Zustände
- Keine externen UI-Bibliotheken – schlankes, eigenes CSS
```
