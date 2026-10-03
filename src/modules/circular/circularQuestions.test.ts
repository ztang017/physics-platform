import { describe, it, expect } from 'vitest';
import { CIRCULAR_EXPLAIN_QUESTIONS } from './circularQuestions';
import { G, bankedForcesAt, designSpeed, minLoopBottomSpeed, minTopSpeed, muFromSlip, rpmToRadPerSec } from '../../core/physics/circular';

const byId = (id: string) => {
  const q = CIRCULAR_EXPLAIN_QUESTIONS.find((item) => item.id === id);
  if (!q) throw new Error(`missing question ${id}`);
  return q;
};
const correct = (id: string) => {
  const q = byId(id);
  return q.options[q.correctIndex];
};

describe('CIRCULAR_EXPLAIN_QUESTIONS (data integrity)', () => {
  it('has unique ids', () => {
    const ids = CIRCULAR_EXPLAIN_QUESTIONS.map((q) => q.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('gives every question four distinct options and a valid answer index', () => {
    for (const q of CIRCULAR_EXPLAIN_QUESTIONS) {
      expect(q.options).toHaveLength(4);
      expect(new Set(q.options).size).toBe(4);
      expect(q.correctIndex).toBeGreaterThanOrEqual(0);
      expect(q.correctIndex).toBeLessThan(4);
      expect(q.hint.length).toBeGreaterThan(10);
      expect(q.explanation.length).toBeGreaterThan(10);
    }
  });
});

// Re-derive every numeric answer from the physics, so a typo in the question text cannot ship.
describe('numeric Explain answers match the physics', () => {
  it('rpm → rad/s: 60 rpm ≈ 6.3 rad/s', () => {
    expect(rpmToRadPerSec(60)).toBeCloseTo(6.28, 2);
    expect(correct('rpm-to-rads')).toBe('6.3 rad/s');
  });

  it('angular acceleration: 120 rad/s to rest in 6 s is −20 rad/s²', () => {
    expect((0 - 120) / 6).toBe(-20);
    expect(correct('angular-accel-stopping')).toBe('−20 rad/s²');
  });

  it('μ from 60 rpm at 10 cm is 0.40', () => {
    expect(muFromSlip(0.1, 60)).toBeCloseTo(0.4028, 3);
    expect(correct('mu-from-rpm')).toBe('0.40');
  });

  it('radius scales as 1/ω²: doubling the speed turns 4 cm into 1 cm', () => {
    expect(4 / (180 / 90) ** 2).toBe(1);
    expect(correct('radius-quarter')).toBe('1 cm');
  });

  it('puck and hanging mass: v = √(mgR/M) ≈ 1.1 m/s', () => {
    const v = Math.sqrt((0.2 * G * 0.3) / 0.5);
    expect(v).toBeCloseTo(1.084, 3);
    expect(correct('puck-hanging-mass')).toBe('1.1 m/s');
    // the listed slips really are what those mistakes give
    expect(Math.sqrt((0.2 * G * 0.3) / (0.5 + 0.2))).toBeCloseTo(0.917, 2); // M + m
    expect(Math.sqrt((0.5 * G * 0.3) / 0.2)).toBeCloseTo(2.71, 2);          // masses swapped
    expect(Math.sqrt(G * 0.3)).toBeCloseTo(1.71, 2);                        // masses forgotten
  });

  it('cords: outer ≈ 63 N, inner ≈ 79 N at 1 rev/s', () => {
    const w2 = rpmToRadPerSec(60) ** 2;
    const outer = 2.0 * w2 * 0.8;
    const inner = outer + 1.0 * w2 * 0.4;
    expect(outer).toBeCloseTo(63.2, 1);
    expect(inner).toBeCloseTo(79.0, 1);
    expect(correct('outer-cord-tension')).toBe('63 N');
    expect(correct('inner-cord-tension')).toBe('79 N');
    expect(inner + 1.0 * w2 * 0.4).toBeCloseTo(94.75, 1); // the "95 N" slip counts A's 16 N twice
  });

  it('vertical circle: bottom tension ≈ 45 N, minimum top speed ≈ 2.8 m/s', () => {
    const bottom = 1.5 * G + (1.5 * 4.0 ** 2) / 0.8;
    expect(bottom).toBeCloseTo(44.7, 1);
    expect(correct('bucket-bottom-tension')).toBe('45 N');
    expect(Math.sqrt(G * 0.8)).toBeCloseTo(2.8, 2);
    expect(correct('bucket-top-minimum')).toBe('2.8 m/s');
    expect(G * 0.8).toBeCloseTo(7.84, 2);                 // forgot the square root
    expect(Math.sqrt(2 * G * 0.8)).toBeCloseTo(3.96, 2);  // √(2gr)
  });
});

describe('phase 2 numeric Explain answers match the physics', () => {
  it('full loop: slowest bottom speed on a 0.80 m rope is √(5gr) ≈ 6.3 m/s', () => {
    expect(minLoopBottomSpeed(0.8)).toBeCloseTo(6.26, 2);
    expect(correct('full-loop-bottom-speed')).toBe('6.3 m/s');
    expect(minTopSpeed(0.8)).toBeCloseTo(2.8, 2);                 // the top-speed slip
    expect(Math.sqrt(2 * G * 0.8)).toBeCloseTo(3.96, 2);          // level with the centre
    expect(Math.sqrt(4 * G * 0.8)).toBeCloseTo(5.6, 1);           // arrives at the top with zero speed
  });

  it('banked design speed: R = 60 m, θ = 20° gives 14.6 m/s', () => {
    expect(designSpeed(60, 20)).toBeCloseTo(14.63, 2);
    expect(correct('bank-design-speed')).toBe('14.6 m/s');
    expect(Math.sqrt(60 * G)).toBeCloseTo(24.25, 2);              // forgot tan θ
    expect(60 * G * Math.tan((20 * Math.PI) / 180)).toBeCloseTo(214, 0); // forgot the square root
    expect(Math.sqrt(G * Math.tan((20 * Math.PI) / 180))).toBeCloseTo(1.89, 2); // forgot R
  });

  it('banked friction direction: slower than v0 means friction up the slope', () => {
    const road = { radius: 60, angleDeg: 20, mu: 0.2 };
    const slow = bankedForcesAt(road, 0.8 * designSpeed(60, 20));
    const fast = bankedForcesAt(road, 1.2 * designSpeed(60, 20));
    expect(slow.friction).toBeGreaterThan(0);   // positive = up the slope
    expect(fast.friction).toBeLessThan(0);
    expect(correct('bank-friction-slow')).toMatch(/^Up the slope/);
  });

});
