import React, { useState } from 'react';
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
      {showConfirmModal && selectedAction && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="w-full max-w-sm glass-modal rounded-2xl p-5 shadow-2xl border border-amber-500/40 space-y-4">
            <div className="flex items-center space-x-2 text-amber-400">
              <AlertTriangle className="w-5 h-5" />
              <h3 className="font-bold text-base">ยืนยันการใช้แอ็กชัน</h3>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              คุณกำลังจะใช้ <span className="font-bold text-amber-400">{ACTION_INFO[selectedAction]?.title}</span> ({ACTION_INFO[selectedAction]?.costText})
            </p>

            {/* Target Select */}
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-slate-300">
                เลือกเป้าหมาย:
              </label>
              <select
                value={selectedTargetId}
                onChange={(e) => setSelectedTargetId(e.target.value)}
                className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-slate-100 text-xs focus:outline-none focus:border-amber-500"
              >
                {activeOpponents.map((opp) => (
                  <option key={opp.id} value={opp.id}>
                    {opp.name} ({opp.coins} เหรียญ)
                  </option>
                ))}
              </select>
            </div>

            {/* Buttons */}
            <div className="flex items-center justify-end space-x-2 pt-2">
              <button
                onClick={() => {
                  setShowConfirmModal(false);
                  setSelectedAction(null);
                }}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl border border-slate-700 transition-colors flex items-center space-x-1"
              >
                <X className="w-3.5 h-3.5" />
                <span>ยกเลิก</span>
              </button>
              <button
                onClick={handleConfirmSubmit}
                disabled={!selectedTargetId}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-600 active:bg-amber-700 disabled:opacity-50 text-slate-950 text-xs font-bold rounded-xl shadow-lg transition-colors flex items-center space-x-1"
              >
                <Check className="w-3.5 h-3.5" />
                <span>ยืนยัน</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
