import React, { useState } from 'react';
import { getActionTitle, getRoleTitle } from '../utils/textHelpers';
import { Shield, Swords, ShieldAlert, Check, X, Axe, UserX } from 'lucide-react';

export default function ResponseOverlay({
  phase,
  currentAction,
  currentUserId,
  players = {},
  onChallenge,
  onCounter,
  onPass,
  timerRemaining = 0,
}) {
  const [selectedCounterRole, setSelectedCounterRole] = useState('');

  if (!['CHALLENGE_ACTION', 'WAITING_FOR_COUNTER', 'CHALLENGE_COUNTER'].includes(phase)) {
    return null;
  }

  const sourcePlayer = players[currentAction?.sourcePlayerId] || {};
  const targetPlayer = players[currentAction?.targetPlayerId] || {};
  const counterPlayer = players[currentAction?.counterPlayerId] || {};

  const isSource = currentUserId === currentAction?.sourcePlayerId;
  const isTarget = currentUserId === currentAction?.targetPlayerId;
  const isCounter = currentUserId === currentAction?.counterPlayerId;

  // Determine allowed counter roles based on action type
  let availableCounterRoles = [];
  if (phase === 'WAITING_FOR_COUNTER' && isTarget) {
    if (currentAction?.actionType === 'AXE' || currentAction?.actionType === 'SHIELD_INCOME') {
      availableCounterRoles = ['SHIELD'];
    } else if (currentAction?.actionType === 'STEAL') {
      availableCounterRoles = ['THIEF'];
    }
  }

  const handleSendCounter = (role) => {
    if (!role) return;
    onCounter({ counterRole: role });
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 p-4 z-40 bg-slate-950/90 backdrop-blur-lg border-t border-amber-500/40 shadow-2xl animate-fade-in">
      <div className="max-w-xl mx-auto space-y-3">
        {/* Header & Status */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-amber-400">
            <ShieldAlert className="w-5 h-5 animate-pulse" />
            <span className="font-bold text-sm">
              {phase === 'CHALLENGE_ACTION' && 'ช่วงเวลาท้าทาย (จับโกหก)'}
              {phase === 'WAITING_FOR_COUNTER' && 'ช่วงเวลาเลือกป้องกัน (Counter)'}
              {phase === 'CHALLENGE_COUNTER' && 'ช่วงเวลาท้าทายการป้องกัน'}
            </span>
          </div>

          <span className="text-xs font-mono font-bold px-2.5 py-1 bg-amber-500/20 text-amber-300 rounded-full border border-amber-500/30">
            {timerRemaining} วินาที
          </span>
        </div>

        {/* Action Summary Message */}
        <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 text-xs text-slate-200 leading-relaxed">
          {phase === 'CHALLENGE_ACTION' && (
            <span>
              <strong className="text-amber-400">{sourcePlayer.name || 'ผู้เล่น'}</strong> ประกาศใช้{' '}
              <strong className="text-amber-300">{getActionTitle(currentAction?.actionType)}</strong>
              {targetPlayer.name && (
                <span> ใส่ <strong className="text-amber-400">{targetPlayer.name}</strong></span>
              )}
            </span>
          )}

          {phase === 'WAITING_FOR_COUNTER' && (
            <span>
              <strong className="text-amber-400">{targetPlayer.name || 'เป้าหมาย'}</strong> ถูกโจมตีด้วย{' '}
              <strong className="text-amber-300">{getActionTitle(currentAction?.actionType)}</strong>! ต้องการเลือกการ์ดป้องกันหรือไม่?
            </span>
          )}

          {phase === 'CHALLENGE_COUNTER' && (
            <span>
              <strong className="text-amber-400">{counterPlayer.name || targetPlayer.name || 'ผู้เล่น'}</strong> ประกาศใช้บทบาท{' '}
              <strong className="text-amber-300">{getRoleTitle(currentAction?.counterRole)}</strong> เพื่อป้องกัน!
            </span>
          )}
        </div>

        {/* Response Action Buttons */}
        <div className="flex flex-wrap items-center justify-end gap-2 pt-1">
          {/* Challenge Button (available to active players except source in CHALLENGE_ACTION; except counter player in CHALLENGE_COUNTER) */}
          {((phase === 'CHALLENGE_ACTION' && !isSource) || (phase === 'CHALLENGE_COUNTER' && !isCounter && !isTarget)) && (
            <button
              onClick={onChallenge}
              className="flex-1 sm:flex-none px-4 py-2.5 bg-red-600 hover:bg-red-700 active:bg-red-800 text-slate-100 text-xs font-bold rounded-xl shadow-lg transition-all flex items-center justify-center space-x-1.5 border border-red-500/50"
            >
              <Swords className="w-4 h-4" />
              <span>ท้าทาย (จับโกหก)</span>
            </button>
          )}

          {/* Counter Buttons (available to target in WAITING_FOR_COUNTER) */}
          {phase === 'WAITING_FOR_COUNTER' && isTarget && (
            <div className="flex items-center space-x-2">
              {availableCounterRoles.map((role) => (
                <button
                  key={role}
                  onClick={() => handleSendCounter(role)}
                  className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-slate-100 text-xs font-bold rounded-xl shadow-lg transition-all flex items-center justify-center space-x-1.5 border border-blue-500/50"
                >
                  <Shield className="w-4 h-4" />
                  <span>ป้องกันด้วย {getRoleTitle(role)}</span>
                </button>
              ))}
            </div>
          )}

          {/* Pass Button */}
          <button
            onClick={onPass}
            className="flex-1 sm:flex-none px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl border border-slate-700 transition-colors flex items-center justify-center space-x-1"
          >
            <X className="w-4 h-4" />
            <span>ผ่าน (ไม่ทำอะไร)</span>
          </button>
        </div>
      </div>
    </div>
  );
}
