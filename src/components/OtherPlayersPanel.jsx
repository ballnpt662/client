import React from 'react';
import { getRoleTitle, ROLE_INFO } from '../utils/textHelpers';
import { Coins, EyeOff, XCircle, WifiOff } from 'lucide-react';

export default function OtherPlayersPanel({
  players = {},
  currentUserId,
  currentTurnPlayerId,
  selectedTargetId,
  onSelectTarget,
  selectable = false,
}) {
  const otherPlayers = Object.values(players).filter((p) => p.id !== currentUserId);

  if (otherPlayers.length === 0) {
    return null;
  }

  return (
    <div className="w-full p-3 sm:p-5">
      <div className="table-panel__title">
        <div><span>ผู้เล่นรอบโต๊ะ</span><strong>{otherPlayers.length} คน</strong></div>
        {selectable && (
          <span className="target-hint">
            เลือกเป้าหมาย
          </span>
        )}
      </div>

      <div className="player-grid">
        {otherPlayers.map((player) => {
          const isTurn = player.id === currentTurnPlayerId;
          const isSelected = selectedTargetId === player.id;
          const isEliminated = player.isEliminated;
          const isDisconnected = !player.isConnected;
          const cards = player.cards || [];

          let borderClass = 'border-slate-800 bg-slate-950/40';
          if (isTurn) {
            borderClass = 'border-amber-500/80 bg-amber-500/10 shadow-lg shadow-amber-500/10 ring-1 ring-amber-500/50';
          }
          if (selectable && !isEliminated) {
            if (isSelected) {
              borderClass = 'border-emerald-500 bg-emerald-500/20 ring-2 ring-emerald-500 shadow-lg';
            } else {
              borderClass += ' cursor-pointer hover:border-amber-400/60 hover:bg-slate-900/60';
            }
          }

          return (
            <button
              type="button"
              key={player.id}
              disabled={!selectable || isEliminated}
              onClick={() => {
                if (selectable && !isEliminated && onSelectTarget) {
                  onSelectTarget(player.id);
                }
              }}
              className={`player-seat relative rounded-xl p-3 border transition-all flex flex-col justify-between space-y-2.5 ${borderClass} ${
                isEliminated ? 'opacity-50 grayscale' : ''
              }`}
              aria-label={`${player.name} ${player.coins} เหรียญ${isSelected ? ' เลือกแล้ว' : ''}`}
            >
              {/* Player Header */}
              <div className="flex items-center justify-between">
                <span className="font-semibold text-xs text-slate-200 truncate max-w-[90px]">
                  {player.name}
                </span>

                {/* Coin Count */}
                <div className="flex items-center space-x-1 px-2 py-0.5 bg-amber-500/10 border border-amber-500/30 rounded-full text-amber-300 text-xs font-bold">
                  <Coins className="w-3 h-3 text-amber-400 fill-amber-400" />
                  <span>{player.coins}</span>
                </div>
              </div>

              {/* Status Badges */}
              {isEliminated ? (
                <div className="flex items-center justify-center space-x-1 text-red-400 text-xs py-1 bg-red-950/40 rounded border border-red-800/40">
                  <XCircle className="w-3 h-3" />
                  <span>ตกรอบแล้ว</span>
                </div>
              ) : isDisconnected ? (
                <div className="flex items-center justify-center space-x-1 text-orange-400 text-[10px] py-0.5 bg-orange-950/40 rounded border border-orange-800/40">
                  <WifiOff className="w-3 h-3" />
                  <span>หลุด (90วิ)</span>
                </div>
              ) : null}

              {/* Card Slots */}
              <div className="grid grid-cols-2 gap-1.5 pt-1">
                {cards.map((card, idx) => {
                  const isRevealed = card.isRevealed;
                  const role = card.role;
                  const roleConfig = ROLE_INFO[role];

                  if (isRevealed) {
                    return (
                      <div
                        key={card.id || idx}
                        className={`h-14 rounded-lg border p-1 flex flex-col items-center justify-center text-center ${
                          roleConfig
                            ? `${roleConfig.bgColor} ${roleConfig.borderColor} ${roleConfig.color}`
                            : 'bg-red-950/40 border-red-500/40 text-red-400'
                        }`}
                      >
                        <span className="text-[10px] font-bold leading-tight line-through opacity-80">
                          {getRoleTitle(role)}
                        </span>
                        <span className="text-[8px] text-red-400/90 font-semibold mt-0.5">
                          เปิดแล้ว
                        </span>
                      </div>
                    );
                  }

                  return (
                    <div
                      key={card.id || idx}
                      className="h-14 rounded-lg bg-slate-900 border border-slate-800 flex flex-col items-center justify-center text-slate-600 shadow-inner"
                    >
                      <EyeOff className="w-4 h-4 text-slate-500 mb-0.5" />
                      <span className="text-[9px] text-slate-400">คว่ำอยู่</span>
                    </div>
                  );
                })}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
