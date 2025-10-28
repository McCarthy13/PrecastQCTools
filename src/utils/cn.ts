import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Calculate Greatest Common Divisor using Euclidean algorithm
 */
function gcd(a: number, b: number): number {
  return b === 0 ? a : gcd(b, a % b);
}

/**
 * Convert decimal inches to nearest 1/16" fraction, reduced to lowest terms
 * @param decimal - decimal inch value (e.g., 0.5 -> 1/2", 0.375 -> 3/8")
 * @returns formatted string like "1/2"" or "3/8"" (calculated as 16ths, displayed reduced)
 */
export function decimalToFraction(decimal: number): string {
  const absDecimal = Math.abs(decimal);
  const wholePart = Math.floor(absDecimal);
  const fractionalPart = absDecimal - wholePart;
  
  // Round to nearest 1/16
  const sixteenths = Math.round(fractionalPart * 16);
  
  // Handle special cases
  if (sixteenths === 0) {
    return wholePart > 0 ? `${wholePart}"` : '0';
  }
  
  if (sixteenths === 16) {
    return `${wholePart + 1}"`;
  }
  
  // Reduce fraction to lowest terms
  const divisor = gcd(sixteenths, 16);
  const reducedNumerator = sixteenths / divisor;
  const reducedDenominator = 16 / divisor;
  
  // Format the result
  if (wholePart > 0) {
    return `${wholePart} ${reducedNumerator}/${reducedDenominator}"`;
  }
  
  return `${reducedNumerator}/${reducedDenominator}"`;
}

/**
 * Format decimal inches with fraction equivalent
 * @param decimal - decimal inch value
 * @returns formatted string like "0.684 (≈11/16")"
 */
export function formatInchesWithFraction(decimal: number): string {
  const fractionStr = decimalToFraction(decimal);
  return `${decimal.toFixed(3)} (≈${fractionStr})`;
}

/**
 * Parse user input (decimal or fractional) to decimal inches
 * Supports formats:
 * - Decimal inches: "1.375", "0.75", ".5"
 * - Fractions: "5/16", "3/8", "11/16"
 * - Mixed numbers: "1 5/16", "2 3/8"
 * - Feet & inches: "1'-6 3/4\"", "1 ft 6.75 in", "5'"
 * - Decimal feet: "2.5ft", "3.25'"
 * @param input - user input string
 * @returns decimal value or null if invalid
 */
function parseDecimalString(value: string): number | null {
  const decimalPattern = /^[+-]?(?:\d+|\d*\.\d+)$/;
  if (!decimalPattern.test(value)) {
    return null;
  }
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function parseFractionString(value: string): number | null {
  const fractionPattern = /^[+-]?\d+\s*\/\s*\d+$/;
  if (!fractionPattern.test(value)) {
    return null;
  }

  const [rawNumerator, rawDenominator] = value.split('/');
  const numerator = Number(rawNumerator.trim());
  const denominator = Number(rawDenominator.trim());

  if (!Number.isFinite(numerator) || !Number.isFinite(denominator) || denominator === 0) {
    return null;
  }

  return numerator / denominator;
}

function parseInchesComponent(raw: string): number | null {
  let working = raw.trim();
  if (!working) return 0;

  // Normalize separators
  working = working.replace(/[–—]/g, ' '); // em/en dash to space
  working = working.replace(/-/g, ' ');
  working = working.replace(/\s+/g, ' ').trim();

  let sign = 1;
  if (working.startsWith('-')) {
    sign = -1;
    working = working.slice(1).trim();
  } else if (working.startsWith('+')) {
    working = working.slice(1).trim();
  }

  if (!working) return 0;

  // Mixed number (e.g., "6 3/4")
  const mixedMatch = working.match(/^(\d+)\s+(\d+)\s*\/\s*(\d+)$/);
  if (mixedMatch) {
    const whole = Number(mixedMatch[1]);
    const numerator = Number(mixedMatch[2]);
    const denominator = Number(mixedMatch[3]);
    if (!Number.isFinite(whole) || !Number.isFinite(numerator) || !Number.isFinite(denominator) || denominator === 0) {
      return null;
    }
    return sign * (whole + numerator / denominator);
  }

  // Decimal inches
  const decimalValue = parseDecimalString(working);
  if (decimalValue !== null) {
    return sign * decimalValue;
  }

  // Simple fraction
  const fractionValue = parseFractionString(working);
  if (fractionValue !== null) {
    return sign * fractionValue;
  }

  return null;
}

export function parseMeasurementInput(input: string): number | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  // Normalize quotes and separators
  let working = trimmed
    .replace(/[’′‹›]/g, "'")
    .replace(/[“”″〞]/g, '"')
    .replace(/\s+/g, ' ')
    .trim();

  let feet = 0;
  let inchesPortion = working;

  // Handle explicit foot designators ("5 ft", "5feet", etc.)
  const footRegex = /^([+-]?\d+(?:\.\d+)?)\s*(?:ft|feet|foot)\b(.*)$/i;
  const footMatch = inchesPortion.match(footRegex);
  if (footMatch) {
    feet = parseFloat(footMatch[1]);
    if (!Number.isFinite(feet)) {
      return null;
    }
    inchesPortion = footMatch[2].trim();
  } else if (inchesPortion.includes("'")) {
    const index = inchesPortion.indexOf("'");
    const footPart = inchesPortion.slice(0, index).trim();
    if (footPart) {
      const parsedFeet = parseFloat(footPart);
      if (!Number.isFinite(parsedFeet)) {
        return null;
      }
      feet = parsedFeet;
    }
    inchesPortion = inchesPortion.slice(index + 1).trim();
  }

  // Remove leading separators (e.g., "-", "–", hyphen)
  inchesPortion = inchesPortion.replace(/^[\s\-–—]+/, '').trim();

  // Remove trailing inch designators
  inchesPortion = inchesPortion.replace(/(?:inches|inch|in)\.?$/i, '').trim();
  inchesPortion = inchesPortion.replace(/"$/g, '').trim();
  inchesPortion = inchesPortion.replace(/"/g, '').trim();

  let inches = 0;
  if (inchesPortion.length > 0) {
    const parsedInches = parseInchesComponent(inchesPortion);
    if (parsedInches === null) {
      return null;
    }
    inches = parsedInches;
  }

  return feet * 12 + inches;
}

/**
 * Convert decimal feet to formatted span display
 * @param decimalFeet - span in decimal feet (e.g., 40.583)
 * @returns formatted string like "40'-7" (40.583 ft)"
 */
export function formatSpanDisplay(decimalFeet: number): string {
  const feet = Math.floor(decimalFeet);
  const remainingInches = (decimalFeet - feet) * 12;
  let wholeInches = Math.floor(remainingInches);
  const fractionalInches = remainingInches - wholeInches;
  
  // Round to nearest 1/16
  let sixteenths = Math.round(fractionalInches * 16);
  
  // Handle rounding up to next inch
  if (sixteenths === 16) {
    wholeInches += 1;
    sixteenths = 0;
  }
  
  let inchDisplay = '';
  if (wholeInches > 0 && sixteenths > 0) {
    inchDisplay = `${wholeInches} ${sixteenths}/16"`;
  } else if (wholeInches > 0) {
    inchDisplay = `${wholeInches}"`;
  } else if (sixteenths > 0) {
    inchDisplay = `${sixteenths}/16"`;
  } else {
    inchDisplay = `0"`;
  }
  
  return `${feet}'-${inchDisplay} (${decimalFeet.toFixed(3)} ft)`;
}
