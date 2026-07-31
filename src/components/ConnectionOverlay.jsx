import React from 'react';
import { Loader2, WifiOff, RefreshCw, Home } from 'lucide-react';

/**
 * Full-screen overlay shown during:
 *  - CONNECTING  : initial socket creation
 *  - RECONNECTING: page-load with saved session, waiting for server response
 *  - FAILED      : all reconnect attempts exhausted
 */
export default function ConnectionOverlay({ state, onRetry, onReturnHome }) {
  if (state === 'CONNECTING') {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-violet-50 z-50">
        <div className="text-center space-y-4 px-4">
          <div className="w-14 h-14 bg-violet-100 rounded-2xl flex items-center justify-center mx-auto">
            <Loader2 className="w-7 h-7 text-violet-500 animate-spin" />
          </div>
          <p className="text-slate-500 font-medium text-sm">กำลังเชื่อมต่อเซิร์ฟเวอร์...</p>
        </div>
      </div>
    );
  }

  if (state === 'RECONNECTING') {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-violet-50 z-50">
        <div className="bg-white rounded-3xl shadow-lg p-8 text-center space-y-5 max-w-xs mx-4">
          <div className="w-16 h-16 bg-violet-100 rounded-2xl flex items-center justify-center mx-auto">
            <RefreshCw className="w-8 h-8 text-violet-500 animate-spin" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-800 mb-1">กำลังกลับเข้าสู่เกม</h2>
            <p className="text-slate-400 text-sm leading-relaxed">
              ระบบกำลังเชื่อมต่อกับเซสชันเดิม กรุณารอสักครู่...
            </p>
          </div>
          <div className="flex gap-1.5 justify-center">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-2 h-2 bg-violet-400 rounded-full animate-bounce"
                style={{ animationDelay: `${i * 0.15}s` }}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (state === 'FAILED') {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-violet-50 z-50">
        <div className="bg-white rounded-3xl shadow-lg p-8 text-center space-y-5 max-w-xs mx-4">
          <div className="w-16 h-16 bg-rose-100 rounded-2xl flex items-center justify-center mx-auto">
            <WifiOff className="w-8 h-8 text-rose-400" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-800 mb-1">ไม่สามารถเชื่อมต่อได้</h2>
            <p className="text-slate-400 text-sm leading-relaxed">
              ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้ กรุณาตรวจสอบอินเทอร์เน็ตและลองใหม่
            </p>
          </div>
          <div className="space-y-2.5">
            {onRetry && (
              <button
                onClick={onRetry}
                className="w-full py-3 bg-violet-500 hover:bg-violet-600 text-white font-semibold rounded-xl transition-colors text-sm"
              >
                ลองเชื่อมต่ออีกครั้ง
              </button>
            )}
            {onReturnHome && (
              <button
                onClick={onReturnHome}
                className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 font-semibold rounded-xl transition-colors text-sm flex items-center justify-center gap-2"
              >
                <Home className="w-4 h-4" />
                กลับหน้าหลัก
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (state === 'DISCONNECTED') {
    return (
      <div className="fixed top-3 left-1/2 -translate-x-1/2 z-50 rounded-full bg-white px-4 py-2 shadow-lg border border-rose-100 flex items-center gap-2 text-sm text-rose-600" role="status">
        <WifiOff className="w-4 h-4" />
        การเชื่อมต่อขาดหาย กำลังลองใหม่...
      </div>
    );
  }

  return null;
}
