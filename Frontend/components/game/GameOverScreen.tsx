'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { RefreshCw, Save, Trophy } from 'lucide-react';
import { saveScore } from '@/lib/api/game';
import { GAME_OVER_CONFIG } from '@/lib/constants/gameOver';
import type { GameOverReason } from '@/types/game';

interface GameOverScreenProps {
  score: number;
  roundsPlayed: number;
  gameOverReason: GameOverReason;
  playerName: string;
  onPlayAgain: () => void;
}

export function GameOverScreen({
  score,
  roundsPlayed,
  gameOverReason,
  playerName,
  onPlayAgain,
}: GameOverScreenProps) {
  const [name, setName] = useState(playerName);
  const [saved, setSaved] = useState(false);
  const queryClient = useQueryClient();
  const reason = GAME_OVER_CONFIG[gameOverReason];

  const { mutate: submitScore, isPending } = useMutation({
    mutationFn: () =>
      saveScore({
        player_name: name.trim() || 'Anonymous',
        score,
        rounds_played: roundsPlayed,
        game_over_reason: gameOverReason,
      }),
    onSuccess: () => {
      setSaved(true);
      queryClient.invalidateQueries({ queryKey: ['leaderboard'] });
    },
  });

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      style={{ background: 'rgba(10, 15, 28, 0.9)', backdropFilter: 'blur(12px)' }}
    >
      <motion.div
        initial={{ scale: 0.85, y: 40, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 260, damping: 22, delay: 0.1 }}
        className="glass rounded-2xl p-8 max-w-md w-full text-center"
        style={{ border: `1px solid ${reason.color}30` }}
      >
        {/* Icon */}
        <motion.div
          className="text-6xl mb-4"
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        >
          {reason.icon}
        </motion.div>

        {/* Title */}
        <h2
          className="text-2xl font-bold mb-2 tracking-wider"
          style={{ color: reason.color, fontFamily: 'var(--font-cinzel), serif' }}
        >
          {reason.title}
        </h2>

        <p className="text-sm opacity-50 mb-6 tracking-wide">{reason.description}</p>

        {/* Score display */}
        <div
          className="rounded-xl py-4 px-6 mb-6 inline-block"
          style={{ background: 'rgba(200,169,110,0.08)', border: '1px solid rgba(200,169,110,0.2)' }}
        >
          <p className="text-[9px] tracking-[0.25em] uppercase opacity-40 mb-1">Final Score</p>
          <p
            className="text-4xl font-black text-shimmer"
            style={{ fontFamily: 'var(--font-cinzel), serif' }}
          >
            {score.toLocaleString()}
          </p>
          <p className="text-xs opacity-30 mt-1">{roundsPlayed} rounds played</p>
        </div>

        {/* Save score form */}
        <AnimatePresence mode="wait">
          {!saved ? (
            <motion.div
              key="form"
              initial={{ opacity: 1 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex flex-col gap-3 mb-4"
            >
              <div className="flex gap-2">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  maxLength={50}
                  className="flex-1 px-3 py-2.5 rounded-lg text-sm outline-none transition-colors"
                  style={{
                    background: 'rgba(255,255,255,0.07)',
                    border: '1px solid rgba(255,255,255,0.12)',
                    color: '#f8f4e8',
                    fontFamily: 'var(--font-cinzel), serif',
                  }}
                  onKeyDown={(e) => e.key === 'Enter' && !isPending && !saved && submitScore()}
                />
                <motion.button
                  onClick={() => submitScore()}
                  disabled={isPending}
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.97 }}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-sm font-semibold"
                  style={{
                    background: 'linear-gradient(135deg, #d97706, #f59e0b)',
                    color: '#0f172a',
                    opacity: isPending ? 0.6 : 1,
                  }}
                >
                  <Save size={14} />
                  {isPending ? '...' : 'Save'}
                </motion.button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="saved"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-center gap-2 py-3 mb-4"
              style={{ color: '#4ade80' }}
            >
              <Trophy size={16} />
              <span className="text-sm tracking-wider">Score saved to leaderboard!</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Play again */}
        <motion.button
          onClick={onPlayAgain}
          whileHover={{ scale: 1.03, y: -2 }}
          whileTap={{ scale: 0.97 }}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm tracking-widest uppercase"
          style={{
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.12)',
            color: '#f8f4e8',
          }}
        >
          <RefreshCw size={15} />
          Play Again
        </motion.button>
      </motion.div>
    </motion.div>
  );
}
