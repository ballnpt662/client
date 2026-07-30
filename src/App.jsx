import React, { useEffect, useRef } from 'react';
import { useSocketGame } from './hooks/useSocketGame';
import MainScreen from './components/MainScreen';
import LobbyScreen from './components/LobbyScreen';
import GameDashboard from './components/GameDashboard';
import { soundManager } from './utils/soundManager';

export default function App() {
  const {
    isConnected,
    roomInfo,
    publicState,
    myCards,
    seerResult,
    timerRemaining,
    error,
    isLoading,
    createRoom,
    joinRoom,
    reconnectRoom,
    startGame,
    sendAction,
    sendChallenge,
    sendCounter,
    sendPass,
    revealCard,
    leaveRoom,
    dismissSeerResult,
  } = useSocketGame();

  const prevPhaseRef = useRef(null);
  const prevTurnRef = useRef(null);

  const currentUserId = roomInfo?.playerId || '';
  const inRoom = Boolean(roomInfo?.roomId);
  const phase = publicState?.phase;
  const currentTurnPlayerId = publicState?.currentTurnPlayerId;
  const isGameStarted = Boolean(publicState && phase !== undefined);

  // Play sounds on phase/turn changes
  useEffect(() => {
    if (!phase) return;
    const prevPhase = prevPhaseRef.current;
    const prevTurn = prevTurnRef.current;

    // New turn start
    if (currentTurnPlayerId && currentTurnPlayerId !== prevTurn && phase === 'WAITING_FOR_ACTION') {
      soundManager.playTurnStart();
    }

    // Challenge phase started
    if (phase === 'CHALLENGE_ACTION' && prevPhase !== 'CHALLENGE_ACTION') {
      soundManager.playChallenge();
    }

    // Game over
    if (phase === 'GAME_OVER' && prevPhase !== 'GAME_OVER') {
      if (publicState?.winnerPlayerId === currentUserId) {
        soundManager.playVictory();
      } else {
        soundManager.playEliminated();
      }
    }

    prevPhaseRef.current = phase;
    prevTurnRef.current = currentTurnPlayerId;
  }, [phase, currentTurnPlayerId, publicState?.winnerPlayerId, currentUserId]);

  // Play sound when cards are revealed (listen to eventLog changes)
  const prevEventCountRef = useRef(0);
  useEffect(() => {
    const log = publicState?.eventLog || [];
    if (log.length > prevEventCountRef.current) {
      const newEvents = log.slice(prevEventCountRef.current);
      newEvents.forEach((ev) => {
        if (ev.type === 'REVEAL' || ev.type === 'ELIMINATION') {
          soundManager.playRevealCard();
        }
        if (ev.type === 'ELIMINATION') {
          setTimeout(() => soundManager.playEliminated(), 300);
        }
      });
      prevEventCountRef.current = log.length;
    }
  }, [publicState?.eventLog]);

  if (!inRoom) {
    return (
      <MainScreen
        onCreateRoom={createRoom}
        onJoinRoom={joinRoom}
        onReconnect={reconnectRoom}
        errorMessage={error}
        isLoading={isLoading}
        isConnected={isConnected}
      />
    );
  }

  if (!isGameStarted) {
    return (
      <LobbyScreen
        roomInfo={roomInfo}
        currentUserId={currentUserId}
        onStartGame={startGame}
        onLeaveRoom={leaveRoom}
      />
    );
  }

  return (
    <GameDashboard
      publicState={publicState}
      myCards={myCards}
      currentUserId={currentUserId}
      seerResult={seerResult}
      timerRemaining={timerRemaining}
      onSendAction={sendAction}
      onSendChallenge={sendChallenge}
      onSendCounter={sendCounter}
      onSendPass={sendPass}
      onRevealCard={revealCard}
      onDismissSeer={dismissSeerResult}
      onLeaveRoom={leaveRoom}
    />
  );
}
