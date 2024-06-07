import {
  eachDayOfInterval,
  eachWeekOfInterval,
  endOfWeek,
  format,
  isEqual,
  min,
  parse,
} from 'date-fns';

const DATE_FORMAT = 'yyyy-MM-dd';
export const formatDate = (date: Date) => format(date, DATE_FORMAT);
export const parseDate = (date: string) => parse(date, DATE_FORMAT, new Date());

const DATETIME_FORMAT = "yyyy-MM-dd'T'HH:mm:ss";
export const formatDateTime = (date: Date) => format(date, DATETIME_FORMAT);
export const formatDateHour = (date: Date) => format(date, "yyyy-MM-dd'T'HH");

export const weekArrays = (startDate: string, endDate?: string) => {
  const start = parse(startDate, 'yyyy-MM-dd', new Date());
  const end = endDate ? parse(endDate, 'yyyy-MM-dd', new Date()) : new Date();
  const startOfWeekArr = eachWeekOfInterval(
    {
      start,
      end,
    },
    { weekStartsOn: 1 },
  );

  const maxEndDay = endOfWeek(end, { weekStartsOn: 1 });
  return startOfWeekArr.map(startOfWeekDay => {
    const end = endOfWeek(startOfWeekDay, { weekStartsOn: 1 });
    const endOfWeekDay = isEqual(maxEndDay, end)
      ? min([end, endOfWeek(startOfWeekDay, { weekStartsOn: 1 })])
      : end;

    const days = eachDayOfInterval({
      start: startOfWeekDay,
      end: endOfWeekDay,
    }).map(item => formatDate(item));
    return {
      startOfWeekDay: formatDate(startOfWeekDay),
      endOfWeekDay: formatDate(endOfWeekDay),
      days,
    };
  });
};

export function convertToSecondsUtil(timeStr: string) {
  // Если timeStr является числом, возвращаем его
  if (!isNaN(timeStr as any)) {
    return parseInt(timeStr);
  }

  let multiplier;

  switch (timeStr[timeStr.length - 1]) {
    case 's':
      multiplier = 1000;
      break;
    case 'm':
      multiplier = 60_000;
      break;
    case 'h':
      multiplier = 60 * 60_000;
      break;
    case 'd':
      multiplier = 24 * 60 * 60_000;
      break;
    case 'M':
      multiplier = 30 * 24 * 60 * 60_000;
      break;
    case 'y':
      multiplier = 365 * 24 * 60 * 60_000;
      break;
    default:
      throw new Error('Invalid time string');
  }

  const num = parseInt(timeStr.slice(0, -1));

  return num * multiplier;
}
