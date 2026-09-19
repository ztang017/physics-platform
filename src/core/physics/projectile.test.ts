import { describe, it, expect } from 'vitest';
import { getRange, getMaxHeight, evaluateMission, type ProjectileParams } from './projectile';

describe('Projectile Engine', () => {
  it('calculates range correctly', () => {
    const params: ProjectileParams = { v0: 20, angleDeg: 45, g: 9.8 };
    // R = v^2 * sin(2*theta) / g = 400 * sin(90) / 9.8 = 40.816
    expect(getRange(params)).toBeCloseTo(40.816, 2);
  });

  it('calculates max height correctly', () => {
    const params: ProjectileParams = { v0: 20, angleDeg: 30, g: 9.8 };
    // h = (v * sin(theta))^2 / (2g) = (20 * 0.5)^2 / 19.6 = 100 / 19.6 = 5.102
    expect(getMaxHeight(params)).toBeCloseTo(5.102, 2);
  });

  it('evaluates successful mission', () => {
    // 25m wall, 12m high. Target at 60m (+-5m)
    // R = v0^2/9.8 = 60 => v0^2 = 588 => v0 = 24.248
    const mission = {
      v0: 24.25,
      angleDeg: 45,
      x0: 0,
      y0: 0,
      wallX: 25,
      wallHeight: 12,
      targetX: 60,
      targetTolerance: 5,
      g: 9.8
    };
    
    const result = evaluateMission(mission);
    expect(result.isSuccess).toBe(true);
    expect(result.clears).toBe(true);
  });
  
  it('detects hitting the wall', () => {
    const mission = {
      v0: 20,
      angleDeg: 45,
      x0: 0,
      y0: 0,
      wallX: 25,
      wallHeight: 12, // height at 25m with v0=20 is around 4.69m, wall is 12m, so it hits wall
      targetX: 60,
      targetTolerance: 5,
      g: 9.8
    };
    
    const result = evaluateMission(mission);
    expect(result.isSuccess).toBe(false);
    expect(result.clears).toBe(false);
  });
});
