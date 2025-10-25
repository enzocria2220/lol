import React, { useState, useEffect } from 'react';
import { useGame } from '../context/GameContext';

const BattleScreen = () => {
  const { 
    gameState, 
    updateBattleState, 
    addToBattleLog, 
    endBattle,
    healPlayer,
    takeDamage 
  } = useGame();

  const [selectedAbility, setSelectedAbility] = useState(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

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

  // Show menu on player turn
  useEffect(() => {
    if (turn === 'player' && !isAnimating) {
      setTimeout(() => setShowMenu(true), 500);
    } else {
      setShowMenu(false);
    }
  }, [turn, isAnimating]);

  const executePlayerAction = (ability) => {
    if (turn !== 'player' || isAnimating) return;

    setShowMenu(false);
    setIsAnimating(true);
    setSelectedAbility(ability.id);

    let newEnemyHp = enemyHp;
    let newPlayerHp = playerHp;
    let message = '';

    if (ability.type === 'attack') {
      const baseDamage = ability.damage;
      const randomFactor = Math.floor(Math.random() * 5) - 2;
      const totalDamage = Math.max(1, baseDamage + randomFactor - Math.floor(currentEnemy.defense / 2));
      
      newEnemyHp = Math.max(0, enemyHp - totalDamage);
      message = `${player.name} usou ${ability.name}! Causou ${totalDamage} de dano!`;
      
    } else if (ability.type === 'heal') {
      const healAmount = ability.damage;
      const actualHeal = Math.min(healAmount, player.maxHp - playerHp);
      newPlayerHp = Math.min(player.maxHp, playerHp + healAmount);
      message = `${player.name} usou ${ability.name}! Recuperou ${actualHeal} HP!`;
      healPlayer(actualHeal);
      
    } else if (ability.type === 'buff') {
      message = `${player.name} usou ${ability.name}!`;
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

    const baseDamage = currentEnemy.attack;
    const randomFactor = Math.floor(Math.random() * 6) - 3;
    const totalDamage = Math.max(1, baseDamage + randomFactor);
    
    const newPlayerHp = Math.max(0, playerHp - totalDamage);
    
    const message = `${currentEnemy.name} atacou! Causou ${totalDamage} de dano!`;
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
  
  const getHpColor = (percent) => {
    if (percent > 50) return 'from-green-500 to-green-600';
    if (percent > 25) return 'from-yellow-500 to-yellow-600';
    return 'from-red-500 to-red-600';
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-800 to-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        {/* Battle Arena - Pokemon Style */}
        <div className="bg-white rounded-lg border-8 border-gray-800 overflow-hidden" style={{ aspectRatio: '16/10' }}>
          
          {/* Top Section - Enemy */}
          <div className="h-1/2 bg-gradient-to-b from-green-200 to-green-300 relative p-6 flex items-start justify-between">
            {/* Enemy Info Box */}
            <div className="bg-white border-4 border-gray-800 rounded-lg p-3 shadow-lg min-w-[200px]">
              <div className="text-lg font-bold text-gray-800 mb-1">{currentEnemy.name}</div>
              <div className="text-xs text-gray-600 mb-2">Nível {player.level + Math.floor(Math.random() * 3)}</div>
              <div className="bg-gray-300 h-2 rounded-full overflow-hidden border border-gray-600">
                <div 
                  className={`h-full bg-gradient-to-r ${getHpColor(enemyHpPercent)} transition-all duration-500`}
                  style={{ width: `${enemyHpPercent}%` }}
                />
              </div>
              <div className="text-xs text-right mt-1 text-gray-700">{enemyHp}/{currentEnemy.hp} HP</div>
            </div>
            
            {/* Enemy Sprite */}
            <div className={`absolute right-12 bottom-8 transition-all duration-300 ${isAnimating && turn === 'enemy' ? 'animate-shake' : ''}`}>
              <div className="text-8xl filter drop-shadow-2xl">
                {currentEnemy.emoji || '👹'}
              </div>
            </div>
          </div>
          
          {/* Bottom Section - Player */}
          <div className="h-1/2 bg-gradient-to-b from-amber-100 to-amber-200 relative p-6 flex items-end justify-between">
            {/* Player Sprite */}
            <div className={`absolute left-12 bottom-8 transition-all duration-300 ${isAnimating && turn === 'player' ? 'animate-bounce' : ''}`}>
              <div className="text-8xl filter drop-shadow-2xl">
                ⚔️
              </div>
            </div>
            
            {/* Player Info Box */}
            <div className="bg-white border-4 border-gray-800 rounded-lg p-3 shadow-lg min-w-[200px] ml-auto">
              <div className="text-lg font-bold text-gray-800 mb-1">{player.name}</div>
              <div className="text-xs text-gray-600 mb-2">Nível {player.level}</div>
              <div className="bg-gray-300 h-2 rounded-full overflow-hidden border border-gray-600">
                <div 
                  className={`h-full bg-gradient-to-r ${getHpColor(playerHpPercent)} transition-all duration-500`}
                  style={{ width: `${playerHpPercent}%` }}
                />
              </div>
              <div className="text-xs text-right mt-1 text-gray-700">{playerHp}/{player.maxHp} HP</div>
            </div>
          </div>
        </div>
        
        {/* Battle UI - Pokemon Style */}
        <div className="mt-4 bg-white rounded-lg border-8 border-gray-800 p-4">
          {!showMenu ? (
            /* Battle Log */
            <div className="min-h-[120px] bg-gray-100 rounded p-4 border-2 border-gray-300">
              <div className="space-y-2">
                {log.slice(-3).map((entry, index) => (
                  <p key={index} className="text-gray-800 text-lg">
                    {entry}
                  </p>
                ))}
              </div>
            </div>
          ) : (
            /* Attack Menu */}
            <div className="min-h-[120px]">
              <div className="grid grid-cols-2 gap-3">
                {player.abilities.map((ability) => (
                  <button
                    key={ability.id}
                    onClick={() => executePlayerAction(ability)}
                    disabled={isAnimating}
                    className={`
                      p-4 rounded-lg border-4 font-bold text-left transition-all transform hover:scale-105
                      ${ability.type === 'attack' ? 'bg-red-500 border-red-700 text-white hover:bg-red-600' : ''}
                      ${ability.type === 'heal' ? 'bg-green-500 border-green-700 text-white hover:bg-green-600' : ''}
                      ${ability.type === 'buff' ? 'bg-blue-500 border-blue-700 text-white hover:bg-blue-600' : ''}
                      ${isAnimating ? 'opacity-50 cursor-not-allowed' : ''}
                    `}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-lg">{ability.name}</span>
                      <span className="text-2xl">
                        {ability.type === 'attack' ? '⚔️' : ability.type === 'heal' ? '💚' : '✨'}
                      </span>
                    </div>
                    <div className="text-xs opacity-90">{ability.description}</div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BattleScreen;
