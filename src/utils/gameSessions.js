export const GAME_SESSION_KEYS={'card-bluff':'card_bluff_session','shadow-detective':'shadow_detective_session','nightfall-village':'nightfall_village_session','puzzle-tower':'puzzle_tower_session','cat-chaos-circle':'cat_chaos_session'};
export function getGameSession(game){try{const value=JSON.parse(localStorage.getItem(GAME_SESSION_KEYS[game]));return value?.roomId?value:null}catch{return null}}
export function clearGameSession(game){const key=GAME_SESSION_KEYS[game];if(key)localStorage.removeItem(key)}
