import React, { useState } from 'react';
import { getRoleTitle } from '../utils/textHelpers';
import { AlertCircle, Check, Eye } from 'lucide-react';

export default function RevealCardModal({
  isOpen = false,
  myCards = [],
  timerRemaining = 10,
  onConfirmReveal,
}) {
  const [selectedIndex, setSelectedIndex] = useState(null);

  if (!isOpen) return null;

  // Filter available unrevealed cards
  const unrevealedCards = myCards.map((card, idx) => ({ card, idx })).filter((c) => !c.card.isRevealed);

  const handleConfirm = () => {
    if (selectedIndex === null) return;
    onConfirmReveal(selectedIndex);
    setSelectedIndex(null);
  };

  return (
    <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="w-full max-w-md glass-modal rounded-2xl p-6 shadow-2xl border border-red-500/40 space-y-5">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-2 text-red-400">
            <AlertCircle className="w-6 h-6 animate-pulse" />
            <h3 className="text-lg font-bold">เลือกการ์ด 1 ใบเพื่อเปิดเผย</h3>
          </div>
          <span className="text-xs font-mono font-bold px-2.5 py-1 bg-red-500/20 text-red-300 rounded-full border border-red-500/30">
            {timerRemaining} วินาที
          </span>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">
          คุณต้องเลือกการ์ดลับ 1 ใบเพื่อเปิดเผยต่อหน้าผู้เล่นทุกคน (หากหมดเวลาระบบจะสุ่มเปิดให้อัตโนมัติ)
        </p>

        {/* Card Options */}
        <div className="grid grid-cols-2 gap-3">
          {unrevealedCards.map(({ card, idx }) => {
            const isSelected = selectedIndex === idx;

            return (
              <div
                key={card.id || idx}
                onClick={() => setSelectedIndex(idx)}
                className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between space-y-3 ${
                  isSelected
                    ? 'bg-red-500/20 border-red-500 ring-2 ring-red-500 shadow-lg'
                    : 'bg-slate-900 border-slate-800 hover:border-red-400/60'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-slate-100">
                    {getRoleTitle(card.role)}
                  </span>
                  {isSelected && <Check className="w-4 h-4 text-red-400" />}
                </div>

                <div className="flex items-center justify-center py-2">
                  <Eye className="w-8 h-8 text-red-400/80" />
                </div>

                <span className="text-[10px] text-center text-slate-400">
                  แตะเพื่อเลือกเปิดใบนี้
                </span>
              </div>
            );
          })}
        </div>

        {/* Action Button */}
        <div className="pt-2">
          <button
            onClick={handleConfirm}
            disabled={selectedIndex === null}
            className="w-full py-3.5 bg-red-600 hover:bg-red-700 active:bg-red-800 disabled:opacity-40 text-slate-100 font-bold rounded-xl shadow-lg transition-all text-base flex items-center justify-center space-x-2"
          >
            <Check className="w-5 h-5" />
            <span>ยืนยันการเปิดการ์ด</span>
          </button>
        </div>
      </div>
    </div>
  );
}
