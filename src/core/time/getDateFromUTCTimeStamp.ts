export function getDateFromUTCTimeStamp(timestamp: number) {
  // 获取当前时区和零时区的差异 （数字）
  const currentTimeZone = new Date().getTimezoneOffset();
  return new Date(timestamp + currentTimeZone * 60 * 1000);
}
