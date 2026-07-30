import React, { useState, useEffect } from 'react';
import { Shield, PlusCircle, LogIn, RefreshCw, AlertCircle } from 'lucide-react';

const RECONNECT_TOKEN_KEY = 'card_bluff_reconnect_token';

export default function MainScreen({
  onCreateRoom,
  onJoinRoom,
  onReconnect,
  errorMessage,
  isLoading,
}) {
  const [activeTab, setActiveTab] = useState('create'); // 'create' | 'join'
  const [playerName, setPlayerName] = useState('');
  const [roomId, setRoomId] = useState('');
  const [hasSavedToken, setHasSavedToken] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem(RECONNECT_TOKEN_KEY);
    if (token) {
      setHasSavedToken(true);
    }
  }, []);

  const handleCreateSubmit = (e) => {
    e.preventDefault();
    if (!playerName.trim()) return;
    onCreateRoom({ playerName: playerName.trim() });
  };

  const handleJoinSubmit = (e) => {
    e.preventDefault();
    if (!playerName.trim() || !roomId.trim()) return;
    onJoinRoom({ roomId: roomId.trim().toUpperCase(), playerName: playerName.trim() });
  };

  const handleReconnectClick = () => {
    const token = localStorage.getItem(RECONNECT_TOKEN_KEY);
    if (token && onReconnect) {
      onReconnect(token);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-900 text-slate-100">
      <div className="w-full max-w-md glass-panel rounded-2xl p-6 shadow-2xl space-y-6">
        {/* Title Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center p-3 bg-amber-500/10 text-amber-400 rounded-2xl border border-amber-500/20 mb-2">
            <Shield className="w-10 h-10" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-amber-400">Card Bluff</h1>
          <p className="text-sm text-slate-400">เกมบลัฟการ์ดฮีโร่ - บลัฟ จับโกหก ชิงความเป็นหนึ่ง</p>
        </div>

        {/* Reconnect Banner */}
        {hasSavedToken && (
          <div className="bg-amber-500/15 border border-amber-500/30 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-amber-200">
            <div className="flex items-center space-x-2 text-sm">
              <RefreshCw className="w-4 h-4 animate-spin text-amber-400" />
              <span>พบเซสชันการเล่นค้างอยู่</span>
            </div>
            <button
              onClick={handleReconnectClick}
              disabled={isLoading}
              className="w-full sm:w-auto px-4 py-2 bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-slate-950 font-semibold rounded-lg transition-colors text-sm shadow-md"
            >
              กลับเข้าสู่เกมเดิม
            </button>
          </div>
        )}

        {/* Error Alert */}
        {errorMessage && (
          <div className="bg-red-500/15 border border-red-500/30 rounded-xl p-3.5 flex items-center space-x-2.5 text-red-300 text-sm">
            <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-400" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Tab Switcher */}
        <div className="grid grid-cols-2 gap-1 p-1 bg-slate-950/60 rounded-xl border border-slate-800">
          <button
            onClick={() => setActiveTab('create')}
            className={`py-2.5 text-sm font-semibold rounded-lg transition-all flex items-center justify-center space-x-2 ${
              activeTab === 'create'
                ? 'bg-amber-500 text-slate-950 shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <PlusCircle className="w-4 h-4" />
            <span>สร้างห้องใหม่</span>
          </button>
          <button
            onClick={() => setActiveTab('join')}
            className={`py-2.5 text-sm font-semibold rounded-lg transition-all flex items-center justify-center space-x-2 ${
              activeTab === 'join'
                ? 'bg-amber-500 text-slate-950 shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <LogIn className="w-4 h-4" />
            <span>เข้าร่วมห้อง</span>
          </button>
        </div>

        {/* Forms */}
        {activeTab === 'create' ? (
          <form onSubmit={handleCreateSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                ชื่อผู้เล่น
              </label>
              <input
                type="text"
                required
                maxLength={12}
                placeholder="กรอกชื่อผู้เล่นของคุณ"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                className="w-full px-4 py-3 bg-slate-950/80 border border-slate-700/80 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500 text-base"
              />
            </div>
            <button
              type="submit"
              disabled={isLoading || !playerName.trim()}
              className="w-full py-3.5 bg-amber-500 hover:bg-amber-600 active:bg-amber-700 disabled:opacity-50 text-slate-950 font-bold rounded-xl transition-colors shadow-lg text-base"
            >
              {isLoading ? 'กำลังสร้างห้อง...' : 'สร้างห้อง'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleJoinSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                ชื่อผู้เล่น
              </label>
              <input
                type="text"
                required
                maxLength={12}
                placeholder="กรอกชื่อผู้เล่นของคุณ"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                className="w-full px-4 py-3 bg-slate-950/80 border border-slate-700/80 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500 text-base"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                รหัสห้อง (Room Code)
              </label>
              <input
                type="text"
                required
                maxLength={6}
                placeholder="เช่น ABCDEF"
                value={roomId}
                onChange={(e) => setRoomId(e.target.value.toUpperCase())}
                className="w-full px-4 py-3 bg-slate-950/80 border border-slate-700/80 rounded-xl text-slate-100 placeholder-slate-500 uppercase tracking-widest text-center font-mono focus:outline-none focus:border-amber-500 text-base"
              />
            </div>
            <button
              type="submit"
              disabled={isLoading || !playerName.trim() || !roomId.trim()}
              className="w-full py-3.5 bg-amber-500 hover:bg-amber-600 active:bg-amber-700 disabled:opacity-50 text-slate-950 font-bold rounded-xl transition-colors shadow-lg text-base"
            >
              {isLoading ? 'กำลังเข้าร่วม...' : 'เข้าร่วมห้อง'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
