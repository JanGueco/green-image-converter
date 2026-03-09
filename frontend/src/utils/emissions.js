export const FIXED_KWH_PER_GB = 0.0065;
export const CELLULAR_KWH_PER_GB = 0.1;
export const HDD_KWH_PER_TB_MONTH = 5.5;
export const SSD_KWH_PER_TB_MONTH = 0.5;
export const MONTHS_PER_YEAR = 12;

export function formatKwh(value) {
  if (value < 0.0001 && value > 0) return value.toExponential(1);
  return value.toFixed(4);
}

export function formatKb(bytes) {
  const kb = Math.round(bytes / 1024);
  return kb.toLocaleString() + ' KB';
}
