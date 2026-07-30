import React, { useState } from 'react';
import { Users, Crown, Copy, Check, Play, LogOut } from 'lucide-react';

export default function LobbyScreen({
  roomInfo,
  currentUserId,
  onStartGame,
  onLeaveRoom,
}) {
  const [copied, setCopied] = useState(false);

  const roomId = roomInfo?.roomId || '';
  const players = roomInfo?.players || [];
  const hostId = roomInfo?.hostId || '';
  const isHost = currentUserId === hostId;
  const playerLength = players.length;
  const canStart = playerLength >= 3 && playerLength <= 6;

  const handleCopyCode = () => {
    if (!roomId) return;
    navigator.clipboard.writeText(roomId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-900 text-slate-100">
      <div className="w-full max-w-lg glass-panel rounded-2xl p-6 shadow-2xl space-y-6">
        {/* Header & Room Code */}
        <div className="text-center space-y-3">
          <span className="inline-block px-3 py-1 bg-amber-500/10 text-amber-400 text-xs font-semibold rounded-full border border-amber-500/20">
            ห้องรอผู้เล่น (Lobby)
          </span>
          <div className="flex items-center justify-center space-x-2">
            <h2 className="text-3xl font-black tracking-widest font-mono text-amber-400">
              #{roomId}
            </h2>
            <button
              onClick={handleCopyCode}
              className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors border border-slate-700"
              title="คัดลอกรหัสห้อง"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
          <p className="text-xs text-slate-400">แชร์รหัสห้องนี้ให้เพื่อน 3–6 คนเพื่อเริ่มเล่น</p>
        </div>

        {/* Player Count Bar */}
        <div className="flex items-center justify-between px-4 py-3 bg-slate-950/60 rounded-xl border border-slate-800">
          <div className="flex items-center space-x-2 text-sm text-slate-300">
            <Users className="w-4 h-4 text-amber-400" />
            <span>รายชื่อผู้เล่นในห้อง</span>
          </div>
          <span className="text-xs font-bold px-2.5 py-1 bg-amber-500/20 text-amber-300 rounded-full border border-amber-500/30">
            {playerLength} / 6 คน
          </span>
        </div>

        {/* Player List */}
        <div className="space-y-2.5">
          {players.map((player, idx) => {
            const isPlayerHost = player.id === hostId;
            const isMe = player.id === currentUserId;

            return (
              <div
                key={player.id || idx}
                className={`flex items-center justify-between p-3.5 rounded-xl border transition-all ${
                  isMe
                    ? 'bg-amber-500/10 border-amber-500/40 text-amber-100'
                    : 'bg-slate-950/40 border-slate-800/80 text-slate-200'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-amber-400 text-sm">
                    {player.name ? player.name.charAt(0).toUpperCase() : '?'}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-sm">{player.name}</span>
                      {isMe && <span className="text-xs text-amber-400">(คุณ)</span>}
                    </div>
                  </div>
                </div>

                {isPlayerHost && (
                  <span className="flex items-center space-x-1 px-2.5 py-1 bg-amber-500/20 text-amber-300 text-xs font-semibold rounded-full border border-amber-500/40">
                    <Crown className="w-3.5 h-3.5 text-amber-400" />
                    <span>เจ้าของห้อง</span>
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {/* Start / Wait Notice */}
        <div className="pt-2 space-y-3">
          {isHost ? (
            <div className="space-y-2">
              <button
                onClick={onStartGame}
                disabled={!canStart}
                className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed text-slate-950 font-bold rounded-xl transition-all shadow-lg flex items-center justify-center space-x-2 text-base"
              >
                <Play className="w-5 h-5 fill-current" />
                <span>เริ่มเกม (ต้องมี 3-6 คน)</span>
              </button>
              {!canStart && (
                <p className="text-center text-xs text-amber-400/80">
                  ต้องการผู้เล่นอย่างน้อย 3 คนเพื่อเริ่มเกม (ปัจจุบันมี {playerLength} คน)
                </p>
              )}
            </div>
          ) : (
            <div className="p-3.5 bg-slate-950/60 rounded-xl border border-slate-800 text-center space-y-1">
              <p className="text-sm text-slate-300 animate-pulse font-medium">
                กำลังรอเจ้าของห้องเริ่มเกม...
              </p>
            </div>
          )}

          <button
            onClick={onLeaveRoom}
            className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl border border-slate-700 transition-colors flex items-center justify-center space-x-2 text-sm"
          >
            <LogOut className="w-4 h-4" />
            <span>ออกจากห้อง</span>
          </button>
        </div>
      </div>
    </div>
  );
}
