import React, { useMemo, useState } from 'react';
import { Check, Copy, QrCode, Share2 } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

export default function RoomInviteQR({ roomId, game = 'card-bluff', accent = 'violet' }) {
  const [copied, setCopied] = useState(false);
  const inviteUrl = useMemo(() => {
    const url = new URL(window.location.href);
    url.search = '';
    url.hash = '';
    url.searchParams.set('game', game);
    url.searchParams.set('room', roomId);
    return url.toString();
  }, [game, roomId]);

  const copyLink = async () => {
    await navigator.clipboard?.writeText(inviteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  const shareLink = async () => {
    if (navigator.share) {
      try { await navigator.share({ title: 'เข้าร่วมห้องบอร์ดเกม', text: `เข้าร่วมห้อง #${roomId}`, url: inviteUrl }); return; }
      catch (error) { if (error?.name === 'AbortError') return; }
    }
    await copyLink();
  };
  const isRose = accent === 'rose';

  return <section className={`rounded-2xl border p-4 ${isRose ? 'border-rose-100 bg-rose-50/70' : 'border-violet-100 bg-violet-50/70'}`}>
    <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
      <div className="rounded-2xl border border-white bg-white p-2.5 shadow-sm"><QRCodeSVG value={inviteUrl} size={132} level="M" marginSize={1} bgColor="#fff" fgColor="#342a43" aria-label={`QR Code เข้าร่วมห้อง ${roomId}`}/></div>
      <div className="min-w-0 flex-1 text-center sm:text-left">
        <div className="flex items-center justify-center gap-2 sm:justify-start"><QrCode className={`h-5 w-5 ${isRose ? 'text-rose-600' : 'text-violet-600'}`}/><h3 className="font-bold text-slate-800">สแกนเพื่อเข้าห้องทันที</h3></div>
        <p className="mt-1 text-xs leading-5 text-slate-500">เปิดลิงก์แล้วกรอกชื่อได้เลย ระบบจะใส่รหัสห้องให้อัตโนมัติ</p>
        <div className="mt-3 flex flex-col gap-2 sm:flex-row">
          <button onClick={copyLink} className="flex items-center justify-center gap-2 rounded-xl border border-white bg-white px-3 py-2 text-xs font-bold text-slate-700 shadow-sm">{copied?<Check className="h-4 w-4 text-emerald-600"/>:<Copy className="h-4 w-4"/>}{copied?'คัดลอกแล้ว':'คัดลอกลิงก์'}</button>
          <button onClick={shareLink} className={`flex items-center justify-center gap-2 rounded-xl px-3 py-2 text-xs font-bold text-white ${isRose?'bg-[#a35f77]':'bg-violet-500'}`}><Share2 className="h-4 w-4"/>แชร์คำเชิญ</button>
        </div>
      </div>
    </div>
  </section>;
}
