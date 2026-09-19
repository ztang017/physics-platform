// ─── Projectile Motion Engine ─────────────────────────────────────────────────
// 2D projectile motion under constant gravity, no air resistance.
// x(t) = v₀cosθ · t    y(t) = v₀sinθ · t − ½gt²

export interface ProjectileParams {
  v0: number;      // launch speed (m/s)
  angleDeg: number; // launch angle above horizontal (degrees)
  x0?: number;     // initial x (m), defaults to 0
  y0?: number;     // initial y (m), defaults to 0
  g?: number;      // gravitational acceleration (m/s²), defaults to 9.8
}

export interface ProjectilePoint {
  t: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  speed: number;
}

function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

/** Horizontal component of initial velocity */
export function getVx(params: ProjectileParams): number {
  return params.v0 * Math.cos(toRad(params.angleDeg));
}

/** Vertical component of initial velocity */
export function getVy0(params: ProjectileParams): number {
  return params.v0 * Math.sin(toRad(params.angleDeg));
}

/** x(t) = x₀ + vₓ·t */
export function getX(params: ProjectileParams, t: number): number {
  return (params.x0 ?? 0) + getVx(params) * t;
}

/** y(t) = y₀ + vy₀·t − ½gt² */
export function getY(params: ProjectileParams, t: number): number {
  const g = params.g ?? 9.8;
  return (params.y0 ?? 0) + getVy0(params) * t - 0.5 * g * t * t;
}

/** Time of flight until y returns to y₀ */
export function getTimeOfFlight(params: ProjectileParams): number {
  const g = params.g ?? 9.8;
  const vy0 = getVy0(params);
  // 0 = vy0*t - ½g*t²  →  t = 2*vy0/g
  return (2 * vy0) / g;
}

/** Horizontal range (m) */
export function getRange(params: ProjectileParams): number {
  return getVx(params) * getTimeOfFlight(params);
}

/** Maximum height above launch point (m) */
export function getMaxHeight(params: ProjectileParams): number {
  const g = params.g ?? 9.8;
  const vy0 = getVy0(params);
  return (vy0 * vy0) / (2 * g);
}

/** Generate full trajectory until y ≤ y0 */
export function generateTrajectory(
  params: ProjectileParams,
  dt = 0.02
): ProjectilePoint[] {
  const g = params.g ?? 9.8;
  const y0 = params.y0 ?? 0;
  const vx = getVx(params);
  const vy0Init = getVy0(params);
  const points: ProjectilePoint[] = [];

  for (let t = 0; ; t += dt) {
    const y = getY(params, t);
    const vy = vy0Init - g * t;
    points.push({
      t: parseFloat(t.toFixed(4)),
      x: getX(params, t),
      y,
      vx,
      vy,
      speed: Math.sqrt(vx * vx + vy * vy),
    });
    if (y <= y0 && t > 0) break;
    if (t > 60) break; // safety cap
  }
  return points;
}

// ─── Mission: Clear the Wall ──────────────────────────────────────────────────

export interface WallMissionParams extends ProjectileParams {
  wallX: number;     // horizontal position of wall (m)
  wallHeight: number; // height of wall (m)
  targetX: number;   // target landing zone center (m)
  targetTolerance: number; // acceptable miss radius (m)
}

export interface MissionResult {
  clears: boolean;
  landingX: number;
  distanceFromTarget: number;
  isSuccess: boolean;
}

export function evaluateMission(params: WallMissionParams): MissionResult {
  // Time when projectile is at wallX
  const tWall = params.wallX / getVx(params);
  const heightAtWall = getY(params, tWall);
  const clears = heightAtWall >= params.wallHeight;

  const landingX = getRange(params) + (params.x0 ?? 0);
  const distanceFromTarget = Math.abs(landingX - params.targetX);

  return {
    clears,
    landingX,
    distanceFromTarget,
    isSuccess: clears && distanceFromTarget <= params.targetTolerance,
  };
}
