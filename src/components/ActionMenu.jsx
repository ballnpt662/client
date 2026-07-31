import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { ACTION_INFO } from '../utils/textHelpers';
import { Coins, Swords, Axe, Shield, UserX, Eye, AlertTriangle, Check, X } from 'lucide-react';

export default function ActionMenu({
  myCoins = 0,
  isMyTurn = false,
  phase,
  otherPlayers = [],
  onExecuteAction,
}) {
  const [selectedAction, setSelectedAction] = useState(null);
  const [selectedTargetId, setSelectedTargetId] = useState('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const activeOpponents = otherPlayers.filter((p) => !p.isEliminated);
  const isWaitingActionPhase = phase === 'WAITING_FOR_ACTION';
  const canAct = isMyTurn && isWaitingActionPhase;
  const isForcedCoup = myCoins >= 10;
  const selectedTarget = activeOpponents.find((player) => player.id === selectedTargetId);
  const selectedCost = selectedAction === 'COUP' ? 7 : selectedAction === 'AXE' ? 3 : 0;

  useEffect(() => {
    if (!showConfirmModal) return undefined;
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setShowConfirmModal(false);
        setSelectedAction(null);
        setSelectedTargetId('');
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [showConfirmModal]);

  const getActionIcon = (type) => {
    switch (type) {
      case 'INCOME':
        return <Coins className="w-5 h-5 text-amber-400" />;
      case 'COUP':
        return <Swords className="w-5 h-5 text-red-500" />;
      case 'AXE':
        return <Axe className="w-5 h-5 text-red-400" />;
      case 'SHIELD_INCOME':
        return <Shield className="w-5 h-5 text-blue-400" />;
      case 'STEAL':
        return <UserX className="w-5 h-5 text-purple-400" />;
      case 'SEER':
        return <Eye className="w-5 h-5 text-emerald-400" />;
      default:
        return null;
    }
  };

  const handleActionClick = (actionType) => {
    if (!canAct) return;
    if (isForcedCoup && actionType !== 'COUP') return;

    // Check if target is needed (COUP, AXE, STEAL, SEER)
    const needsTarget = ['COUP', 'AXE', 'STEAL', 'SEER'].includes(actionType);
    if (!needsTarget) {
      // INCOME and SHIELD_INCOME resolve without a target. Send immediately;
      // previously these only changed local selection and timed out to INCOME.
      onExecuteAction({ actionType });
      setSelectedAction(null);
      setSelectedTargetId('');
      return;
    }

    setSelectedAction(actionType);
    if (needsTarget) {
      // Pick first active opponent by default if available
      const defaultTarget = activeOpponents[0]?.id || '';
      setSelectedTargetId(defaultTarget);

      // If COUP or AXE, prompt confirmation modal
      if (actionType === 'COUP' || actionType === 'AXE') {
        setShowConfirmModal(true);
      }
    }
  };

  const handleConfirmSubmit = () => {
    if (!selectedAction) return;
    const needsTarget = ['COUP', 'AXE', 'STEAL', 'SEER'].includes(selectedAction);

    if (needsTarget && !selectedTargetId) {
      return;
    }

    onExecuteAction({
      actionType: selectedAction,
      targetPlayerId: needsTarget ? selectedTargetId : undefined,
    });

    setShowConfirmModal(false);
    setSelectedAction(null);
    setSelectedTargetId('');
  };

  return (
    <div className="w-full glass-panel border-t border-slate-800 p-3 sm:p-4 space-y-3">
      {/* Forced COUP Alert */}
      {isForcedCoup && canAct && (
        <div className="bg-red-500/20 border border-red-500/40 rounded-xl p-2.5 flex items-center space-x-2 text-red-200 text-xs font-semibold animate-pulse">
          <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0" />
          <span>เหรียญของคุณ ≥ 10 เหรียญ! ถูกบังคับใช้ "โจมตีแน่นอน (COUP)" เท่านั้น</span>
        </div>
      )}

      {/* Action Buttons Grid (2x3) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {Object.keys(ACTION_INFO).map((type) => {
          const info = ACTION_INFO[type];
          let disabled = !canAct;

          if (isForcedCoup && type !== 'COUP') {
            disabled = true;
          }
          if (type === 'COUP' && myCoins < 7) {
            disabled = true;
          }
          if (type === 'AXE' && myCoins < 3) {
            disabled = true;
          }

          const isSelected = selectedAction === type;

          return (
            <button
              key={type}
              onClick={() => handleActionClick(type)}
              disabled={disabled}
              className={`min-h-[52px] p-2.5 rounded-xl border transition-all flex flex-col justify-between text-left ${
                isSelected
                  ? 'bg-amber-500/20 border-amber-500 text-amber-100 ring-2 ring-amber-500'
                  : disabled
                  ? 'bg-slate-950/30 border-slate-800/60 opacity-40 text-slate-500 cursor-not-allowed'
                  : 'bg-slate-950/70 border-slate-700/80 hover:border-amber-500/60 text-slate-200 active:scale-[0.98]'
              }`}
            >
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center space-x-2">
                  {getActionIcon(type)}
                  <span className="font-bold text-xs">{info.title}</span>
                </div>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300 font-semibold">
                  {info.costText}
                </span>
              </div>
              <p className="text-[10px] text-slate-400 mt-1 line-clamp-1">{info.description}</p>
            </button>
          );
        })}
      </div>

      {/* Target Selector Bar (if action selected requires target & modal not open) */}
      {selectedAction && ['STEAL', 'SEER'].includes(selectedAction) && (
        <div className="p-3 bg-slate-950/80 rounded-xl border border-amber-500/40 space-y-2">
          <label className="block text-xs font-semibold text-amber-300">
            เลือกเป้าหมายสำหรับ {ACTION_INFO[selectedAction]?.title}:
          </label>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {activeOpponents.map((opp) => (
              <button
                key={opp.id}
                onClick={() => setSelectedTargetId(opp.id)}
                className={`px-3 py-2 rounded-lg text-xs font-bold border transition-all whitespace-nowrap ${
                  selectedTargetId === opp.id
                    ? 'bg-amber-500 text-slate-950 border-amber-500'
                    : 'bg-slate-900 border-slate-700 text-slate-300 hover:border-slate-500'
                }`}
              >
                {opp.name}
              </button>
            ))}
          </div>
          <div className="flex justify-end space-x-2 pt-1">
            <button
              onClick={() => setSelectedAction(null)}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold border border-slate-700"
            >
              ยกเลิก
            </button>
            <button
              onClick={handleConfirmSubmit}
              disabled={!selectedTargetId}
              className="px-4 py-1.5 bg-amber-500 hover:bg-amber-600 active:bg-amber-700 disabled:opacity-50 text-slate-950 rounded-lg text-xs font-bold shadow"
            >
              ยืนยันแอ็กชัน
            </button>
          </div>
        </div>
      )}

      {/* Confirmation Modal for COUP and AXE */}
      {showConfirmModal && selectedAction && createPortal(
        <div className="action-confirm-backdrop animate-fade-in" role="dialog" aria-modal="true" aria-labelledby="action-confirm-title">
          <div className="action-confirm-modal">
            <div className="action-confirm-scroll">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span className="grid h-11 w-11 flex-shrink-0 place-items-center rounded-2xl bg-amber-100 text-amber-600">
                    {getActionIcon(selectedAction)}
                  </span>
                  <div>
                    <p className="text-[11px] font-bold tracking-[.16em] text-amber-600">CONFIRM ACTION</p>
                    <h3 id="action-confirm-title" className="text-lg font-black text-slate-800">{ACTION_INFO[selectedAction]?.title}</h3>
                  </div>
                </div>
                <button onClick={() => { setShowConfirmModal(false); setSelectedAction(null); setSelectedTargetId(''); }} className="rounded-full bg-slate-100 p-2 text-slate-500 hover:bg-slate-200" aria-label="ปิดหน้าต่างยืนยัน">
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-2">
                <div className="rounded-2xl bg-amber-50 p-3">
                  <p className="text-[11px] font-semibold text-amber-700">ค่าใช้จ่าย</p>
                  <p className="mt-1 text-lg font-black text-amber-800">{selectedCost} เหรียญ</p>
                </div>
                <div className="rounded-2xl bg-violet-50 p-3">
                  <p className="text-[11px] font-semibold text-violet-600">เหรียญหลังใช้</p>
                  <p className="mt-1 text-lg font-black text-violet-800">{Math.max(0, myCoins - selectedCost)} เหรียญ</p>
                </div>
              </div>

              <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-3 text-xs leading-5 text-slate-600">
                {selectedAction === 'COUP'
                  ? 'การโจมตีนี้สำเร็จแน่นอน เป้าหมายไม่สามารถท้าทายหรือใช้บทบาทป้องกันได้'
                  : 'เป้าหมายสามารถอ้างบทบาทโล่เพื่อป้องกัน และผู้เล่นอื่นอาจท้าทายคำกล่าวอ้างได้'}
              </div>

              <fieldset className="mt-5">
                <legend className="mb-2 text-xs font-bold text-slate-700">เลือกผู้เล่นเป้าหมาย</legend>
                <div className="grid max-h-44 gap-2 overflow-y-auto pr-1 sm:grid-cols-2">
                  {activeOpponents.map((opp) => (
                    <button type="button" key={opp.id} onClick={() => setSelectedTargetId(opp.id)} className={`rounded-xl border p-3 text-left transition ${selectedTargetId === opp.id ? 'border-amber-400 bg-amber-50 ring-2 ring-amber-100' : 'border-slate-200 bg-white hover:border-violet-300'}`}>
                      <span className="block truncate text-sm font-black text-slate-800">{opp.name}</span>
                      <span className="mt-1 block text-[11px] font-semibold text-slate-500">{opp.coins} เหรียญ · {opp.hiddenCardCount ?? opp.cards?.filter((card) => !card.isRevealed).length ?? '?'} การ์ดคว่ำ</span>
                    </button>
                  ))}
                </div>
              </fieldset>

              {selectedTarget && <p className="mt-3 text-center text-xs font-semibold text-slate-500">เป้าหมายที่เลือก: <span className="text-slate-800">{selectedTarget.name}</span></p>}
            </div>

            <div className="action-confirm-footer">
              <button onClick={() => { setShowConfirmModal(false); setSelectedAction(null); setSelectedTargetId(''); }} className="rounded-xl bg-slate-100 px-4 py-3 text-sm font-bold text-slate-600 hover:bg-slate-200">ยกเลิก</button>
              <button onClick={handleConfirmSubmit} disabled={!selectedTargetId} className="flex items-center justify-center gap-2 rounded-xl bg-amber-500 px-5 py-3 text-sm font-black text-slate-900 shadow-lg shadow-amber-200 hover:bg-amber-400 disabled:opacity-40">
                <Check className="h-4 w-4" /> ยืนยันโจมตี
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
