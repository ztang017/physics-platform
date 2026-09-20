import { describe, it, expect } from 'vitest';
import { generateTimeSeries, scoreGraphMatch, type KinematicsParams } from './kinematics';

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

describe('scoreGraphMatch', () => {
  const target: KinematicsParams = { x0: 0, v0: 3, a: -1.5 };

  it('scores an identical curve as a perfect match', () => {
    const series = generateTimeSeries(target, 8, 1);
    const result = scoreGraphMatch(series, series);
    expect(result.score).toBe(100);
    expect(result.isPerfect).toBe(true);
  });

  it('gives a close-but-not-exact guess a high but imperfect score', () => {
    const targetSeries = generateTimeSeries(target, 8, 1);
    const studentSeries = generateTimeSeries({ x0: 0, v0: 3.2, a: -1.4 }, 8, 1);
    const result = scoreGraphMatch(targetSeries, studentSeries);
    expect(result.score).toBeGreaterThan(80);
    expect(result.score).toBeLessThan(100);
  });

  it('gives a wildly different guess a low but non-collapsed score', () => {
    const targetSeries = generateTimeSeries(target, 8, 1);
    // A previous version of the scoring formula rounded almost any mismatch
    // down to exactly 0 because it normalised against |target.v| per point,
    // which shrinks to ~0 wherever the target crosses zero.
    const studentSeries = generateTimeSeries({ x0: 0, v0: 5, a: 2 }, 8, 1);
    const result = scoreGraphMatch(targetSeries, studentSeries);
    expect(result.score).toBe(0); // this guess really is that far off
    expect(result.mae).toBeGreaterThan(0);
  });

  it('rewards getting closer with a monotonically higher score', () => {
    const targetSeries = generateTimeSeries(target, 8, 1);
    const farSeries = generateTimeSeries({ x0: 0, v0: 8, a: 3 }, 8, 1);
    const nearSeries = generateTimeSeries({ x0: 0, v0: 3.5, a: -1 }, 8, 1);
    const farScore = scoreGraphMatch(targetSeries, farSeries).score;
    const nearScore = scoreGraphMatch(targetSeries, nearSeries).score;
    expect(nearScore).toBeGreaterThan(farScore);
  });
});
