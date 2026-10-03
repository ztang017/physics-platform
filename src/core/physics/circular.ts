// ─── Circular Motion Engine ───────────────────────────────────────────────────
// Phase 1 scene: a coin riding near the rim of a turntable that speeds up
// slowly. Static friction is the ONLY horizontal force on the coin, and it has
// to supply the centripetal force m·ω²·r. When that demand reaches the most
// friction can give, μ·m·g, the coin lets go.
//
// Idealisation (stated to the student): the coin sits right at the rim, so it
// leaves the table the moment it slips; from then on nothing pushes it
// sideways, so it travels in a straight line along the tangent. Everything is
// closed-form, so there is no integration error to explain away.

export const G = 9.8;

/** Seconds the turntable takes to spin up from rest to the coin's slip speed. */
export const SPIN_UP_TIME = 5;
/** How far (in radians of the slip speed) the coin is followed after release, so it stays in view. */
const TAIL_RADIANS = 2.2;
/** A guess within this fraction of the true slip speed counts as correct. */
export const RPM_TOLERANCE = 0.1;

// ─── Unit helpers ─────────────────────────────────────────────────────────────
export const rpmToRadPerSec = (rpm: number) => (rpm * 2 * Math.PI) / 60;
export const radPerSecToRpm = (omega: number) => (omega * 60) / (2 * Math.PI);

/** v = ωr — true for any point on a rotating body, at any moment. */
export const tangentialSpeed = (omega: number, radius: number) => omega * radius;
/** a = v²/r = ω²r, directed toward the centre. */
export const centripetalAcceleration = (omega: number, radius: number) => omega * omega * radius;
/** Constant-acceleration link: α = (ω_f − ω_i) / t. */
export const angularAcceleration = (omegaStart: number, omegaEnd: number, time: number) =>
  (omegaEnd - omegaStart) / time;

// ─── Slip condition ───────────────────────────────────────────────────────────
/** ω² r = μ g  →  ω = √(μg/r). Mass has cancelled. */
export const slipAngularSpeed = (radius: number, mu: number) => Math.sqrt((mu * G) / radius);
export const slipRpm = (radius: number, mu: number) => radPerSecToRpm(slipAngularSpeed(radius, mu));
/** The tutorial question run backwards: μ = ω² r / g from the speed at which the coin slipped. */
export const muFromSlip = (radius: number, rpm: number) => centripetalAcceleration(rpmToRadPerSec(rpm), radius) / G;

export interface TurntableParams {
  /** Distance of the coin from the axis (m). */
  radius: number;
  /** Coefficient of static friction between coin and turntable. */
  mu: number;
  /** Mass of the coin (kg). It never affects when the coin slips. */
  mass: number;
}

export interface TurntableResult {
  slipOmega: number;       // rad/s
  slipRpm: number;
  slipSpeed: number;       // m/s — the coin's speed at the moment it lets go
  slipAcceleration: number; // m/s² — centripetal acceleration then, equal to μg
  maxFriction: number;     // N — the most static friction can supply, μmg
}

export function computeTurntable({ radius, mu, mass }: TurntableParams): TurntableResult {
  const slipOmega = slipAngularSpeed(radius, mu);
  return {
    slipOmega,
    slipRpm: radPerSecToRpm(slipOmega),
    slipSpeed: tangentialSpeed(slipOmega, radius),
    slipAcceleration: centripetalAcceleration(slipOmega, radius),
    maxFriction: mu * mass * G,
  };
}

// ─── Prediction grading ───────────────────────────────────────────────────────
export interface RpmGrade {
  isCorrect: boolean;
  /** Signed: positive means the guess was too high. */
  errorPercent: number;
}

export function gradeRpmGuess(guess: number, actualRpm: number, tolerance = RPM_TOLERANCE): RpmGrade {
  const error = (guess - actualRpm) / actualRpm;
  return { isCorrect: Math.abs(error) <= tolerance, errorPercent: error * 100 };
}

// ─── Motion over time ─────────────────────────────────────────────────────────
// Viewed from above, turntable turning counter-clockwise, coin starting on the +x axis.
export interface TurntableState {
  t: number;
  /** Turntable's angular speed (rad/s). */
  omega: number;
  /** How far the turntable has turned (rad). */
  tableAngle: number;
  /** Coin position in the room's frame (m), origin at the axis. */
  x: number;
  y: number;
  vx: number;
  vy: number;
  speed: number;
  /** False while riding the turntable, true once it has let go. */
  flying: boolean;
  /** Static friction acting on the coin (N): exactly the m·ω²·r it needs to keep circling, until it lets go. Zero afterwards. */
  friction: number;
}

export function turntableAlpha(params: TurntableParams): number {
  return slipAngularSpeed(params.radius, params.mu) / SPIN_UP_TIME;
}

export function turntableDuration(params: TurntableParams): number {
  return SPIN_UP_TIME + TAIL_RADIANS / slipAngularSpeed(params.radius, params.mu);
}

export function turntableStateAt(params: TurntableParams, time: number): TurntableState {
  const { radius, mass } = params;
  const alpha = turntableAlpha(params);
  const slipOmega = slipAngularSpeed(radius, params.mu);
  const t = Math.max(0, Math.min(time, turntableDuration(params)));

  const omega = alpha * t;
  const tableAngle = 0.5 * alpha * t * t;

  if (t <= SPIN_UP_TIME) {
    const speed = omega * radius;
    const needed = mass * centripetalAcceleration(omega, radius);
    return {
      t,
      omega,
      tableAngle,
      x: radius * Math.cos(tableAngle),
      y: radius * Math.sin(tableAngle),
      vx: -speed * Math.sin(tableAngle),
      vy: speed * Math.cos(tableAngle),
      speed,
      flying: false,
      friction: needed,
    };
  }

  // Released: a straight line along the tangent at the slip point, at constant speed.
  const slipAngle = 0.5 * alpha * SPIN_UP_TIME * SPIN_UP_TIME;
  const slipSpeed = slipOmega * radius;
  const vx = -slipSpeed * Math.sin(slipAngle);
  const vy = slipSpeed * Math.cos(slipAngle);
  const flightTime = t - SPIN_UP_TIME;
  return {
    t,
    omega,
    tableAngle,
    x: radius * Math.cos(slipAngle) + vx * flightTime,
    y: radius * Math.sin(slipAngle) + vy * flightTime,
    vx,
    vy,
    speed: slipSpeed,
    flying: true,
    friction: 0,
  };
}

/** The coin's position as seen by someone riding on the turntable. */
export function toTurntableFrame(x: number, y: number, tableAngle: number): { x: number; y: number } {
  const c = Math.cos(tableAngle);
  const s = Math.sin(tableAngle);
  return { x: x * c + y * s, y: -x * s + y * c };
}

// ─── Speed-guess grading (phase 2 games) ──────────────────────────────────────
/** A speed within this fraction of the true value counts as correct in the games. */
export const SPEED_TOLERANCE = 0.05;

export function gradeSpeedGuess(guess: number, actual: number, tolerance = SPEED_TOLERANCE): RpmGrade {
  return gradeRpmGuess(guess, actual, tolerance);
}

// ─── Banked curve (Tutorial 5, Q6) ────────────────────────────────────────────
// A car on a banked bend, drawn in cross-section with the outside of the bend
// higher. The centripetal acceleration a = v²/R is horizontal and points toward
// the centre of the bend, which is partly DOWN the slope. All forces are per
// kilogram, so the car's mass never appears.
export interface BankedParams {
  /** Radius of the bend (m). */
  radius: number;
  /** Banking angle of the road (degrees). */
  angleDeg: number;
  /** Coefficient of static friction between the tyres and the road. */
  mu: number;
}

const rad = (deg: number) => (deg * Math.PI) / 180;

/** v0 = √(R g tanθ): the speed at which no friction is needed at all. */
export const designSpeed = (radius: number, angleDeg: number) => Math.sqrt(radius * G * Math.tan(rad(angleDeg)));

/** tanθ = v0²/(Rg): the banking angle a road needs for a given design speed. */
export const bankAngleFromDesignSpeed = (v0: number, radius: number) =>
  (Math.atan((v0 * v0) / (radius * G)) * 180) / Math.PI;

export interface BankedBand {
  designSpeed: number;
  /** Slowest speed at which the car does not slide down. Zero if friction alone can hold a parked car. */
  vMin: number;
  /** Fastest speed at which the car does not slide up and out. Infinity if friction can hold any speed. */
  vMax: number;
}

export function bankedBand({ radius, angleDeg, mu }: BankedParams): BankedBand {
  const t = Math.tan(rad(angleDeg));
  return {
    designSpeed: Math.sqrt(radius * G * t),
    vMin: t <= mu ? 0 : Math.sqrt((radius * G * (t - mu)) / (1 + mu * t)),
    vMax: mu * t >= 1 ? Infinity : Math.sqrt((radius * G * (t + mu)) / (1 - mu * t)),
  };
}

/** A little give (N/kg of friction) so a slider can land on the design speed of an icy road, where only one speed holds. */
export const HOLD_TOLERANCE = 0.05;

export type BankStatus = 'slides-down' | 'holds' | 'slides-up';

export interface BankedForces {
  /** Normal force per kg (N/kg): g cosθ + (v²/R) sinθ. */
  normal: number;
  /** Friction needed per kg, positive UP the slope: g sinθ − (v²/R) cosθ. */
  friction: number;
  /** The most friction available per kg: μ × normal. */
  maxFriction: number;
  /** Centripetal acceleration v²/R (m/s²). */
  centripetal: number;
  status: BankStatus;
}

export function bankedForcesAt({ radius, angleDeg, mu }: BankedParams, speed: number): BankedForces {
  const theta = rad(angleDeg);
  const centripetal = (speed * speed) / radius;
  const normal = G * Math.cos(theta) + centripetal * Math.sin(theta);
  const friction = G * Math.sin(theta) - centripetal * Math.cos(theta);
  const maxFriction = mu * normal;
  const slack = HOLD_TOLERANCE;
  const status: BankStatus =
    friction > maxFriction + slack ? 'slides-down' : friction < -maxFriction - slack ? 'slides-up' : 'holds';
  return { normal, friction, maxFriction, centripetal, status };
}

// ─── Bucket in a vertical circle (Tutorial 5, Q1) ─────────────────────────────
// φ is the angle round from the lowest point: 0° at the bottom, 90° level with
// the centre, 180° at the top. Energy conservation gives the speed at any φ.
export interface BucketParams {
  mass: number;
  radius: number;
  /** Speed at the lowest point (m/s). */
  bottomSpeed: number;
}

/** √(5gr): the slowest bottom speed that keeps the rope taut all the way round. */
export const minLoopBottomSpeed = (radius: number) => Math.sqrt(5 * G * radius);
/** √(gr): the slowest speed at the top that keeps the rope taut. */
export const minTopSpeed = (radius: number) => Math.sqrt(G * radius);

export type BucketOutcome = 'swings-back' | 'goes-slack' | 'completes';

export function bucketOutcome({ radius, bottomSpeed }: BucketParams): BucketOutcome {
  const v2 = bottomSpeed * bottomSpeed;
  if (v2 <= 2 * G * radius) return 'swings-back';
  if (v2 < 5 * G * radius) return 'goes-slack';
  return 'completes';
}

/** Where the rope goes slack (degrees from the bottom), or null if it never does. */
export function slackAngleDeg({ radius, bottomSpeed }: BucketParams): number | null {
  const v2 = bottomSpeed * bottomSpeed;
  if (v2 <= 2 * G * radius || v2 >= 5 * G * radius) return null;
  return (Math.acos((2 * G - v2 / radius) / (3 * G)) * 180) / Math.PI;
}

/** Where a bucket that swings back comes to rest for an instant, or null if it climbs higher than level. */
export function turnAroundAngleDeg({ radius, bottomSpeed }: BucketParams): number | null {
  const v2 = bottomSpeed * bottomSpeed;
  if (v2 > 2 * G * radius) return null;
  return (Math.acos(1 - v2 / (2 * G * radius)) * 180) / Math.PI;
}

/** The furthest round the bucket gets while the rope stays taut (degrees). */
export function maxAngleDeg(params: BucketParams): number {
  switch (bucketOutcome(params)) {
    case 'completes': return 180;
    case 'goes-slack': return slackAngleDeg(params)!;
    case 'swings-back': return turnAroundAngleDeg(params)!;
  }
}

export interface BucketState {
  speed: number;
  /** Rope tension: m v²/r + m g cos φ. Negative would mean the rope pushing, which it cannot, so the rope is slack there. */
  tension: number;
  /** Component of the net force along the path (negative = slowing the bucket down): −m g sin φ. */
  tangentialForce: number;
  /** Net force toward the centre, which must equal m v²/r. */
  radialForce: number;
  /** Height above the lowest point (m). */
  height: number;
}

export function bucketAt({ mass, radius, bottomSpeed }: BucketParams, phiDeg: number): BucketState {
  const phi = rad(phiDeg);
  const height = radius * (1 - Math.cos(phi));
  const v2 = Math.max(0, bottomSpeed * bottomSpeed - 2 * G * height);
  return {
    speed: Math.sqrt(v2),
    tension: (mass * v2) / radius + mass * G * Math.cos(phi),
    tangentialForce: -mass * G * Math.sin(phi),
    radialForce: (mass * v2) / radius,
    height,
  };
}
