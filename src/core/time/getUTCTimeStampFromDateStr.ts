export function getUTCTimeStampFromDateStr(dateStr: string) {
  const parts = dateStr.split('-');
  if (parts.length !== 3) {
    throw new Error('日期格式错误，应为 yyyy-MM-dd 格式');
  }
  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10);
  const day = parseInt(parts[2], 10);
  const utcMilliseconds = Date.UTC(year, month - 1, day);
  return utcMilliseconds;
}
