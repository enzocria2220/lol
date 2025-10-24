import React from "react";
import "@/App.css";
import { GameProvider, useGame } from './context/GameContext';
import MainMenu from './components/MainMenu';
import Library from './components/Library';
import BattleScreen from './components/BattleScreen';
import DialogueScreen from './components/DialogueScreen';
import VictoryScreen from './components/VictoryScreen';

const GameRouter = () => {
  const { gameState } = useGame();

  switch (gameState.currentScreen) {
    case 'menu':
      return <MainMenu />;
    case 'library':
      return <Library />;
    case 'battle':
      return <BattleScreen />;
    case 'dialogue':
      return <DialogueScreen />;
    case 'victory':
      return <VictoryScreen />;
    case 'gameover':
      return <GameOver />;
    default:
      return <MainMenu />;
  }
};

const GameOver = () => {
  const { changeScreen } = useGame();

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black flex items-center justify-center p-4">
      <div className="text-center">
        <div className="text-8xl mb-8">💀</div>
        <h1 className="text-5xl font-bold text-red-500 mb-6 pixel-art">GAME OVER</h1>
        <p className="text-gray-300 text-xl mb-8">A escuridão venceu desta vez...</p>
        <button
          onClick={() => {
            localStorage.removeItem('alexandriaGame');
            window.location.reload();
          }}
          className="bg-red-600 hover:bg-red-500 text-white font-bold py-4 px-8 rounded-lg text-xl transition-all"
        >
          Tentar Novamente
        </button>
      </div>
    </div>
  );
};

function App() {
  return (
    <GameProvider>
      <div className="App">
        <GameRouter />
      </div>
    </GameProvider>
  );
}

export default App;
