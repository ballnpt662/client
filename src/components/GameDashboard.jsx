import React, { useState } from 'react';
import Header from './Header';
import OtherPlayersPanel from './OtherPlayersPanel';
import MyCards from './MyCards';
import ActionMenu from './ActionMenu';
import EventLog from './EventLog';
import ResponseOverlay from './ResponseOverlay';
import RevealCardModal from './RevealCardModal';
import SeerToastModal from './SeerToastModal';
import GameOverScreen from './GameOverScreen';
import { MoreHorizontal, X } from 'lucide-react';

export default function GameDashboard({
  publicState,
  myCards = [],
  currentUserId,
  seerResult,
  timerRemaining,
  onSendAction,
  onSendChallenge,
  onSendCounter,
  onSendPass,
  onRevealCard,
  onDismissSeer,
  onLeaveRoom,
  onTerminateGame,
  isHost,
  connectionState,
}) {
  const [selectedTargetId, setSelectedTargetId] = useState('');
  const [selectedRevealIndex, setSelectedRevealIndex] = useState(null);
  const [showRoomMenu, setShowRoomMenu] = useState(false);
  const [showTerminateConfirm, setShowTerminateConfirm] = useState(false);
  const [isTerminating, setIsTerminating] = useState(false);

  if (!publicState) return null;

  const {
    roomId,
    phase,
    currentTurnPlayerId,
    players = {},
    currentAction,
    eventLog = [],
    winnerPlayerId,
  } = publicState;

  const myPlayer = players[currentUserId] || {};
  const isMyTurn = currentUserId === currentTurnPlayerId;
  const currentTurnPlayer = players[currentTurnPlayerId] || {};

  // Check if logged-in player is designated revealer in SELECT_CARD_TO_REVEAL phase
  const isRevealer =
    phase === 'SELECT_CARD_TO_REVEAL' &&
    currentAction?.pendingCardRevealerPlayerId === currentUserId;
  const canInteract = connectionState === 'CONNECTED';

  const handleTargetSelect = (targetId) => {
    setSelectedTargetId(targetId);
  };

  const handleCardRevealConfirm = (cardIndex) => {
    onRevealCard(cardIndex);
    setSelectedRevealIndex(null);
  };

  return (
    <div className="min-h-screen bg-[#f7f5ff] text-slate-800 flex flex-col justify-between relative pb-20 sm:pb-0">
      {/* 1. Header */}
      <Header
        phase={phase}
        currentTurnPlayerName={currentTurnPlayer.name}
        isMyTurn={isMyTurn}
        timerRemaining={timerRemaining}
        roomId={roomId}
      />
      {isHost && onTerminateGame && phase !== 'GAME_OVER' && (
        <div className="fixed right-3 top-16 z-40">
          <button onClick={() => setShowRoomMenu((v) => !v)} className="w-10 h-10 rounded-full bg-white border border-violet-100 shadow-md flex items-center justify-center" aria-label="เมนูห้อง"><MoreHorizontal className="w-5 h-5" /></button>
          {showRoomMenu && <button onClick={() => { setShowRoomMenu(false); setShowTerminateConfirm(true); }} className="absolute right-0 mt-2 whitespace-nowrap rounded-xl bg-white border border-rose-100 shadow-lg px-4 py-2.5 text-sm text-rose-600 font-medium">ยุติเกม</button>}
        </div>
      )}

      {/* Main Content Body */}
      <div className="flex-1 max-w-4xl w-full mx-auto p-2 sm:p-4 space-y-4">
        {/* 2. Other Players Panel */}
        <OtherPlayersPanel
          players={players}
          currentUserId={currentUserId}
          currentTurnPlayerId={currentTurnPlayerId}
          selectedTargetId={selectedTargetId}
          onSelectTarget={handleTargetSelect}
          selectable={isMyTurn && phase === 'WAITING_FOR_ACTION'}
        />

        {/* 3. Event Log */}
        <EventLog eventLog={eventLog} />
      </div>

      {/* Sticky Bottom Area: Action Menu & My Cards */}
      <div className="w-full max-w-4xl mx-auto space-y-0">
        {/* 4. Action Menu */}
        <ActionMenu
          myCoins={myPlayer.coins || 0}
          isMyTurn={isMyTurn}
          phase={phase}
          otherPlayers={Object.values(players).filter((p) => p.id !== currentUserId)}
          onExecuteAction={canInteract ? onSendAction : () => {}}
        />

        {/* 5. My Cards */}
        <MyCards
          myCards={myCards}
          myCoins={myPlayer.coins || 0}
          isSelectable={isRevealer}
          selectedCardIndex={selectedRevealIndex}
          onSelectCard={(idx) => setSelectedRevealIndex(idx)}
        />
      </div>

      {/* 6. Overlays & Modals */}

      {/* Response Overlay (Challenge / Counter / Pass) */}
      <ResponseOverlay
        phase={phase}
        currentAction={currentAction}
        currentUserId={currentUserId}
        players={players}
        onChallenge={canInteract ? onSendChallenge : () => {}}
        onCounter={canInteract ? onSendCounter : () => {}}
        onPass={canInteract ? onSendPass : () => {}}
        timerRemaining={timerRemaining}
      />

      {/* Reveal Card Modal */}
      <RevealCardModal
        isOpen={isRevealer}
        myCards={myCards}
        timerRemaining={timerRemaining}
        onConfirmReveal={canInteract ? handleCardRevealConfirm : () => {}}
      />

      {/* Private SEER Toast Modal */}
      <SeerToastModal
        seerResult={seerResult}
        players={players}
        onClose={onDismissSeer}
      />

      {/* Game Over Modal */}
      {phase === 'GAME_OVER' && (
        <GameOverScreen
          winnerPlayerId={winnerPlayerId}
          players={players}
          currentUserId={currentUserId}
          onReturnToMain={onLeaveRoom}
        />
      )}
      {showTerminateConfirm && (
        <div className="fixed inset-0 z-50 bg-slate-900/30 backdrop-blur-sm flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="terminate-title">
          <div className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl">
            <div className="flex justify-between items-start gap-4"><div><h3 id="terminate-title" className="text-lg font-bold">ยืนยันยุติเกม?</h3><p className="mt-2 text-sm text-slate-500">การแข่งขันปัจจุบันจะสิ้นสุดและผู้เล่นทุกคนจะกลับไปยังห้องรอ</p></div><button onClick={() => setShowTerminateConfirm(false)} aria-label="ปิด"><X className="w-5 h-5" /></button></div>
            <div className="space-y-3 mt-6"><button disabled={isTerminating} onClick={async () => { setIsTerminating(true); try { await onTerminateGame(); } finally { setIsTerminating(false); setShowTerminateConfirm(false); } }} className="w-full py-3 rounded-xl bg-rose-500 text-white font-semibold disabled:opacity-50">{isTerminating ? 'กำลังยุติ...' : 'ยุติเกมและกลับ Lobby'}</button><button onClick={() => setShowTerminateConfirm(false)} className="w-full py-3 rounded-xl bg-slate-100 font-semibold">ยกเลิก</button></div>
          </div>
        </div>
      )}
    </div>
  );
}
