import { describe, it, expect } from 'vitest';
import {
  computeEnergyRamp,
  generateEnergyTimeline,
  sampleTimelineAt,
  rampLength,
  G,
  PATCH_LENGTH,
  type EnergyRampParams,
} from './energy';

const STOPS_BEFORE: EnergyRampParams = { mass: 1, height: 1, mu: 0.6, k: 100 };
const STOPS_AFTER: EnergyRampParams = { mass: 2, height: 2, mu: 0.5, k: 100 };
const RETURNS: EnergyRampParams = { mass: 1, height: 3, mu: 0.1, k: 100 };
const FRICTIONLESS: EnergyRampParams = { mass: 1, height: 2, mu: 0, k: 100 };

describe('computeEnergyRamp (closed-form energy accounting)', () => {
  it('stops before the spring when the energy cannot pay for one crossing', () => {
    const r = computeEnergyRamp(STOPS_BEFORE);
    expect(r.outcome).toBe('stops-before-spring');
    expect(r.stopPosition).toBeCloseTo(1 / 0.6, 6); // μmg·s = mgh  →  s = h/μ
    expect(r.maxCompression).toBe(0);
    expect(r.heatDissipated).toBeCloseTo(r.totalEnergy, 6);
  });

  it('bounces off the spring and stops on the patch between one and two crossings', () => {
    const r = computeEnergyRamp(STOPS_AFTER);
    expect(r.outcome).toBe('stops-after-rebound');
    // E0 = 39.2 J, one crossing costs 29.4 J → 9.8 J left at the spring
    expect(r.speedAtSpring).toBeCloseTo(Math.sqrt(9.8), 6);
    expect(r.maxCompression).toBeCloseTo(Math.sqrt((2 * 9.8) / 100), 6);
    expect(r.stopPosition).toBeCloseTo(PATCH_LENGTH - 1, 6);
    expect(r.heatDissipated).toBeCloseTo(r.totalEnergy, 6);
  });

  it('climbs the ramp again when the energy affords more than two crossings', () => {
    const r = computeEnergyRamp(RETURNS);
    expect(r.outcome).toBe('returns-up-ramp');
    expect(r.returnHeight).toBeCloseTo(3 - 2 * 0.1 * PATCH_LENGTH, 6);
    expect(r.heatDissipated).toBeCloseTo(2 * r.frictionCostPerCrossing, 6);
    expect(r.stopPosition).toBeNull();
  });

  it('returns to the release height when there is no friction', () => {
    const r = computeEnergyRamp(FRICTIONLESS);
    expect(r.outcome).toBe('returns-up-ramp');
    expect(r.returnHeight).toBeCloseTo(2, 6);
    expect(r.heatDissipated).toBe(0);
    expect(r.budgetRatio).toBe(Infinity);
  });

  it('gives the speed at the foot of the ramp as √(2gh), independent of mass', () => {
    const light = computeEnergyRamp({ ...RETURNS, mass: 1 });
    const heavy = computeEnergyRamp({ ...RETURNS, mass: 5 });
    expect(light.speedAtBottom).toBeCloseTo(Math.sqrt(2 * G * 3), 6);
    expect(heavy.speedAtBottom).toBeCloseTo(light.speedAtBottom, 6);
  });

  it('does not let mass change the outcome (it cancels from mgh = μmgd)', () => {
    for (const mass of [1, 2, 5]) {
      expect(computeEnergyRamp({ ...STOPS_AFTER, mass }).outcome).toBe('stops-after-rebound');
      expect(computeEnergyRamp({ ...STOPS_BEFORE, mass }).outcome).toBe('stops-before-spring');
    }
  });

  it('treats exactly-affordable budgets as the earlier outcome', () => {
    // E0 = mgh, cost = μmgd → ratio exactly 1 when h = μd
    const r = computeEnergyRamp({ mass: 1, height: 1.5, mu: 0.5, k: 100 });
    expect(r.budgetRatio).toBeCloseTo(1, 9);
    expect(r.outcome).toBe('stops-before-spring');
  });
});

describe('generateEnergyTimeline (numerical integration)', () => {
  const scenarios: [string, EnergyRampParams][] = [
    ['stops before the spring', STOPS_BEFORE],
    ['stops after rebound', STOPS_AFTER],
    ['returns up the ramp', RETURNS],
    ['frictionless', FRICTIONLESS],
  ];

  it.each(scenarios)('conserves total energy throughout — %s', (_name, params) => {
    const { samples } = generateEnergyTimeline(params);
    const e0 = params.mass * G * params.height;
    for (const s of samples) {
      const total = s.kinetic + s.gravitational + s.elastic + s.heat;
      expect(Math.abs(total - e0) / e0).toBeLessThan(0.015);
    }
  });

  it('starts at rest at the release height', () => {
    const { samples } = generateEnergyTimeline(RETURNS);
    expect(samples[0].v).toBe(0);
    expect(samples[0].y).toBeCloseTo(3, 6);
    expect(samples[0].gravitational).toBeCloseTo(RETURNS.mass * G * 3, 6);
  });

  it('reaches √(2gh) at the foot of the ramp', () => {
    const { samples } = generateEnergyTimeline(RETURNS);
    const L = rampLength(RETURNS.height);
    const firstAtFoot = samples.find((s) => s.u >= L)!;
    expect(firstAtFoot.v).toBeGreaterThan(0);
    expect(firstAtFoot.v).toBeCloseTo(Math.sqrt(2 * G * RETURNS.height), 1);
  });

  it('stops on the patch where the analysis says it should (no spring contact)', () => {
    const tl = generateEnergyTimeline(STOPS_BEFORE);
    const last = tl.samples[tl.samples.length - 1];
    expect(tl.endedOn).toBe('patch');
    expect(last.u - rampLength(STOPS_BEFORE.height)).toBeCloseTo(computeEnergyRamp(STOPS_BEFORE).stopPosition!, 1);
    expect(Math.max(...tl.samples.map((s) => s.elastic))).toBe(0);
  });

  it('compresses the spring by the predicted amount, then stops on the patch', () => {
    const tl = generateEnergyTimeline(STOPS_AFTER);
    const expected = computeEnergyRamp(STOPS_AFTER);
    const last = tl.samples[tl.samples.length - 1];
    expect(tl.endedOn).toBe('patch');

    const maxElastic = Math.max(...tl.samples.map((s) => s.elastic));
    expect(maxElastic).toBeCloseTo(0.5 * STOPS_AFTER.k * expected.maxCompression ** 2, 0);
    expect(last.u - rampLength(STOPS_AFTER.height)).toBeCloseTo(expected.stopPosition!, 1);
  });

  it('ends at the predicted height back on the ramp and with the predicted heat', () => {
    const tl = generateEnergyTimeline(RETURNS);
    const expected = computeEnergyRamp(RETURNS);
    const last = tl.samples[tl.samples.length - 1];
    expect(tl.endedOn).toBe('ramp');
    expect(last.y).toBeCloseTo(expected.returnHeight, 1);
    expect(last.heat).toBeCloseTo(expected.heatDissipated, 0);
  });

  it('never produces heat without friction', () => {
    const tl = generateEnergyTimeline(FRICTIONLESS);
    expect(Math.max(...tl.samples.map((s) => s.heat))).toBe(0);
    expect(tl.samples[tl.samples.length - 1].y).toBeCloseTo(FRICTIONLESS.height, 1);
  });

  it('numerical and analytic outcomes agree across a sweep of parameters', () => {
    for (const height of [0.5, 1.5, 3]) {
      for (const mu of [0.05, 0.3, 0.6]) {
        const params: EnergyRampParams = { mass: 2, height, mu, k: 150 };
        const tl = generateEnergyTimeline(params);
        const analytic = computeEnergyRamp(params);
        // skip knife-edge budgets, where integration error can tip the classification
        if (Math.abs(analytic.budgetRatio - 1) < 0.02 || Math.abs(analytic.budgetRatio - 2) < 0.02) continue;
        expect(tl.endedOn).toBe(analytic.outcome === 'returns-up-ramp' ? 'ramp' : 'patch');
      }
    }
  });
});

describe('sampleTimelineAt', () => {
  const tl = generateEnergyTimeline(RETURNS);

  it('clamps to the first and last samples', () => {
    expect(sampleTimelineAt(tl, -1)).toBe(tl.samples[0]);
    expect(sampleTimelineAt(tl, tl.duration + 10)).toBe(tl.samples[tl.samples.length - 1]);
  });

  it('interpolates between samples', () => {
    const a = tl.samples[10];
    const b = tl.samples[11];
    const mid = sampleTimelineAt(tl, (a.t + b.t) / 2);
    expect(mid.u).toBeGreaterThan(a.u);
    expect(mid.u).toBeLessThan(b.u);
  });
});
