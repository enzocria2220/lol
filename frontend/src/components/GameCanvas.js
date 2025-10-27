import React, { useEffect, useRef, useState } from "react";
import { useGame } from "../context/GameContext";

const TILE_SIZE = 32;
const MOVE_SPEED = 2;
const FRAME_COUNT = 4;
const FRAME_SPEED = 10;

const GameCanvas = () => {
  const canvasRef = useRef(null);
  const { gameState } = useGame();
  const [keys, setKeys] = useState({});
  const [frame, setFrame] = useState(0);
  const [tick, setTick] = useState(0);
  const [player, setPlayer] = useState({
    x: 100,
    y: 100,
    direction: "down",
    moving: false,
  });

  // Carregar sprites
  const sprites = {
    up: new Image(),
    down: new Image(),
    left: new Image(),
    right: new Image(),
  };

  sprites.up.src = "/sprites/player/up.png";
  sprites.down.src = "/sprites/player/down.png";
  sprites.left.src = "/sprites/player/left.png";
  sprites.right.src = "/sprites/player/right.png";

  // Controle de teclas
  useEffect(() => {
    const handleKeyDown = (e) => {
      setKeys((prev) => ({ ...prev, [e.key]: true }));
    };
    const handleKeyUp = (e) => {
      setKeys((prev) => ({ ...prev, [e.key]: false }));
    };
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  // Loop principal
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let animationId;

    const update = () => {
      let newX = player.x;
      let newY = player.y;
      let newDirection = player.direction;
      let isMoving = false;

      if (keys.ArrowUp || keys.w) {
        newY -= MOVE_SPEED;
        newDirection = "up";
        isMoving = true;
      } else if (keys.ArrowDown || keys.s) {
        newY += MOVE_SPEED;
        newDirection = "down";
        isMoving = true;
      } else if (keys.ArrowLeft || keys.a) {
        newX -= MOVE_SPEED;
        newDirection = "left";
        isMoving = true;
      } else if (keys.ArrowRight || keys.d) {
        newX += MOVE_SPEED;
        newDirection = "right";
        isMoving = true;
      }

      setPlayer((prev) => ({
        ...prev,
        x: newX,
        y: newY,
        direction: newDirection,
        moving: isMoving,
      }));

      // Atualiza frame
      setTick((prev) => prev + 1);
      if (isMoving && tick % FRAME_SPEED === 0) {
        setFrame((prev) => (prev + 1) % FRAME_COUNT);
      }
    };

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const sprite = sprites[player.direction];
      const sx = frame * TILE_SIZE;
      const sy = 0;

      if (sprite.complete) {
        ctx.drawImage(
          sprite,
          sx,
          sy,
          TILE_SIZE,
          TILE_SIZE,
          player.x,
          player.y,
          TILE_SIZE,
          TILE_SIZE
        );
      } else {
        sprite.onload = () => {
          ctx.drawImage(
            sprite,
            sx,
            sy,
            TILE_SIZE,
            TILE_SIZE,
            player.x,
            player.y,
            TILE_SIZE,
            TILE_SIZE
          );
        };
      }
    };

    const loop = () => {
      update();
      draw();
      animationId = requestAnimationFrame(loop);
    };

    loop();
    return () => cancelAnimationFrame(animationId);
  }, [player, keys, tick, frame]);

  return (
    <div className="flex justify-center items-center h-screen bg-black">
      <canvas
        ref={canvasRef}
        width={640}
        height={480}
        className="border-4 border-gray-700 rounded-xl bg-gray-900 shadow-lg"
      />
    </div>
  );
};

export default GameCanvas;

