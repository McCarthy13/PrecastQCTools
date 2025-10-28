import { parseMeasurementInput } from '@/utils/cn';

export const FRACTIONS = ['0', '1/8', '1/4', '3/8', '1/2', '5/8', '3/4', '7/8'] as const;

export type FractionOption = (typeof FRACTIONS)[number];

export function splitSpanToParts(spanInFeet?: number) {
  if (!spanInFeet || Number.isNaN(spanInFeet) || spanInFeet <= 0) {
    return {
      feet: '',
      inches: '',
      fraction: '0' as FractionOption,
    };
  }

  const feet = Math.floor(spanInFeet);
  const totalInches = (spanInFeet - feet) * 12;
  const wholeInches = Math.floor(totalInches);
  const remainder = totalInches - wholeInches;

  const nearestFractionIndex = Math.round(remainder * 8);
  const fraction = FRACTIONS[Math.min(Math.max(nearestFractionIndex, 0), FRACTIONS.length - 1)];

  return {
    feet: feet ? String(feet) : '',
    inches: wholeInches ? String(wholeInches) : '',
    fraction,
  };
}

export function combineSpanParts(feetRaw: string, inchesRaw: string, fraction: FractionOption): number {
  const feet = Number(feetRaw) || 0;
  const inches = Number(inchesRaw) || 0;
  const fractionValue = fraction === '0' ? 0 : parseMeasurementInput(fraction) ?? 0;
  return feet + (inches + fractionValue) / 12;
}

export function formatNumber(value: number | undefined, digits = 3) {
  if (value === undefined || Number.isNaN(value)) {
    return '—';
  }
  return value.toFixed(digits);
}

export function formatPercent(value: number | undefined, digits = 1) {
  if (value === undefined || Number.isNaN(value)) {
    return '—';
  }
  return `${value.toFixed(digits)}%`;
}

export function formatTimestamp(timestamp: number) {
  try {
    return new Date(timestamp).toLocaleString();
  } catch {
    return 'Unknown date';
  }
}
