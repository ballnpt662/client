import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Coins, HeartCrack, MessageCircle, MoonStar, ShieldAlert, Sparkles, Sun, Trophy, Vote } from 'lucide-react';
import { PHASE_THAI_TEXT } from '../utils/textHelpers';

const phaseMeta = (phase) => {
  if (phase === 'GAME_OVER') return { icon: Trophy, eyebrow: 'บทสรุปของเกม', title: 'การแข่งขันสิ้นสุดแล้ว', tone: 'gold' };
  if (/NIGHT/.test(phase)) return { icon: MoonStar, eyebrow: 'แสงจันทร์ส่องลงมา', title: 'ค่ำคืนเริ่มต้น', tone: 'night' };
  if (/DAWN|DISCUSSION/.test(phase)) return { icon: phase.includes('DAWN') ? Sun : MessageCircle, eyebrow: 'เรื่องราวดำเนินต่อ', title: phase.includes('DAWN') ? 'รุ่งเช้ามาถึง' : 'เปิดวงสนทนา', tone: 'day' };
  if (/VOT|NOMINATION/.test(phase)) return { icon: Vote, eyebrow: 'ทุกเสียงมีความหมาย', title: 'ถึงเวลาตัดสินใจ', tone: 'rose' };
  if (/CHALLENGE|COUNTER/.test(phase)) return { icon: ShieldAlert, eyebrow: 'สถานการณ์เปลี่ยน', title: PHASE_THAI_TEXT[phase] || 'มีการโต้ตอบ', tone: 'rose' };
  if (/REVEAL/.test(phase)) return { icon: Sparkles, eyebrow: 'ความจริงกำลังเปิดเผย', title: PHASE_THAI_TEXT[phase] || 'เปิดเผยการ์ด', tone: 'violet' };
  return { icon: Sparkles, eyebrow: 'เฟสใหม่เริ่มขึ้น', title: PHASE_THAI_TEXT[phase] || 'ดำเนินเกมต่อ', tone: 'violet' };
};

const eventMeta=(event)=>{const text=event?.message||event?.text||'',signature=`${event?.type||''} ${event?.tone||''} ${text}`.toUpperCase();if(/DEATH|ELIMINATION|KILLED|เสียชีวิต|ถูกกำจัด|ตกรอบ|สังหาร/.test(signature))return{icon:HeartCrack,eyebrow:'ชะตากรรมถูกเปิดเผย',text,tone:'death'};if(/WIN|VICTORY|ชนะ|สำเร็จ|เปิดประตู/.test(signature))return{icon:Trophy,eyebrow:'เหตุการณ์สำคัญ',text,tone:'gold'};if(/REVEAL|CHALLENGE|COUP|VOTE_RESULT|เปิดเผย|ท้าทาย|ผลโหวต|กล่าวหา|พลังงานลด/.test(signature))return{icon:ShieldAlert,eyebrow:'สถานการณ์เปลี่ยน',text,tone:'rose'};return null};

export default function GameEffects({ phase, eventLog = [], coins, enabled = true }) {
  const previousPhase = useRef(phase), previousEventId = useRef(eventLog.at(-1)?.id), previousCoins = useRef(coins);
  const [phaseMoment, setPhaseMoment] = useState(null), [eventMoment, setEventMoment] = useState(null), [coinMoment, setCoinMoment] = useState(null);
  useEffect(() => { if (!enabled || !phase || phase === previousPhase.current) return; previousPhase.current = phase; setPhaseMoment({ ...phaseMeta(phase), key: `${phase}-${Date.now()}` }); const t=setTimeout(()=>setPhaseMoment(null),1450);return()=>clearTimeout(t)}, [enabled, phase]);
  useEffect(() => { const latest=eventLog.at(-1),id=latest?.id||`${latest?.type}-${eventLog.length}`;if(!enabled||!latest||id===previousEventId.current)return;previousEventId.current=id;const meta=eventMeta(latest);if(!meta)return;setEventMoment({...meta,key:id});const t=setTimeout(()=>setEventMoment(null),3300);return()=>clearTimeout(t)}, [enabled, eventLog]);
  useEffect(() => { if(typeof coins!=='number')return;if(typeof previousCoins.current!=='number'){previousCoins.current=coins;return}const delta=coins-previousCoins.current;previousCoins.current=coins;if(!delta)return;setCoinMoment({delta,key:Date.now()});const t=setTimeout(()=>setCoinMoment(null),1300);return()=>clearTimeout(t)}, [coins]);
  if(!enabled||(!phaseMoment&&!eventMoment&&!coinMoment))return null;
  return createPortal(<div className="fx-layer" aria-live="polite" aria-atomic="true">{phaseMoment&&<div key={phaseMoment.key}className={`fx-phase fx-phase--${phaseMoment.tone}`}><div className="fx-orbit"><span/><span/><span/></div><phaseMoment.icon className="fx-phase__icon"/><p>{phaseMoment.eyebrow}</p><h2>{phaseMoment.title}</h2></div>}{eventMoment&&<div key={eventMoment.key}className={`fx-major fx-major--${eventMoment.tone}`}><div className="fx-major__pulse"/><eventMoment.icon/><small>{eventMoment.eyebrow}</small><strong>{eventMoment.text}</strong></div>}{coinMoment&&<div key={coinMoment.key}className={`fx-coin ${coinMoment.delta>0?'fx-coin--gain':'fx-coin--loss'}`}><Coins/>{coinMoment.delta>0?'+':''}{coinMoment.delta}</div>}</div>,document.body);
}
