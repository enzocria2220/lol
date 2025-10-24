import React from 'react';
import { useGame } from '../context/GameContext';

const Library = () => {
  const { gameState, startPhase, changeScreen, saveGame } = useGame();

  const paintings = [
    {
      id: 'health',
      name: 'A Pintura da Saúde',
      emoji: '🩺',
      description: 'Um pergaminho antigo revela conhecimentos sobre o corpo e a mente',
      color: 'from-red-900 to-red-700',
      borderColor: 'border-red-600',
      unlocked: true
    },
    {
      id: 'programming',
      name: 'A Pintura da Programação',
      emoji: '💻',
      description: 'Runas digitais e códigos antigos se entrelaçam',
      color: 'from-blue-900 to-blue-700',
      borderColor: 'border-blue-600',
      unlocked: gameState.player.fragments.some(f => f.id === 'health')
    },
    {
      id: 'art',
      name: 'A Pintura da Arte',
      emoji: '🎨',
      description: 'Cores vibrantes que criam e destroem realidades',
      color: 'from-purple-900 to-purple-700',
      borderColor: 'border-purple-600',
      unlocked: gameState.player.fragments.some(f => f.id === 'programming')
    }
  ];

  const handlePaintingClick = (painting) => {
    if (painting.unlocked) {
      // Check if already has fragment
      const hasFragment = gameState.player.fragments.some(f => f.id === painting.id);
      if (hasFragment) {
        alert(`Você já possui o ${painting.name.replace('A Pintura da', 'Fragmento da')}!`);
        return;
      }
      
      saveGame();
      startPhase(painting.id);
    }
  };

  const handleSaveGame = () => {
    saveGame();
    alert('Jogo salvo com sucesso!');
  };

  const handleMainMenu = () => {
    saveGame();
    changeScreen('menu');
  };

  // Check if player has all fragments
  const hasAllFragments = gameState.player.fragments.length === 3;

  if (hasAllFragments) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-amber-900 via-yellow-800 to-amber-950 flex items-center justify-center p-4">
        <div className="max-w-4xl w-full text-center">
          <div className="animate-pulse-slow">
            <h1 className="text-6xl font-bold text-yellow-300 mb-8 glow-text">
              ⚡ ASCENSÃO DIVINA ⚡
            </h1>
            <div className="bg-amber-950 bg-opacity-80 p-12 rounded-lg border-4 border-yellow-500 mb-8">
              <p className="text-amber-100 text-2xl mb-6 leading-relaxed">
                Você reuniu os três Fragmentos do Conhecimento!
              </p>
              <p className="text-amber-200 text-xl mb-8">
                A Biblioteca de Alexandria resplandece em todo o seu esplendor. 
                Você ascendeu e se tornou o <span className="text-yellow-400 font-bold">Deus da Sabedoria</span>!
              </p>
              <div className="flex justify-center gap-4 text-5xl mb-8">
                <span>🩺</span>
                <span>💻</span>
                <span>🎨</span>
              </div>
              <p className="text-amber-300 text-lg italic">
                "O verdadeiro conhecimento é reconhecer a extensão da própria ignorância."
              </p>
            </div>
            <button
              onClick={handleMainMenu}
              className="bg-yellow-600 hover:bg-yellow-500 text-yellow-950 font-bold py-4 px-8 rounded-lg text-xl transition-all transform hover:scale-105"
            >
              ← Voltar ao Menu
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-900 via-amber-800 to-amber-950 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 pt-8">
          <h1 className="text-5xl font-bold text-amber-300 mb-4 pixel-art glow-text">
            📚 BIBLIOTECA DE ALEXANDRIA 📚
          </h1>
          <p className="text-amber-200 text-lg">
            Escolha uma pintura para iniciar sua jornada
          </p>
        </div>

        {/* Player Stats */}
        <div className="bg-amber-950 bg-opacity-70 p-4 rounded-lg border-2 border-amber-600 mb-8">
          <div className="flex justify-between items-center flex-wrap gap-4">
            <div>
              <span className="text-amber-300 font-bold">❤️ HP:</span>{' '}
              <span className="text-amber-100">{gameState.player.hp}/{gameState.player.maxHp}</span>
            </div>
            <div>
              <span className="text-amber-300 font-bold">⭐ Nível:</span>{' '}
              <span className="text-amber-100">{gameState.player.level}</span>
            </div>
            <div>
              <span className="text-amber-300 font-bold">📊 XP:</span>{' '}
              <span className="text-amber-100">{gameState.player.xp}/{gameState.player.xpToNextLevel}</span>
            </div>
            <div>
              <span className="text-amber-300 font-bold">✨ Fragmentos:</span>{' '}
              <span className="text-amber-100">{gameState.player.fragments.length}/3</span>
            </div>
          </div>
        </div>

        {/* Paintings Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {paintings.map((painting) => {
            const hasFragment = gameState.player.fragments.some(f => f.id === painting.id);
            
            return (
              <div
                key={painting.id}
                onClick={() => handlePaintingClick(painting)}
                className={`
                  relative cursor-pointer transition-all transform hover:scale-105 
                  ${painting.unlocked ? 'opacity-100' : 'opacity-50 cursor-not-allowed'}
                `}
              >
                <div className={`
                  bg-gradient-to-br ${painting.color} p-8 rounded-lg 
                  border-4 ${painting.borderColor} shadow-2xl h-full
                  flex flex-col items-center justify-center text-center
                  ${painting.unlocked && !hasFragment ? 'hover:shadow-yellow-500/50' : ''}
                `}>
                  <div className="text-8xl mb-4">{painting.emoji}</div>
                  <h3 className="text-2xl font-bold text-white mb-3 pixel-art">
                    {painting.name}
                  </h3>
                  <p className="text-gray-200 text-sm mb-4">
                    {painting.description}
                  </p>
                  
                  {hasFragment && (
                    <div className="absolute top-4 right-4 bg-yellow-500 text-yellow-950 px-3 py-1 rounded-full font-bold text-sm">
                      ✓ Completo
                    </div>
                  )}
                  
                  {!painting.unlocked && (
                    <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center rounded-lg">
                      <div className="text-center">
                        <div className="text-4xl mb-2">🔒</div>
                        <p className="text-gray-300 font-bold">Bloqueado</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center gap-4 flex-wrap">
          <button
            onClick={handleSaveGame}
            className="bg-green-600 hover:bg-green-500 text-white font-bold py-3 px-6 rounded-lg transition-all transform hover:scale-105"
          >
            💾 Salvar Jogo
          </button>
          <button
            onClick={handleMainMenu}
            className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-3 px-6 rounded-lg transition-all transform hover:scale-105"
          >
            ← Menu Principal
          </button>
        </div>

        {/* Guardian Quote */}
        <div className="mt-8 text-center bg-amber-950 bg-opacity-50 p-6 rounded-lg border-2 border-amber-700">
          <p className="text-amber-300 italic text-lg">
            "A sabedoria começa na maravilha." - Sócrates
          </p>
        </div>
      </div>
    </div>
  );
};

export default Library;
