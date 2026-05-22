import { useEffect, useReducer, useRef, useState } from 'react';
import { gameReducer, initialState } from './gameReducer';
import type { AppState } from './types';
import SetupScreen from './components/SetupScreen';
import GameScreen from './components/GameScreen';
import OverviewScreen from './components/OverviewScreen';
import GameDetail from './components/GameDetail';

// Der Spielstand wird getrennt gespeichert: das LAUFENDE Spiel und das ARCHIV
// beendeter Spiele in eigenen Einträgen. Dadurch bleibt das laufende Spiel
// klein und kann immer gesichert werden – auch wenn das Archiv groß ist.
const KEY_CURRENT = 'schlagball-v5-aktuell';
const KEY_ARCHIVE = 'schlagball-v5-archiv';
// Alter, gemeinsamer Speichereintrag – wird nur noch zum Übernehmen gelesen.
const KEY_LEGACY = 'schlagball-zaehler-v4';

function isValidView(v: unknown): v is AppState['view'] {
  return v === 'setup' || v === 'playing' || v === 'overview' || v === 'detail';
}

function loadState(): AppState {
  // Aktuelles Format: laufendes Spiel + Archiv getrennt.
  try {
    const currentRaw = localStorage.getItem(KEY_CURRENT);
    if (currentRaw) {
      const current = JSON.parse(currentRaw);
      if (isValidView(current?.view)) {
        let completedGames: AppState['completedGames'] = [];
        const archiveRaw = localStorage.getItem(KEY_ARCHIVE);
        if (archiveRaw) {
          const archive = JSON.parse(archiveRaw);
          if (Array.isArray(archive)) completedGames = archive;
        }
        return {
          view: current.view,
          currentGame: current.currentGame ?? null,
          selectedGameId: current.selectedGameId ?? null,
          completedGames,
        };
      }
    }
  } catch {
    // Ungültiger Speicherstand – unten den alten Eintrag prüfen.
  }

  // Migration: alten, gemeinsamen Speichereintrag übernehmen.
  try {
    const legacyRaw = localStorage.getItem(KEY_LEGACY);
    if (legacyRaw) {
      const parsed = JSON.parse(legacyRaw) as AppState;
      if (isValidView(parsed?.view) && Array.isArray(parsed.completedGames)) {
        return parsed;
      }
    }
  } catch {
    // Auch der alte Stand ist unbrauchbar.
  }

  return initialState;
}

/**
 * Speichert den Zustand. Das LAUFENDE Spiel wird zuerst gesichert (Vorrang),
 * danach das Archiv. Liefert false zurück, wenn etwas nicht gespeichert
 * werden konnte – dann wird der Schiedsrichter gewarnt.
 */
function persist(state: AppState): boolean {
  let ok = true;
  try {
    localStorage.setItem(
      KEY_CURRENT,
      JSON.stringify({
        view: state.view,
        currentGame: state.currentGame,
        selectedGameId: state.selectedGameId,
      }),
    );
  } catch {
    ok = false;
  }
  try {
    localStorage.setItem(KEY_ARCHIVE, JSON.stringify(state.completedGames));
  } catch {
    ok = false;
  }
  return ok;
}

export default function App() {
  const [state, dispatch] = useReducer(gameReducer, initialState, loadState);
  const [saveFailed, setSaveFailed] = useState(false);

  // Hält immer den aktuellen Zustand bereit – für die Sicherung beim Verlassen.
  const stateRef = useRef(state);
  stateRef.current = state;

  // Nach jeder Änderung speichern; Speicherfehler sichtbar machen.
  useEffect(() => {
    setSaveFailed(!persist(state));
  }, [state]);

  // Zusätzliche Sicherung, sobald die Seite verlassen oder ausgeblendet wird
  // (Neuladen, Tab-Wechsel, App in den Hintergrund) – schützt vor Datenverlust.
  useEffect(() => {
    const saveNow = () => {
      persist(stateRef.current);
    };
    const onVisibility = () => {
      if (document.visibilityState === 'hidden') saveNow();
    };
    window.addEventListener('pagehide', saveNow);
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      window.removeEventListener('pagehide', saveNow);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, []);

  function renderView() {
    switch (state.view) {
      case 'playing':
        if (state.currentGame) {
          return <GameScreen game={state.currentGame} dispatch={dispatch} />;
        }
        return (
          <SetupScreen
            dispatch={dispatch}
            canReturnToOverview={state.completedGames.length > 0}
          />
        );

      case 'overview':
        return <OverviewScreen games={state.completedGames} dispatch={dispatch} />;

      case 'detail': {
        const index = state.completedGames.findIndex(
          (g) => g.id === state.selectedGameId,
        );
        if (index >= 0) {
          return (
            <GameDetail
              game={state.completedGames[index]}
              gameNumber={state.completedGames.length - index}
              dispatch={dispatch}
            />
          );
        }
        return <OverviewScreen games={state.completedGames} dispatch={dispatch} />;
      }

      case 'setup':
      default:
        return (
          <SetupScreen
            dispatch={dispatch}
            canReturnToOverview={state.completedGames.length > 0}
          />
        );
    }
  }

  return (
    <div className="app">
      {saveFailed && (
        <div className="save-warning" role="alert">
          Achtung: Spielstand konnte nicht gespeichert werden. Bitte
          Browser-Speicher prüfen und die Spiele als Datei sichern.
        </div>
      )}
      {renderView()}
    </div>
  );
}
