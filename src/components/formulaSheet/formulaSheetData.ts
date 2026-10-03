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
    moduleId: 'energy',
    icon: '🔋',
    title: 'Work, Energy & Power',
    formulas: [
      {
        label: 'Work',
        latex: 'W = F\\,s\\cos\\theta',
        symbols: [
          { symbol: 'W', meaning: 'Work done by the force', unit: 'J' },
          { symbol: 'θ', meaning: 'Angle between the force and the motion', unit: '°' },
        ],
      },
      {
        label: 'Work–energy theorem',
        latex: 'W_{net} = \\Delta K = \\tfrac{1}{2}mv_f^2 - \\tfrac{1}{2}mv_i^2',
        symbols: [{ symbol: 'K', meaning: 'Kinetic energy', unit: 'J' }],
      },
      {
        label: 'Gravitational potential energy',
        latex: '\\Delta U = mg\\,\\Delta y',
        caption: 'Only the change matters — zero height can go anywhere.',
        symbols: [{ symbol: 'Δy', meaning: 'Change in height', unit: 'm' }],
      },
      {
        label: 'Spring force and energy',
        latex: 'F = -kx \\qquad U_{el} = \\tfrac{1}{2}kx^2',
        symbols: [
          { symbol: 'k', meaning: 'Spring constant', unit: 'N/m' },
          { symbol: 'x', meaning: 'Extension from natural length', unit: 'm' },
        ],
      },
      {
        label: 'Conservation of energy',
        latex: 'K_i + U_i + W_{nc} = K_f + U_f',
        symbols: [{ symbol: 'W_{nc}', meaning: 'Work by non-conservative forces (e.g. friction)', unit: 'J' }],
      },
      {
        label: 'Power',
        latex: 'P = \\dfrac{W}{t} = Fv',
        symbols: [{ symbol: 'P', meaning: 'Power', unit: 'W' }],
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
  {
    moduleId: 'circular',
    icon: '🎡',
    title: 'Circular Motion',
    formulas: [
      {
        label: 'Angular velocity and units',
        latex: '\\omega = \\dfrac{d\\theta}{dt} = 2\\pi f = \\dfrac{2\\pi}{T} \\qquad \\omega\\ (\\text{rad/s}) = \\text{rpm} \\times \\dfrac{2\\pi}{60}',
        symbols: [
          { symbol: 'ω', meaning: 'Angular velocity', unit: 'rad/s' },
          { symbol: 'f, T', meaning: 'Frequency (turns per second) and period (seconds per turn)' },
        ],
      },
      {
        label: 'Arc length and speed on a circle',
        latex: 'l = r\\theta \\qquad v = \\omega r',
        caption: 'True for any point on a turning body. θ must be in radians.',
        symbols: [{ symbol: 'r', meaning: 'Distance from the axis', unit: 'm' }],
      },
      {
        label: 'Centripetal acceleration and force',
        latex: 'a_c = \\dfrac{v^2}{r} = \\omega^2 r \\qquad \\Sigma F_{toward\\ centre} = \\dfrac{mv^2}{r}',
        caption: 'Centripetal is a job done by real forces (tension, friction, normal force, gravity), not a new force.',
        symbols: [{ symbol: 'a c', meaning: 'Acceleration toward the centre', unit: 'm/s²' }],
      },
      {
        label: 'Coin on a turntable',
        latex: '\\omega_{max} = \\sqrt{\\dfrac{\\mu_s g}{r}}',
        caption: 'The mass cancels.',
        symbols: [{ symbol: 'μₛ', meaning: 'Coefficient of static friction' }],
      },
      {
        label: 'Constant angular acceleration',
        latex: '\\omega = \\omega_0 + \\alpha t \\qquad \\theta = \\omega_0 t + \\tfrac{1}{2}\\alpha t^2 \\qquad \\omega^2 = \\omega_0^2 + 2\\alpha\\theta',
        symbols: [{ symbol: 'α', meaning: 'Angular acceleration', unit: 'rad/s²' }],
      },
      {
        label: 'Tangential acceleration',
        latex: 'a_{tan} = \\alpha r',
        symbols: [{ symbol: 'a tan', meaning: 'Acceleration along the circle (changes the speed)', unit: 'm/s²' }],
      },
      {
        label: 'Banked curve, no friction',
        latex: '\\tan\\theta = \\dfrac{v_0^2}{Rg} \\qquad v_0 = \\sqrt{Rg\\tan\\theta}',
        caption: 'The design speed: the slope alone supplies the centripetal force.',
        symbols: [{ symbol: 'θ', meaning: 'Banking angle', unit: 'degrees' }],
      },
      {
        label: 'Banked curve with friction',
        latex: 'N = m\\left(g\\cos\\theta + \\dfrac{v^2}{R}\\sin\\theta\\right) \\qquad mg\\sin\\theta \\mp \\mu_s N = \\dfrac{mv^2}{R}\\cos\\theta',
        caption: 'Solve once with friction up the slope (the − sign, giving v_min) and once with it down the slope (the + sign, giving v_max).',
        symbols: [{ symbol: 'μₛ', meaning: 'Coefficient of static friction' }],
      },
      {
        label: 'Vertical circle (rope)',
        latex: 'T_{bottom} = mg + \\dfrac{mv^2}{r} \\qquad T_{top} = \\dfrac{mv^2}{r} - mg \\qquad v_{min,\\,top} = \\sqrt{gr}',
        symbols: [{ symbol: 'T', meaning: 'Tension in the rope', unit: 'N' }],
      },
      {
        label: 'Vertical circle: any angle and the full loop',
        latex: 'T(\\varphi) = \\dfrac{mv_0^2}{r} - 2mg + 3mg\\cos\\varphi \\qquad v_{0,\\,min} = \\sqrt{5gr}',
        caption: 'φ is measured from the lowest point. The rope stays taut all the way round only if v₀ ≥ √(5gr).',
        symbols: [{ symbol: 'v₀', meaning: 'Speed at the lowest point', unit: 'm/s' }],
      },
    ],
  },
];
