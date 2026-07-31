import React, { useEffect, useRef, useState } from 'react';
import { useSocketGame } from './hooks/useSocketGame';
import MainScreen from './components/MainScreen';
import LobbyScreen from './components/LobbyScreen';
import GameDashboard from './components/GameDashboard';
import ConnectionOverlay from './components/ConnectionOverlay';
import { soundManager } from './utils/soundManager';
import GameStore from './components/GameStore';
import ShadowGameApp from './shadow/ShadowGameApp';
import NightfallGameApp from './nightfall/NightfallGameApp';
import { flushSync } from 'react-dom';

function CardBluffApp({ inviteRoomId = '' }) {
  const {
    connectionState,
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
    closeRoom,
    terminateGame,
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
  const prevEventCountRef = useRef(0);

  const currentUserId = roomInfo?.playerId || '';
  const inRoom = Boolean(roomInfo?.roomId);
  const phase = publicState?.phase;
  const currentTurnPlayerId = publicState?.currentTurnPlayerId;
  const isGameStarted = Boolean(publicState && phase !== undefined);
  const isHost = Boolean(roomInfo?.playerId && roomInfo?.playerId === roomInfo?.hostPlayerId);

  // Play sounds on phase/turn changes
  useEffect(() => {
    if (!phase) return;
    const prevPhase = prevPhaseRef.current;

    if (currentTurnPlayerId && currentTurnPlayerId !== prevTurnRef.current && phase === 'WAITING_FOR_ACTION') {
      soundManager.playTurnStart();
    }
    if (phase === 'CHALLENGE_ACTION' && prevPhase !== 'CHALLENGE_ACTION') {
      soundManager.playChallenge();
    }
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

  // Sound on card reveal / elimination events
  useEffect(() => {
    const log = publicState?.eventLog || [];
    if (log.length > prevEventCountRef.current) {
      const newEvents = log.slice(prevEventCountRef.current);
      newEvents.forEach((ev) => {
        if (ev.type === 'REVEAL' || ev.type === 'ELIMINATION') soundManager.playRevealCard();
        if (ev.type === 'ELIMINATION') setTimeout(() => soundManager.playEliminated(), 300);
      });
      prevEventCountRef.current = log.length;
    }
  }, [publicState?.eventLog]);

  // Reset event counter when game is reset
  useEffect(() => {
    if (!publicState) prevEventCountRef.current = 0;
  }, [publicState]);

  // ── Full-screen overlays (CONNECTING, RECONNECTING, FAILED) ─────────────────
  if (connectionState === 'CONNECTING' || connectionState === 'RECONNECTING') {
    return (
      <ConnectionOverlay
        state={connectionState}
        onReturnHome={() => {
          leaveRoom();
        }}
      />
    );
  }

  if (connectionState === 'FAILED') {
    return (
      <ConnectionOverlay
        state="FAILED"
        onRetry={() => window.location.reload()}
        onReturnHome={() => {
          leaveRoom();
          window.location.reload();
        }}
      />
    );
  }

  // ── Normal screens ───────────────────────────────────────────────────────────
  if (!inRoom) {
    return (
      <>
        <ConnectionOverlay state={connectionState} />
        <MainScreen
          initialRoomId={inviteRoomId}
          onCreateRoom={createRoom}
          onJoinRoom={joinRoom}
          onReconnect={reconnectRoom}
          errorMessage={error}
          isLoading={isLoading}
          isConnected={isConnected}
        />
      </>
    );
  }

  if (!isGameStarted) {
    return (
      <>
        <ConnectionOverlay state={connectionState} />
        <LobbyScreen
          roomInfo={roomInfo}
          currentUserId={currentUserId}
          onStartGame={startGame}
          onLeaveRoom={leaveRoom}
          onCloseRoom={isHost ? closeRoom : null}
          isHost={isHost}
          connectionState={connectionState}
        />
      </>
    );
  }

  return (
    <><ConnectionOverlay state={connectionState} /><GameDashboard
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
      onTerminateGame={isHost ? terminateGame : null}
      isHost={isHost}
      hostPlayerId={roomInfo?.hostPlayerId}
      connectionState={connectionState}
    /></>
  );
}

export default function App() {
  const invite = new URLSearchParams(window.location.search);
  const inviteGame = invite.get('game');
  const inviteRoomId = (invite.get('room') || '').toUpperCase().slice(0, 6);
  const [selectedGame, setSelectedGame] = useState(() => inviteGame || localStorage.getItem('board_game_selection') || '');
  const transitionTo = async (game, event) => {
    const rect = event?.currentTarget?.getBoundingClientRect();
    const x = rect ? rect.left + rect.width / 2 : window.innerWidth / 2;
    const y = rect ? rect.top + rect.height / 2 : window.innerHeight / 2;
    const radius = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y));
    document.documentElement.style.setProperty('--nav-x', `${x}px`);
    document.documentElement.style.setProperty('--nav-y', `${y}px`);
    document.documentElement.style.setProperty('--nav-radius', `${radius}px`);
    const commit = () => {
      if (game) localStorage.setItem('board_game_selection', game);
      else localStorage.removeItem('board_game_selection');
      flushSync(() => setSelectedGame(game));
    };
    if (document.startViewTransition && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      const transition = document.startViewTransition(commit);
      await transition.finished.catch(() => {});
      return;
    }
    const fadeOut = document.documentElement.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 140, easing: 'ease-out', fill: 'forwards' });
    await fadeOut.finished.catch(() => {});
    commit();
    fadeOut.cancel();
    document.documentElement.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 260, easing: 'ease-out' });
  };
  const selectGame = (game, event) => transitionTo(game, event);
  const goStore = (event) => transitionTo('', event);

  if (!selectedGame) return <div className="route-stage"><GameStore onSelect={selectGame} /></div>;
  return (
    <div className="route-stage relative">
      <button onClick={goStore} className="fixed left-3 top-3 z-[70] rounded-full border border-white/60 bg-white/90 px-4 py-2 text-sm font-bold text-slate-700 shadow-lg backdrop-blur hover:bg-white" aria-label="กลับไปเลือกร้านเกม">
        ← ร้านเกม
      </button>
      {selectedGame === 'shadow-detective' ? <ShadowGameApp inviteRoomId={inviteRoomId} /> : selectedGame === 'nightfall-village' ? <NightfallGameApp inviteRoomId={inviteRoomId} /> : <CardBluffApp inviteRoomId={inviteRoomId} />}
    </div>
  );
}
