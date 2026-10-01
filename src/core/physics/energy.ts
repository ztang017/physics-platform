// ─── Work–Energy Ramp Engine ──────────────────────────────────────────────────
// A block is released from rest at the top of a smooth ramp, slides across a
// rough (frictional) patch, and meets a spring bumper. We follow it for ONE
// round trip: it ends either stopped on the patch, or back up the ramp at its
// turning point. Masses, heights and the spring constant are all adjustable.

export const G = 9.8;
export const RAMP_ANGLE_DEG = 30;
export const PATCH_LENGTH = 3; // metres of rough floor between ramp and spring

const RAMP_ANGLE = (RAMP_ANGLE_DEG * Math.PI) / 180;
const MAX_SIM_SECONDS = 120;

export interface EnergyRampParams {
  mass: number;   // kg
  height: number; // release height above the floor, m
  mu: number;     // kinetic friction coefficient of the rough patch
  k: number;      // spring constant, N/m
}

export type RampOutcome = 'stops-before-spring' | 'stops-after-rebound' | 'returns-up-ramp';

export interface EnergyRampResult {
  totalEnergy: number;              // mgh — everything the block starts with (J)
  frictionCostPerCrossing: number;  // μmg·d — what ONE pass over the patch costs (J)
  /** totalEnergy ÷ frictionCostPerCrossing — how many crossings the energy can pay for. */
  budgetRatio: number;
  outcome: RampOutcome;
  speedAtBottom: number;   // m/s, at the foot of the (smooth) ramp
  speedAtSpring: number;   // m/s on first reaching the spring (0 if it never does)
  maxCompression: number;  // m (0 if it never reaches the spring)
  /** Where it comes to rest on the patch, in metres from the ramp end (null if it doesn't). */
  stopPosition: number | null;
  returnHeight: number;    // height reached back up the ramp, m (0 unless it returns)
  heatDissipated: number;  // J turned into thermal energy over the whole trip
}

export function rampLength(height: number): number {
  return height / Math.sin(RAMP_ANGLE);
}

/**
 * Closed-form analysis by energy accounting. Friction is the only thing that
 * removes mechanical energy, and it removes exactly μmg·d every time the
 * block crosses the patch — so the outcome is decided by how many crossings
 * the starting energy can afford:
 *   ≤ 1 crossing  → stops before ever reaching the spring
 *   ≤ 2 crossings → reaches the spring, bounces back, and stops on the patch
 *   > 2 crossings → makes it back across and climbs the ramp again
 */
export function computeEnergyRamp(params: EnergyRampParams): EnergyRampResult {
  const { mass: m, height: h, mu, k } = params;
  const d = PATCH_LENGTH;

  const totalEnergy = m * G * h;
  const cost = mu * m * G * d;
  const budgetRatio = cost > 0 ? totalEnergy / cost : Infinity;
  const speedAtBottom = Math.sqrt(2 * G * h);

  if (budgetRatio <= 1) {
    return {
      totalEnergy,
      frictionCostPerCrossing: cost,
      budgetRatio,
      outcome: 'stops-before-spring',
      speedAtBottom,
      speedAtSpring: 0,
      maxCompression: 0,
      stopPosition: h / mu,
      returnHeight: 0,
      heatDissipated: totalEnergy,
    };
  }

  const energyAtSpring = totalEnergy - cost; // = mg(h − μd)
  const speedAtSpring = Math.sqrt((2 * energyAtSpring) / m);
  const maxCompression = Math.sqrt((2 * energyAtSpring) / k);

  if (budgetRatio <= 2) {
    return {
      totalEnergy,
      frictionCostPerCrossing: cost,
      budgetRatio,
      outcome: 'stops-after-rebound',
      speedAtBottom,
      speedAtSpring,
      maxCompression,
      stopPosition: d - energyAtSpring / (mu * m * G),
      returnHeight: 0,
      heatDissipated: totalEnergy,
    };
  }

  return {
    totalEnergy,
    frictionCostPerCrossing: cost,
    budgetRatio,
    outcome: 'returns-up-ramp',
    speedAtBottom,
    speedAtSpring,
    maxCompression,
    stopPosition: null,
    returnHeight: h - 2 * mu * d,
    heatDissipated: 2 * cost,
  };
}

// ─── Numerical timeline (drives the animation and the live energy bars) ──────

export type TrackRegion = 'ramp' | 'patch' | 'spring';

export interface EnergySample {
  t: number;      // s
  u: number;      // distance travelled along the path from the top of the ramp, m
  v: number;      // velocity along the path (+ = toward the spring), m/s
  y: number;      // height above the floor, m
  kinetic: number;
  gravitational: number;
  elastic: number;
  heat: number;   // cumulative work done against friction, J
  region: TrackRegion;
}

export interface EnergyTimeline {
  samples: EnergySample[];
  duration: number;
  endedOn: 'patch' | 'ramp';
}

export function generateEnergyTimeline(
  params: EnergyRampParams,
  dt = 0.0005,
  sampleEvery = 20,
): EnergyTimeline {
  const { mass: m, height: h, mu, k } = params;
  const L = rampLength(h);
  const patchEnd = L + PATCH_LENGTH;
  const downSlopeAccel = G * Math.sin(RAMP_ANGLE);

  let u = 0;
  let v = 0;
  let t = 0;
  let heat = 0;

  const snapshot = (): EnergySample => {
    const onRamp = u < L;
    const y = onRamp ? (L - u) * Math.sin(RAMP_ANGLE) : 0;
    const compression = Math.max(0, u - patchEnd);
    return {
      t,
      u,
      v,
      y,
      kinetic: 0.5 * m * v * v,
      gravitational: m * G * y,
      elastic: 0.5 * k * compression * compression,
      heat,
      region: onRamp ? 'ramp' : u <= patchEnd ? 'patch' : 'spring',
    };
  };

  const samples: EnergySample[] = [snapshot()];
  const maxSteps = Math.floor(MAX_SIM_SECONDS / dt);
  let endedOn: 'patch' | 'ramp' = 'ramp';

  for (let step = 1; step <= maxSteps; step++) {
    const vPrev = v;
    const onPatch = u >= L && u <= patchEnd;

    let a: number;
    if (u < L) a = downSlopeAccel;
    else if (onPatch) a = v === 0 ? 0 : -Math.sign(v) * mu * G;
    else a = (-k * (u - patchEnd)) / m;

    v += a * dt;

    // Friction only ever slows the block down — if it flipped the sign, the
    // block has actually come to rest on the patch.
    if (onPatch && vPrev !== 0 && Math.sign(v) !== Math.sign(vPrev)) {
      v = 0;
      t += dt;
      samples.push(snapshot());
      endedOn = 'patch';
      break;
    }

    u += v * dt;
    t += dt;
    if (u >= L && u <= patchEnd) heat += mu * m * G * Math.abs(v) * dt;

    // Back on the ramp and heading uphill, then turning round = the top of the trip.
    if (u < L && vPrev < 0 && v >= 0) {
      samples.push(snapshot());
      endedOn = 'ramp';
      break;
    }

    if (step % sampleEvery === 0) samples.push(snapshot());
  }

  return { samples, duration: samples[samples.length - 1].t, endedOn };
}

/** Linearly interpolated state at time `t` (clamped to the timeline's ends). */
export function sampleTimelineAt(timeline: EnergyTimeline, t: number): EnergySample {
  const { samples } = timeline;
  if (t <= 0) return samples[0];
  if (t >= timeline.duration) return samples[samples.length - 1];

  let lo = 0;
  let hi = samples.length - 1;
  while (hi - lo > 1) {
    const mid = (lo + hi) >> 1;
    if (samples[mid].t <= t) lo = mid;
    else hi = mid;
  }

  const a = samples[lo];
  const b = samples[hi];
  const f = b.t === a.t ? 0 : (t - a.t) / (b.t - a.t);
  const mix = (x: number, y: number) => x + (y - x) * f;
  return {
    t,
    u: mix(a.u, b.u),
    v: mix(a.v, b.v),
    y: mix(a.y, b.y),
    kinetic: mix(a.kinetic, b.kinetic),
    gravitational: mix(a.gravitational, b.gravitational),
    elastic: mix(a.elastic, b.elastic),
    heat: mix(a.heat, b.heat),
    region: f < 0.5 ? a.region : b.region,
  };
}
