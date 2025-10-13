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
