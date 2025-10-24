import React from 'react';
import { useGame } from '../context/GameContext';

const MainMenu = () => {
  const { changeScreen, gameState, saveGame } = useGame();

  const hasProgress = gameState.player.fragments.length > 0 || gameState.player.level > 1;

  const startNewGame = () => {
    changeScreen('library');
  };

  const continueGame = () => {
    if (hasProgress) {
      changeScreen('library');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-900 via-amber-800 to-amber-950 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        {/* Title */}
        <div className="text-center mb-12 animate-fade-in">
          <h1 className="text-6xl font-bold text-amber-100 mb-4 pixel-art tracking-wider drop-shadow-lg">
            OS FRAGMENTOS DE
          </h1>
          <h2 className="text-7xl font-bold text-amber-300 pixel-art tracking-wide drop-shadow-2xl glow-text">
            ALEXANDRIA
          </h2>
          <p className="text-amber-200 text-xl mt-6 italic">
            Uma jornada pela sabedoria perdida
          </p>
        </div>

        {/* Menu Options */}
        <div className="space-y-4 max-w-md mx-auto">
          <button
            onClick={startNewGame}
            className="w-full bg-amber-600 hover:bg-amber-500 text-amber-950 font-bold py-4 px-8 rounded-lg text-xl transition-all transform hover:scale-105 hover:shadow-2xl border-4 border-amber-700 pixel-border"
          >
            ⚔️ NOVO JOGO
          </button>

          {hasProgress && (
            <button
              onClick={continueGame}
              className="w-full bg-blue-600 hover:bg-blue-500 text-blue-50 font-bold py-4 px-8 rounded-lg text-xl transition-all transform hover:scale-105 hover:shadow-2xl border-4 border-blue-700 pixel-border"
            >
              📖 CONTINUAR
            </button>
          )}

          <div className="mt-8 p-6 bg-amber-950 bg-opacity-50 rounded-lg border-2 border-amber-700">
            <h3 className="text-amber-300 font-bold text-lg mb-2">📜 SOBRE O JOGO</h3>
            <p className="text-amber-100 text-sm leading-relaxed">
              Explore a lendária Biblioteca de Alexandria e recupere os três Fragmentos do Conhecimento. 
              Enfrente manifestações do esquecimento em batalhas por turnos e torne-se o Deus da Sabedoria.
            </p>
          </div>
        </div>

        {/* Stats Display */}
        {hasProgress && (
          <div className="mt-8 text-center">
            <div className="inline-block bg-amber-950 bg-opacity-70 px-6 py-3 rounded-lg border-2 border-amber-600">
              <p className="text-amber-300">
                <span className="font-bold">Nível:</span> {gameState.player.level} | 
                <span className="font-bold"> Fragmentos:</span> {gameState.player.fragments.length}/3
              </p>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-12 text-center text-amber-400 text-sm opacity-70">
          <p>⚡ Criado com Emergent AI ⚡</p>
        </div>
      </div>
    </div>
  );
};

export default MainMenu;
