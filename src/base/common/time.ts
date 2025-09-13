import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import customParseFormat from 'dayjs/plugin/customParseFormat';
dayjs.extend(utc);
dayjs.extend(customParseFormat);

export function getUtcDayjsFromDateStr(dateStr: string) {
  return dayjs.utc(dateStr, 'YYYY-MM-DD');
}

export function getTodayDayjsUtc() {
  return getUtcDayjsFromDateStr(getCurrentDateStr());
}

export function getTodayTimestampInUtc() {
  return getUtcDayjsFromDateStr(getCurrentDateStr()).valueOf();
}

export function isDateBeforeOrEqualToday(timestamp: number) {
  return timestamp <= getTodayTimestampInUtc();
}

/**
 * 将 "YYYY-MM-DD" 格式的日期字符串转换为 UTC（零时区）的时间戳（毫秒）
 * @param {string} dateStr - 例如 "2023-10-07"
 * @returns {number} 时间戳（毫秒）
 */
export function dateStrToTimestamp(dateStr: string) {
  const parts = dateStr.split('-');
  if (parts.length !== 3) {
    throw new Error('日期格式错误，应为 YYYY-MM-DD');
  }
  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10);
  const day = parseInt(parts[2], 10);
  const utcMilliseconds = Date.UTC(year, month - 1, day);
  return utcMilliseconds;
}

/**
 * 获取当前日期字符串
 * @returns {string} 例如 "2023-10-07"
 */
export function getCurrentDateStr() {
  const date = new Date();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

export function isToday(date: Date) {
  return getCurrentDateStr() === dayjs(date).format('YYYY-MM-DD');
}

/**
 * 检查给定的时间戳（秒）是否为 UTC 日期的开始，
 * 即该时间戳经过转换后，其时、分、秒、毫秒全部为 0
 * @param {number} timestamp - 时间戳（秒）
 * @returns {boolean} 如果是日期开始，则返回 true，否则 false
 */
export function isStartOfDay(timestamp: number) {
  // 将秒转为毫秒构造 Date 对象
  const date = new Date(timestamp);
  return (
    date.getUTCHours() === 0 &&
    date.getUTCMinutes() === 0 &&
    date.getUTCSeconds() === 0 &&
    date.getUTCMilliseconds() === 0
  );
}

export function mergeDateAndTime(date: Date | number, time: Date | number): Date {
  const selectedDate = new Date(typeof date === 'number' ? date : date.getTime());
  const selectedTime = new Date(typeof time === 'number' ? time : time.getTime());
  return new Date(
    selectedDate.getFullYear(),
    selectedDate.getMonth(),
    selectedDate.getDate(),
    selectedTime.getHours(),
    selectedTime.getMinutes(),
    selectedTime.getSeconds(),
    selectedTime.getMilliseconds()
  );
}
