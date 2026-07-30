import React from 'react';
import { PHASE_THAI_TEXT } from '../utils/textHelpers';
import { Clock, Shield } from 'lucide-react';

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
    <div className="w-full glass-panel border-b border-slate-800 p-3 sm:p-4 space-y-2.5 sticky top-0 z-30 shadow-md">
      {/* Top Info Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 bg-amber-500/10 text-amber-400 rounded-lg border border-amber-500/20">
            <Shield className="w-4 h-4" />
          </div>
          <span className="text-xs font-mono font-bold tracking-wider text-amber-400">
            #{roomId}
          </span>
        </div>

        {/* Phase Badge */}
        <div className="px-3 py-1 bg-slate-950/80 rounded-full border border-slate-700/80 text-xs text-slate-300 font-medium">
          {phaseTitle}
        </div>

        {/* Timer Seconds Digital Badge */}
        <div className="flex items-center space-x-1.5 px-2.5 py-1 bg-slate-950/80 rounded-full border border-slate-700/80 text-xs font-mono text-amber-300">
          <Clock className="w-3.5 h-3.5 text-amber-400" />
          <span>{timerRemaining}s</span>
        </div>
      </div>

      {/* Turn Banner */}
      <div className="text-center">
        {isMyTurn ? (
          <div className="inline-block px-4 py-1.5 bg-emerald-500/20 border border-emerald-500/40 rounded-full text-emerald-300 text-sm font-bold shadow-sm animate-pulse">
            ★ ตาของคุณ! โปรดเลือกแอ็กชัน ★
          </div>
        ) : (
          <div className="text-xs sm:text-sm text-slate-300 font-medium">
            ตาของผู้เล่น: <span className="text-amber-400 font-semibold">{currentTurnPlayerName || '-'}</span>
          </div>
        )}
      </div>

      {/* Timer Progress Bar */}
      <div className="w-full h-2 bg-slate-950/80 rounded-full overflow-hidden border border-slate-800">
        <div
          className={`h-full transition-all duration-300 ease-linear ${timerColorClass}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
