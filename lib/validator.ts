export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

/**
 * Convert "7-6(10-8)" => { g1: 7, g2: 6, tb1: 10, tb2: 8 }
 */
function parseSet(str: string) {
  const RE = /^(?<g1>\d+)-(?<g2>\d+)(?:\((?<tb1>\d+)-(?<tb2>\d+)\))?$/;

  const m = str.match(RE);
  if (!m?.groups) throw new Error(`Malformed set "${str}"`);

  const i = (x?: string) => (x === undefined ? undefined : +x);
  return {
    g1: +m.groups.g1,
    g2: +m.groups.g2,
    tb1: i(m.groups.tb1),
    tb2: i(m.groups.tb2),
  };
}

function validateSet(
  s: ReturnType<typeof parseSet>
): string | null /* error msg */ {
  const inRange = (v: number) => Number.isInteger(v) && v >= 0 && v <= 7;
  if (!inRange(s.g1) || !inRange(s.g2)) return "games must be integers 0-7";
  if (s.g1 === s.g2) return "set cannot end in a draw";

  const max = Math.max(s.g1, s.g2);
  const diff = Math.abs(s.g1 - s.g2);
  const ok =
    (max === 6 && diff >= 2) || //
    (max === 7 && (diff === 2 || diff === 1));
  if (!ok) return "invalid game score";

  const tbNeeded = max === 7 && diff === 1;
  if (tbNeeded) {
    if (s.tb1 === undefined || s.tb2 === undefined)
      return "tiebreak missing for 7-6";
    const tbMax = Math.max(s.tb1, s.tb2);
    const tbDiff = Math.abs(s.tb1 - s.tb2);
    if (tbMax < 7 || tbDiff < 2) return "tiebreak must reach ≥7 and lead by 2";
  } else if (s.tb1 !== undefined || s.tb2 !== undefined) {
    return "tiebreak supplied for non-tiebreak set";
  }
  return null;
}

export function validateMatch(bestOf: 3 | 5, sets: string[]): ValidationResult {
  const errors: string[] = [];

  if (sets.length === 0) errors.push("no sets given");
  if (sets.length > bestOf)
    errors.push(`best-of-${bestOf} cannot contain ${sets.length} sets`);

  let p1 = 0,
    p2 = 0,
    decidedAt: number | null = null;

  sets.forEach((str, i) => {
    let parsed;
    try {
      parsed = parseSet(str);
    } catch (e) {
      errors.push(`set ${i + 1}: ${(e as Error).message}`);
      return;
    }
    const msg = validateSet(parsed);
    if (msg) {
      errors.push(`set ${i + 1}: ${msg}`);
      return;
    }
    if (parsed.g1 > parsed.g2) {
      p1++;
    } else {
      p2++;
    }

    const need = bestOf === 3 ? 2 : 3;
    if (decidedAt === null && (p1 === need || p2 === need)) decidedAt = i;
  });

  const need = bestOf === 3 ? 2 : 3;
  if (p1 < need && p2 < need) errors.push("match unfinished");
  if (decidedAt !== null && decidedAt !== sets.length - 1)
    errors.push(`extra sets after match decided at set ${decidedAt + 1}`);

  return { valid: errors.length === 0, errors };
}

export function getWinner(sets: string[]): 1 | 2 | null {
  const need = sets.length > 3 ? 3 : 2;
  let p1 = 0,
    p2 = 0;
  sets.forEach((s) => {
    const [a, b] = s.split("-").map(Number);
    if (a > b) p1++;
    else if (b > a) p2++;
  });
  if (p1 >= need) return 1;
  if (p2 >= need) return 2;
  return null;
}
