// ─── Kinematics Engine ────────────────────────────────────────────────────────
// Pure analytical functions for 1D constant-acceleration motion.
// No side effects. All inputs in SI units (m, m/s, m/s², s).

export interface KinematicsParams {
  x0: number;   // initial position (m)
  v0: number;   // initial velocity (m/s)
  a: number;    // constant acceleration (m/s²)
}

export interface KinematicsDataPoint {
  t: number;  // time (s)
  x: number;  // position (m)
  v: number;  // velocity (m/s)
  a: number;  // acceleration (m/s²)
}

/** x = x₀ + v₀t + ½at² */
export function getPosition(params: KinematicsParams, t: number): number {
  const { x0, v0, a } = params;
  return x0 + v0 * t + 0.5 * a * t * t;
}

/** v = v₀ + at */
export function getVelocity(params: KinematicsParams, t: number): number {
  return params.v0 + params.a * t;
}

/** v² = v₀² + 2a(x - x₀) — returns velocity at a given position */
export function getVelocityAtPosition(params: KinematicsParams, x: number): number {
  const { v0, a, x0 } = params;
  const discriminant = v0 * v0 + 2 * a * (x - x0);
  return discriminant >= 0 ? Math.sqrt(discriminant) : NaN;
}

/**
 * Generate a time-series of kinematic data points.
 * @param params   initial conditions
 * @param duration total simulation time (s)
 * @param dt       time step (s), defaults to 0.016 (~60fps)
 */
export function generateTimeSeries(
  params: KinematicsParams,
  duration: number,
  dt = 0.016
): KinematicsDataPoint[] {
  const points: KinematicsDataPoint[] = [];
  for (let t = 0; t <= duration + dt / 2; t += dt) {
    points.push({
      t: parseFloat(t.toFixed(4)),
      x: getPosition(params, t),
      v: getVelocity(params, t),
      a: params.a,
    });
  }
  return points;
}

// ─── Graph-Match Scoring ───────────────────────────────────────────────────────

export interface GraphMatchResult {
  /** 0–100 score based on how well the student matched the target */
  score: number;
  /** Mean absolute error in m/s */
  mae: number;
  /** Whether the student earned a perfect-match badge (score ≥ 95) */
  isPerfect: boolean;
}

/**
 * Compares two velocity time-series arrays and returns a match score.
 * Uses normalised mean absolute error, capped at 0–100.
 */
export function scoreGraphMatch(
  target: KinematicsDataPoint[],
  student: KinematicsDataPoint[]
): GraphMatchResult {
  const len = Math.min(target.length, student.length);
  if (len === 0) return { score: 0, mae: Infinity, isPerfect: false };

  let totalError = 0;
  let maxPossible = 0;

  for (let i = 0; i < len; i++) {
    totalError += Math.abs(target[i].v - student[i].v);
    maxPossible += Math.abs(target[i].v) + 1; // avoid div-by-zero
  }

  const normError = totalError / maxPossible;
  const score = Math.max(0, Math.round((1 - normError) * 100));
  const mae = totalError / len;

  return { score, mae, isPerfect: score >= 95 };
}

// ─── POE Answer Key ───────────────────────────────────────────────────────────

export type GraphShape =
  | 'linear-increasing'
  | 'linear-decreasing'
  | 'constant'
  | 'parabolic-up'
  | 'parabolic-down';

/** Given kinematic params, return the expected shape of the v-t graph */
export function predictVelocityShape(params: KinematicsParams): GraphShape {
  if (params.a > 0.01) return 'linear-increasing';
  if (params.a < -0.01) return 'linear-decreasing';
  return 'constant';
}

/** Given kinematic params, return the expected shape of the x-t graph */
export function predictPositionShape(params: KinematicsParams): GraphShape {
  if (Math.abs(params.a) > 0.01) {
    return params.a > 0 ? 'parabolic-up' : 'parabolic-down';
  }
  return params.v0 > 0.01
    ? 'linear-increasing'
    : params.v0 < -0.01
    ? 'linear-decreasing'
    : 'constant';
}
