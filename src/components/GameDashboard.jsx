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
}) {
  const [selectedTargetId, setSelectedTargetId] = useState('');
  const [selectedRevealIndex, setSelectedRevealIndex] = useState(null);

  if (!publicState) return null;

  const {
    roomId,
    phase,
    currentTurnPlayerId,
    players = {},
    currentAction,
    eventLog = [],
    winnerPlayerId,
    pendingCardRevealerPlayerId,
  } = publicState;

  const myPlayer = players[currentUserId] || {};
  const isMyTurn = currentUserId === currentTurnPlayerId;
  const currentTurnPlayer = players[currentTurnPlayerId] || {};

  // Check if logged-in player is designated revealer in SELECT_CARD_TO_REVEAL phase
  const isRevealer = phase === 'SELECT_CARD_TO_REVEAL' && pendingCardRevealerPlayerId === currentUserId;

  const handleTargetSelect = (targetId) => {
    setSelectedTargetId(targetId);
  };

  const handleCardRevealConfirm = (cardIndex) => {
    onRevealCard(cardIndex);
    setSelectedRevealIndex(null);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col justify-between relative pb-20 sm:pb-0">
      {/* 1. Header */}
      <Header
        phase={phase}
        currentTurnPlayerName={currentTurnPlayer.name}
        isMyTurn={isMyTurn}
        timerRemaining={timerRemaining}
        roomId={roomId}
      />

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
          onExecuteAction={onSendAction}
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
        onChallenge={onSendChallenge}
        onCounter={onSendCounter}
        onPass={onSendPass}
        timerRemaining={timerRemaining}
      />

      {/* Reveal Card Modal */}
      <RevealCardModal
        isOpen={isRevealer}
        myCards={myCards}
        timerRemaining={timerRemaining}
        onConfirmReveal={handleCardRevealConfirm}
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
    </div>
  );
}
