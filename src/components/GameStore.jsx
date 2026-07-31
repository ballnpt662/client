import React from 'react';
import { Clock3, Fingerprint, LockKeyhole, MoonStar, Shield, Sparkles, Users } from 'lucide-react';
import { getGameSession } from '../utils/gameSessions';

const games = [
  { id:'puzzle-tower', eyebrow:'การผจญภัยแบบร่วมมือ', title:'หอคอยปริศนา', subtitle:'แบ่งปันข้อมูล ไขกลไก และเปิดประตูทั้งห้าชั้นไปด้วยกัน', players:'2–6 คน', time:'15–30 นาที', tags:['Co-op','Puzzle','สื่อสาร'], icon:LockKeyhole, tone:'tower' },
  { id:'nightfall-village', eyebrow:'โต๊ะใหญ่ประจำค่ำคืน', title:'หมู่บ้านรัตติกาล', subtitle:'เกมบทบาทลับ พูดคุย และตามหาฝ่ายหมาป่าใต้แสงจันทร์', players:'5–12 คน', time:'25–45 นาที', tags:['Social Deduction','บทบาทลับ','พูดคุย'], icon:MoonStar, tone:'nightfall' },
  { id:'shadow-detective', eyebrow:'คดีใหม่ประจำร้าน', title:'นักสืบเงา', subtitle:'ไขคดีในพิพิธภัณฑ์ ก่อนผู้ก่อเหตุจะกลบหลักฐาน', players:'4–6 คน', time:'15–25 นาที', tags:['บทบาทลับ','สืบสวน','ลงคะแนน'], icon:Fingerprint, tone:'shadow' },
  { id:'card-bluff', eyebrow:'เกมยอดนิยม', title:'Card Bluff', subtitle:'บลัฟบทบาท จับโกหก และรักษาการ์ดใบสุดท้าย', players:'3–6 คน', time:'10–20 นาที', tags:['บลัฟ','กลยุทธ์','ปาร์ตี้'], icon:Shield, tone:'bluff' },
];

export default function GameStore({onSelect,onStartNew}) {
  return <main className="store-shell min-h-screen overflow-hidden px-4 py-8 sm:px-8">
    <div className="store-glow store-glow-one"/><div className="store-glow store-glow-two"/>
    <div className="relative mx-auto max-w-6xl">
      <nav className="mb-12 flex items-center justify-between rounded-full border border-white/60 bg-white/70 px-5 py-3 shadow-sm backdrop-blur-xl">
        <div className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-full bg-[#3c304f] text-[#fff8e9]"><Sparkles className="h-5 w-5"/></span><div><p className="font-display text-lg font-bold leading-none text-[#342a43]">Moonmee Boardgame Café</p><p className="mt-1 text-xs text-[#756c7f]">โต๊ะพร้อมแล้ว เลือกเกมได้เลย</p></div></div>
        <span className="hidden rounded-full bg-[#eef5df] px-4 py-2 text-xs font-bold text-[#536342] sm:block">เปิดให้เล่นออนไลน์</span>
      </nav>
      <header className="mb-10 max-w-3xl"><p className="mb-3 text-sm font-bold tracking-[.22em] text-[#8f6075]">WELCOME TO THE TABLE</p><h1 className="font-display text-4xl font-black leading-tight text-[#342a43] sm:text-6xl">คืนนี้อยากเปิดโต๊ะ<br/><span className="text-[#a45f78]">เกมไหนดี?</span></h1><p className="mt-5 max-w-2xl text-base leading-7 text-[#6d6576] sm:text-lg">ร้านบอร์ดเกมออนไลน์สำหรับเล่นกับเพื่อน สร้างห้อง แชร์รหัส แล้วเริ่มเรื่องราวของค่ำคืนนี้ได้ทันที</p></header>
      <section className="grid gap-6 lg:grid-cols-2">{games.map(({id,eyebrow,title,subtitle,players,time,tags,icon:Icon,tone})=>{const session=getGameSession(id);return <article key={id} className={`game-box game-box-${tone}`}>
        <div className="game-art" aria-hidden="true"><div className="game-art-ring"/><Icon className="game-art-icon"/><span className="game-art-star">✦</span></div>
        <div className="relative z-10 flex h-full flex-col p-6 sm:p-8"><p className="text-xs font-black tracking-[.18em] text-[#8f6075]">{eyebrow}</p><h2 className="font-display mt-3 text-3xl font-black text-[#342a43]">{title}</h2><p className="mt-3 max-w-sm leading-7 text-[#655e6e]">{subtitle}</p><div className="mt-5 flex flex-wrap gap-2">{tags.map(t=><span key={t} className="rounded-full border border-white/70 bg-white/65 px-3 py-1.5 text-xs font-bold text-[#60566c]">{t}</span>)}</div><div className="mt-auto flex flex-wrap items-end justify-between gap-4 pt-10"><div className="flex gap-4 text-sm font-semibold text-[#655e6e]"><span className="flex items-center gap-1.5"><Users className="h-4 w-4"/>{players}</span><span className="flex items-center gap-1.5"><Clock3 className="h-4 w-4"/>{time}</span></div>{session?<div className="flex flex-col items-end gap-2"><button onClick={(event)=>onSelect(id,event)}className="game-select-button rounded-full bg-emerald-600 px-5 py-3 text-sm font-black text-white shadow-lg">กลับห้อง #{session.roomId} →</button><button onClick={(event)=>onStartNew(id,event)}className="text-xs font-bold text-[#756c7f] underline">ไม่กลับห้องเดิม · เริ่มใหม่</button></div>:<button onClick={(event)=>onSelect(id,event)} className="game-select-button rounded-full bg-[#3d324c] px-6 py-3 text-sm font-black text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-[#564461]">เลือกเกมนี้ →</button>}</div></div>
      </article>})}</section>
      <p className="mt-8 text-center text-xs text-[#8b8392]">เกมทุกโต๊ะเล่นผ่านห้องส่วนตัว · ไม่ต้องสมัครสมาชิก</p>
    </div>
  </main>;
}
