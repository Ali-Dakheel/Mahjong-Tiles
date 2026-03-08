'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, LayoutList, Zap, TrendingUp, Target, Flame } from 'lucide-react';
import { useGameState } from '@/lib/hooks/useGameState';
import { usePhaseAutoAdvance } from '@/lib/hooks/usePhaseAutoAdvance';
import { PHASE_LABELS, PHASE_INDICATOR_COLOR } from '@/lib/constants/phases';
import {
  Tile,
  HandDisplay,
  BettingControls,
  ScoreBar,
  HistoryPanel,
  ValueMapDisplay,
  GameOverScreen,
} from '@/components/game';
import { DevPanel } from '@/components/dev/DevPanel';

export default function GamePage() {
  const router = useRouter();

  const {
    phase,
    currentHand,
    currentHandValue,
    history,
    tileValueMap,
    score,
    streak,
    currentRound,
    drawPile,
    reshuffleCount,
    gameOverReason,
    playerName,
    placeBet,
    advanceToNextBet,
    startGame,
    setPlayerName,
  } = useGameState();

  // Redirect to landing if no game started
  useEffect(() => {
    if (phase === 'idle') router.replace('/');
  }, [phase, router]);

  // Auto-advance dealing→betting and revealing→betting
  usePhaseAutoAdvance(phase, advanceToNextBet);

  const latestRound = history[0] ?? null;

  // Live game stats
  const totalRounds = history.length;
  const wins = history.filter((r) => r.outcome === 'win').length;
  const winRate = totalRounds > 0 ? Math.round((wins / totalRounds) * 100) : 0;
  const bestStreak = history.reduce((best, r) => Math.max(best, r.streakAtTime), 0);
  const glowVariant =
    phase === 'revealing' && latestRound ? latestRound.outcome : null;

  const indicatorColor =
    phase === 'revealing'
      ? glowVariant === 'win'
        ? '#22c55e'
        : '#ef4444'
      : PHASE_INDICATOR_COLOR[phase];

  if (phase === 'idle') return null;

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      {/* Background ambient */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 100% 60% at 50% 0%, rgba(200,169,110,0.05) 0%, transparent 60%)',
        }}
      />

      {/* Top nav */}
      <header
        className="relative z-20 flex items-center justify-between px-4 py-3 border-b"
        style={{
          borderColor: 'rgba(255,255,255,0.06)',
          background: 'rgba(15,23,42,0.6)',
          backdropFilter: 'blur(10px)',
        }}
      >
        <motion.button
          onClick={() => router.push('/')}
          whileHover={{ x: -2 }}
          className="flex items-center gap-1.5 text-xs tracking-wider opacity-40 hover:opacity-70 transition-opacity"
        >
          <ArrowLeft size={14} />
          Lobby
        </motion.button>

        <span
          className="text-[10px] tracking-widest opacity-25 uppercase"
          style={{ fontFamily: 'var(--font-cinzel), serif' }}
        >
          {playerName || 'Player'}
        </span>

        {/* Phase indicator */}
        <div className="flex items-center gap-1.5">
          <div
            className="w-1.5 h-1.5 rounded-full"
            style={{
              backgroundColor: indicatorColor,
              boxShadow: phase === 'betting' ? `0 0 6px ${indicatorColor}` : 'none',
            }}
          />
          <span className="text-[9px] tracking-widest uppercase opacity-40">
            {PHASE_LABELS[phase]}
          </span>
        </div>
      </header>

      {/* Main layout */}
      <div className="flex-1 flex flex-col lg:flex-row gap-0 relative z-10 max-w-screen-2xl mx-auto w-full px-4 py-4">

        {/* Left sidebar — history (desktop) */}
        <aside className="hidden lg:flex flex-col gap-3 w-80 shrink-0 pr-6">
          <div className="glass rounded-xl p-4 flex-1 min-h-0 flex flex-col gap-3">
            <div className="flex items-center gap-2 opacity-40">
              <LayoutList size={13} />
              <span className="text-[9px] tracking-[0.25em] uppercase">Round History</span>
            </div>
            <HistoryPanel history={history} />
          </div>
        </aside>

        {/* Center — main game area */}
        <main className="flex-1 flex flex-col items-center gap-8 min-w-0">

          {/* Score bar */}
          <div className="glass rounded-xl px-5 py-3 w-full">
            <ScoreBar
              score={score}
              streak={streak}
              round={currentRound}
              drawPileCount={drawPile.length}
              reshuffleCount={reshuffleCount}
            />
          </div>

          {/* Previous hand */}
          <AnimatePresence>
            {latestRound && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center gap-2"
              >
                <span className="text-[9px] tracking-widest uppercase opacity-20">Previous Hand</span>
                <div className="flex gap-2 opacity-50">
                  {latestRound.previousHand.map((tile) => (
                    <Tile key={tile.id} tile={tile} revealed size="small" />
                  ))}
                </div>
                <span className="text-xs tabular-nums opacity-20">
                  = {latestRound.previousHandValue}
                </span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Arrow between hands */}
          {latestRound && (
            <div className="flex items-center gap-2 opacity-15">
              <div className="h-px w-8" style={{ background: 'rgba(200,169,110,0.5)' }} />
              <Zap size={12} style={{ color: '#c8a96e' }} />
              <div className="h-px w-8" style={{ background: 'rgba(200,169,110,0.5)' }} />
            </div>
          )}

          {/* Current hand */}
          <div className="flex flex-col items-center gap-4">
            <span className="text-[9px] tracking-widest uppercase opacity-30">Current Hand</span>
            <AnimatePresence mode="wait">
              <motion.div key={currentHand.map((t) => t.id).join(',')}>
                <HandDisplay
                  tiles={currentHand}
                  revealed={phase !== 'dealing'}
                  glowVariant={glowVariant}
                />
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Win/Loss result flash */}
          <AnimatePresence>
            {phase === 'revealing' && latestRound && (
              <motion.div
                initial={{ scale: 0.7, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 1.1, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                className="flex flex-col items-center gap-1"
              >
                <span
                  className="text-2xl font-black tracking-wider"
                  style={{
                    color: latestRound.outcome === 'win' ? '#4ade80' : '#f87171',
                    fontFamily: 'var(--font-cinzel), serif',
                    textShadow: `0 0 20px ${latestRound.outcome === 'win' ? 'rgba(34,197,94,0.5)' : 'rgba(239,68,68,0.5)'}`,
                  }}
                >
                  {latestRound.outcome === 'win' ? '✓ WIN' : '✗ LOSS'}
                </span>
                {latestRound.outcome === 'win' && (
                  <span className="text-sm font-bold" style={{ color: '#f59e0b' }}>
                    +{latestRound.pointsEarned}
                    {latestRound.streakAtTime >= 2 && (
                      <span className="text-xs ml-1 opacity-60">🔥 ×{latestRound.streakAtTime}</span>
                    )}
                  </span>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Betting controls */}
          <BettingControls
            handValue={currentHandValue}
            phase={phase}
            onBet={placeBet}
          />

          {/* Live game stats */}
          {totalRounds > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-3 gap-3 w-full max-w-sm"
            >
              <div
                className="flex flex-col items-center gap-1 rounded-xl py-3 px-2"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
              >
                <Target size={13} style={{ color: '#c8a96e', opacity: 0.6 }} />
                <span className="text-lg font-black tabular-nums" style={{ color: '#c8a96e' }}>
                  {winRate}%
                </span>
                <span className="text-[8px] tracking-widest uppercase opacity-30">Win Rate</span>
              </div>
              <div
                className="flex flex-col items-center gap-1 rounded-xl py-3 px-2"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
              >
                <TrendingUp size={13} style={{ color: '#c8a96e', opacity: 0.6 }} />
                <span className="text-lg font-black tabular-nums" style={{ color: '#c8a96e' }}>
                  {wins}/{totalRounds}
                </span>
                <span className="text-[8px] tracking-widest uppercase opacity-30">Wins</span>
              </div>
              <div
                className="flex flex-col items-center gap-1 rounded-xl py-3 px-2"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
              >
                <Flame size={13} style={{ color: '#f59e0b', opacity: 0.7 }} />
                <span className="text-lg font-black tabular-nums" style={{ color: '#f59e0b' }}>
                  {bestStreak}
                </span>
                <span className="text-[8px] tracking-widest uppercase opacity-30">Best Streak</span>
              </div>
            </motion.div>
          )}
        </main>

        {/* Right sidebar — value map (desktop) */}
        <aside className="hidden lg:flex flex-col gap-3 w-80 shrink-0 pl-6">
          <div className="glass rounded-xl p-4">
            <ValueMapDisplay valueMap={tileValueMap} />
          </div>
          <div className="glass rounded-xl p-4 flex flex-col gap-3">
            <div className="flex items-center gap-2 opacity-40">
              <LayoutList size={13} />
              <span className="text-[9px] tracking-[0.25em] uppercase">Last 3</span>
            </div>
            <HistoryPanel history={history.slice(0, 3)} compact />
          </div>
        </aside>
      </div>

      {/* Mobile: value map + history row */}
      <div className="lg:hidden flex gap-3 px-4 pb-6 relative z-10">
        <div className="glass rounded-xl p-3 flex-1">
          <ValueMapDisplay valueMap={tileValueMap} />
        </div>
        <div className="glass rounded-xl p-3 flex-1">
          <div className="flex items-center gap-1.5 mb-2 opacity-40">
            <LayoutList size={12} />
            <span className="text-[9px] tracking-widest uppercase">History</span>
          </div>
          <HistoryPanel history={history.slice(0, 4)} compact />
        </div>
      </div>

      {/* Game over overlay */}
      <AnimatePresence>
        {phase === 'game_over' && gameOverReason && (
          <GameOverScreen
            score={score}
            roundsPlayed={currentRound - 1}
            gameOverReason={gameOverReason}
            playerName={playerName}
            onPlayAgain={() => {
              const currentName = playerName;
              startGame();
              setPlayerName(currentName);
            }}
          />
        )}
      </AnimatePresence>

      {/* Dev panel — development only */}
      {process.env.NODE_ENV !== 'production' && <DevPanel />}
    </div>
  );
}
