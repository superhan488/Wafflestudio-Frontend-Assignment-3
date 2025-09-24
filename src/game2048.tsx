import { useEffect, useState } from 'react';
import './index.css';

const SIZE = 4;

type Board = number[][];
type Direction = 'up' | 'down' | 'left' | 'right';

function getEmptyBoard(): Board {
  return Array(SIZE)
    .fill(null)
    .map(() => Array(SIZE).fill(0));
}

function getRandomEmptyCell(board: Board): [number, number] | null {
  const empty: [number, number][] = [];
  board.forEach((row, i) =>
    row.forEach((cell, j) => {
      if (cell === 0) empty.push([i, j]);
    })
  );
  if (empty.length === 0) return null;
  return empty[Math.floor(Math.random() * empty.length)];
}

function addRandomTile(board: Board): Board {
  const newBoard = board.map((row) => [...row]);
  const cell = getRandomEmptyCell(newBoard);
  if (cell) {
    const [i, j] = cell;
    newBoard[i][j] = Math.random() < 0.9 ? 2 : 4;
  }
  return newBoard;
}

// Updated slide to correctly track score
function slide(row: number[], addScore: (points: number) => void): number[] {
  const arr = row.filter((val) => val !== 0);
  const result: number[] = [];
  let skip = false;

  for (let i = 0; i < arr.length; i++) {
    if (skip) {
      skip = false;
      continue;
    }

    if (i + 1 < arr.length && arr[i] === arr[i + 1]) {
      const merged = arr[i] * 2;
      result.push(merged);
      addScore(merged*0.5);
      skip = true; // skip next tile
    } else {
      result.push(arr[i]);
    }
  }

  while (result.length < SIZE) result.push(0);
  return result;
}

function operate(board: Board, direction: Direction, addScore: (points: number) => void): Board {
  let rotated = board.map((r) => [...r]);

  if (direction === 'up') rotated = rotateLeft(rotated);
  else if (direction === 'down') rotated = rotateRight(rotated);
  else if (direction === 'right') rotated = rotated.map((row) => row.reverse());

  let newBoard = rotated.map((row) => slide(row, addScore));

  if (direction === 'up') newBoard = rotateRight(newBoard);
  else if (direction === 'down') newBoard = rotateLeft(newBoard);
  else if (direction === 'right') newBoard = newBoard.map((row) => row.reverse());

  return newBoard;
}

function rotateLeft(board: Board): Board {
  return board[0].map((_, i) => board.map((row) => row[i])).reverse();
}

function rotateRight(board: Board): Board {
  return board[0].map((_, i) => board.map((row) => row[i]).reverse());
}

export default function Game2048() {
  const [board, setBoard] = useState<Board>(() => {
    let b = addRandomTile(getEmptyBoard());
    b = addRandomTile(b);
    return b;
  });
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameOver) return;

      let direction: Direction | null = null;
      if (e.key === 'ArrowUp') direction = 'up';
      if (e.key === 'ArrowDown') direction = 'down';
      if (e.key === 'ArrowLeft') direction = 'left';
      if (e.key === 'ArrowRight') direction = 'right';

      if (direction) {
        setBoard((prevBoard) => {
          let gained = 0;
          const newBoard = operate(prevBoard, direction!, (points) => (gained += points));

          if (JSON.stringify(prevBoard) !== JSON.stringify(newBoard)) {
            setScore((prev) => prev + gained);
            const boardWithTile = addRandomTile(newBoard);
            if (isGameOver(boardWithTile)) setGameOver(true);
            return boardWithTile;
          }
          return prevBoard;
        });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameOver]);

  function isGameOver(board: Board): boolean {
    if (getRandomEmptyCell(board)) return false;
    const directions: Direction[] = ['up', 'down', 'left', 'right'];
    return directions.every((dir) => {
      const moved = operate(board, dir, () => void 0);
      return JSON.stringify(board) === JSON.stringify(moved);
    });
  }

  return (
    <div className="game-container">
    <h1>2048 Game</h1>
  <h2>Join the numbers and get to the 2048 tile!</h2>
  <h2>Score: {score}</h2>
  {gameOver && <h2>Game Over!</h2>}

  <button
    onClick={() => {
      let newBoard = addRandomTile(getEmptyBoard());
      newBoard = addRandomTile(newBoard);
      setBoard(newBoard);
      setScore(0);
      setGameOver(false);
    }}
  >
    New Game
  </button>

  <div className="board">
    {board.map((row, i) => (
      <div key={i} className="row">
        {row.map((cell, j) => (
          <div key={j} className={`cell value-${cell}`}>
            {cell !== 0 ? cell : ''}
          </div>
        ))}
      </div>
    ))}
  </div>
</div>
); 
}