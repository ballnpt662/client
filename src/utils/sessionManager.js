/**
 * Session manager — central localStorage helper for Card Bluff.
 * Only stores the minimum needed to reconnect; never stores game state.
 */

const SESSION_KEY = 'card_bluff_session';
// Legacy key used by earlier versions — we clear it too
const LEGACY_KEY = 'card_bluff_reconnect_token';

/**
 * @typedef {{ roomId: string, playerId: string, reconnectToken: string }} Session
 */

/** Save session after create/join/reconnect */
export function saveSession({ roomId, playerId, reconnectToken }) {
  try {
    localStorage.setItem(SESSION_KEY, JSON.stringify({ roomId, playerId, reconnectToken }));
  } catch {
    // Storage quota exceeded or unavailable — silently ignore
  }
}

/** Load saved session. Returns null if nothing valid is stored. */
export function loadSession() {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed?.roomId && parsed?.playerId && parsed?.reconnectToken) {
      return /** @type {Session} */ (parsed);
    }
    return null;
  } catch {
    return null;
  }
}

/** Clear session data (on leave, room closed, server restart) */
export function clearSession() {
  try {
    localStorage.removeItem(SESSION_KEY);
    localStorage.removeItem(LEGACY_KEY); // backward compat cleanup
  } catch {
    // Ignore
  }
}
