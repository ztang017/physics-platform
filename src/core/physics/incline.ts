// ─── Incline / Free-Body Diagram Engine ──────────────────────────────────────
// Decomposes forces on a block resting on a tilted surface.
// Convention: angle in degrees from horizontal. g = 9.8 m/s²

export interface InclineParams {
  mass: number;         // kg
  angleDeg: number;     // incline angle (0–90°)
  muStatic: number;     // coefficient of static friction
  muKinetic: number;    // coefficient of kinetic friction
  g?: number;           // gravitational acceleration, default 9.8
}

export interface ForceComponents {
  weight: number;           // mg  (N)
  weightParallel: number;   // mg·sin(θ) — down the slope (N)
  weightPerpendicular: number; // mg·cos(θ) — into surface (N)
  normal: number;           // equal to weightPerpendicular (N)
  frictionMax: number;      // μₛ·N (N)
  frictionKinetic: number;  // μₖ·N (N)
  netForce: number;         // net force along slope (positive = down) (N)
  acceleration: number;     // m/s²
  isStationary: boolean;    // true if block doesn't move
}

function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

/**
 * Compute all force components for a block on an incline.
 * Returns a complete ForceComponents breakdown.
 */
export function computeInclineForces(params: InclineParams): ForceComponents {
  const g = params.g ?? 9.8;
  const { mass, angleDeg, muStatic, muKinetic } = params;
  const theta = toRad(angleDeg);

  const weight = mass * g;
  const weightParallel = weight * Math.sin(theta);
  const weightPerpendicular = weight * Math.cos(theta);
  const normal = weightPerpendicular;
  const frictionMax = muStatic * normal;
  const frictionKinetic = muKinetic * normal;

  // Static case: does gravity overcome max static friction?
  const isStationary = weightParallel <= frictionMax;

  let netForce: number;
  let acceleration: number;

  if (isStationary) {
    netForce = 0;
    acceleration = 0;
  } else {
    // Block slides: kinetic friction opposes motion (up the slope)
    netForce = weightParallel - frictionKinetic;
    acceleration = netForce / mass;
  }

  return {
    weight,
    weightParallel,
    weightPerpendicular,
    normal,
    frictionMax,
    frictionKinetic,
    netForce,
    acceleration,
    isStationary,
  };
}

// ─── FBD Validation ──────────────────────────────────────────────────────────

export interface FBDVector {
  id: string;
  magnitude: number;  // N
  angleDeg: number;   // from positive x-axis
}

export interface FBDValidationResult {
  isValid: boolean;
  errors: string[];
  score: number; // 0–100
}

/**
 * Validate student-placed FBD vectors against the computed correct answer.
 * Each expected vector is matched to the closest student vector.
 * Tolerance: ±5% magnitude, ±5° direction.
 */
export function validateFBD(
  studentVectors: FBDVector[],
  correct: ForceComponents,
  angleDeg: number
): FBDValidationResult {
  const theta = angleDeg;
  const errors: string[] = [];

  // Expected vectors: weight (straight down), normal (perpendicular to surface), friction (up slope)
  const expected = [
    { id: 'weight', mag: correct.weight, angleDeg: 270 }, // straight down
    { id: 'normal', mag: correct.normal, angleDeg: 90 + theta }, // perpendicular to surface
    {
      id: 'friction',
      mag: correct.isStationary ? correct.weightParallel : correct.frictionKinetic,
      angleDeg: 180 - theta, // up the slope
    },
  ];

  let matched = 0;

  for (const exp of expected) {
    const found = studentVectors.find((sv) => {
      const magOk = Math.abs(sv.magnitude - exp.mag) / exp.mag < 0.08;
      const angDiff = Math.abs(((sv.angleDeg - exp.angleDeg + 540) % 360) - 180);
      return magOk && angDiff <= 8;
    });
    if (!found) {
      errors.push(`Missing or incorrect ${exp.id} vector`);
    } else {
      matched++;
    }
  }

  const score = Math.round((matched / expected.length) * 100);
  return { isValid: matched === expected.length, errors, score };
}
