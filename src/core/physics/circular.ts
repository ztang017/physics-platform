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
