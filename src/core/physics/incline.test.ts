import { describe, it, expect } from 'vitest';
import { computeInclineForces, validateFBD, type InclineParams } from './incline';

describe('Incline Engine', () => {
  it('computes forces on a flat surface (0 degrees)', () => {
    const params: InclineParams = { mass: 10, angleDeg: 0, muStatic: 0.5, muKinetic: 0.3, g: 9.8 };
    const forces = computeInclineForces(params);
    
    expect(forces.weight).toBeCloseTo(98.0);
    expect(forces.normal).toBeCloseTo(98.0); 
    expect(forces.weightParallel).toBeCloseTo(0);
    expect(forces.frictionMax).toBeCloseTo(49.0);
    expect(forces.isStationary).toBe(true);
  });

  it('determines when block is stationary on an incline', () => {
    const params: InclineParams = { mass: 10, angleDeg: 30, muStatic: 0.8, muKinetic: 0.5, g: 9.8 };
    const forces = computeInclineForces(params);
    expect(forces.isStationary).toBe(true);
  });

  it('determines when block slides on an incline', () => {
    const params: InclineParams = { mass: 10, angleDeg: 45, muStatic: 0.5, muKinetic: 0.3, g: 9.8 };
    const forces = computeInclineForces(params);
    expect(forces.isStationary).toBe(false);
  });

  it('validates FBD correctly', () => {
    const params: InclineParams = { mass: 10, angleDeg: 30, muStatic: 0.5, muKinetic: 0.3, g: 9.8 };
    const forces = computeInclineForces(params);
    
    // Only gave weight and normal, missing friction
    const studentVectors = [
      { id: 'w', magnitude: forces.weight, angleDeg: 270 },
      { id: 'n', magnitude: forces.normal, angleDeg: 90 + 30 }
    ];
    
    const result = validateFBD(studentVectors, forces, 30);
    expect(result.isValid).toBe(false); 
    expect(result.score).toBeLessThan(100);
  });
});
