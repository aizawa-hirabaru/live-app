export function getDayOfWeek(dateStr: string): string {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  const days = ['日', '月', '火', '水', '木', '金', '土'];
  return days[date.getDay()];
}

export function formatDateTimeJP(dateStr: string): string {
  if (!dateStr) return '';
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const dayOfWeek = getDayOfWeek(dateStr);
    
    // Check if time is included (HH:mm)
    const hasTime = dateStr.includes('T') || dateStr.includes(':');
    if (hasTime) {
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      return `${year}年${month}月${day}日(${dayOfWeek}) ${hours}:${minutes}`;
    }
    return `${year}年${month}月${day}日(${dayOfWeek})`;
  } catch (e) {
    return dateStr;
  }
}

export function formatDateJP(dateStr: string): string {
  if (!dateStr) return '';
  try {
    const date = new Date(dateStr.split('T')[0]);
    if (isNaN(date.getTime())) return dateStr;
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const dayOfWeek = getDayOfWeek(dateStr.split('T')[0]);
    return `${year}年${month}月${day}日(${dayOfWeek})`;
  } catch (e) {
    return dateStr;
  }
}

export function getDaysUntil(targetDateStr: string): number | null {
  if (!targetDateStr) return null;
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const target = new Date(targetDateStr);
    target.setHours(0, 0, 0, 0);
    
    const diffTime = target.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  } catch (e) {
    return null;
  }
}

export function formatCurrency(value?: number): string {
  if (value === undefined || value === null) return '-';
  return `¥${value.toLocaleString()}`;
}
