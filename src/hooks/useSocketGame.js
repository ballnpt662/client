import { useState, useEffect, useCallback, useRef } from 'react';
import { io } from 'socket.io-client';
import { translateError } from '../utils/textHelpers';

const RECONNECT_TOKEN_KEY = 'card_bluff_reconnect_token';
const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:3001';

export function useSocketGame() {
  const socketRef = useRef(null);
  const seerTimerRef = useRef(null);

  const [isConnected, setIsConnected] = useState(false);
  const [roomInfo, setRoomInfo] = useState(null);
  const [publicState, setPublicState] = useState(null);
  const [myCards, setMyCards] = useState([]);
  const [seerResult, setSeerResult] = useState(null);
  const [timerRemaining, setTimerRemaining] = useState(0);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const generateActionId = useCallback(() => {
    return `act-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  }, []);

  const showError = useCallback((msg) => {
    setError(translateError(msg));
    setTimeout(() => setError(null), 4000);
  }, []);

  useEffect(() => {
    const socket = io(SERVER_URL, {
      transports: ['websocket', 'polling'],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    });
    socketRef.current = socket;

    socket.on('connect', () => {
      setIsConnected(true);
      const savedToken = localStorage.getItem(RECONNECT_TOKEN_KEY);
      if (savedToken && !roomInfo) {
        socket.emit('room:reconnect', { reconnectToken: savedToken }, (res) => {
          if (res?.success) {
            setRoomInfo({
              roomId: res.roomId,
              playerId: res.playerId,
              reconnectToken: savedToken,
              players: res.room?.players || [],
              hostId: res.room?.hostId,
            });
            if (res.state) {
              setPublicState(res.state);
              setTimerRemaining(res.state.phaseTimerRemainingSeconds || 0);
            }
          } else {
            localStorage.removeItem(RECONNECT_TOKEN_KEY);
          }
        });
      }
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
    });

    socket.on('game:publicState', ({ roomId, state }) => {
      setPublicState(state);
      if (state?.phaseTimerRemainingSeconds !== undefined) {
        setTimerRemaining(state.phaseTimerRemainingSeconds);
      }
    });

    socket.on('game:privateState', ({ playerId, myCards: cards }) => {
      setMyCards(cards || []);
    });

    socket.on('game:timerTick', ({ roomId, secondsRemaining }) => {
      setTimerRemaining(secondsRemaining);
    });

    socket.on('game:seerResult', (result) => {
      setSeerResult(result);
      if (seerTimerRef.current) clearTimeout(seerTimerRef.current);
      
      seerTimerRef.current = setTimeout(() => {
        setSeerResult(null);
      }, 5000);
    });

    socket.on('room:updated', ({ room }) => {
      if (room) {
        setRoomInfo((prev) => (prev ? { ...prev, players: room.players, hostId: room.hostId } : null));
      }
    });

    socket.on('room:playerJoined', ({ playerId, playerName }) => {
      // Handled via room:updated
    });

    socket.on('room:playerLeft', ({ playerId }) => {
      // Handled via room:updated
    });

    return () => {
      if (seerTimerRef.current) clearTimeout(seerTimerRef.current);
      socket.disconnect();
    };
  }, []);

  const createRoom = useCallback(async ({ playerName }) => {
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
          localStorage.setItem(RECONNECT_TOKEN_KEY, res.reconnectToken);
          setRoomInfo({
            roomId: res.roomId,
            playerId: res.playerId,
            reconnectToken: res.reconnectToken,
            players: res.room?.players || [],
            hostId: res.room?.hostId,
          });
          resolve(res);
        } else {
          showError(res?.error || 'ไม่สามารถสร้างห้องได้');
          reject(new Error(res?.error));
        }
      });
    });
  }, [showError]);

  const joinRoom = useCallback(async ({ roomId, playerName }) => {
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
          localStorage.setItem(RECONNECT_TOKEN_KEY, res.reconnectToken);
          setRoomInfo({
            roomId: res.roomId,
            playerId: res.playerId,
            reconnectToken: res.reconnectToken,
            players: res.room?.players || [],
            hostId: res.room?.hostId,
          });
          resolve(res);
        } else {
          showError(res?.error || 'ไม่สามารถเข้าร่วมห้องได้');
          reject(new Error(res?.error));
        }
      });
    });
  }, [showError]);

  const reconnectRoom = useCallback(async (reconnectToken) => {
    setIsLoading(true);
    return new Promise((resolve) => {
      socketRef.current?.emit('room:reconnect', { reconnectToken }, (res) => {
        setIsLoading(false);
        if (res?.success) {
          localStorage.setItem(RECONNECT_TOKEN_KEY, reconnectToken);
          setRoomInfo({
            roomId: res.roomId,
            playerId: res.playerId,
            reconnectToken: reconnectToken,
            players: res.room?.players || [],
            hostId: res.room?.hostId,
          });
          if (res.state) {
            setPublicState(res.state);
            setTimerRemaining(res.state.phaseTimerRemainingSeconds || 0);
          }
          resolve(true);
        } else {
          localStorage.removeItem(RECONNECT_TOKEN_KEY);
          showError(res?.error || 'ไม่สามารถเชื่อมต่อเซสชันเดิมได้');
          resolve(false);
        }
      });
    });
  }, [showError]);

  const startGame = useCallback(async () => {
    if (!roomInfo?.roomId) return;
    socketRef.current?.emit('room:start', { roomId: roomInfo.roomId }, (res) => {
      if (!res?.success) {
        showError(res?.error || 'ไม่สามารถเริ่มเกมได้');
      }
    });
  }, [roomInfo?.roomId, showError]);

  const sendAction = useCallback(async ({ actionType, targetPlayerId }) => {
    if (!roomInfo?.roomId) return;
    const actionId = generateActionId();
    socketRef.current?.emit(
      'game:action',
      { roomId: roomInfo.roomId, actionId, actionType, targetPlayerId },
      (res) => {
        if (!res?.success && !res?.duplicate) {
          showError(res?.error || 'ทำแอ็กชันไม่สำเร็จ');
        }
      }
    );
  }, [roomInfo?.roomId, generateActionId, showError]);

  const sendChallenge = useCallback(async () => {
    if (!roomInfo?.roomId) return;
    const actionId = generateActionId();
    socketRef.current?.emit(
      'game:challenge',
      { roomId: roomInfo.roomId, actionId },
      (res) => {
        if (!res?.success && !res?.duplicate) {
          showError(res?.error || 'ไม่สามารถจับโกหกได้');
        }
      }
    );
  }, [roomInfo?.roomId, generateActionId, showError]);

  const sendCounter = useCallback(async ({ counterRole }) => {
    if (!roomInfo?.roomId) return;
    const actionId = generateActionId();
    socketRef.current?.emit(
      'game:counter',
      { roomId: roomInfo.roomId, actionId, counterRole },
      (res) => {
        if (!res?.success && !res?.duplicate) {
          showError(res?.error || 'ไม่สามารถป้องกันได้');
        }
      }
    );
  }, [roomInfo?.roomId, generateActionId, showError]);

  const sendPass = useCallback(async () => {
    if (!roomInfo?.roomId) return;
    const actionId = generateActionId();
    socketRef.current?.emit(
      'game:pass',
      { roomId: roomInfo.roomId, actionId },
      (res) => {
        if (!res?.success && !res?.duplicate) {
          showError(res?.error || 'ไม่สามารถผ่านได้');
        }
      }
    );
  }, [roomInfo?.roomId, generateActionId, showError]);

  const revealCard = useCallback(async (cardIndex) => {
    if (!roomInfo?.roomId) return;
    const actionId = generateActionId();
    socketRef.current?.emit(
      'game:revealCard',
      { roomId: roomInfo.roomId, actionId, cardIndex },
      (res) => {
        if (!res?.success && !res?.duplicate) {
          showError(res?.error || 'ไม่สามารถเปิดการ์ดได้');
        }
      }
    );
  }, [roomInfo?.roomId, generateActionId, showError]);

  const leaveRoom = useCallback(() => {
    localStorage.removeItem(RECONNECT_TOKEN_KEY);
    setRoomInfo(null);
    setPublicState(null);
    setMyCards([]);
    setSeerResult(null);
  }, []);

  const dismissSeerResult = useCallback(() => {
    if (seerTimerRef.current) clearTimeout(seerTimerRef.current);
    setSeerResult(null);
  }, []);

  return {
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
    clearError: () => setError(null),
  };
}
