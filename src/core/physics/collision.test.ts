import { describe, it, expect } from 'vitest';
import { solveCollision, type CollisionParams } from './collision';

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
