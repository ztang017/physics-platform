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

// ─── Phase 2: banked curve ────────────────────────────────────────────────────
import {
  bankAngleFromDesignSpeed,
  bankedBand,
  bankedForcesAt,
  bucketAt,
  bucketOutcome,
  designSpeed,
  gradeSpeedGuess,
  maxAngleDeg,
  minLoopBottomSpeed,
  minTopSpeed,
  slackAngleDeg,
  turnAroundAngleDeg,
  type BankedParams,
  type BucketParams,
} from './circular';

describe('banked curve (Tutorial 5, Q6)', () => {
  const ROAD: BankedParams = { radius: 60, angleDeg: 20, mu: 0.2 };

  it('needs no friction at the design speed v0 = √(Rg tanθ)', () => {
    const v0 = designSpeed(60, 20);
    expect(v0).toBeCloseTo(14.63, 2);
    const f = bankedForcesAt({ ...ROAD, mu: 0 }, v0);
    expect(f.friction).toBeCloseTo(0, 9);
    expect(f.status).toBe('holds');
  });

  it('shrinks the safe band to the single design speed on ice', () => {
    const band = bankedBand({ ...ROAD, mu: 0 });
    expect(band.vMin).toBeCloseTo(band.designSpeed, 9);
    expect(band.vMax).toBeCloseTo(band.designSpeed, 9);
  });

  it('gives the worked-example band (9.48 to 18.9 m/s) around the design speed', () => {
    const band = bankedBand(ROAD);
    expect(band.vMin).toBeCloseTo(9.48, 2);
    expect(band.vMax).toBeCloseTo(18.91, 2);
    expect(band.vMin).toBeLessThan(band.designSpeed);
    expect(band.vMax).toBeGreaterThan(band.designSpeed);
  });

  it('puts friction exactly at its limit at both ends of the band, pointing opposite ways', () => {
    const { vMin, vMax } = bankedBand(ROAD);
    const low = bankedForcesAt(ROAD, vMin);
    const high = bankedForcesAt(ROAD, vMax);
    expect(low.friction).toBeCloseTo(low.maxFriction, 9);    // up the slope: stopping a slide down
    expect(high.friction).toBeCloseTo(-high.maxFriction, 9); // down the slope: stopping a slide up
    expect(low.status).toBe('holds');
    expect(high.status).toBe('holds');
  });

  it('classifies speeds outside the band', () => {
    const { vMin, vMax } = bankedBand(ROAD);
    expect(bankedForcesAt(ROAD, vMin * 0.95).status).toBe('slides-down');
    expect(bankedForcesAt(ROAD, vMax * 1.05).status).toBe('slides-up');
    expect(bankedForcesAt(ROAD, (vMin + vMax) / 2).status).toBe('holds');
  });

  it('widens the band as friction grows', () => {
    const rough = bankedBand({ ...ROAD, mu: 0.4 });
    const smooth = bankedBand({ ...ROAD, mu: 0.1 });
    expect(rough.vMin).toBeLessThan(smooth.vMin);
    expect(rough.vMax).toBeGreaterThan(smooth.vMax);
  });

  it('lets a car stay parked when friction alone beats the slope (μ ≥ tanθ)', () => {
    expect(bankedBand({ radius: 60, angleDeg: 10, mu: 0.3 }).vMin).toBe(0);
    expect(bankedForcesAt({ radius: 60, angleDeg: 10, mu: 0.3 }, 0).status).toBe('holds');
  });

  it('has no upper limit when μ tanθ ≥ 1', () => {
    expect(bankedBand({ radius: 60, angleDeg: 45, mu: 1.2 }).vMax).toBe(Infinity);
  });

  it('matches the form in terms of v0 (tanθ = v0²/Rg), as the tutorial asks', () => {
    const R = 40, v0 = 12, mu = 0.2;
    const angle = bankAngleFromDesignSpeed(v0, R);
    expect(designSpeed(R, angle)).toBeCloseTo(v0, 9);
    const band = bankedBand({ radius: R, angleDeg: angle, mu });
    const vMinV0 = Math.sqrt((R * G * (v0 * v0 - mu * R * G)) / (R * G + mu * v0 * v0));
    const vMaxV0 = Math.sqrt((R * G * (v0 * v0 + mu * R * G)) / (R * G - mu * v0 * v0));
    expect(band.vMin).toBeCloseTo(vMinV0, 9);
    expect(band.vMax).toBeCloseTo(vMaxV0, 9);
    expect(band.vMin).toBeCloseTo(7.82, 2);
    expect(band.vMax).toBeCloseTo(15.49, 2);
  });

  it('lets a slider land on the design speed of an icy road, but still catches clearly wrong speeds', () => {
    const ice: BankedParams = { radius: 50, angleDeg: 15, mu: 0 };
    const v0 = designSpeed(50, 15);
    expect(bankedForcesAt(ice, Math.round(v0 * 10) / 10).status).toBe('holds'); // nearest 0.1 m/s
    expect(bankedForcesAt(ice, v0 * 0.95).status).toBe('slides-down');
    expect(bankedForcesAt(ice, v0 * 1.05).status).toBe('slides-up');
  });

  it('makes the normal force grow with speed', () => {
    expect(bankedForcesAt(ROAD, 15).normal).toBeGreaterThan(bankedForcesAt(ROAD, 5).normal);
  });

  it('grades a speed guess within ±5%', () => {
    expect(gradeSpeedGuess(9.7, 9.48).isCorrect).toBe(true);
    expect(gradeSpeedGuess(10.2, 9.48).isCorrect).toBe(false);
  });
});

// ─── Phase 2: bucket in a vertical circle ─────────────────────────────────────
describe('bucket in a vertical circle (Tutorial 5, Q1)', () => {
  const base = { mass: 1.5, radius: 0.8 };
  const at = (bottomSpeed: number): BucketParams => ({ ...base, bottomSpeed });

  it('has the tension at the bottom equal to mg + mv²/r', () => {
    const s = bucketAt(at(4), 0);
    expect(s.tension).toBeCloseTo(1.5 * G + (1.5 * 16) / 0.8, 9);
    expect(s.tension).toBeCloseTo(44.7, 1);
  });

  it('has the tension at the top equal to mv²/r − mg', () => {
    const top = bucketAt(at(7), 180);
    expect(top.speed ** 2).toBeCloseTo(49 - 4 * G * 0.8, 9);
    expect(top.tension).toBeCloseTo((1.5 * top.speed ** 2) / 0.8 - 1.5 * G, 9);
  });

  it('matches the closed form T(φ) = mv0²/r − 2mg + 3mg cos φ at every angle', () => {
    const p = at(7);
    for (let phi = 0; phi <= 180; phi += 15) {
      const closed = (1.5 * 49) / 0.8 - 2 * 1.5 * G + 3 * 1.5 * G * Math.cos((phi * Math.PI) / 180);
      expect(bucketAt(p, phi).tension).toBeCloseTo(closed, 9);
    }
  });

  it('has the bottom tension exceed the top tension by exactly 6mg, at any speed', () => {
    for (const v of [6.3, 7, 9]) {
      expect(bucketAt(at(v), 0).tension - bucketAt(at(v), 180).tension).toBeCloseTo(6 * 1.5 * G, 9);
    }
  });

  it('has the radial force equal m v²/r and equal to T − mg cos φ', () => {
    const p = at(7);
    for (const phi of [0, 40, 90, 140]) {
      const s = bucketAt(p, phi);
      expect(s.radialForce).toBeCloseTo((1.5 * s.speed ** 2) / 0.8, 9);
      expect(s.tension - 1.5 * G * Math.cos((phi * Math.PI) / 180)).toBeCloseTo(s.radialForce, 9);
    }
  });

  it('has the tangential force slow the bucket on the way up, and vanish at the bottom and top', () => {
    const p = at(7);
    expect(bucketAt(p, 0).tangentialForce).toBeCloseTo(0, 9);
    expect(bucketAt(p, 90).tangentialForce).toBeCloseTo(-1.5 * G, 9);
    expect(bucketAt(p, 180).tangentialForce).toBeCloseTo(0, 9);
  });

  it('finds the slowest loop speeds: √(5gr) at the bottom, √(gr) at the top', () => {
    expect(minLoopBottomSpeed(0.8)).toBeCloseTo(6.26, 2);
    expect(minTopSpeed(0.8)).toBeCloseTo(2.8, 2);
    const atMin = bucketAt(at(minLoopBottomSpeed(0.8)), 180);
    expect(atMin.speed).toBeCloseTo(minTopSpeed(0.8), 9);
    expect(atMin.tension).toBeCloseTo(0, 9);
  });

  it('classifies the three outcomes by the bottom speed', () => {
    expect(bucketOutcome(at(3))).toBe('swings-back');   // below √(2gr) ≈ 3.96
    expect(bucketOutcome(at(5))).toBe('goes-slack');    // between 3.96 and 6.26
    expect(bucketOutcome(at(6.5))).toBe('completes');
    expect(bucketOutcome(at(minLoopBottomSpeed(0.8)))).toBe('completes');
  });

  it('puts the slack point where the tension reaches zero, above the level of the centre', () => {
    const p = at(5);
    const phi = slackAngleDeg(p)!;
    expect(phi).toBeGreaterThan(90);
    expect(phi).toBeLessThan(180);
    expect(bucketAt(p, phi).tension).toBeCloseTo(0, 6);
    expect(bucketAt(p, phi - 5).tension).toBeGreaterThan(0);
    expect(slackAngleDeg(at(3))).toBeNull();
    expect(slackAngleDeg(at(6.5))).toBeNull();
  });

  it('puts the turn-around point below level and keeps the tension positive on the way', () => {
    const p = at(3);
    const phi = turnAroundAngleDeg(p)!;
    expect(phi).toBeLessThan(90);
    expect(bucketAt(p, phi).speed).toBeCloseTo(0, 6);
    for (let a = 0; a <= phi; a += 5) expect(bucketAt(p, a).tension).toBeGreaterThan(0);
    expect(turnAroundAngleDeg(at(5))).toBeNull();
  });

  it('reports how far round the bucket gets in every case', () => {
    expect(maxAngleDeg(at(3))).toBeCloseTo(turnAroundAngleDeg(at(3))!, 9);
    expect(maxAngleDeg(at(5))).toBeCloseTo(slackAngleDeg(at(5))!, 9);
    expect(maxAngleDeg(at(7))).toBe(180);
  });

  it('is mass-independent for the speed', () => {
    expect(bucketAt({ mass: 1, radius: 0.8, bottomSpeed: 7 }, 120).speed)
      .toBeCloseTo(bucketAt({ mass: 9, radius: 0.8, bottomSpeed: 7 }, 120).speed, 12);
  });
});

// ─── Animation physics: the car that cannot hold the bend, and the swinging bucket ──
import {
  bankedSlideAcceleration,
  bucketSampleAt,
  generateBucketTimeline,
} from './circular';

describe('bankedSlideAcceleration', () => {
  const road: BankedParams = { radius: 60, angleDeg: 20, mu: 0.2 };

  it('is zero anywhere inside the safe band', () => {
    const { vMin, vMax } = bankedBand(road);
    expect(bankedSlideAcceleration(road, (vMin + vMax) / 2)).toBe(0);
    expect(bankedSlideAcceleration(road, designSpeed(60, 20))).toBe(0);
  });

  it('slides the car DOWN the slope (negative) when it is too slow, more so the slower it goes', () => {
    const { vMin } = bankedBand(road);
    const slow = bankedSlideAcceleration(road, vMin * 0.8);
    const slower = bankedSlideAcceleration(road, vMin * 0.5);
    expect(slow).toBeLessThan(0);
    expect(slower).toBeLessThan(slow);
  });

  it('slides the car UP the slope (positive) when it is too fast, more so the faster it goes', () => {
    const { vMax } = bankedBand(road);
    const fast = bankedSlideAcceleration(road, vMax * 1.1);
    const faster = bankedSlideAcceleration(road, vMax * 1.4);
    expect(fast).toBeGreaterThan(0);
    expect(faster).toBeGreaterThan(fast);
  });

  it('starts from zero right at the edge of the band', () => {
    const { vMin, vMax } = bankedBand(road);
    expect(Math.abs(bankedSlideAcceleration(road, vMin * 0.999))).toBeLessThan(0.1);
    expect(Math.abs(bankedSlideAcceleration(road, vMax * 1.001))).toBeLessThan(0.1);
  });
});

describe('generateBucketTimeline', () => {
  const m = 1.5, r = 0.8;
  const run = (bottomSpeed: number, duration = 6) => generateBucketTimeline({ mass: m, radius: r, bottomSpeed }, duration);
  const energyPerKg = (s: { x: number; y: number; speed: number }) => 0.5 * s.speed ** 2 + G * s.y;

  it('starts at the bottom of the circle, moving at the chosen speed', () => {
    const first = run(5)[0];
    expect(first.x).toBeCloseTo(0, 9);
    expect(first.y).toBeCloseTo(-r, 9);
    expect(first.speed).toBeCloseTo(5, 6);
    expect(first.tension).toBeCloseTo(1.5 * G + (1.5 * 25) / 0.8, 3);
  });

  it('keeps the bucket exactly one rope-length from the pivot while the rope is taut', () => {
    for (const s of run(7).filter((p) => p.onRope)) expect(Math.hypot(s.x, s.y)).toBeCloseTo(r, 6);
  });

  it('conserves energy along the rope (within 1%)', () => {
    const samples = run(7);
    const e0 = energyPerKg(samples[0]);
    for (const s of samples.filter((p) => p.onRope)) expect(Math.abs(energyPerKg(s) - e0) / Math.abs(e0)).toBeLessThan(0.01);
  });

  it('goes right round the circle, again and again, when the speed beats √(5gr)', () => {
    const samples = run(minLoopBottomSpeed(r) + 0.5);
    expect(samples.every((s) => s.onRope)).toBe(true);
    expect(Math.max(...samples.map((s) => s.y))).toBeGreaterThan(r * 0.99); // it reaches the top
    const lowest = Math.min(...samples.map((s) => s.tension));
    expect(lowest).toBeGreaterThan(0); // rope never goes slack
  });

  it('swings back without leaving the rope when the speed is below √(2gr)', () => {
    const v = 3;
    const samples = run(v);
    expect(samples.every((s) => s.onRope)).toBe(true);
    expect(Math.max(...samples.map((s) => s.y))).toBeLessThan(0.02); // never rises above the pivot
    // the highest it gets matches the closed-form turn-around angle
    const phiMax = turnAroundAngleDeg({ mass: m, radius: r, bottomSpeed: v })!;
    const yTop = -r * Math.cos((phiMax * Math.PI) / 180);
    expect(Math.max(...samples.map((s) => s.y))).toBeCloseTo(yTop, 1);
  });

  it('lets go of the rope at the closed-form slack angle when the speed is in between', () => {
    const params: BucketParams = { mass: m, radius: r, bottomSpeed: 5 };
    const samples = generateBucketTimeline(params, 4);
    const firstFree = samples.findIndex((s) => !s.onRope);
    expect(firstFree).toBeGreaterThan(0);
    const phi = samples[firstFree - 1].phiDeg;
    expect(phi).toBeCloseTo(slackAngleDeg(params)!, 0);
  });

  it('becomes a projectile after the rope goes slack: energy is still conserved and it falls', () => {
    const samples = run(5, 4);
    const free = samples.filter((s) => !s.onRope);
    expect(free.length).toBeGreaterThan(20);
    const e = energyPerKg(free[0]);
    for (const s of free) expect(Math.abs(energyPerKg(s) - e) / Math.abs(e)).toBeLessThan(0.02);
    expect(free[free.length - 1].y).toBeLessThan(free[0].y); // it ends up lower than where it let go
  });

  it('is independent of the mass in its motion', () => {
    const a = generateBucketTimeline({ mass: 1, radius: r, bottomSpeed: 7 }, 1);
    const b = generateBucketTimeline({ mass: 9, radius: r, bottomSpeed: 7 }, 1);
    expect(a[30].x).toBeCloseTo(b[30].x, 9);
    expect(a[30].y).toBeCloseTo(b[30].y, 9);
  });

  it('loops cleanly when asked for a time beyond the end', () => {
    const samples = run(7, 2);
    expect(bucketSampleAt(samples, 0).t).toBe(0);
    expect(bucketSampleAt(samples, 2 + 0.5).t).toBeCloseTo(bucketSampleAt(samples, 0.5).t, 1);
  });
});
