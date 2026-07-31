import React, { useState } from 'react';
import { Users, Crown, Copy, Check, Play, LogOut, Trash2, Wifi, WifiOff, X, Settings2, ChevronDown } from 'lucide-react';
import RoomInviteQR from './RoomInviteQR';

export default function LobbyScreen({
  roomInfo,
  currentUserId,
  onStartGame,
  onLeaveRoom,
  onCloseRoom,
  connectionState,
  onUpdateConfig,
}) {
  const [copied, setCopied] = useState(false);
  const [showCloseConfirm, setShowCloseConfirm] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const roomId = roomInfo?.roomId || '';
  const players = roomInfo?.players || [];
  const hostId = roomInfo?.hostPlayerId || '';
  const isHost = currentUserId === hostId;
  const playerLength = players.length;
  const canStart = playerLength >= 3 && playerLength <= 6;

  const handleCopyCode = () => {
    if (!roomId) return;
    navigator.clipboard?.writeText(roomId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#f7f5ff] text-slate-800">
      <div className="w-full max-w-lg bg-white rounded-3xl p-5 sm:p-7 shadow-xl shadow-violet-100/70 space-y-6 border border-violet-100">
        {/* Header & Room Code */}
        <div className="text-center space-y-3">
          <span className="inline-block px-3 py-1 bg-violet-50 text-violet-600 text-xs font-semibold rounded-full border border-violet-100">
            ห้องรอผู้เล่น (Lobby)
          </span>
          <div className="flex items-center justify-center space-x-2">
            <h2 className="text-3xl font-black tracking-widest font-mono text-violet-600">
              #{roomId}
            </h2>
            <button
              onClick={handleCopyCode}
              className="p-2 bg-violet-50 hover:bg-violet-100 text-violet-600 rounded-xl transition-colors border border-violet-100"
              aria-label="คัดลอกรหัสห้อง"
              title="คัดลอกรหัสห้อง"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
          <p className="text-xs text-slate-500">แชร์รหัสห้องนี้ให้เพื่อน 3–6 คนเพื่อเริ่มเล่น</p>
        </div>

        <RoomInviteQR roomId={roomId} game="card-bluff" />

        {isHost && (
          <section className="rounded-2xl border border-violet-100 bg-violet-50/60 overflow-hidden">
            <button type="button" onClick={() => setShowSettings((v) => !v)} className="w-full flex items-center justify-between p-4 text-left">
              <span className="flex items-center gap-2 font-bold text-slate-700"><Settings2 className="w-4 h-4 text-violet-500" /> ตั้งค่ากติกาห้อง</span>
              <ChevronDown className={`w-4 h-4 transition-transform ${showSettings ? 'rotate-180' : ''}`} />
            </button>
            {showSettings && <div className="px-4 pb-4 grid sm:grid-cols-3 gap-4">
              {[
                ['turnSeconds', 'เวลาเลือกแอ็กชัน', 20, 90],
                ['responseSeconds', 'เวลาตอบโต้', 8, 45],
                ['revealSeconds', 'เวลาเปิดการ์ด', 8, 45],
              ].map(([key, label, min, max]) => <label key={key} className="text-xs font-semibold text-slate-600">
                <span className="flex justify-between mb-2"><span>{label}</span><b className="text-violet-600">{roomInfo?.config?.[key] ?? (key === 'turnSeconds' ? 45 : 15)} วิ</b></span>
                <input className="w-full accent-violet-600" type="range" min={min} max={max} step="5" value={roomInfo?.config?.[key] ?? (key === 'turnSeconds' ? 45 : 15)} onChange={(e) => onUpdateConfig?.({ ...roomInfo.config, [key]: Number(e.target.value) }).catch(() => {})} />
              </label>)}
              <p className="sm:col-span-3 text-[11px] text-slate-500">การตั้งค่าจะบันทึกทันทีและใช้เมื่อเริ่มเกม</p>
            </div>}
          </section>
        )}

        {/* Player Count Bar */}
        <div className="flex items-center justify-between px-4 py-3 bg-violet-50 rounded-2xl border border-violet-100">
          <div className="flex items-center space-x-2 text-sm text-slate-600">
            <Users className="w-4 h-4 text-violet-500" />
            <span>รายชื่อผู้เล่นในห้อง</span>
          </div>
          <span className="text-xs font-bold px-2.5 py-1 bg-white text-violet-600 rounded-full border border-violet-200">
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
                    ? 'bg-violet-50 border-violet-200 text-slate-800'
                    : 'bg-white border-slate-100 text-slate-700'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 rounded-full bg-[#f0edff] border border-violet-100 flex items-center justify-center font-bold text-violet-600 text-sm">
                    {player.name ? player.name.charAt(0).toUpperCase() : '?'}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-sm">{player.name}</span>
                      {isMe && <span className="text-xs text-violet-600">(คุณ)</span>}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`flex items-center gap-1 text-xs ${player.isConnected ? 'text-emerald-600' : 'text-rose-500'}`}>
                    {player.isConnected ? <Wifi className="w-3.5 h-3.5" /> : <WifiOff className="w-3.5 h-3.5" />}
                    {player.isConnected ? 'ออนไลน์' : 'หลุดชั่วคราว'}
                  </span>
                {isPlayerHost && (
                  <span className="flex items-center space-x-1 px-2.5 py-1 bg-amber-50 text-amber-700 text-xs font-semibold rounded-full border border-amber-200">
                    <Crown className="w-3.5 h-3.5 text-amber-500" />
                    <span>เจ้าของห้อง</span>
                  </span>
                )}
                </div>
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
                disabled={!canStart || connectionState !== 'CONNECTED'}
                className="w-full py-3.5 bg-violet-500 hover:bg-violet-600 active:bg-violet-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold rounded-2xl transition-all shadow-lg shadow-violet-200 flex items-center justify-center space-x-2 text-base"
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
            className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 font-semibold rounded-2xl transition-colors flex items-center justify-center space-x-2 text-sm"
          >
            <LogOut className="w-4 h-4" />
            <span>ออกจากห้อง</span>
          </button>
          {isHost && onCloseRoom && (
            <button onClick={() => setShowCloseConfirm(true)} className="w-full py-2.5 text-rose-600 hover:bg-rose-50 rounded-xl transition-colors flex items-center justify-center gap-2 text-sm font-medium">
              <Trash2 className="w-4 h-4" /> ยุบห้อง
            </button>
          )}
        </div>
      </div>
      {showCloseConfirm && (
        <div className="fixed inset-0 z-50 bg-slate-900/30 backdrop-blur-sm flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="close-room-title">
          <div className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl">
            <div className="flex justify-between items-start gap-4"><div><h3 id="close-room-title" className="text-lg font-bold">ยืนยันยุบห้อง?</h3><p className="mt-2 text-sm text-slate-500">ผู้เล่นทุกคนจะถูกนำออกจากห้องและไม่สามารถกลับเข้าห้องนี้ได้</p></div><button onClick={() => setShowCloseConfirm(false)} aria-label="ปิด"><X className="w-5 h-5" /></button></div>
            <div className="grid grid-cols-2 gap-3 mt-6"><button onClick={() => setShowCloseConfirm(false)} className="py-3 rounded-xl bg-slate-100 font-semibold">ยกเลิก</button><button disabled={isClosing} onClick={async () => { setIsClosing(true); try { await onCloseRoom(); } finally { setIsClosing(false); setShowCloseConfirm(false); } }} className="py-3 rounded-xl bg-rose-500 text-white font-semibold disabled:opacity-50">{isClosing ? 'กำลังยุบ...' : 'ยืนยันยุบห้อง'}</button></div>
          </div>
        </div>
      )}
    </div>
  );
}
