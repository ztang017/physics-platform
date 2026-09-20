import { describe, it, expect } from 'vitest';
import { solveCollision, interpolateCollision, type CollisionParams } from './collision';

describe('Collision Engine', () => {
  it('solves elastic collision correctly', () => {
    const params: CollisionParams = { m1: 2, v1: 3, m2: 2, v2: -3, e: 1 };
    const result = solveCollision(params);
    
    // Equal mass, e=1 -> they swap velocities
    expect(result.v1f).toBeCloseTo(-3);
    expect(result.v2f).toBeCloseTo(3);
    expect(result.isEnergyConserved).toBe(true);
  });

  it('solves perfectly inelastic collision correctly', () => {
    const params: CollisionParams = { m1: 2, v1: 4, m2: 2, v2: 0, e: 0 };
    const result = solveCollision(params);
    
    // Conservation of momentum: (2 * 4) + (2 * 0) = 8
    // Total mass = 4
    // Final velocity = 8 / 4 = 2
    expect(result.v1f).toBeCloseTo(2);
    expect(result.v2f).toBeCloseTo(2);
    expect(result.isEnergyConserved).toBe(false);
  });

  it('conserves momentum in all cases', () => {
    const params: CollisionParams = { m1: 5, v1: 10, m2: 3, v2: -2, e: 0.6 };
    const result = solveCollision(params);
    
    expect(result.totalMomentumBefore).toBeCloseTo(result.totalMomentumAfter);
  });
});

describe('interpolateCollision (animation positions)', () => {
  const params: CollisionParams = { m1: 3, v1: 5, m2: 1, v2: 0, e: 1 };
  const result = solveCollision(params);

  it('never lets cart 1 overshoot past cart 2 during the approach', () => {
    for (let t = 0; t <= 0.45; t += 0.05) {
      const state = interpolateCollision(params, result, t);
      expect(state.x1).toBeLessThanOrEqual(state.x2 + 1e-6);
    }
  });

  it('holds a continuous position across the approach → collision boundary', () => {
    const justBefore = interpolateCollision(params, result, 0.449);
    const justAfter = interpolateCollision(params, result, 0.45);
    expect(justAfter.x1).toBeCloseTo(justBefore.x1, 1);
    expect(justAfter.x2).toBeCloseTo(justBefore.x2, 1);
  });

  it('holds a continuous position across the collision → separation boundary', () => {
    const justBefore = interpolateCollision(params, result, 0.549);
    const justAfter = interpolateCollision(params, result, 0.55);
    expect(justAfter.x1).toBeCloseTo(justBefore.x1, 1);
    expect(justAfter.x2).toBeCloseTo(justBefore.x2, 1);
  });

  it('still animates when cart 1 is slower than cart 2 (no NaN/negative-time blowup)', () => {
    const slowParams: CollisionParams = { m1: 1, v1: -2, m2: 1, v2: 3, e: 1 };
    const slowResult = solveCollision(slowParams);
    const state = interpolateCollision(slowParams, slowResult, 0.9);
    expect(Number.isFinite(state.x1)).toBe(true);
    expect(Number.isFinite(state.x2)).toBe(true);
  });

  it('keeps a fast post-collision cart from flying off the visible track', () => {
    // A light cart (m2=1) hit by a heavy fast one (m1=10, v1=10) elastically
    // ends up moving much faster than the incoming speed (v2f can exceed v1).
    const fastParams: CollisionParams = { m1: 10, v1: 10, m2: 1, v2: 0, e: 1 };
    const fastResult = solveCollision(fastParams);
    const trackWidth = 10;
    for (let t = 0.55; t <= 1; t += 0.05) {
      const state = interpolateCollision(fastParams, fastResult, t, trackWidth);
      expect(state.x1).toBeLessThan(trackWidth + 2);
      expect(state.x2).toBeLessThan(trackWidth + 2);
    }
  });
});
