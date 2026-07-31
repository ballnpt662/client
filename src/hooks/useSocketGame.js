import { useState, useEffect, useCallback, useRef } from 'react';
import { io } from 'socket.io-client';
import { translateError } from '../utils/textHelpers';
import { saveSession, loadSession, clearSession } from '../utils/sessionManager';

const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:3001';

/**
 * Connection state machine:
 *   CONNECTING   — socket is being created / first connection attempt
 *   RECONNECTING — initial page load: has session, waiting for room:reconnect response
 *   CONNECTED    — socket is online and ready
 *   DISCONNECTED — mid-session drop; socket.io will auto-retry
 *   FAILED       — all reconnect attempts exhausted
 */

export function useSocketGame() {
  const socketRef = useRef(null);
  const seerTimerRef = useRef(null);
  // Prevents re-triggering the initial page-load reconnect after the first connect
  const hasInitReconnectRef = useRef(false);
  // Keeps a live reference to roomInfo for use inside socket event closures
  const roomInfoRef = useRef(null);

  const [connectionState, setConnectionState] = useState('CONNECTING');
  const [roomInfo, setRoomInfo] = useState(null);
  const [publicState, setPublicState] = useState(null);
  const [myCards, setMyCards] = useState([]);
  const [seerResult, setSeerResult] = useState(null);
  const [timerRemaining, setTimerRemaining] = useState(0);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Keep roomInfoRef in sync
  useEffect(() => {
    roomInfoRef.current = roomInfo;
  }, [roomInfo]);

  const generateActionId = useCallback(() => {
    return `act-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  }, []);

  const showError = useCallback((msg) => {
    setError(translateError(msg));
    setTimeout(() => setError(null), 5000);
  }, []);

  useEffect(() => {
    const socket = io(SERVER_URL, {
      transports: ['websocket', 'polling'],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1500,
    });
    socketRef.current = socket;

    // ── Connection lifecycle ──────────────────────────────────────────────────
    socket.on('connect', () => {
      setConnectionState('CONNECTED');

      if (!hasInitReconnectRef.current) {
        // First connect after page load — try to restore session
        hasInitReconnectRef.current = true;
        const session = loadSession();
        if (session) {
          setConnectionState('RECONNECTING');
          socket.emit('room:reconnect', session, (res) => {
            if (res?.success) {
              saveSession({
                roomId: res.roomId,
                playerId: res.playerId,
                reconnectToken: session.reconnectToken,
              });
              setRoomInfo({
                roomId: res.roomId,
                playerId: res.playerId,
                reconnectToken: session.reconnectToken,
                players: res.room?.players || [],
                hostPlayerId: res.room?.hostPlayerId,
                config: res.room?.config,
              });
              if (res.state) {
                setPublicState(res.state);
                setTimerRemaining(res.state.phaseTimerRemainingSeconds || 0);
              }
              setConnectionState('CONNECTED');
            } else {
              // Room gone or token invalid — clean up and go to main screen
              clearSession();
              setRoomInfo(null);
              setPublicState(null);
              setMyCards([]);
              setConnectionState('CONNECTED');
              // Show error only for unexpected failures (not stale session)
              if (
                res?.error &&
                !res.error.includes('INVALID_RECONNECT_TOKEN') &&
                !res.error.includes('ROOM_NOT_FOUND')
              ) {
                showError(res?.error);
              }
            }
          });
        }
      } else if (roomInfoRef.current) {
        // Mid-session reconnect (socket dropped and came back) —
        // re-join the socket room on server so events flow again
        const session = loadSession();
        if (session) {
          setConnectionState('RECONNECTING');
          socket.emit('room:reconnect', session, (res) => {
            if (res?.success) {
              setRoomInfo({
                roomId: res.roomId,
                playerId: res.playerId,
                reconnectToken: session.reconnectToken,
                players: res.room?.players || [],
                hostPlayerId: res.room?.hostPlayerId,
                config: res.room?.config,
              });
              setPublicState(res.state || null);
              setTimerRemaining(res.state?.phaseTimerRemainingSeconds || 0);
              setConnectionState('CONNECTED');
            } else {
              // Room or session gone while we were disconnected
              clearSession();
              setRoomInfo(null);
              setPublicState(null);
              setMyCards([]);
              setConnectionState('CONNECTED');
              showError(res?.error || 'SESSION_EXPIRED');
            }
          });
        }
      }
    });

    socket.on('disconnect', (reason) => {
      setConnectionState('DISCONNECTED');
    });

    socket.on('connect_error', () => {
      setConnectionState('DISCONNECTED');
    });

    socket.io.on('reconnect', () => {
      // socket 'connect' event will fire right after — let it handle state
    });

    socket.io.on('reconnect_attempt', () => {
      setConnectionState('RECONNECTING');
    });

    socket.io.on('reconnect_failed', () => {
      setConnectionState('FAILED');
    });

    // ── Game state ────────────────────────────────────────────────────────────
    socket.on('game:publicState', ({ state }) => {
      setPublicState(state);
      if (state?.phaseTimerRemainingSeconds !== undefined) {
        setTimerRemaining(state.phaseTimerRemainingSeconds);
      }
    });

    socket.on('game:privateState', ({ myCards: cards }) => {
      setMyCards(cards || []);
    });

    socket.on('game:timerTick', ({ secondsRemaining }) => {
      setTimerRemaining(secondsRemaining);
    });

    socket.on('game:seerResult', (result) => {
      setSeerResult(result);
      if (seerTimerRef.current) clearTimeout(seerTimerRef.current);
      seerTimerRef.current = setTimeout(() => setSeerResult(null), 5000);
    });

    // ── Room events ───────────────────────────────────────────────────────────
    socket.on('room:updated', (updatedRoom) => {
      if (!updatedRoom) return;
      setRoomInfo((prev) =>
        prev
          ? {
              ...prev,
              players: updatedRoom.players || [],
              hostPlayerId: updatedRoom.hostPlayerId,
              config: updatedRoom.config || prev.config,
            }
          : prev
      );
    });

    // Host closed the lobby room — everyone goes home
    socket.on('room:closed', ({ message }) => {
      clearSession();
      setRoomInfo(null);
      setPublicState(null);
      setMyCards([]);
      setSeerResult(null);
      if (seerTimerRef.current) clearTimeout(seerTimerRef.current);
      if (message) showError(message);
    });

    // Host terminated the game — everyone goes back to lobby
    // Server will also emit room:updated so roomInfo stays updated
    socket.on('game:terminated', () => {
      setPublicState(null);
      setMyCards([]);
      setSeerResult(null);
      if (seerTimerRef.current) clearTimeout(seerTimerRef.current);
    });

    // Kept for backward compat (no-op; handled via room:updated)
    socket.on('room:playerJoined', () => {});
    socket.on('room:playerLeft', () => {});

    return () => {
      if (seerTimerRef.current) clearTimeout(seerTimerRef.current);
      socket.off(); // Remove all listeners before disconnect
      socket.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Public actions ──────────────────────────────────────────────────────────
  const createRoom = useCallback(
    async ({ playerName }) => {
      if (!socketRef.current?.connected) {
        showError('ยังไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้ กรุณารอสักครู่');
        return Promise.reject(new Error('Not connected'));
      }
      setIsLoading(true);
      return new Promise((resolve, reject) => {
        socketRef.current.timeout(10000).emit('room:create', { playerName }, (err, res) => {
          setIsLoading(false);
          if (err) {
            showError('เซิร์ฟเวอร์ไม่ตอบกลับ กรุณาลองใหม่');
            reject(err);
            return;
          }
          if (res?.success) {
            saveSession({ roomId: res.roomId, playerId: res.playerId, reconnectToken: res.reconnectToken });
            setRoomInfo({
              roomId: res.roomId,
              playerId: res.playerId,
              reconnectToken: res.reconnectToken,
              players: res.room?.players || [],
              hostPlayerId: res.room?.hostPlayerId,
              config: res.room?.config,
            });
            resolve(res);
          } else {
            showError(res?.error || 'ไม่สามารถสร้างห้องได้');
            reject(new Error(res?.error));
          }
        });
      });
    },
    [showError]
  );

  const joinRoom = useCallback(
    async ({ roomId, playerName }) => {
      if (!socketRef.current?.connected) {
        showError('ยังไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้ กรุณารอสักครู่');
        return Promise.reject(new Error('Not connected'));
      }
      setIsLoading(true);
      return new Promise((resolve, reject) => {
        socketRef.current.timeout(10000).emit('room:join', { roomId, playerName }, (err, res) => {
          setIsLoading(false);
          if (err) {
            showError('เซิร์ฟเวอร์ไม่ตอบกลับ กรุณาลองใหม่');
            reject(err);
            return;
          }
          if (res?.success) {
            saveSession({ roomId: res.roomId, playerId: res.playerId, reconnectToken: res.reconnectToken });
            setRoomInfo({
              roomId: res.roomId,
              playerId: res.playerId,
              reconnectToken: res.reconnectToken,
              players: res.room?.players || [],
              hostPlayerId: res.room?.hostPlayerId,
              config: res.room?.config,
            });
            resolve(res);
          } else {
            showError(res?.error || 'ไม่สามารถเข้าร่วมห้องได้');
            reject(new Error(res?.error));
          }
        });
      });
    },
    [showError]
  );

  const reconnectRoom = useCallback(
    async (reconnectToken) => {
      setIsLoading(true);
      return new Promise((resolve) => {
        const session = loadSession();
        const payload = session || { reconnectToken };
        socketRef.current?.emit('room:reconnect', payload, (res) => {
          setIsLoading(false);
          if (res?.success) {
            saveSession({ roomId: res.roomId, playerId: res.playerId, reconnectToken });
            setRoomInfo({
              roomId: res.roomId,
              playerId: res.playerId,
              reconnectToken,
              players: res.room?.players || [],
              hostPlayerId: res.room?.hostPlayerId,
              config: res.room?.config,
            });
            if (res.state) {
              setPublicState(res.state);
              setTimerRemaining(res.state.phaseTimerRemainingSeconds || 0);
            }
            resolve(true);
          } else {
            clearSession();
            showError(res?.error || 'ไม่สามารถเชื่อมต่อเซสชันเดิมได้');
            resolve(false);
          }
        });
      });
    },
    [showError]
  );

  const startGame = useCallback(async () => {
    if (!roomInfoRef.current?.roomId) return;
    socketRef.current?.emit('room:start', { roomId: roomInfoRef.current.roomId }, (res) => {
      if (!res?.success) showError(res?.error || 'ไม่สามารถเริ่มเกมได้');
    });
  }, [showError]);

  const closeRoom = useCallback(async () => {
    const info = roomInfoRef.current;
    if (!info?.roomId || !info?.reconnectToken) return;
    return new Promise((resolve, reject) => {
      socketRef.current?.timeout(10000).emit(
        'room:close',
        { roomId: info.roomId, reconnectToken: info.reconnectToken },
        (err, res) => {
          if (err || !res?.success) {
            showError(res?.error || 'ไม่สามารถยุบห้องได้');
            reject(err || new Error(res?.error));
            return;
          }
          // room:closed event will handle cleanup
          resolve(res);
        }
      );
    });
  }, [showError]);

  const terminateGame = useCallback(async () => {
    const info = roomInfoRef.current;
    if (!info?.roomId || !info?.reconnectToken) return;
    return new Promise((resolve, reject) => {
      socketRef.current?.timeout(10000).emit(
        'game:terminate',
        { roomId: info.roomId, reconnectToken: info.reconnectToken },
        (err, res) => {
          if (err || !res?.success) {
            showError(res?.error || 'ไม่สามารถยุติเกมได้');
            reject(err || new Error(res?.error));
            return;
          }
          // game:terminated + room:updated events handle state update
          resolve(res);
        }
      );
    });
  }, [showError]);

  const sendAction = useCallback(
    async ({ actionType, targetPlayerId }) => {
      if (!roomInfoRef.current?.roomId) return;
      const actionId = generateActionId();
      socketRef.current?.emit(
        'game:action',
        { roomId: roomInfoRef.current.roomId, actionId, actionType, targetPlayerId },
        (res) => {
          if (!res?.success && !res?.duplicate) showError(res?.error || 'ทำแอ็กชันไม่สำเร็จ');
        }
      );
    },
    [generateActionId, showError]
  );

  const sendChallenge = useCallback(async () => {
    if (!roomInfoRef.current?.roomId) return;
    const actionId = generateActionId();
    socketRef.current?.emit(
      'game:challenge',
      { roomId: roomInfoRef.current.roomId, actionId },
      (res) => {
        if (!res?.success && !res?.duplicate) showError(res?.error || 'ไม่สามารถจับโกหกได้');
      }
    );
  }, [generateActionId, showError]);

  const sendCounter = useCallback(
    async ({ counterRole }) => {
      if (!roomInfoRef.current?.roomId) return;
      const actionId = generateActionId();
      socketRef.current?.emit(
        'game:counter',
        { roomId: roomInfoRef.current.roomId, actionId, counterRole },
        (res) => {
          if (!res?.success && !res?.duplicate) showError(res?.error || 'ไม่สามารถป้องกันได้');
        }
      );
    },
    [generateActionId, showError]
  );

  const sendPass = useCallback(async () => {
    if (!roomInfoRef.current?.roomId) return;
    const actionId = generateActionId();
    socketRef.current?.emit(
      'game:pass',
      { roomId: roomInfoRef.current.roomId, actionId },
      (res) => {
        if (!res?.success && !res?.duplicate) showError(res?.error || 'ไม่สามารถผ่านได้');
      }
    );
  }, [generateActionId, showError]);

  const revealCard = useCallback(
    async (cardIndex) => {
      if (!roomInfoRef.current?.roomId) return;
      const actionId = generateActionId();
      socketRef.current?.emit(
        'game:revealCard',
        { roomId: roomInfoRef.current.roomId, actionId, cardIndex },
        (res) => {
          if (!res?.success && !res?.duplicate) showError(res?.error || 'ไม่สามารถเปิดการ์ดได้');
        }
      );
    },
    [generateActionId, showError]
  );

  const leaveRoom = useCallback(() => {
    const roomId = roomInfoRef.current?.roomId;
    if (roomId && socketRef.current?.connected) {
      socketRef.current.emit('room:leave', { roomId });
    }
    clearSession();
    setRoomInfo(null);
    setPublicState(null);
    setMyCards([]);
    setSeerResult(null);
    if (seerTimerRef.current) clearTimeout(seerTimerRef.current);
  }, []);

  const updateRoomConfig = useCallback((config) => new Promise((resolve, reject) => {
    const roomId = roomInfoRef.current?.roomId;
    if (!roomId || !socketRef.current?.connected) return reject(new Error('Not connected'));
    socketRef.current.timeout(8000).emit('room:updateConfig', { roomId, config }, (err, res) => {
      if (err || !res?.success) {
        const message = res?.error || 'ไม่สามารถบันทึกการตั้งค่าห้องได้';
        showError(message);
        reject(err || new Error(message));
        return;
      }
      resolve(res);
    });
  }), [showError]);

  const dismissSeerResult = useCallback(() => {
    if (seerTimerRef.current) clearTimeout(seerTimerRef.current);
    setSeerResult(null);
  }, []);

  return {
    connectionState,
    isConnected: connectionState === 'CONNECTED',
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
    updateRoomConfig,
    leaveRoom,
    dismissSeerResult,
    clearError: () => setError(null),
  };
}
