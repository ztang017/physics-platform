// ─── 1D Collision Engine ──────────────────────────────────────────────────────
// Analytical solutions for elastic and inelastic 1D collisions.
// Coefficient of restitution e: 0 = perfectly inelastic, 1 = perfectly elastic.

export interface CollisionParams {
  m1: number;  // mass of cart 1 (kg)
  v1: number;  // initial velocity of cart 1 (m/s)
  m2: number;  // mass of cart 2 (kg)
  v2: number;  // initial velocity of cart 2 (m/s)
  e: number;   // coefficient of restitution [0, 1]
}

export interface CollisionResult {
  v1f: number;             // final velocity of cart 1 (m/s)
  v2f: number;             // final velocity of cart 2 (m/s)
  p1i: number;             // initial momentum of cart 1 (kg·m/s)
  p2i: number;             // initial momentum of cart 2 (kg·m/s)
  p1f: number;             // final momentum of cart 1 (kg·m/s)
  p2f: number;             // final momentum of cart 2 (kg·m/s)
  totalMomentumBefore: number;
  totalMomentumAfter: number;
  ke1i: number;            // initial KE of cart 1 (J)
  ke2i: number;            // initial KE of cart 2 (J)
  ke1f: number;            // final KE of cart 1 (J)
  ke2f: number;            // final KE of cart 2 (J)
  totalKEBefore: number;
  totalKEAfter: number;
  keLost: number;          // energy converted to heat/sound (J)
  isEnergyConserved: boolean; // true if |keLost| < 1% of totalKEBefore
  isMomentumConserved: boolean; // always true (sanity check)
}

/**
 * Solve a 1D collision using the coefficient of restitution method.
 *
 * Equations:
 *   v1f = (m1·v1 + m2·v2 + m2·e·(v2 - v1)) / (m1 + m2)
 *   v2f = (m1·v1 + m2·v2 + m1·e·(v1 - v2)) / (m1 + m2)
 */
export function solveCollision(params: CollisionParams): CollisionResult {
  const { m1, v1, m2, v2, e } = params;
  const totalMass = m1 + m2;

  const v1f = (m1 * v1 + m2 * v2 + m2 * e * (v2 - v1)) / totalMass;
  const v2f = (m1 * v1 + m2 * v2 + m1 * e * (v1 - v2)) / totalMass;

  const p1i = m1 * v1;
  const p2i = m2 * v2;
  const p1f = m1 * v1f;
  const p2f = m2 * v2f;

  const ke = (m: number, v: number) => 0.5 * m * v * v;
  const ke1i = ke(m1, v1);
  const ke2i = ke(m2, v2);
  const ke1f = ke(m1, v1f);
  const ke2f = ke(m2, v2f);

  const totalKEBefore = ke1i + ke2i;
  const totalKEAfter = ke1f + ke2f;
  const keLost = totalKEBefore - totalKEAfter;

  const totalMomentumBefore = p1i + p2i;
  const totalMomentumAfter = p1f + p2f;

  return {
    v1f, v2f,
    p1i, p2i, p1f, p2f,
    totalMomentumBefore, totalMomentumAfter,
    ke1i, ke2i, ke1f, ke2f,
    totalKEBefore, totalKEAfter,
    keLost,
    isEnergyConserved: Math.abs(keLost) < 0.01 * totalKEBefore,
    isMomentumConserved: Math.abs(totalMomentumAfter - totalMomentumBefore) < 1e-9,
  };
}

// ─── Collision Interpolation (for slow-mo scrubber) ──────────────────────────

export interface CartState {
  x1: number;
  x2: number;
  v1: number;
  v2: number;
  phase: 'approach' | 'collision' | 'separation';
}

/** Half-width of a cart in track meters, used to decide when they touch. */
const CART_HALF_WIDTH = 0.45;

/**
 * Compute cart positions along a track at a normalized time t ∈ [0, 1].
 * Phase: approach (0–0.45), collision (0.45–0.55), separation (0.55–1.0)
 *
 * The approach phase moves each cart at its OWN real velocity for exactly the
 * time it takes them to reach contact (rather than an arbitrary multiplier),
 * so cart 1 never visually overshoots cart 2's position — and the collision
 * phase holds the carts at that same contact position, so there's no
 * teleport/"restart" jump into the separation phase.
 */
export function interpolateCollision(
  params: CollisionParams,
  result: CollisionResult,
  tNorm: number, // 0 to 1
  trackWidth = 10 // meters
): CartState {
  const { v1, v2 } = params;
  const { v1f, v2f } = result;

  // Starting positions: cart1 at 15% from left, cart2 at 65% from left
  const x1Start = trackWidth * 0.15;
  const x2Start = trackWidth * 0.65;
  const contactGap = CART_HALF_WIDTH * 2; // distance between centres at impact

  // How fast the gap between the carts is closing. If it isn't closing
  // (e.g. cart 1 is slower than or moving away from cart 2), fall back to a
  // small positive rate so the animation still plays instead of stalling.
  const closingSpeed = Math.max(v1 - v2, 0.5);
  const gapToClose = Math.max(x2Start - x1Start - contactGap, 0);
  const timeToContact = gapToClose / closingSpeed;

  const contactX1 = x1Start + v1 * timeToContact;
  const contactX2 = x2Start + v2 * timeToContact;

  if (tNorm < 0.45) {
    const t = tNorm / 0.45;
    const elapsed = t * timeToContact;
    return {
      x1: x1Start + v1 * elapsed,
      x2: x2Start + v2 * elapsed,
      v1, v2,
      phase: 'approach',
    };
  } else if (tNorm < 0.55) {
    // Hold at the exact contact position reached at the end of the approach.
    return {
      x1: contactX1,
      x2: contactX2,
      v1, v2,
      phase: 'collision',
    };
  } else {
    const t = (tNorm - 0.55) / 0.45;
    // Scale the separation phase's duration to the actual outcome speed, so a
    // fast rebound doesn't fly off the visible track while a slow one barely
    // moves — the faster cart always travels the same visual distance by the
    // end of the animation, regardless of how many m/s that actually is.
    const SEPARATION_DISTANCE = 3; // meters the faster cart travels by animation's end
    const maxFinalSpeed = Math.max(Math.abs(v1f), Math.abs(v2f), 0.1);
    const separationTime = SEPARATION_DISTANCE / maxFinalSpeed;
    const elapsed = t * separationTime;
    return {
      x1: contactX1 + v1f * elapsed,
      x2: contactX2 + v2f * elapsed,
      v1: v1f, v2: v2f,
      phase: 'separation',
    };
  }
}
