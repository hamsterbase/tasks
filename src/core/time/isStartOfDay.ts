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
