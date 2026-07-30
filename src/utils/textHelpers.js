export const ROLE_INFO = {
  AXE: {
    title: 'ขวาน',
    english: 'AXE',
    color: 'text-red-400',
    bgColor: 'bg-red-950/40',
    borderColor: 'border-red-500/40',
    badgeColor: 'bg-red-500',
    description: 'จ่าย 3 เหรียญ เพื่อบังคับเป้าหมายเปิดการ์ด 1 ใบ (เป้าหมายใช้โล่ป้องกันได้)',
  },
  SHIELD: {
    title: 'โล่',
    english: 'SHIELD',
    color: 'text-blue-400',
    bgColor: 'bg-blue-950/40',
    borderColor: 'border-blue-500/40',
    badgeColor: 'bg-blue-500',
    description: 'รับ 3 เหรียญจากกองกลาง หรือใช้ป้องกันการโจมตีจากขวาน',
  },
  THIEF: {
    title: 'ขโมย',
    english: 'THIEF',
    color: 'text-purple-400',
    bgColor: 'bg-purple-950/40',
    borderColor: 'border-purple-500/40',
    badgeColor: 'bg-purple-500',
    description: 'ขโมยสูงสุด 2 เหรียญจากเป้าหมาย หรือใช้ป้องกันการโดนขโมย',
  },
  SEER: {
    title: 'เนตรทิพย์',
    english: 'SEER',
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-950/40',
    borderColor: 'border-emerald-500/40',
    badgeColor: 'bg-emerald-500',
    description: 'แอบดูการ์ดลับ 1 ใบของเป้าหมาย (5 วินาที) + รับ 1 เหรียญ',
  },
};

export const ACTION_INFO = {
  INCOME: {
    title: 'รับเหรียญ',
    english: 'INCOME',
    cost: 0,
    costText: 'ฟรี',
    description: 'รับ 1 เหรียญจากกองกลาง (ไม่สามารถจับโกหกได้)',
  },
  COUP: {
    title: 'โจมตีแน่นอน',
    english: 'COUP',
    cost: 7,
    costText: '7 เหรียญ',
    description: 'จ่าย 7 เหรียญ บังคับเปิดการ์ด 1 ใบ (ท้าทายไม่ได้ ป้องกันไม่ได้)',
  },
  AXE: {
    title: 'ขวาน',
    english: 'AXE',
    cost: 3,
    costText: '3 เหรียญ',
    description: 'จ่าย 3 เหรียญ โจมตีการ์ดเป้าหมาย (ป้องกันด้วยโล่ได้)',
  },
  SHIELD_INCOME: {
    title: 'โล่ (รับเหรียญ)',
    english: 'SHIELD_INCOME',
    cost: 0,
    costText: 'ฟรี',
    description: 'อ้างบทบาทโล่ รับ 3 เหรียญจากกองกลาง (ท้าทายได้)',
  },
  STEAL: {
    title: 'ขโมย',
    english: 'STEAL',
    cost: 0,
    costText: 'ฟรี',
    description: 'อ้างบทบาทขโมย ขโมย 2 เหรียญจากเป้าหมาย (ป้องกันด้วยขโมยได้)',
  },
  SEER: {
    title: 'เนตรทิพย์',
    english: 'SEER',
    cost: 0,
    costText: 'ฟรี',
    description: 'อ้างบทบาทเนตรทิพย์ ดูการ์ดลับ 1 ใบ + รับ 1 เหรียญ',
  },
};

export const PHASE_THAI_TEXT = {
  WAITING_FOR_ACTION: 'กำลังรอการเลือกแอ็กชันประจำตา',
  CHALLENGE_ACTION: 'กำลังรอการท้าทาย (จับโกหก) แอ็กชัน',
  RESOLVING_CHALLENGE: 'กำลังประมวลผลการท้าทาย...',
  WAITING_FOR_COUNTER: 'กำลังรอการเลือกป้องกันจากเป้าหมาย',
  CHALLENGE_COUNTER: 'กำลังรอการท้าทายการป้องกัน',
  SELECT_CARD_TO_REVEAL: 'กำลังรอผู้เล่นเลือกเปิดการ์ด 1 ใบ',
  RESOLVING_ACTION: 'กำลังประมวลผลผลลัพธ์ของแอ็กชัน...',
  TURN_END: 'จบตา กำลังเปลี่ยนผู้เล่น...',
  GAME_OVER: 'การแข่งขันจบลงแล้ว!',
};

export function getRoleTitle(role) {
  if (!role) return 'การ์ดคว่ำ (ลับ)';
  return ROLE_INFO[role]?.title || role;
}

export function getActionTitle(actionType) {
  if (!actionType) return '';
  return ACTION_INFO[actionType]?.title || actionType;
}

export function translateError(errorStr) {
  if (!errorStr) return null;
  if (errorStr.includes('FORCED_COUP_REQUIRED') || errorStr.includes('coins >= 10')) {
    return 'เหรียญของคุณมี 10 เหรียญขึ้นไป บังคับใช้ COUP เท่านั้น!';
  }
  if (errorStr.includes('INSUFFICIENT_COINS')) {
    return 'เหรียญไม่เพียงพอสำหรับการใช้แอ็กชันนี้';
  }
  if (errorStr.includes('NOT_YOUR_TURN')) {
    return 'ยังไม่ถึงตาของคุณ';
  }
  if (errorStr.includes('RATE_LIMIT')) {
    return 'ส่งคำสั่งเร็วเกินไป กรุณารอครู่หนึ่ง';
  }
  if (errorStr.includes('CARD_ALREADY_REVEALED')) {
    return 'การ์ดใบนี้ถูกเปิดไปแล้ว';
  }
  if (errorStr.includes('INVALID_PHASE')) {
    return 'ไม่สามารถทำแอ็กชันนี้ได้ในเฟสปัจจุบัน';
  }
  return errorStr;
}
