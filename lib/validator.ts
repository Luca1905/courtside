type SetScore = { guest: number; home: number };

type MatchResult = {
  valid: boolean;
  winner: "Guest" | "Home" | null;
};

/**
 * Normal set:
 * – Winner 6 points and loser ≤ 4, or
 * – Winner 7 points and loser 6
 */
function isNormalSet(a: number, b: number): boolean {
  const w = Math.max(a, b);
  const l = Math.min(a, b);
  return (w === 6 && l <= 4) || (w === 7 && l === 6);
}

/**
 * Match tiebreak:
 * – Winner ≥ 10 points
 * – Win by ≥ 2 points
 */
function isMatchTiebreak(a: number, b: number): boolean {
  const w = Math.max(a, b);
  const l = Math.min(a, b);
  return w >= 10 && w - l >= 2;
}

function isEmptySet(a: number, b: number): boolean {
  return a === 0 && b === 0;
}

/**
 * Validate a best-of-3 match:
 * – Sets 1 and 2 normal
 * – If after two sets one side leads 2–0, set 3 must not be played
 * – If 1–1, set 3 must be either normal or a match tiebreak
 * – One side must win majority of sets
 */
export function validateMatchScore(sets: SetScore[]): MatchResult {
  if (sets.length !== 3) {
    return { valid: false, winner: null };
  }

  let guestWins = 0;
  let homeWins = 0;

  // Validate first two sets as normal
  for (let i = 0; i < 2; i++) {
    const { guest, home } = sets[i];
    if (!isNormalSet(guest, home)) {
      return { valid: false, winner: null };
    }
    if (guest > home) guestWins++;
    else homeWins++;
  }

  // case: someone already won 2–0, set 3 must be empty
  if (guestWins === 2 || homeWins === 2) {
    const { guest, home } = sets[2];
    if (!isEmptySet(guest, home)) {
      return { valid: false, winner: null };
    }
    return {
      valid: true,
      winner: guestWins > homeWins ? "Guest" : "Home",
    };
  }

  // case: tied 1–1, set3 must be played
  // validate set 3
  const { guest, home } = sets[2];
  const thirdIsNormal = isNormalSet(guest, home);
  const thirdIsTiebreak = isMatchTiebreak(guest, home);
  if (!thirdIsNormal && !thirdIsTiebreak) {
    return { valid: false, winner: null };
  }
  if (guest > home) guestWins++;
  else homeWins++;

  // checK: one side has more sets
  if (guestWins === homeWins) {
    return { valid: false, winner: null };
  }
  return {
    valid: true,
    winner: guestWins > homeWins ? "Guest" : "Home",
  };
}
