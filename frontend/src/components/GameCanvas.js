import React, { useEffect, useRef, useState } from 'react';
import { useGame } from '../context/GameContext';

const TILE_SIZE = 48;
const MAP_WIDTH = 17;
const MAP_HEIGHT = 13;

const GameCanvas = () => {
  const canvasRef = useRef(null);
  const { gameState, startBattle } = useGame();
  const [playerPos, setPlayerPos] = useState({ x: 8, y: 10 });
  const [playerDirection, setPlayerDirection] = useState('down');
  const [isMoving, setIsMoving] = useState(false);
  const [stepCount, setStepCount] = useState(0);

  // Map data - 0: walkable, 1: wall, 2: grass/battle zone, 3: door/portal
  const map = [
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,2,2,2,2,2,2,2,2,2,2,2,2,2,0,1],
    [1,0,2,0,0,0,0,0,0,0,0,0,0,0,2,0,1],
    [1,0,2,0,0,0,0,0,0,0,0,0,0,0,2,0,1],
    [1,0,2,0,0,0,1,1,1,1,1,0,0,0,2,0,1],
    [1,0,2,0,0,0,1,3,3,3,1,0,0,0,2,0,1],
    [1,0,2,0,0,0,1,1,1,1,1,0,0,0,2,0,1],
    [1,0,2,0,0,0,0,0,0,0,0,0,0,0,2,0,1],
    [1,0,2,0,0,0,0,0,0,0,0,0,0,0,2,0,1],
    [1,0,2,2,2,2,2,2,2,2,2,2,2,2,2,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
  ];

  // Colors for tiles
  const getTileColor = (tile) => {
    switch(tile) {
      case 0: return '#d4a574'; // floor
      case 1: return '#8b4513'; // wall
      case 2: return '#c19a6b'; // battle zone (lighter)
      case 3: return '#b8860b'; // portal
      default: return '#d4a574';
    }
  };

  // Draw map
  const drawMap = (ctx) => {
    for (let y = 0; y < MAP_HEIGHT; y++) {
      for (let x = 0; x < MAP_WIDTH; x++) {
        const tile = map[y][x];
        ctx.fillStyle = getTileColor(tile);
        ctx.fillRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
        
        // Draw grid
        ctx.strokeStyle = '#00000020';
        ctx.strokeRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
        
        // Draw wall texture
        if (tile === 1) {
          ctx.fillStyle = '#6b3410';
          ctx.fillRect(x * TILE_SIZE + 4, y * TILE_SIZE + 4, TILE_SIZE - 8, TILE_SIZE - 8);
        }
        
        // Draw portal/door
        if (tile === 3) {
          ctx.fillStyle = '#ffd700';
          ctx.fillRect(x * TILE_SIZE + 12, y * TILE_SIZE + 8, TILE_SIZE - 24, TILE_SIZE - 16);
        }
      }
    }
  };

  // Draw player
  const drawPlayer = (ctx) => {
    const x = playerPos.x * TILE_SIZE;
    const y = playerPos.y * TILE_SIZE;
    
    // Player body
    ctx.fillStyle = '#ff6b6b';
    ctx.fillRect(x + 14, y + 20, 20, 24);
    
    // Player head
    ctx.fillStyle = '#ffd4a3';
    ctx.beginPath();
    ctx.arc(x + 24, y + 16, 10, 0, Math.PI * 2);
    ctx.fill();
    
    // Player features based on direction
    ctx.fillStyle = '#000';
    if (playerDirection === 'down' || playerDirection === 'up') {
      ctx.fillRect(x + 20, y + 14, 3, 3);
      ctx.fillRect(x + 25, y + 14, 3, 3);
    }
    
    // Weapon/staff
    ctx.fillStyle = '#8b7355';
    ctx.fillRect(x + 34, y + 18, 4, 20);
  };

  // Render game
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw everything
    drawMap(ctx);
    drawPlayer(ctx);
    
  }, [playerPos, playerDirection]);

  // Handle movement
  const movePlayer = (dx, dy, direction) => {
    if (isMoving) return;
    
    const newX = playerPos.x + dx;
    const newY = playerPos.y + dy;
    
    // Check boundaries and collisions
    if (newX < 0 || newX >= MAP_WIDTH || newY < 0 || newY >= MAP_HEIGHT) return;
    if (map[newY][newX] === 1) return; // wall
    
    setPlayerDirection(direction);
    setIsMoving(true);
    setPlayerPos({ x: newX, y: newY });
    
    // Check for battle
    if (map[newY][newX] === 2) {
      const newSteps = stepCount + 1;
      setStepCount(newSteps);
      
      // Random encounter (30% chance)
      if (Math.random() < 0.3 && newSteps > 2) {
        setTimeout(() => {
          triggerBattle();
        }, 300);
        setStepCount(0);
      }
    }
    
    setTimeout(() => setIsMoving(false), 150);
  };

  // Trigger battle
  const triggerBattle = async () => {
    const enemies = [
      { type: 'Vírus Simbólico', emoji: '🦠', hp: 35, attack: 8, defense: 5, xp: 30 },
      { type: 'Bactéria Caótica', emoji: '🧬', hp: 40, attack: 9, defense: 6, xp: 35 },
      { type: 'Espírito do Desequilíbrio', emoji: '👻', hp: 45, attack: 10, defense: 7, xp: 40 }
    ];
    
    const randomEnemy = enemies[Math.floor(Math.random() * enemies.length)];
    
    // Try to fetch AI description
    try {
      const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
      const response = await fetch(`${BACKEND_URL}/api/generate/enemy`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          enemy_type: randomEnemy.type,
          phase: 'health'
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        randomEnemy.name = data.name;
        randomEnemy.description = data.description;
        randomEnemy.hp = data.hp;
        randomEnemy.attack = data.attack;
        randomEnemy.defense = data.defense;
      }
    } catch (e) {
      console.log('Using fallback enemy data');
      randomEnemy.name = randomEnemy.type;
      randomEnemy.description = 'Uma manifestação do esquecimento';
    }
    
    startBattle(randomEnemy);
  };

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e) => {
      switch(e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          movePlayer(0, -1, 'up');
          e.preventDefault();
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          movePlayer(0, 1, 'down');
          e.preventDefault();
          break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
          movePlayer(-1, 0, 'left');
          e.preventDefault();
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          movePlayer(1, 0, 'right');
          e.preventDefault();
          break;
        default:
          break;
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [playerPos, isMoving, stepCount]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black p-4">
      <div className="mb-4">
        <div className="bg-amber-900 px-6 py-3 rounded-lg border-2 border-amber-600">
          <div className="flex gap-6 text-amber-100">
            <span>❤️ HP: {gameState.player.hp}/{gameState.player.maxHp}</span>
            <span>⭐ Nível: {gameState.player.level}</span>
            <span>✨ Fragmentos: {gameState.player.fragments.length}/3</span>
          </div>
        </div>
      </div>
      
      <canvas
        ref={canvasRef}
        width={MAP_WIDTH * TILE_SIZE}
        height={MAP_HEIGHT * TILE_SIZE}
        className="border-4 border-amber-600 shadow-2xl"
        style={{ imageRendering: 'pixelated' }}
      />
      
      <div className="mt-4 text-amber-300 text-center">
        <p className="text-sm">Use as setas ou WASD para mover</p>
        <p className="text-xs opacity-70">Ande pelas áreas douradas para encontrar inimigos</p>
      </div>
    </div>
  );
};

export default GameCanvas;
