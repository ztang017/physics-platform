import { describe, it, expect } from 'vitest';
import {
  G,
  SPIN_UP_TIME,
  angularAcceleration,
  centripetalAcceleration,
  computeTurntable,
  gradeRpmGuess,
  muFromSlip,
  radPerSecToRpm,
  rpmToRadPerSec,
  slipAngularSpeed,
  slipRpm,
  tangentialSpeed,
  toTurntableFrame,
  turntableDuration,
  turntableStateAt,
  type TurntableParams,
} from './circular';

const COIN: TurntableParams = { radius: 0.12, mu: 0.4, mass: 0.005 };

describe('unit helpers (CY1308 Tutorial 5, Q3 numbers)', () => {
  it('converts the blender\'s 650 rpm to 68.1 rad/s', () => {
    expect(rpmToRadPerSec(650)).toBeCloseTo(68.07, 2);
  });

  it('round-trips rpm and rad/s', () => {
    expect(radPerSecToRpm(rpmToRadPerSec(35))).toBeCloseTo(35, 10);
  });

  it('gives the blade tip speed and centripetal acceleration (3.74 m/s, 255 m/s²)', () => {
    const omega = rpmToRadPerSec(650);
    expect(tangentialSpeed(omega, 0.055)).toBeCloseTo(3.74, 2);
    expect(centripetalAcceleration(omega, 0.055)).toBeCloseTo(254.8, 0);
  });

  it('gives the blender\'s slowing angular acceleration (−17.0 rad/s²)', () => {
    expect(angularAcceleration(rpmToRadPerSec(650), 0, 4)).toBeCloseTo(-17.0, 1);
  });
});

describe('slip condition (Tutorial 5, Q4: coin on a turntable)', () => {
  it('finds μ ≈ 0.164 for a coin at 12.0 cm that slips at 35.0 rpm', () => {
    expect(muFromSlip(0.12, 35)).toBeCloseTo(0.1645, 3);
  });

  it('runs back the other way: that μ slips at 35 rpm', () => {
    expect(slipRpm(0.12, muFromSlip(0.12, 35))).toBeCloseTo(35, 6);
  });

  it('satisfies ω²r = μg at the slip speed', () => {
    const omega = slipAngularSpeed(0.2, 0.7);
    expect(omega * omega * 0.2).toBeCloseTo(0.7 * G, 10);
  });

  it('slips sooner when the coin is further out, and later on a rougher surface', () => {
    expect(slipRpm(0.2, 0.4)).toBeLessThan(slipRpm(0.1, 0.4));
    expect(slipRpm(0.1, 0.8)).toBeGreaterThan(slipRpm(0.1, 0.4));
  });

  it('scales as 1/√r and √μ', () => {
    expect(slipRpm(0.4, 0.4)).toBeCloseTo(slipRpm(0.1, 0.4) / 2, 8);
    expect(slipRpm(0.1, 1.6)).toBeCloseTo(slipRpm(0.1, 0.4) * 2, 8);
  });

  it('does not depend on the coin\'s mass', () => {
    const light = computeTurntable({ ...COIN, mass: 0.002 });
    const heavy = computeTurntable({ ...COIN, mass: 0.02 });
    expect(light.slipRpm).toBeCloseTo(heavy.slipRpm, 10);
    expect(heavy.maxFriction).toBeCloseTo(10 * light.maxFriction, 10);
  });

  it('reports the speed and acceleration at the moment of release', () => {
    const r = computeTurntable(COIN);
    expect(r.slipSpeed).toBeCloseTo(Math.sqrt(COIN.mu * G * COIN.radius), 10);
    expect(r.slipAcceleration).toBeCloseTo(COIN.mu * G, 10);
  });
});

describe('gradeRpmGuess', () => {
  it('accepts a guess inside the tolerance and reports the signed error', () => {
    const g = gradeRpmGuess(58, 55);
    expect(g.isCorrect).toBe(true);
    expect(g.errorPercent).toBeCloseTo(5.45, 1);
  });

  it('rejects a guess outside the tolerance, in either direction', () => {
    expect(gradeRpmGuess(70, 55).isCorrect).toBe(false);
    expect(gradeRpmGuess(40, 55).isCorrect).toBe(false);
    expect(gradeRpmGuess(40, 55).errorPercent).toBeLessThan(0);
  });
});

describe('turntableStateAt', () => {
  const slipOmega = slipAngularSpeed(COIN.radius, COIN.mu);

  it('starts at rest on the +x axis', () => {
    const s = turntableStateAt(COIN, 0);
    expect(s.omega).toBe(0);
    expect(s.x).toBeCloseTo(COIN.radius, 10);
    expect(s.y).toBeCloseTo(0, 10);
    expect(s.flying).toBe(false);
    expect(s.friction).toBe(0);
  });

  it('keeps the coin on a circle of constant radius while it rides', () => {
    for (let t = 0; t <= SPIN_UP_TIME; t += 0.25) {
      const s = turntableStateAt(COIN, t);
      expect(Math.hypot(s.x, s.y)).toBeCloseTo(COIN.radius, 10);
    }
  });

  it('has the friction it needs equal m·ω²·r, always below the limit until the end', () => {
    const limit = computeTurntable(COIN).maxFriction;
    for (let t = 0.5; t < SPIN_UP_TIME; t += 0.5) {
      const s = turntableStateAt(COIN, t);
      expect(s.friction).toBeCloseTo(COIN.mass * s.omega * s.omega * COIN.radius, 12);
      expect(s.friction).toBeLessThan(limit);
    }
  });

  it('reaches exactly the friction limit at the slip moment', () => {
    const s = turntableStateAt(COIN, SPIN_UP_TIME);
    expect(s.omega).toBeCloseTo(slipOmega, 10);
    expect(s.friction).toBeCloseTo(computeTurntable(COIN).maxFriction, 12);
    expect(s.flying).toBe(false);
  });

  it('points the velocity along the tangent while riding (perpendicular to the radius)', () => {
    const s = turntableStateAt(COIN, 3);
    expect(s.x * s.vx + s.y * s.vy).toBeCloseTo(0, 10);
    expect(Math.hypot(s.vx, s.vy)).toBeCloseTo(s.omega * COIN.radius, 10);
  });

  it('lets go along the TANGENT, not the radius, and then keeps a constant velocity', () => {
    const atSlip = turntableStateAt(COIN, SPIN_UP_TIME);
    const later = turntableStateAt(COIN, SPIN_UP_TIME + 0.3);
    expect(later.flying).toBe(true);
    // The displacement since release is parallel to the velocity at release...
    const dx = later.x - atSlip.x;
    const dy = later.y - atSlip.y;
    expect(dx * atSlip.vy - dy * atSlip.vx).toBeCloseTo(0, 10);
    // ...and perpendicular to the radius at the slip point (no outward component at all).
    expect(dx * atSlip.x + dy * atSlip.y).toBeCloseTo(0, 10);
    expect(later.vx).toBeCloseTo(atSlip.vx, 12);
    expect(later.vy).toBeCloseTo(atSlip.vy, 12);
  });

  it('is continuous in position and speed across the release', () => {
    const before = turntableStateAt(COIN, SPIN_UP_TIME - 1e-6);
    const after = turntableStateAt(COIN, SPIN_UP_TIME + 1e-6);
    expect(after.x).toBeCloseTo(before.x, 4);
    expect(after.y).toBeCloseTo(before.y, 4);
    expect(after.speed).toBeCloseTo(before.speed, 4);
  });

  it('has no friction acting once the coin has left', () => {
    expect(turntableStateAt(COIN, SPIN_UP_TIME + 0.1).friction).toBe(0);
  });

  it('moves away from the axis along a straight line: distance = r√(1 + (ω s)²)', () => {
    const s = 0.2;
    const flying = turntableStateAt(COIN, SPIN_UP_TIME + s);
    expect(Math.hypot(flying.x, flying.y)).toBeCloseTo(COIN.radius * Math.sqrt(1 + (slipOmega * s) ** 2), 10);
  });

  it('clamps times outside the run', () => {
    expect(turntableStateAt(COIN, -3).t).toBe(0);
    expect(turntableStateAt(COIN, 1e6).t).toBeCloseTo(turntableDuration(COIN), 10);
  });

  it('is mass-independent: the coin moves identically for any mass', () => {
    const a = turntableStateAt({ ...COIN, mass: 0.002 }, 4.2);
    const b = turntableStateAt({ ...COIN, mass: 0.02 }, 4.2);
    expect(a.x).toBeCloseTo(b.x, 12);
    expect(a.y).toBeCloseTo(b.y, 12);
  });
});

describe('toTurntableFrame (what a rider on the turntable sees)', () => {
  it('sees a riding coin stand still', () => {
    for (let t = 0; t <= SPIN_UP_TIME; t += 0.5) {
      const s = turntableStateAt(COIN, t);
      const rel = toTurntableFrame(s.x, s.y, s.tableAngle);
      expect(rel.x).toBeCloseTo(COIN.radius, 10);
      expect(rel.y).toBeCloseTo(0, 10);
    }
  });

  it('sees the released coin drift outward, away from the axis, and backwards against the spin', () => {
    const end = turntableStateAt(COIN, turntableDuration(COIN));
    const rel = toTurntableFrame(end.x, end.y, end.tableAngle);
    expect(Math.hypot(rel.x, rel.y)).toBeGreaterThan(COIN.radius * 2);
    // Moving along +y would be "with the spin"; the turntable runs ahead of the coin, so it falls behind.
    expect(rel.y).toBeLessThan(0);
  });
});
