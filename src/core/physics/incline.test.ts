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

  describe('validateFBD with a complete diagram', () => {
    const slider: InclineParams = { mass: 5, angleDeg: 30, muStatic: 0.4, muKinetic: 0.3, g: 9.8 }; // slides
    const holder: InclineParams = { mass: 5, angleDeg: 20, muStatic: 0.6, muKinetic: 0.45, g: 9.8 }; // stays put

    it('accepts a correct diagram for a block that slides, with kinetic friction UP the slope', () => {
      const f = computeInclineForces(slider);
      expect(f.isStationary).toBe(false);
      const vectors = [
        { id: 'weight', magnitude: f.weight, angleDeg: 270 },
        { id: 'normal', magnitude: f.normal, angleDeg: 90 + 30 },
        { id: 'friction', magnitude: f.frictionKinetic, angleDeg: 30 },
      ];
      const result = validateFBD(vectors, f, 30);
      expect(result.isValid).toBe(true);
      expect(result.score).toBe(100);
    });

    it('accepts a correct diagram for a block that stays put, with friction equal to the pull down the slope', () => {
      const f = computeInclineForces(holder);
      expect(f.isStationary).toBe(true);
      const vectors = [
        { id: 'weight', magnitude: f.weight, angleDeg: 270 },
        { id: 'normal', magnitude: f.normal, angleDeg: 90 + 20 },
        { id: 'friction', magnitude: f.weightParallel, angleDeg: 20 },
      ];
      expect(validateFBD(vectors, f, 20).isValid).toBe(true);
    });

    it('rejects friction drawn pointing down the slope or away from the surface', () => {
      const f = computeInclineForces(slider);
      const withFriction = (angleDeg: number) => [
        { id: 'weight', magnitude: f.weight, angleDeg: 270 },
        { id: 'normal', magnitude: f.normal, angleDeg: 90 + 30 },
        { id: 'friction', magnitude: f.frictionKinetic, angleDeg },
      ];
      expect(validateFBD(withFriction(180 + 30), f, 30).isValid).toBe(false); // down the slope
      expect(validateFBD(withFriction(180 - 30), f, 30).isValid).toBe(false); // up and away from the ramp
    });

    it('allows a few pixels of slop on a short friction arrow', () => {
      const f = computeInclineForces(slider);
      const vectors = [
        { id: 'weight', magnitude: f.weight, angleDeg: 270 },
        { id: 'normal', magnitude: f.normal, angleDeg: 90 + 30 },
        { id: 'friction', magnitude: f.frictionKinetic + 0.06 * f.weight, angleDeg: 30 + 12 },
      ];
      expect(validateFBD(vectors, f, 30).isValid).toBe(true);
    });

    it('still catches static friction drawn where sliding (kinetic) friction belongs', () => {
      const f = computeInclineForces(slider);
      const vectors = [
        { id: 'weight', magnitude: f.weight, angleDeg: 270 },
        { id: 'normal', magnitude: f.normal, angleDeg: 90 + 30 },
        { id: 'friction', magnitude: f.weightParallel, angleDeg: 30 }, // the stay-put length
      ];
      expect(validateFBD(vectors, f, 30).isValid).toBe(false);
    });
  });
});
