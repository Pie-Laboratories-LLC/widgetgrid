// Fractional indexing for sibling order (David Greenspan's base-62
// midpoint scheme). A rank is a string of digits from DIGITS, compared as
// plain bytes (the column uses COLLATE "C"), never ending in '0'. Between
// any two ranks there is always another, so inserting or moving an issue
// rewrites only that issue's rank.
const DIGITS = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';

// A rank strictly between a and b. a = '' means "before everything",
// b = null means "after everything".
export function rankBetween(a, b) {
  if (b !== null && a >= b) throw new Error(`rankBetween: ${a} >= ${b}`);
  if (a.endsWith('0') || (b && b.endsWith('0'))) throw new Error('rankBetween: rank ends in 0');
  if (b) {
    // Shared prefix: recurse on the parts after it.
    let n = 0;
    while ((a[n] ?? '0') === b[n]) n += 1;
    if (n > 0) return b.slice(0, n) + rankBetween(a.slice(n), b.slice(n));
  }
  const digitA = a ? DIGITS.indexOf(a[0]) : 0;
  const digitB = b !== null ? DIGITS.indexOf(b[0]) : DIGITS.length;
  if (digitB - digitA > 1) return DIGITS[Math.round((digitA + digitB) / 2)];
  // Adjacent first digits: extend.
  if (b && b.length > 1) return b.slice(0, 1);
  return DIGITS[digitA] + rankBetween(a.slice(1), null);
}

// A rank after `last` ('' = no siblings yet) for appending: steps the last
// digit up instead of halving the gap to the end, so a long run of appends
// grows by one character per ~30 issues rather than every few.
export function rankAfter(last) {
  if (!last) return 'V';
  const i = DIGITS.indexOf(last.at(-1));
  return i < DIGITS.length - 1 ? last.slice(0, -1) + DIGITS[i + 1] : last + 'V';
}
