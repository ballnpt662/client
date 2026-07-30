import React, { useEffect, useRef } from 'react';
import { ScrollText } from 'lucide-react';

export default function EventLog({ eventLog = [] }) {
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [eventLog]);

  const getLogBadge = (type) => {
    switch (type) {
      case 'ACTION':
        return <span className="px-1.5 py-0.5 bg-blue-500/20 text-blue-300 text-[10px] rounded font-mono">ACTION</span>;
      case 'CHALLENGE':
        return <span className="px-1.5 py-0.5 bg-red-500/20 text-red-300 text-[10px] rounded font-mono">CHALLENGE</span>;
      case 'COUNTER':
        return <span className="px-1.5 py-0.5 bg-purple-500/20 text-purple-300 text-[10px] rounded font-mono">COUNTER</span>;
      case 'REVEAL':
        return <span className="px-1.5 py-0.5 bg-amber-500/20 text-amber-300 text-[10px] rounded font-mono">REVEAL</span>;
      case 'ELIMINATION':
        return <span className="px-1.5 py-0.5 bg-red-900/60 text-red-200 text-[10px] rounded font-mono">ELIMINATED</span>;
      case 'TURN':
        return <span className="px-1.5 py-0.5 bg-emerald-500/20 text-emerald-300 text-[10px] rounded font-mono">TURN</span>;
      default:
        return <span className="px-1.5 py-0.5 bg-slate-800 text-slate-400 text-[10px] rounded font-mono">INFO</span>;
    }
  };

  return (
    <div className="w-full glass-panel rounded-xl p-3 space-y-2">
      <div className="flex items-center space-x-2 text-xs font-semibold text-slate-400 border-b border-slate-800 pb-1.5">
        <ScrollText className="w-4 h-4 text-amber-400" />
        <span>บันทึกเหตุการณ์ (Event Log)</span>
      </div>

      <div
        ref={scrollRef}
        className="h-32 overflow-y-auto custom-scrollbar space-y-1.5 pr-1"
      >
        {eventLog.length === 0 ? (
          <div className="text-center text-xs text-slate-600 py-4">
            ยังไม่มีเหตุการณ์ในขณะนี้
          </div>
        ) : (
          eventLog.map((log, idx) => (
            <div
              key={log.id || idx}
              className="text-xs flex items-start space-x-2 p-1.5 rounded bg-slate-950/40 border border-slate-800/40 text-slate-300"
            >
              {getLogBadge(log.type)}
              <span className="flex-1 leading-snug">{log.message}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
