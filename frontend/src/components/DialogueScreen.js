import React, { useState, useEffect } from 'react';
import { useGame } from '../context/GameContext';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const DialogueScreen = () => {
  const { gameState, changeScreen, startBattle } = useGame();
  const [dialogue, setDialogue] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState(0);

  const phaseData = {
    health: {
      title: 'O Labirinto da Saúde',
      emoji: '🩺',
      color: 'from-red-900 to-red-800',
      enemies: [
        { type: 'Vírus Simbólico', emoji: '🦠', isBoss: false, xp: 30 },
        { type: 'Bactéria Caótica', emoji: '🧬', isBoss: false, xp: 35 },
        { type: 'Echo do Esquecimento - Doença', emoji: '💀', isBoss: true, xp: 100 }
      ]
    },
    programming: {
      title: 'O Reino Digital',
      emoji: '💻',
      color: 'from-blue-900 to-blue-800',
      enemies: [
        { type: 'Bug Vivo', emoji: '🐛', isBoss: false, xp: 35 },
        { type: 'Algoritmo Corrompido', emoji: '⚙️', isBoss: false, xp: 40 },
        { type: 'Echo do Esquecimento - Corrupção', emoji: '🌀', isBoss: true, xp: 120 }
      ]
    },
    art: {
      title: 'O Mundo das Cores',
      emoji: '🎨',
      color: 'from-purple-900 to-purple-800',
      enemies: [
        { type: 'Sombra de Artista Esquecido', emoji: '👤', isBoss: false, xp: 40 },
        { type: 'Pincelada Destrutiva', emoji: '🖌️', isBoss: false, xp: 45 },
        { type: 'Echo do Esquecimento - Vaidade', emoji: '🎭', isBoss: true, xp: 150 }
      ]
    }
  };

  const currentPhase = phaseData[gameState.currentPhase];
  const currentEnemy = currentPhase?.enemies[currentStep];

  useEffect(() => {
    if (currentPhase && currentStep === 0) {
      fetchIntroDialogue();
    }
  }, [gameState.currentPhase]);

  const fetchIntroDialogue = async () => {
    setIsLoading(true);
    try {
      const response = await axios.post(`${API}/generate/dialogue`, {
        context: `O jogador acabou de entrar na fase "${currentPhase.title}". Dê as boas-vindas e explique o desafio que o aguarda.`,
        character_name: 'Guardiã da Biblioteca',
        phase: currentPhase.title
      });
      setDialogue(response.data.dialogue);
    } catch (error) {
      console.error('Error fetching dialogue:', error);
      setDialogue(`Bem-vindo ao ${currentPhase.title}. Prepare-se para enfrentar as manifestações do esquecimento.`);
    }
    setIsLoading(false);
  };

  const fetchEnemyData = async (enemyType) => {
    try {
      const response = await axios.post(`${API}/generate/enemy`, {
        enemy_type: enemyType,
        phase: gameState.currentPhase
      });
      return {
        ...currentEnemy,
        ...response.data,
        emoji: currentEnemy.emoji
      };
    } catch (error) {
      console.error('Error fetching enemy:', error);
      return {
        ...currentEnemy,
        name: enemyType,
        description: 'Um inimigo formidável',
        hp: currentEnemy.isBoss ? 100 : 35,
        attack: currentEnemy.isBoss ? 15 : 8,
        defense: currentEnemy.isBoss ? 10 : 5
      };
    }
  };

  const handleContinue = async () => {
    if (currentEnemy) {
      // Fetch enemy data and start battle
      setIsLoading(true);
      const enemyData = await fetchEnemyData(currentEnemy.type);
      setIsLoading(false);
      startBattle(enemyData);
    }
  };

  const handleSkip = () => {
    changeScreen('library');
  };

  if (!currentPhase) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-amber-900 to-amber-950 flex items-center justify-center">
        <div className="text-amber-100 text-xl">Carregando...</div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gradient-to-b ${currentPhase.color} p-4 flex items-center justify-center`}>
      <div className="max-w-4xl w-full">
        {/* Title */}
        <div className="text-center mb-8">
          <div className="text-7xl mb-4">{currentPhase.emoji}</div>
          <h1 className="text-4xl font-bold text-white pixel-art glow-text mb-2">
            {currentPhase.title}
          </h1>
        </div>

        {/* Dialogue Box */}
        <div className="bg-amber-950 bg-opacity-90 p-8 rounded-lg border-4 border-amber-700 shadow-2xl mb-6">
          {isLoading ? (
            <div className="text-center">
              <div className="animate-pulse text-amber-300 text-xl">
                ✨ Carregando... ✨
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-start gap-4 mb-6">
                <div className="text-4xl">👤</div>
                <div>
                  <h3 className="text-amber-300 font-bold text-xl mb-2">
                    Guardiã da Biblioteca
                  </h3>
                  <p className="text-amber-100 text-lg leading-relaxed">
                    {dialogue}
                  </p>
                </div>
              </div>

              {currentEnemy && (
                <div className="mt-6 pt-6 border-t-2 border-amber-700">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="text-5xl">{currentEnemy.emoji}</div>
                    <div>
                      <h4 className="text-red-400 font-bold text-lg">
                        Próximo Desafio
                      </h4>
                      <p className="text-amber-200">
                        {currentEnemy.type}
                      </p>
                      {currentEnemy.isBoss && (
                        <span className="inline-block bg-red-600 text-white px-3 py-1 rounded-full text-xs font-bold mt-1">
                          ⚡ BOSS
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center gap-4">
          {!isLoading && (
            <>
              <button
                onClick={handleContinue}
                className="bg-red-600 hover:bg-red-500 text-white font-bold py-4 px-8 rounded-lg text-xl transition-all transform hover:scale-105 border-2 border-red-700"
              >
                ⚔️ Iniciar Batalha
              </button>
              <button
                onClick={handleSkip}
                className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-4 px-8 rounded-lg text-xl transition-all transform hover:scale-105"
              >
                ← Voltar
              </button>
            </>
          )}
        </div>

        {/* Phase Info */}
        <div className="mt-8 text-center">
          <div className="inline-block bg-black bg-opacity-50 px-6 py-3 rounded-lg">
            <p className="text-amber-300 text-sm">
              Inimigos restantes: {currentPhase.enemies.length}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DialogueScreen;
