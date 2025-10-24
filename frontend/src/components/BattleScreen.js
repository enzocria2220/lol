import React, { useState, useEffect } from 'react';
import { useGame } from '../context/GameContext';

const BattleScreen = () => {
  const { 
    gameState, 
    updateBattleState, 
    addToBattleLog, 
    endBattle,
    updatePlayer,
    healPlayer,
    takeDamage 
  } = useGame();

  const [selectedAbility, setSelectedAbility] = useState(null);
  const [isAnimating, setIsAnimating] = useState(false);

  const { battleState, player, currentEnemy } = gameState;
  const { turn, playerHp, enemyHp, log } = battleState;

  // Enemy AI turn
  useEffect(() => {
    if (turn === 'enemy' && enemyHp > 0 && playerHp > 0 && !isAnimating) {
      setTimeout(() => {
        executeEnemyTurn();
      }, 1500);
    }
  }, [turn, enemyHp, playerHp]);

  // Check battle end
  useEffect(() => {
    if (enemyHp <= 0) {
      setTimeout(() => {
        endBattle(true);
      }, 1500);
    } else if (playerHp <= 0) {
      setTimeout(() => {
        endBattle(false);
      }, 1500);
    }
  }, [enemyHp, playerHp]);

  const executePlayerAction = (ability) => {
    if (turn !== 'player' || isAnimating) return;

    setIsAnimating(true);
    setSelectedAbility(ability.id);

    let newEnemyHp = enemyHp;
    let newPlayerHp = playerHp;
    let message = '';

    if (ability.type === 'attack') {
      // Calculate damage
      const baseDamage = ability.damage;
      const randomFactor = Math.floor(Math.random() * 5) - 2; // -2 to +2
      const totalDamage = Math.max(1, baseDamage + randomFactor - Math.floor(currentEnemy.defense / 2));
      
      newEnemyHp = Math.max(0, enemyHp - totalDamage);
      message = `⚔️ Você usou ${ability.name}! Causou ${totalDamage} de dano!`;
      
    } else if (ability.type === 'heal') {
      // Heal
      const healAmount = ability.damage;
      const actualHeal = Math.min(healAmount, player.maxHp - playerHp);
      newPlayerHp = Math.min(player.maxHp, playerHp + healAmount);
      message = `💚 Você usou ${ability.name}! Recuperou ${actualHeal} HP!`;
      healPlayer(actualHeal);
      
    } else if (ability.type === 'buff') {
      // Buff (increases next attack)
      message = `✨ Você usou ${ability.name}! Preparando um ataque poderoso!`;
      // In a more complex system, this would set a buff flag
    }

    addToBattleLog(message);
    updateBattleState({ enemyHp: newEnemyHp, playerHp: newPlayerHp });

    setTimeout(() => {
      if (newEnemyHp > 0) {
        updateBattleState({ turn: 'enemy' });
      }
      setIsAnimating(false);
      setSelectedAbility(null);
    }, 1000);
  };

  const executeEnemyTurn = () => {
    setIsAnimating(true);

    // Enemy attacks
    const baseDamage = currentEnemy.attack;
    const randomFactor = Math.floor(Math.random() * 6) - 3;
    const totalDamage = Math.max(1, baseDamage + randomFactor);
    
    const newPlayerHp = Math.max(0, playerHp - totalDamage);
    
    const message = `👹 ${currentEnemy.name} atacou! Causou ${totalDamage} de dano!`;
    addToBattleLog(message);
    updateBattleState({ playerHp: newPlayerHp });
    takeDamage(totalDamage);

    setTimeout(() => {
      if (newPlayerHp > 0) {
        updateBattleState({ turn: 'player' });
      }
      setIsAnimating(false);
    }, 1000);
  };

  const playerHpPercent = (playerHp / player.maxHp) * 100;
  const enemyHpPercent = (enemyHp / currentEnemy.hp) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-b from-red-950 via-red-900 to-red-950 p-4 flex flex-col">
      {/* Battle Arena */}
      <div className="flex-1 max-w-7xl mx-auto w-full flex flex-col">
        
        {/* Enemy Section */}
        <div className="flex-1 flex flex-col justify-center items-center mb-8">
          <div className="text-center mb-4">
            <h2 className="text-3xl font-bold text-red-100 pixel-art mb-2">
              {currentEnemy.name}
            </h2>
            <p className="text-red-300 text-sm max-w-md mx-auto">
              {currentEnemy.description}
            </p>
          </div>

          {/* Enemy Sprite */}
          <div className={`
            relative mb-4 transition-all duration-300
            ${turn === 'enemy' && isAnimating ? 'animate-shake' : ''}
          `}>
            <div className="text-9xl filter drop-shadow-2xl">
              {currentEnemy.emoji || '👹'}
            </div>
            {turn === 'enemy' && !isAnimating && (
              <div className="absolute -top-4 -right-4 bg-red-500 text-white px-3 py-1 rounded-full animate-pulse text-sm font-bold">
                ⚡ Turno
              </div>
            )}
          </div>

          {/* Enemy HP Bar */}
          <div className="w-full max-w-md">
            <div className="flex justify-between text-red-100 text-sm mb-1">
              <span>HP Inimigo</span>
              <span>{enemyHp}/{currentEnemy.hp}</span>
            </div>
            <div className="w-full bg-red-950 h-6 rounded-full border-2 border-red-600 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-red-600 to-red-400 h-full transition-all duration-500 flex items-center justify-center text-xs font-bold text-white"
                style={{ width: `${enemyHpPercent}%` }}
              >
                {enemyHp > 0 && `${Math.round(enemyHpPercent)}%`}
              </div>
            </div>
          </div>
        </div>

        {/* Battle Log */}
        <div className="bg-amber-950 bg-opacity-80 p-4 rounded-lg border-2 border-amber-700 mb-4 max-h-32 overflow-y-auto">
          <div className="space-y-1">
            {log.slice(-4).map((entry, index) => (
              <p key={index} className="text-amber-100 text-sm">
                {entry}
              </p>
            ))}
          </div>
        </div>

        {/* Player Section */}
        <div className="bg-amber-900 bg-opacity-50 p-6 rounded-lg border-2 border-amber-600">
          {/* Player Info */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className={`
                text-6xl transition-all duration-300
                ${turn === 'player' && isAnimating ? 'animate-bounce' : ''}
              `}>
                ⚔️
              </div>
              <div>
                <h3 className="text-2xl font-bold text-amber-100 pixel-art">
                  {player.name}
                </h3>
                <p className="text-amber-300 text-sm">Nível {player.level}</p>
              </div>
            </div>
            {turn === 'player' && !isAnimating && (
              <div className="bg-amber-500 text-amber-950 px-4 py-2 rounded-full animate-pulse font-bold">
                ⚡ SEU TURNO
              </div>
            )}
          </div>

          {/* Player HP Bar */}
          <div className="mb-4">
            <div className="flex justify-between text-amber-100 text-sm mb-1">
              <span>Seu HP</span>
              <span>{playerHp}/{player.maxHp}</span>
            </div>
            <div className="w-full bg-red-950 h-6 rounded-full border-2 border-amber-600 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-green-600 to-green-400 h-full transition-all duration-500 flex items-center justify-center text-xs font-bold text-white"
                style={{ width: `${playerHpPercent}%` }}
              >
                {playerHp > 0 && `${Math.round(playerHpPercent)}%`}
              </div>
            </div>
          </div>

          {/* Abilities */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {player.abilities.map((ability) => {
              const isDisabled = turn !== 'player' || isAnimating;
              const isSelected = selectedAbility === ability.id;

              return (
                <button
                  key={ability.id}
                  onClick={() => executePlayerAction(ability)}
                  disabled={isDisabled}
                  className={`
                    p-4 rounded-lg border-2 font-bold transition-all transform
                    ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105 cursor-pointer'}
                    ${isSelected ? 'ring-4 ring-yellow-400' : ''}
                    ${ability.type === 'attack' ? 'bg-red-700 border-red-600 text-red-100 hover:bg-red-600' : ''}
                    ${ability.type === 'heal' ? 'bg-green-700 border-green-600 text-green-100 hover:bg-green-600' : ''}
                    ${ability.type === 'buff' ? 'bg-blue-700 border-blue-600 text-blue-100 hover:bg-blue-600' : ''}
                  `}
                >
                  <div className="text-2xl mb-2">
                    {ability.type === 'attack' ? '⚔️' : ability.type === 'heal' ? '💚' : '✨'}
                  </div>
                  <div className="text-lg mb-1">{ability.name}</div>
                  <div className="text-xs opacity-80">{ability.description}</div>
                  <div className="text-sm mt-2 font-bold">
                    {ability.type === 'attack' ? `${ability.damage} DMG` : ability.type === 'heal' ? `${ability.damage} CURA` : `${ability.damage} BUFF`}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BattleScreen;
