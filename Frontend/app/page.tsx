'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'motion/react';
import { ChevronRight, Sparkles } from 'lucide-react';
import { useGameStore } from '@/lib/stores/useGameStore';
import { LeaderboardTable } from '@/components/game/LeaderboardTable';

const DECORATIVE_TILES = ['🀄', '🀅', '🀆', '🀀', '🀁', '🀂', '🀃'];

export default function LandingPage() {
  const router = useRouter();
  const setPlayerName = useGameStore((s) => s.setPlayerName);
  const startGame = useGameStore((s) => s.startGame);
  const [name, setName] = useState('');

  function handleStart() {
    if (!name.trim()) return;
    setPlayerName(name.trim());
    startGame();
    router.push('/game');
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4 py-16 relative overflow-hidden">
      {/* Ambient glow */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at top, rgba(200,169,110,0.08) 0%, transparent 70%)' }}
      />

      {/* Floating tile decorations */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {DECORATIVE_TILES.map((unicode, i) => (
          <motion.div
            key={i}
            className="absolute text-3xl select-none"
            style={{
              left: `${8 + i * 13}%`,
              top: `${15 + (i % 3) * 22}%`,
              fontFamily: 'serif',
              opacity: 0.04,
            }}
            animate={{ y: [0, -18, 0], rotate: [0, i % 2 === 0 ? 4 : -4, 0] }}
            transition={{ duration: 4 + i * 0.5, repeat: Infinity, ease: 'easeInOut', delay: i * 0.4 }}
          >
            {unicode}
          </motion.div>
        ))}
      </div>

      {/* Hero */}
      <motion.div
        className="text-center mb-12 relative z-10"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.4, 0, 0.2, 1] }}
      >
        <div className="flex items-center justify-center gap-3 mb-6">
          <div className="h-px w-16" style={{ background: 'linear-gradient(to right, transparent, rgba(200,169,110,0.5))' }} />
          <span className="text-lg" style={{ color: '#c8a96e', fontFamily: 'serif' }}>🀄</span>
          <div className="h-px w-16" style={{ background: 'linear-gradient(to left, transparent, rgba(200,169,110,0.5))' }} />
        </div>

        <h1 className="font-black tracking-wider mb-3" style={{ fontFamily: 'var(--font-cinzel), serif' }}>
          <span className="text-shimmer" style={{ fontSize: 'clamp(2.5rem, 8vw, 4rem)' }}>MAHJONG</span>
          <br />
          <span className="font-semibold tracking-[0.4em] opacity-60 text-xl">HAND BETTING</span>
        </h1>

        <p className="text-xs tracking-widest opacity-25 uppercase mt-4">
          Bet higher or lower — survive the deck
        </p>
      </motion.div>

      {/* Input form */}
      <motion.div
        className="glass rounded-2xl p-8 w-full max-w-sm relative z-10 mb-12"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <div className="flex items-center gap-2 mb-4 opacity-50">
          <Sparkles size={13} style={{ color: '#c8a96e' }} />
          <span className="text-[10px] tracking-[0.3em] uppercase">Enter Your Name</span>
        </div>

        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleStart()}
          placeholder="Player name..."
          maxLength={50}
          autoFocus
          className="w-full px-4 py-3 rounded-xl mb-4 text-sm outline-none"
          style={{
            background: 'rgba(255,255,255,0.06)',
            border: `1px solid ${name.trim() ? 'rgba(200,169,110,0.4)' : 'rgba(255,255,255,0.1)'}`,
            color: '#f8f4e8',
            fontFamily: 'var(--font-cinzel), serif',
            transition: 'border-color 0.2s',
          }}
        />

        <motion.button
          onClick={handleStart}
          disabled={!name.trim()}
          whileHover={name.trim() ? { y: -2, scale: 1.02 } : {}}
          whileTap={name.trim() ? { scale: 0.97 } : {}}
          className="w-full flex items-center justify-center gap-3 py-3.5 rounded-xl font-bold text-sm tracking-widest uppercase disabled:opacity-30 disabled:cursor-not-allowed"
          style={{
            background: name.trim()
              ? 'linear-gradient(135deg, #b45309 0%, #f59e0b 50%, #fcd34d 100%)'
              : 'rgba(245,158,11,0.15)',
            color: name.trim() ? '#0f172a' : '#f59e0b',
            boxShadow: name.trim() ? '0 6px 28px rgba(245,158,11,0.38)' : 'none',
            transition: 'all 0.25s',
          }}
        >
          Deal the Hand
          <ChevronRight size={16} />
        </motion.button>
      </motion.div>

      {/* Leaderboard */}
      <motion.div
        className="w-full max-w-2xl relative z-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.45 }}
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="h-px flex-1" style={{ background: 'rgba(200,169,110,0.2)' }} />
          <span className="text-[10px] tracking-[0.3em] uppercase" style={{ color: '#c8a96e' }}>
            Leaderboard
          </span>
          <div className="h-px flex-1" style={{ background: 'rgba(200,169,110,0.2)' }} />
        </div>
        <LeaderboardTable />
      </motion.div>
    </main>
  );
}
