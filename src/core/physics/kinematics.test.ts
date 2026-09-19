import { describe, it, expect } from 'vitest';
import { generateTimeSeries, type KinematicsParams } from './kinematics';

describe('Kinematics Engine', () => {
  it('evaluates constant position correctly', () => {
    const params: KinematicsParams = { x0: 10, v0: 0, a: 0 };
    const result = generateTimeSeries(params, 5, 1);
    
    expect(result.length).toBe(6); // t=0 to 5
    expect(result[0].x).toBeCloseTo(10);
    expect(result[0].v).toBeCloseTo(0);
    expect(result[0].a).toBeCloseTo(0);
    
    expect(result[5].x).toBeCloseTo(10);
    expect(result[5].v).toBeCloseTo(0);
  });

  it('evaluates constant velocity correctly', () => {
    const params: KinematicsParams = { x0: 0, v0: 2, a: 0 };
    const result = generateTimeSeries(params, 5, 1);
    
    expect(result[5].x).toBeCloseTo(10);
    expect(result[5].v).toBeCloseTo(2);
  });

  it('evaluates constant acceleration correctly', () => {
    const params: KinematicsParams = { x0: 0, v0: 0, a: 2 };
    const result = generateTimeSeries(params, 5, 1);
    
    // x = 0.5 * a * t^2 = 0.5 * 2 * 25 = 25
    expect(result[5].x).toBeCloseTo(25);
    // v = a * t = 2 * 5 = 10
    expect(result[5].v).toBeCloseTo(10);
  });
});
