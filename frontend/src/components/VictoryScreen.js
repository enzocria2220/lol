import React from 'react';
import { useGame } from '../context/GameContext';

const VictoryScreen = () => {
  const { gameState, changeScreen, saveGame } = useGame();

  const phaseNames = {
    health: 'Saúde',
    programming: 'Programação',
    art: 'Arte'
  };

  const phaseName = phaseNames[gameState.currentPhase] || 'Desconhecido';

  const handleContinue = () => {
    saveGame();
    
    // Check if all fragments collected
    if (gameState.player.fragments.length >= 3) {
      // Show final victory
      changeScreen('finalvictory');
    } else {
      changeScreen('library');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-yellow-900 via-yellow-800 to-amber-950 flex items-center justify-center p-4">
      <div className="max-w-3xl w-full text-center">
        {/* Victory Animation */}
        <div className="animate-bounce-slow mb-8">
          <div className="text-9xl mb-4">🏆</div>
          <h1 className="text-6xl font-bold text-yellow-300 mb-4 pixel-art glow-text animate-pulse">
            VITÓRIA!
          </h1>
        </div>

        {/* Victory Message */}
        <div className="bg-amber-950 bg-opacity-90 p-8 rounded-lg border-4 border-yellow-600 shadow-2xl mb-8">
          <p className="text-amber-100 text-2xl mb-6">
            Você derrotou o Echo do Esquecimento!
          </p>
          
          {/* Fragment Obtained */}
          <div className="bg-yellow-900 bg-opacity-50 p-6 rounded-lg border-2 border-yellow-500 mb-6">
            <div className="text-6xl mb-4">
              {gameState.currentPhase === 'health' ? '🩺' : 
               gameState.currentPhase === 'programming' ? '💻' : '🎨'}
            </div>
            <h3 className="text-yellow-300 font-bold text-2xl mb-2">
              Fragmento da {phaseName} Obtido!
            </h3>
            <p className="text-amber-200">
              Você recuperou um dos fragmentos perdidos do conhecimento
            </p>
          </div>

          {/* Rewards */}
          <div className="space-y-3 mb-6">
            <p className="text-amber-100 text-lg">
              ⭐ Nível: <span className="font-bold text-yellow-300">{gameState.player.level}</span>
            </p>
            <p className="text-amber-100 text-lg">
              ✨ Fragmentos: <span className="font-bold text-yellow-300">{gameState.player.fragments.length}/3</span>
            </p>
            <p className="text-amber-100 text-lg">
              ❤️ HP: <span className="font-bold text-green-400">{gameState.player.hp}/{gameState.player.maxHp}</span>
            </p>
          </div>

          {/* Quote */}
          <div className="border-t-2 border-amber-700 pt-6">
            <p className="text-amber-300 italic text-lg">
              "A sabedoria é a única riqueza que não pode ser roubada."
            </p>
          </div>
        </div>

        {/* Continue Button */}
        <button
          onClick={handleContinue}
          className="bg-yellow-600 hover:bg-yellow-500 text-yellow-950 font-bold py-4 px-12 rounded-lg text-2xl transition-all transform hover:scale-110 border-4 border-yellow-700 shadow-2xl"
        >
          Continuar Jornada →
        </button>

        {/* Progress Indicator */}
        {gameState.player.fragments.length < 3 && (
          <div className="mt-8">
            <p className="text-amber-400 text-sm">
              Ainda faltam {3 - gameState.player.fragments.length} fragmento(s) para completar sua jornada
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default VictoryScreen;
