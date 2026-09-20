import type { FormulaSymbol } from '../concepts/ConceptNotes';

export interface SheetFormula {
  label: string;
  latex: string;
  caption?: string;
  symbols: FormulaSymbol[];
}

export interface SheetSection {
  moduleId: string;
  icon: string;
  title: string;
  formulas: SheetFormula[];
}

// A curated cross-module cheat sheet — the load-bearing formula from each
// module's Concept Notes, gathered in one place so a student mid-way through
// one module can quickly check something from another without navigating away.
export const FORMULA_SHEET: SheetSection[] = [
  {
    moduleId: 'kinematics',
    icon: '📈',
    title: 'Vector Kinematics',
    formulas: [
      {
        label: 'Displacement',
        latex: '\\Delta x = x_f - x_i',
        symbols: [
          { symbol: 'Δx', meaning: 'Displacement', unit: 'm' },
          { symbol: 'x_f, x_i', meaning: 'Final and initial position', unit: 'm' },
        ],
      },
      {
        label: 'Average velocity',
        latex: 'v_{avg} = \\dfrac{\\Delta x}{\\Delta t}',
        symbols: [
          { symbol: 'v_{avg}', meaning: 'Average velocity', unit: 'm/s' },
          { symbol: 'Δt', meaning: 'Elapsed time', unit: 's' },
        ],
      },
      {
        label: 'Acceleration',
        latex: 'a = \\dfrac{\\Delta v}{\\Delta t}',
        symbols: [
          { symbol: 'a', meaning: 'Acceleration', unit: 'm/s²' },
          { symbol: 'Δv', meaning: 'Change in velocity', unit: 'm/s' },
        ],
      },
      {
        label: 'Constant-acceleration equations',
        latex: 'v = v_0 + at \\qquad x = x_0 + v_0 t + \\tfrac{1}{2}at^2',
        symbols: [
          { symbol: 'v_0, x_0', meaning: 'Initial velocity and position', unit: 'm/s, m' },
          { symbol: 't', meaning: 'Elapsed time', unit: 's' },
        ],
      },
    ],
  },
  {
    moduleId: 'projectile',
    icon: '🚀',
    title: 'Projectile Motion',
    formulas: [
      {
        label: 'Launch components',
        latex: 'v_x = v_0\\cos\\theta \\qquad v_y = v_0\\sin\\theta',
        symbols: [
          { symbol: 'v_0', meaning: 'Launch speed', unit: 'm/s' },
          { symbol: 'θ', meaning: 'Launch angle from horizontal', unit: '°' },
        ],
      },
      {
        label: 'Horizontal position',
        latex: 'x = x_0 + v_x t',
        symbols: [{ symbol: 'v_x', meaning: 'Horizontal velocity (constant)', unit: 'm/s' }],
      },
      {
        label: 'Vertical position',
        latex: 'y = y_0 + v_y t - \\tfrac{1}{2} g t^2',
        symbols: [{ symbol: 'g', meaning: 'Gravitational acceleration ≈ 9.8', unit: 'm/s²' }],
      },
      {
        label: 'Range',
        latex: 'R = \\dfrac{v_0^2 \\sin(2\\theta)}{g}',
        caption: 'Launch and landing at the same height.',
        symbols: [{ symbol: 'R', meaning: 'Horizontal range', unit: 'm' }],
      },
    ],
  },
  {
    moduleId: 'incline',
    icon: '⚖️',
    title: 'Forces on an Incline',
    formulas: [
      {
        label: 'Weight components',
        latex: 'W_\\parallel = mg\\sin\\theta \\qquad W_\\perp = mg\\cos\\theta',
        symbols: [
          { symbol: 'm', meaning: 'Mass', unit: 'kg' },
          { symbol: 'θ', meaning: 'Incline angle from horizontal', unit: '°' },
        ],
      },
      {
        label: 'Normal force',
        latex: 'N = mg\\cos\\theta',
        symbols: [{ symbol: 'N', meaning: 'Normal force', unit: 'N' }],
      },
      {
        label: 'Friction',
        latex: 'f_{s,max} = \\mu_s N \\qquad f_k = \\mu_k N',
        symbols: [
          { symbol: 'μ_s, μ_k', meaning: 'Coefficients of static / kinetic friction' },
        ],
      },
      {
        label: 'Critical angle',
        latex: '\\tan\\theta_{critical} = \\mu_s',
        symbols: [{ symbol: 'θ_{critical}', meaning: 'Angle at which sliding just begins', unit: '°' }],
      },
    ],
  },
  {
    moduleId: 'collision',
    icon: '💥',
    title: 'Momentum & Collisions',
    formulas: [
      {
        label: 'Momentum',
        latex: 'p = mv',
        symbols: [{ symbol: 'p', meaning: 'Momentum', unit: 'kg·m/s' }],
      },
      {
        label: 'Conservation of momentum',
        latex: 'm_1 v_{1i} + m_2 v_{2i} = m_1 v_{1f} + m_2 v_{2f}',
        symbols: [
          { symbol: 'i, f subscripts', meaning: 'Before (initial) and after (final) the collision' },
        ],
      },
      {
        label: 'Coefficient of restitution',
        latex: 'e = \\dfrac{v_{2f} - v_{1f}}{v_{1i} - v_{2i}}',
        symbols: [{ symbol: 'e', meaning: '0 = stick together, 1 = perfectly bouncy' }],
      },
    ],
  },
];
