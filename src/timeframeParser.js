/**
 * Timeframe Parser
 * Converts natural language timeframes (e.g., "6 months", "2 years") to Unix seconds
 * Supports: days, weeks, months, years
 */

const TIME_UNITS = {
  second: 1,
  seconds: 1,
  minute: 60,
  minutes: 60,
  hour: 3600,
  hours: 3600,
  day: 86400,
  days: 86400,
  week: 604800,
  weeks: 604800,
  month: 2592000, // 30 days average
  months: 2592000,
  year: 31536000, // 365 days
  years: 31536000,
};

/**
 * Parse natural language timeframe to seconds
 * @param {string} timeframeString - e.g., "6 months", "2 years", "90 days"
 * @returns {number} Seconds
 * @throws {Error} If timeframe is invalid
 */
export function parseTimeframe(timeframeString) {
  if (!timeframeString || typeof timeframeString !== 'string') {
    throw new Error('Timeframe must be a non-empty string');
  }

  const trimmed = timeframeString.toLowerCase().trim();

  // Match pattern: number + unit (e.g., "6 months", "2 years")
  const match = trimmed.match(/^(\d+(?:\.\d+)?)\s+([a-z]+)$/);

  if (!match) {
    throw new Error(
      `Invalid timeframe format: "${timeframeString}". Use format like "6 months", "2 years", "90 days"`
    );
  }

  const [, numberStr, unit] = match;
  const number = parseFloat(numberStr);
  const unitSeconds = TIME_UNITS[unit];

  if (!unitSeconds) {
    throw new Error(
      `Unknown time unit: "${unit}". Valid units: ${Object.keys(TIME_UNITS).filter((u, i, a) => a.indexOf(u) === i).join(', ')}`
    );
  }

  const seconds = Math.floor(number * unitSeconds);

  if (seconds < 0) {
    throw new Error('Timeframe must be positive');
  }

  return seconds;
}

/**
 * Convert Unix seconds to human-readable format
 * @param {number} seconds - Unix seconds
 * @returns {string} Human-readable format
 */
export function secondsToHumanReadable(seconds) {
  const units = [
    { name: 'year', value: 31536000 },
    { name: 'month', value: 2592000 },
    { name: 'week', value: 604800 },
    { name: 'day', value: 86400 },
    { name: 'hour', value: 3600 },
    { name: 'minute', value: 60 },
    { name: 'second', value: 1 },
  ];

  for (const unit of units) {
    if (seconds >= unit.value) {
      const count = Math.floor(seconds / unit.value);
      return `${count} ${unit.name}${count > 1 ? 's' : ''}`;
    }
  }

  return '0 seconds';
}
