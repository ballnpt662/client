import React from 'react';
import { PHASE_THAI_TEXT } from '../utils/textHelpers';
import { Clock, Spade } from 'lucide-react';

export default function Header({
  phase,
  currentTurnPlayerName,
  isMyTurn,
  timerRemaining = 0,
  totalTimerDuration = 20,
  roomId,
}) {
  // Determine timer percentage and color
  const maxTimer = totalTimerDuration > 0 ? totalTimerDuration : 20;
  const pct = Math.max(0, Math.min(100, (timerRemaining / maxTimer) * 100));

  let timerColorClass = 'bg-emerald-500';
  if (pct <= 25) {
    timerColorClass = 'bg-red-500 animate-pulse';
  } else if (pct <= 50) {
    timerColorClass = 'bg-amber-500';
  }

  const phaseTitle = PHASE_THAI_TEXT[phase] || phase || 'กำลังเล่น';

  return (
    <header className="game-header sticky top-0 z-30">
      <div className="max-w-6xl mx-auto px-3 sm:px-5 py-3 space-y-3">
      {/* Top Info Bar */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center space-x-2">
          <div className="game-mark">
            <Spade className="w-4 h-4 fill-current" />
          </div>
          <div><span className="block text-[10px] font-semibold uppercase tracking-[.18em] text-slate-400">Card Bluff</span><span className="text-xs font-mono font-bold tracking-wider text-slate-700">ห้อง {roomId}</span></div>
        </div>

        {/* Phase Badge */}
        <div className="phase-chip hidden sm:block">
          {phaseTitle}
        </div>

        {/* Timer Seconds Digital Badge */}
        <div className="timer-chip">
          <Clock className="w-3.5 h-3.5" />
          <span>{timerRemaining} วิ</span>
        </div>
      </div>

      {/* Turn Banner */}
      <div className="text-center sm:hidden">
        {isMyTurn ? (
          <div className="text-sm font-bold text-violet-700">
            ตาของคุณ · เลือกแอ็กชัน
          </div>
        ) : (
          <div className="text-xs text-slate-500 font-medium truncate">
            ตาของ <span className="text-slate-800 font-semibold">{currentTurnPlayerName || '-'}</span>
          </div>
        )}
      </div>

      {/* Timer Progress Bar */}
      <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <div
          className={`h-full transition-all duration-300 ease-linear ${timerColorClass}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      </div>
    </header>
  );
}
