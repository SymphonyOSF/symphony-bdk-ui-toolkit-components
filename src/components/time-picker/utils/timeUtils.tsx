import { Keys } from '../../date-picker/utils/keyUtils';
import {
  format as formatTime,
  formatISO as formatISOTime,
  parse as parseTime,
  isValid,
} from 'date-fns';

export const TIME_FORMAT = {
  HH_MM_12: /^(0[1-9]|1[0-2]):[0-5][0-9]$/,
  HH_MM_SS_12: /^(0[1-9]|1[0-2]):[0-5][0-9]:[0-5][0-9]$/,
  HH_MM_12_A: /^(0[1-9]|1[0-2]):[0-5][0-9] ?[AaPp][Mm]$/,
  HH_MM_SS_12_A: /^(0[1-9]|1[0-2]):[0-5][0-9]:[0-5][0-9] ?[AaPp][Mm]$/,
  HH_MM_24: /^(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/,
  HH_MM_SS_24: /^(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/,
};

// const isTimeValid = (time: string, format: RegExp): boolean => {
//   return time.match(format);
// };

export const isTimeValid = (time, format = null): boolean => {
  return time.match(format);
};

export function matchExactTime(time, matcher): boolean {
  if (!('time' in matcher)) return false;
  return formatTimeISO(time) === matcher.time;
}

export function matchTimeInRange(time, matcher): boolean {
  if (!('from' in matcher) || !('to' in matcher)) return false;
  return (
    matcher.from <= formatTimeISO(time) && formatTimeISO(time) <= matcher.to
  );
}

/**
 * Format time in ISO time format 'HH:MM:SS' on 24 hours
 * @param time
 */
export const formatTimeISO = (time) => {
  return (
    time.hours.toString().padStart(2, '0') +
    ':' +
    time.minutes.toString().padStart(2, '0') +
    ':' +
    time.seconds.toString().padStart(2, '0')
  );
};

export const getNumberOn2Digits = (number) =>
  number.toLocaleString(undefined, { minimumIntegerDigits: 2 });

/**
 * Convert ISO time to seconds
 * @param time HH:MM:ss
 */
export const formatISOToSeconds = (time) => {
  // TODO : Do better (check, algo use Date ?)
  const matches = time.split(':'); // split it at the colons
  return +matches[0] * 60 * 60 + +matches[1] * 60 + +matches[2];
};

/**
 * Return the options to use in the DropDown menu
 *
 * @param format Format used to display the time
 * @param min Minimum value
 * @param max Maximum value
 * @param step Step in seconds
 */
export const getOptions = (
  format: string,
  min: number,
  max: number,
  step: number
): Array<any> => {
  const options = [];
  for (
    let currentTime = min, index = 0;
    currentTime <= max;
    currentTime += step, index++
  ) {
    const time = getTimeFromSeconds(currentTime);
    options.push({
      label: getFormattedTime(time, format),
      value: {
        index, // Save the index of the Option, for easy access to the previous/next option if needed
        ...time,
      },
      // value: formatTimeISO(time),
    });
  }
  return options;
};

/**
 * Split time from a ISO time string
 * @param time Example hh:mm:ss (on 24 hours)
 *
 */
export const getTimeFromISO = (time: string) => {
  // TODO : Check if time is valid
  if (!time) {
    return null;
  }

  const matches = time.split(':');

  const hours = matches[0];
  const minutes = matches[1];
  const seconds = matches[2];

  return { hours, minutes, seconds };
};

/**
 * Return `true` if the given time matches to a disabled time.
 */
export const isTimeDisabled = (time, disabledTimes): boolean => {
  let disabledTimesAsArray;
  if (Array.isArray(disabledTimes)) {
    disabledTimesAsArray = disabledTimes;
  } else {
    disabledTimesAsArray = [disabledTimes];
  }

  return disabledTimesAsArray.some((disabledTime) => {
    return (
      matchExactTime(time.value, disabledTime) ||
      matchTimeInRange(time.value, disabledTime)
    );
  });
};

//--------------

export enum FIELD {
  HOURS = 'hours',
  MINUTES = 'minutes',
  SECONDS = 'seconds',
  AMPM = 'ampm',
}

/**
 * Return true if the option is matching with the hours/minutes/seconds and not appears in the disabledTimes
 * @param option
 * @param hours
 * @param minutes
 * @param seconds
 * @param disabledTimes
 */
export const isOptionSelected = (
  option: any,
  hours: string,
  minutes: string,
  seconds: string,
  disabledTimes: string | Array<any>
): boolean =>
  option &&
  option.value &&
  option.value.hours === hours &&
  option.value.minutes === minutes &&
  option.value.seconds === seconds &&
  !isTimeDisabled(option, disabledTimes);

/**
 * Get ISO time in an object {hours, minutes, seconds} from a given local time and format
 * @param time
 * @param format (optional) Use HH:mm:ss per default (on 24 hours)
 */
export const getISOTimeFromLocalTime = (time: string, format = 'HH:mm:ss') => {
  if (!time || !format) {
    return null;
  }
  const date = parseTime(time, format, 0);
  return {
    hours: getNumberOn2Digits(date.getHours()),
    minutes: getNumberOn2Digits(date.getMinutes()),
    seconds: getNumberOn2Digits(date.getSeconds()),
  };
};

/**
 * Return the time formatted with the format if it's provided in parameter, else it will use the locale settings of the user
 * @param time Object with {hours, seconds, minutes}
 * @param format
 */
export const getFormattedTime = (time, format = null): string => {
  if (!time) {
    // Time null or undefined
    return null;
  }
  const date = new Date();
  date.setHours(time.hours, time.minutes, time.seconds);

  if (!isValid(date)) {
    // Not valid
    return null;
  }

  if (format === null) {
    // Return time formatted with locale time (Example: 08:50 AM or 14:55:00 ...)
    return date.toLocaleTimeString();
  }
  // Format time
  return formatTime(date, format);
};

/**
 * Split a time given only in seconds into { hours, minutes, seconds } on 24 hours format
 *
 * @param time In seconds
 * @return { hours, minutes, seconds }
 */
export const getTimeFromSeconds = (time: number): any => {
  const hours = Math.floor(time / 60 / 60);
  const minutes = Math.floor(time / 60) - hours * 60;
  const seconds = time % 60;
  return {
    hours: getNumberOn2Digits(hours),
    minutes: getNumberOn2Digits(minutes),
    seconds: getNumberOn2Digits(seconds),
  };
};

/**
 * Returns all sorted values used in the options
 * Example:
 * {
 *   hours: ['02', '05', '06', '11'],
 *   minutes: ['00', '15', '30', '45'],
 *   seconds: ['00', '30'],
 * }
 * @param options
 */
export const getSteps = (options: Array<any>) => {
  const hoursValues = new Set<string>();
  const minutesValues = new Set<string>();
  const secondsValues = new Set<string>();

  options.forEach((option) => {
    hoursValues.add(option.value[FIELD.HOURS]);
    minutesValues.add(option.value[FIELD.MINUTES]);
    secondsValues.add(option.value[FIELD.SECONDS]);
  });

  return {
    hours: [...hoursValues].sort(),
    minutes: [...minutesValues].sort(),
    seconds: [...secondsValues].sort(),
  };
};

/**
 * Return the next value to display when the user press a arrow up/down key
 *
 * @param key Key pressed by the user (See keyUtils.Key)
 * @param field Field to process (Field.HOURS or Field.MINUTES or Field.SECONDS)
 * @param inputValue Input value saved in an object (Example: {hours: '12', minutes: '30', seconds: '20'})
 * @param options Options used in the Dropdown component
 * @param steps All the steps (See method getSteps)
 */
export const getOptionValue = (
  key: Keys,
  field: FIELD,
  inputValue: any,
  options: any,
  steps: any
) => {
  if (field === FIELD.SECONDS) {
    // Loop on seconds
    let seconds = parseInt(inputValue[FIELD.SECONDS], 10);
    let nextValue = key === Keys.ARROW_UP ? ++seconds : --seconds;
    // To not return -1 or 60
    nextValue = nextValue < 0 ? 59 : nextValue;
    nextValue = 59 < nextValue ? 0 : nextValue;
    return getNumberOn2Digits(nextValue);
  } else if (field === FIELD.AMPM) {
    // Loop on 'AM'/'PM'
    return inputValue[FIELD.AMPM] === 'AM' ? 'PM' : 'AM';
  }
  for (
    let index = key === Keys.ARROW_UP ? 0 : steps[field].length - 1;
    key === Keys.ARROW_UP ? index < steps[field].length : 0 <= index;
    key === Keys.ARROW_UP ? index++ : index--
  ) {
    const currentValue = steps[field][index];
    if (key === Keys.ARROW_UP && currentValue > inputValue[field]) {
      return currentValue;
    } else if (key === Keys.ARROW_DOWN && currentValue < inputValue[field]) {
      return currentValue;
    }
  }
  // If not found then return the first/last value
  return key === Keys.ARROW_UP
    ? steps[field][0]
    : steps[field][steps[field].length - 1];
};
