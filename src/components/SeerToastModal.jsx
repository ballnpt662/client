import React, { useEffect, useState } from 'react';
import { getRoleTitle, ROLE_INFO } from '../utils/textHelpers';
import { Eye, X } from 'lucide-react';

export default function SeerToastModal({
  seerResult = null,
  players = {},
  onClose,
}) {
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    if (!seerResult) return;

    const interval = setInterval(() => {
      setProgress((prev) => Math.max(0, prev - 2));
    }, 100);

    return () => clearInterval(interval);
  }, [seerResult]);

  if (!seerResult) return null;

  const targetPlayer = players[seerResult.targetPlayerId] || {};
  const cardRole = seerResult.card?.role;
  const roleConfig = ROLE_INFO[cardRole] || {};

  return (
    <div className="fixed top-4 right-4 max-w-sm w-[calc(100vw-2rem)] z-50 animate-pop-in">
      <div className="glass-modal rounded-2xl p-4 shadow-2xl border border-emerald-500/50 space-y-3 relative overflow-hidden">
        {/* Progress Bar at top */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-slate-900">
          <div
            className="h-full bg-emerald-500 transition-all duration-100 ease-linear"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center space-x-2 text-emerald-400">
            <Eye className="w-5 h-5 animate-pulse" />
            <h4 className="font-bold text-sm">ผลเนตรทิพย์ (SEER) — ลับเฉพาะคุณ (5s)</h4>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-slate-200 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 space-y-1.5">
          <p className="text-xs text-slate-300">
            การ์ดลับของ <strong className="text-amber-400">{targetPlayer.name || 'เป้าหมาย'}</strong> คือ:
          </p>
          <div className="flex items-center space-x-2">
            <span className={`text-base font-extrabold ${roleConfig.color || 'text-emerald-400'}`}>
              {getRoleTitle(cardRole)}
            </span>
            <span className="text-[10px] px-2 py-0.5 bg-emerald-500/20 text-emerald-300 rounded-full border border-emerald-500/30">
              {cardRole}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
