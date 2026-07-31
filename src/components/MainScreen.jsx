import React, { useState } from 'react';
import { Shield, PlusCircle, LogIn, AlertCircle } from 'lucide-react';

export default function MainScreen({
  onCreateRoom,
  onJoinRoom,
  errorMessage,
  isLoading,
}) {
  const [activeTab, setActiveTab] = useState('create'); // 'create' | 'join'
  const [playerName, setPlayerName] = useState('');
  const [roomId, setRoomId] = useState('');

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

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#f7f5ff] text-slate-800">
      <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-xl shadow-violet-100/70 border border-violet-100 space-y-6">
        {/* Title Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center p-3 bg-violet-100 text-violet-600 rounded-2xl mb-2">
            <Shield className="w-10 h-10" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-violet-700">Card Bluff</h1>
          <p className="text-sm text-slate-500">เกมบลัฟการ์ดฮีโร่ · บลัฟ จับโกหก ชิงความเป็นหนึ่ง</p>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="bg-red-500/15 border border-red-500/30 rounded-xl p-3.5 flex items-center space-x-2.5 text-red-300 text-sm">
            <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-400" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Tab Switcher */}
        <div className="grid grid-cols-2 gap-1 p-1 bg-violet-50 rounded-xl border border-violet-100">
          <button
            onClick={() => setActiveTab('create')}
            className={`py-2.5 text-sm font-semibold rounded-lg transition-all flex items-center justify-center space-x-2 ${
              activeTab === 'create'
                ? 'bg-violet-500 text-white shadow'
                : 'text-slate-500 hover:text-violet-700'
            }`}
          >
            <PlusCircle className="w-4 h-4" />
            <span>สร้างห้องใหม่</span>
          </button>
          <button
            onClick={() => setActiveTab('join')}
            className={`py-2.5 text-sm font-semibold rounded-lg transition-all flex items-center justify-center space-x-2 ${
              activeTab === 'join'
                ? 'bg-violet-500 text-white shadow'
                : 'text-slate-500 hover:text-violet-700'
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
                className="w-full px-4 py-3 bg-white border border-violet-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-200 text-base"
              />
            </div>
            <button
              type="submit"
              disabled={isLoading || !playerName.trim()}
              className="w-full py-3.5 bg-violet-500 hover:bg-violet-600 disabled:opacity-50 text-white font-bold rounded-xl transition-colors shadow-lg shadow-violet-200 text-base"
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
                className="w-full px-4 py-3 bg-white border border-violet-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-200 text-base"
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
                className="w-full px-4 py-3 bg-white border border-violet-200 rounded-xl text-slate-800 placeholder-slate-400 uppercase tracking-widest text-center font-mono focus:outline-none focus:ring-2 focus:ring-violet-200 text-base"
              />
            </div>
            <button
              type="submit"
              disabled={isLoading || !playerName.trim() || !roomId.trim()}
              className="w-full py-3.5 bg-violet-500 hover:bg-violet-600 disabled:opacity-50 text-white font-bold rounded-xl transition-colors shadow-lg shadow-violet-200 text-base"
            >
              {isLoading ? 'กำลังเข้าร่วม...' : 'เข้าร่วมห้อง'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
