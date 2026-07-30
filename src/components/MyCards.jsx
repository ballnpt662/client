import React from 'react';
import { ROLE_INFO, getRoleTitle } from '../utils/textHelpers';
import { Shield, Axe, UserX, Eye, CheckCircle2, Lock } from 'lucide-react';

export default function MyCards({
  myCards = [],
  myCoins = 0,
  isSelectable = false,
  selectedCardIndex = null,
  onSelectCard,
}) {
  const getRoleIcon = (role) => {
    switch (role) {
      case 'AXE':
        return <Axe className="w-5 h-5 text-red-400" />;
      case 'SHIELD':
        return <Shield className="w-5 h-5 text-blue-400" />;
      case 'THIEF':
        return <UserX className="w-5 h-5 text-purple-400" />;
      case 'SEER':
        return <Eye className="w-5 h-5 text-emerald-400" />;
      default:
        return <Lock className="w-5 h-5 text-amber-400" />;
    }
  };

  return (
    <div className="w-full glass-panel border-t border-slate-800 p-3 sm:p-4 space-y-2.5">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-300 flex items-center space-x-1.5">
          <Lock className="w-3.5 h-3.5 text-amber-400" />
          <span>การ์ดลับของคุณ ({myCards.length} ใบ)</span>
        </span>
        {isSelectable && (
          <span className="text-xs font-bold text-amber-400 animate-pulse">
            แตะเลือกการ์ด 1 ใบที่จะเปิดเผย
          </span>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        {myCards.map((card, idx) => {
          const isRevealed = card.isRevealed;
          const role = card.role;
          const roleConfig = ROLE_INFO[role] || {};
          const isSelected = selectedCardIndex === idx;

          if (isRevealed) {
            return (
              <div
                key={card.id || idx}
                className="p-3 bg-red-950/20 border border-red-500/30 rounded-xl flex flex-col justify-between space-y-2 opacity-60 grayscale"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-red-400 line-through">
                    {getRoleTitle(role)}
                  </span>
                  <span className="text-[10px] bg-red-500/20 text-red-300 px-1.5 py-0.5 rounded border border-red-500/40 font-semibold">
                    ถูกเปิดแล้ว
                  </span>
                </div>
                <p className="text-[10px] text-slate-400">การ์ดใบนี้ถูกเปิดเผยแล้ว (สูญเสียพลังชีวิต)</p>
              </div>
            );
          }

          let borderClass = 'border-amber-500/40 bg-slate-950/70 hover:border-amber-400';
          if (isSelectable) {
            if (isSelected) {
              borderClass = 'border-emerald-500 bg-emerald-500/15 ring-2 ring-emerald-500 shadow-lg';
            } else {
              borderClass = 'border-amber-500 bg-amber-500/10 cursor-pointer animate-pulse-subtle';
            }
          }

          return (
            <div
              key={card.id || idx}
              onClick={() => {
                if (isSelectable && !isRevealed && onSelectCard) {
                  onSelectCard(idx);
                }
              }}
              className={`p-3 rounded-xl border transition-all flex flex-col justify-between space-y-2.5 relative ${borderClass}`}
            >
              {/* Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {getRoleIcon(role)}
                  <span className={`text-sm font-bold ${roleConfig.color || 'text-amber-300'}`}>
                    {getRoleTitle(role)}
                  </span>
                </div>
                {isSelected && (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                )}
              </div>

              {/* Description */}
              <p className="text-[11px] text-slate-300 leading-tight">
                {roleConfig.description || 'การ์ดลับประจำบทบาท'}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
