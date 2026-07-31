import React from 'react';
import { Trophy, Medal, RotateCcw, Crown } from 'lucide-react';

export default function GameOverScreen({
  winnerPlayerId,
  players = {},
  currentUserId,
  onReturnToMain,
}) {
  const winner = players[winnerPlayerId];
  const isWinner = winnerPlayerId === currentUserId;

  // Rank players by active status first, then coins
  const playerList = Object.values(players).sort((a, b) => {
    if (a.isEliminated !== b.isEliminated) {
      return a.isEliminated ? 1 : -1;
    }
    return b.coins - a.coins;
  });

  return (
    <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-lg flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="w-full max-w-lg glass-modal rounded-2xl p-6 shadow-2xl border border-amber-500/40 text-center space-y-6">
        {/* Trophy Icon Header */}
        <div className="inline-flex items-center justify-center p-4 bg-amber-500/20 text-amber-400 rounded-full border border-amber-500/40 shadow-lg shadow-amber-500/20">
          <Trophy className="w-14 h-14 animate-bounce" />
        </div>

        {/* Winner Title */}
        <div className="space-y-1.5">
          {isWinner ? (
            <h2 className="text-3xl font-black text-amber-400">
              🎉 ยินดีด้วย! คุณคือผู้ชนะ!
            </h2>
          ) : (
            <h2 className="text-2xl font-bold text-slate-100">
              ผู้ชนะในเกมนี้คือ <span className="text-amber-400">{winner?.name || 'ผู้เล่น'}</span>
            </h2>
          )}
          <p className="text-xs text-slate-400">การแข่งขันการ์ดบลัฟได้สิ้นสุดลงแล้ว</p>
        </div>

        {/* Final Rankings Table */}
        <div className="space-y-2 text-left">
          <span className="text-xs font-semibold text-slate-400 px-1">อันดับผู้เล่น</span>
          <div className="space-y-1.5 max-h-48 overflow-y-auto custom-scrollbar">
            {playerList.map((p, idx) => {
              const isPWinner = p.id === winnerPlayerId;
              const isMe = p.id === currentUserId;

              return (
                <div
                  key={p.id}
                  className={`flex items-center justify-between p-3 rounded-xl border text-xs ${
                    isPWinner
                      ? 'bg-amber-500/15 border-amber-500/40 text-amber-200'
                      : 'bg-slate-900/60 border-slate-800 text-slate-300'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <span className="font-bold font-mono text-slate-400 w-5">
                      #{idx + 1}
                    </span>
                    <div className="flex items-center space-x-1.5">
                      <span className="font-semibold">{p.name}</span>
                      {isMe && <span className="text-amber-400 text-[10px]">(คุณ)</span>}
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <span className="text-slate-400">{p.coins} เหรียญ</span>
                    {isPWinner ? (
                      <span className="px-2 py-0.5 bg-amber-500/20 text-amber-300 rounded font-bold text-[10px] flex items-center space-x-1 border border-amber-500/30">
                        <Crown className="w-3 h-3 text-amber-400" />
                        <span>ผู้ชนะ</span>
                      </span>
                    ) : p.isEliminated ? (
                      <span className="px-2 py-0.5 bg-red-950/40 text-red-400 rounded text-[10px] border border-red-800/40">
                        ตกรอบ
                      </span>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Replay in the same room — host resets everyone to the lobby */}
        {onReturnToMain ? <button
          onClick={onReturnToMain}
          className="w-full py-3.5 bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-slate-950 font-bold rounded-xl shadow-lg transition-colors flex items-center justify-center space-x-2 text-base"
        >
          <RotateCcw className="w-5 h-5" />
          <span>เล่นอีกครั้งในห้องเดิม</span>
        </button> : <p className="rounded-xl bg-slate-900/60 p-3 text-sm font-semibold text-slate-300">รอเจ้าของห้องกดเล่นอีกครั้ง...</p>}
      </div>
    </div>
  );
}
