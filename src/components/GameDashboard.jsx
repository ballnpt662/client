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
import { MoreHorizontal, X, Sparkles, ScrollText, ChevronDown, ChevronUp } from 'lucide-react';
import { getActionTitle, PHASE_THAI_TEXT } from '../utils/textHelpers';
import GameEffects from './GameEffects';

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
  const [showLog, setShowLog] = useState(false);

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
  const sourcePlayer = players[currentAction?.sourcePlayerId] || {};
  const targetPlayer = players[currentAction?.targetPlayerId] || {};

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
    <div className="game-shell min-h-screen text-slate-800 flex flex-col relative">
      <div className="game-ambient" aria-hidden="true"><i/><i/><i/></div>
      <GameEffects phase={phase} eventLog={eventLog} coins={myPlayer.coins || 0} />
      {/* 1. Header */}
      <Header
        phase={phase}
        currentTurnPlayerName={currentTurnPlayer.name}
        isMyTurn={isMyTurn}
        timerRemaining={timerRemaining}
        roomId={roomId}
      />
      {isHost && onTerminateGame && phase !== 'GAME_OVER' && (
        <div className="fixed right-3 top-[4.5rem] z-40">
          <button onClick={() => setShowRoomMenu((v) => !v)} className="w-10 h-10 rounded-full bg-white border border-violet-100 shadow-md flex items-center justify-center" aria-label="เมนูห้อง"><MoreHorizontal className="w-5 h-5" /></button>
          {showRoomMenu && <button onClick={() => { setShowRoomMenu(false); setShowTerminateConfirm(true); }} className="absolute right-0 mt-2 whitespace-nowrap rounded-xl bg-white border border-rose-100 shadow-lg px-4 py-2.5 text-sm text-rose-600 font-medium">ยุติเกม</button>}
        </div>
      )}

      <main className="game-board flex-1 w-full max-w-6xl mx-auto px-3 sm:px-5 py-4 sm:py-6">
        <section className={`turn-stage ${isMyTurn ? 'turn-stage--mine' : ''}`} aria-live="polite">
          <div className="turn-stage__icon"><Sparkles className="w-5 h-5" /></div>
          <div className="min-w-0 flex-1">
            <p className="turn-stage__eyebrow">{isMyTurn ? 'ถึงตาของคุณแล้ว' : `ตาของ ${currentTurnPlayer.name || 'ผู้เล่น'}`}</p>
            <h2>{currentAction ? `${sourcePlayer.name || 'ผู้เล่น'} ใช้ ${getActionTitle(currentAction.actionType)}` : PHASE_THAI_TEXT[phase] || 'กำลังดำเนินเกม'}</h2>
            <p>{currentAction?.targetPlayerId ? `เป้าหมายคือ ${targetPlayer.name || 'ผู้เล่น'} · รอการตอบสนอง` : isMyTurn ? 'เลือกแอ็กชันจากแถบด้านล่างเพื่อเล่นตานี้' : 'ติดตามสถานการณ์และเตรียมตอบโต้'}</p>
          </div>
          <div className="turn-stage__time"><strong>{timerRemaining}</strong><span>วินาที</span></div>
        </section>

        <div className="game-layout">
          <section className="table-panel">
            <OtherPlayersPanel
              players={players}
              currentUserId={currentUserId}
              currentTurnPlayerId={currentTurnPlayerId}
              selectedTargetId={selectedTargetId}
              onSelectTarget={handleTargetSelect}
              selectable={isMyTurn && phase === 'WAITING_FOR_ACTION'}
            />
          </section>

          <aside className="player-dock">
            <div className="player-dock__heading"><div><span>พื้นที่ของคุณ</span><strong>{myPlayer.name || 'ผู้เล่น'}</strong></div><div className="coin-pill">● {myPlayer.coins || 0} เหรียญ</div></div>
            <MyCards
              myCards={myCards}
              myCoins={myPlayer.coins || 0}
              isSelectable={isRevealer}
              selectedCardIndex={selectedRevealIndex}
              onSelectCard={(idx) => setSelectedRevealIndex(idx)}
            />
            <button className="log-toggle" onClick={() => setShowLog((value) => !value)} aria-expanded={showLog}>
              <span><ScrollText className="w-4 h-4" /> ประวัติเกม</span>{showLog ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
            {showLog && <EventLog eventLog={eventLog} />}
          </aside>
        </div>
      </main>

      <div className="action-dock">
        <div className="w-full max-w-6xl mx-auto">
          <ActionMenu
            myCoins={myPlayer.coins || 0}
            isMyTurn={isMyTurn}
            phase={phase}
            otherPlayers={Object.values(players).filter((p) => p.id !== currentUserId)}
            onExecuteAction={canInteract ? onSendAction : () => {}}
          />
        </div>
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
