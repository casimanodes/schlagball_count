import { useEffect, useReducer } from 'react';
import { gameReducer, initialState } from './gameReducer';
import type { AppState } from './types';
import SetupScreen from './components/SetupScreen';
import GameScreen from './components/GameScreen';
import OverviewScreen from './components/OverviewScreen';
import GameDetail from './components/GameDetail';

// App-Zustand lokal speichern, damit ein versehentliches Neuladen weder das
// laufende Spiel noch das Spielarchiv verliert.
const STORAGE_KEY = 'schlagball-zaehler-v4';

function loadState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as AppState;
      const validView =
        parsed?.view === 'setup' ||
        parsed?.view === 'playing' ||
        parsed?.view === 'overview' ||
        parsed?.view === 'detail';
      if (validView && Array.isArray(parsed.completedGames)) {
        return parsed;
      }
    }
  } catch {
    // Ungültiger oder fehlender Speicherstand – Standardzustand verwenden.
  }
  return initialState;
}

export default function App() {
  const [state, dispatch] = useReducer(gameReducer, initialState, loadState);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Speichern nicht möglich (z. B. privater Modus) – stört das Spiel nicht.
    }
  }, [state]);

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

  return <div className="app">{renderView()}</div>;
}
