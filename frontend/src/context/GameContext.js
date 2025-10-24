import React, { createContext, useContext, useState, useEffect } from 'react';

const GameContext = createContext();

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within GameProvider');
  }
  return context;
};

export const GameProvider = ({ children }) => {
  const [gameState, setGameState] = useState({
    player: {
      name: 'O Aprendiz',
      hp: 100,
      maxHp: 100,
      level: 1,
      xp: 0,
      xpToNextLevel: 100,
      wisdom: 0,
      abilities: [
        { id: 'logic', name: 'Lógica', type: 'attack', damage: 15, description: 'Ataque baseado em razão' },
        { id: 'inspiration', name: 'Inspiração', type: 'buff', damage: 10, description: 'Fortalece temporariamente' },
        { id: 'cure', name: 'Cura', type: 'heal', damage: 20, description: 'Restaura pontos de vida' }
      ],
      fragments: []
    },
    currentPhase: null, // 'health', 'programming', 'art'
    currentScreen: 'menu', // 'menu', 'library', 'battle', 'dialogue', 'victory'
    currentEnemy: null,
    battleState: {
      turn: 'player', // 'player' or 'enemy'
      playerHp: 100,
      enemyHp: 100,
      log: []
    },
    dialogueState: {
      speaker: '',
      text: '',
      options: []
    }
  });

  // Load game from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('alexandriaGame');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setGameState(prev => ({ ...prev, ...parsed }));
      } catch (e) {
        console.error('Error loading game:', e);
      }
    }
  }, []);

  // Save game to localStorage
  const saveGame = () => {
    localStorage.setItem('alexandriaGame', JSON.stringify(gameState));
  };

  // Update player stats
  const updatePlayer = (updates) => {
    setGameState(prev => ({
      ...prev,
      player: { ...prev.player, ...updates }
    }));
  };

  // Heal player
  const healPlayer = (amount) => {
    setGameState(prev => ({
      ...prev,
      player: {
        ...prev.player,
        hp: Math.min(prev.player.hp + amount, prev.player.maxHp)
      }
    }));
  };

  // Take damage
  const takeDamage = (amount) => {
    setGameState(prev => ({
      ...prev,
      player: {
        ...prev.player,
        hp: Math.max(prev.player.hp - amount, 0)
      }
    }));
  };

  // Gain XP
  const gainXP = (amount) => {
    setGameState(prev => {
      const newXp = prev.player.xp + amount;
      let newLevel = prev.player.level;
      let newXpToNext = prev.player.xpToNextLevel;
      let newMaxHp = prev.player.maxHp;

      // Level up logic
      if (newXp >= prev.player.xpToNextLevel) {
        newLevel++;
        newXpToNext = newLevel * 100;
        newMaxHp = 100 + (newLevel * 20);
      }

      return {
        ...prev,
        player: {
          ...prev.player,
          xp: newXp,
          level: newLevel,
          xpToNextLevel: newXpToNext,
          maxHp: newMaxHp,
          hp: Math.min(prev.player.hp, newMaxHp)
        }
      };
    });
  };

  // Change screen
  const changeScreen = (screen) => {
    setGameState(prev => ({ ...prev, currentScreen: screen }));
  };

  // Start phase
  const startPhase = (phase) => {
    setGameState(prev => ({ ...prev, currentPhase: phase, currentScreen: 'dialogue' }));
  };

  // Start battle
  const startBattle = (enemy) => {
    setGameState(prev => ({
      ...prev,
      currentEnemy: enemy,
      currentScreen: 'battle',
      battleState: {
        turn: 'player',
        playerHp: prev.player.hp,
        enemyHp: enemy.hp,
        log: [`Batalha iniciada contra ${enemy.name}!`]
      }
    }));
  };

  // Add to battle log
  const addToBattleLog = (message) => {
    setGameState(prev => ({
      ...prev,
      battleState: {
        ...prev.battleState,
        log: [...prev.battleState.log, message]
      }
    }));
  };

  // Update battle state
  const updateBattleState = (updates) => {
    setGameState(prev => ({
      ...prev,
      battleState: { ...prev.battleState, ...updates }
    }));
  };

  // End battle
  const endBattle = (won) => {
    if (won) {
      const xpGain = gameState.currentEnemy?.xp || 50;
      gainXP(xpGain);
      
      // Check if boss defeated
      if (gameState.currentEnemy?.isBoss) {
        const fragment = {
          id: gameState.currentPhase,
          name: `Fragmento da ${gameState.currentPhase === 'health' ? 'Saúde' : gameState.currentPhase === 'programming' ? 'Programação' : 'Arte'}`,
          obtained: true
        };
        
        setGameState(prev => ({
          ...prev,
          player: {
            ...prev.player,
            fragments: [...prev.player.fragments, fragment]
          },
          currentScreen: 'victory'
        }));
      } else {
        changeScreen('library');
      }
    } else {
      // Game over
      changeScreen('gameover');
    }
  };

  // Show dialogue
  const showDialogue = (speaker, text, options = []) => {
    setGameState(prev => ({
      ...prev,
      currentScreen: 'dialogue',
      dialogueState: { speaker, text, options }
    }));
  };

  // Add fragment
  const addFragment = (fragmentId) => {
    const fragmentNames = {
      health: 'Fragmento da Saúde',
      programming: 'Fragmento da Programação',
      art: 'Fragmento da Arte'
    };

    setGameState(prev => ({
      ...prev,
      player: {
        ...prev.player,
        fragments: [...prev.player.fragments, {
          id: fragmentId,
          name: fragmentNames[fragmentId],
          obtained: true
        }]
      }
    }));
  };

  const value = {
    gameState,
    setGameState,
    updatePlayer,
    healPlayer,
    takeDamage,
    gainXP,
    changeScreen,
    startPhase,
    startBattle,
    addToBattleLog,
    updateBattleState,
    endBattle,
    showDialogue,
    addFragment,
    saveGame
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
};
