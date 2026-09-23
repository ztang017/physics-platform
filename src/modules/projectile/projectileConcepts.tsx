import { type ConceptSection } from '../../components/concepts/ConceptNotes';
import { TryIt } from '../../components/concepts/TryIt';
import { RevealAnswer } from '../../components/concepts/RevealAnswer';
import { Katex } from '../../components/ui/Katex';

export const PROJECTILE_CONCEPTS: ConceptSection[] = [
  {
    id: 'independence-of-motion',
    icon: '↔️',
    title: 'Horizontal and Vertical Motion are Independent',
    body: [
      'The single most important idea in projectile motion: horizontal and vertical motion happen completely separately from each other — as if they were two unrelated 1D problems running side by side. Gravity only ever pulls straight down, so it never has any effect on how fast something moves sideways.',
      'Classic demonstration: drop a ball, and at the exact same instant fire an identical ball horizontally from the same height. They hit the ground at the EXACT same time — even though the fired ball also travels far sideways before landing. Both balls experience identical vertical motion (same gravity, same starting height, same starting vertical velocity of zero); the sideways motion of one of them is simply irrelevant to how long it takes to fall.',
      'This independence is why we can analyze a curving cannonball trajectory just by solving two much simpler, already-familiar problems separately, then combining the results.',
    ],
  },
  {
    id: 'launch-components',
    icon: '📐',
    title: 'Splitting the Launch Velocity into Components',
    body: [
      "A launch at speed v₀ and angle θ above the ground isn't purely horizontal or purely vertical — it's both at once. To analyze it, we decompose the single launch velocity into a horizontal piece and a vertical piece, using the same right-triangle trigonometry as the incline module: cosine gives the piece along the horizontal, sine gives the piece along the vertical.",
      'Once split, each component is handled completely separately using the rules below — the horizontal piece never changes (no horizontal force), while the vertical piece is subject to gravity from the instant of launch.',
    ],
    formulaLatex: 'v_x = v_0\\cos\\theta \\qquad\\qquad v_y = v_0\\sin\\theta',
    symbols: [
      { symbol: 'v_0', meaning: 'Launch speed — the total speed at the moment of launch', unit: 'm/s' },
      { symbol: 'θ', meaning: 'Launch angle, measured from the horizontal', unit: 'degrees' },
      { symbol: 'v_x', meaning: 'Horizontal component of the launch velocity (stays constant)', unit: 'm/s' },
      { symbol: 'v_y', meaning: 'Vertical component of the launch velocity (changes under gravity)', unit: 'm/s' },
    ],
  },
  {
    id: 'horizontal-motion',
    icon: '➡️',
    title: 'Horizontal Motion: Constant Velocity',
    body: [
      'With no horizontal force acting (ignoring air resistance), horizontal velocity never changes for the entire flight. Horizontal position just grows steadily with time — the same "no acceleration" equation you\'d use for a car cruising at constant speed on a straight road.',
      "This is the piece that determines RANGE: the longer the projectile stays in the air (governed entirely by the vertical motion below), the farther this constant sideways drift carries it.",
    ],
    formulaLatex: 'x = x_0 + v_x t',
    symbols: [
      { symbol: 'x', meaning: 'Horizontal position at time t', unit: 'm' },
      { symbol: 'x_0', meaning: 'Starting horizontal position', unit: 'm' },
      { symbol: 'v_x', meaning: 'Horizontal velocity (constant throughout flight)', unit: 'm/s' },
      { symbol: 't', meaning: 'Time since launch', unit: 's' },
    ],
  },
  {
    id: 'vertical-motion',
    icon: '⬇️',
    title: 'Vertical Motion: Constant Acceleration (Gravity)',
    body: [
      'Vertically, gravity provides a constant downward acceleration g ≈ 9.8 m/s², identical to the acceleration in the kinematics module — just relabeled and pointed down instead of along a generic axis. So vertical motion uses the exact same constant-acceleration equation as before, applied in the up/down direction, with the launch angle only affecting the STARTING vertical velocity v_y.',
      "This is the piece that determines flight TIME: it takes exactly as long to rise and fall back to launch height as it would for a ball thrown straight up at speed v_y — the sideways motion happening at the same time doesn't slow this down or speed it up at all.",
    ],
    formulaLatex: 'y = y_0 + v_y t - \\tfrac{1}{2} g t^2',
    symbols: [
      { symbol: 'y', meaning: 'Vertical position (height) at time t', unit: 'm' },
      { symbol: 'y_0', meaning: 'Starting height', unit: 'm' },
      { symbol: 'v_y', meaning: 'Initial vertical velocity component', unit: 'm/s' },
      { symbol: 'g', meaning: 'Gravitational acceleration (constant, ≈ 9.8)', unit: 'm/s²' },
      { symbol: 't', meaning: 'Time since launch', unit: 's' },
    ],
  },
  {
    id: 'why-parabola',
    icon: '🌙',
    title: 'Why the Path is a Parabola — and How Range Depends on Angle',
    body: [
      'Combine steady sideways motion (x grows linearly with t) with steadily-accelerating downward motion (y depends on t²), and the shape traced out by plotting y against x is a parabola — a direct mathematical consequence of one coordinate being linear in time while the other is quadratic in time.',
      'The launch angle controls a trade-off between how far (range) and how high the projectile goes. A shallow angle (small θ) gives a lot of horizontal speed but very little time in the air; a steep angle (large θ) gives a long hang time but little horizontal speed. The sweet spot that maximizes range, on level ground with no air resistance, is exactly 45° — high enough for decent hang time, flat enough for decent horizontal speed.',
      "Interestingly, any two angles that add up to 90° (like 30° and 60°, or 20° and 70°) produce the SAME range as each other — they just trade height for hang time in opposite ways. Only the height and shape of the trajectory differ between them.",
    ],
    formulaLatex: 'R = \\dfrac{v_0^2 \\sin(2\\theta)}{g}',
    formulaCaption: 'Valid for launch and landing at the same height.',
    symbols: [
      { symbol: 'R', meaning: 'Horizontal range — total distance traveled before landing', unit: 'm' },
      { symbol: 'v_0', meaning: 'Launch speed', unit: 'm/s' },
      { symbol: 'θ', meaning: 'Launch angle above horizontal', unit: 'degrees' },
      { symbol: 'g', meaning: 'Gravitational acceleration', unit: 'm/s²' },
    ],
    interactive: (
      <TryIt
        resultLabel="Horizontal Range"
        resultUnit="m"
        formulaLatex={'R = \\dfrac{v_0^2 \\sin(2\\theta)}{g}'}
        variables={[
          { id: 'v0', label: 'Launch Speed (v₀)', min: 5, max: 40, step: 1, defaultValue: 20, unit: 'm/s' },
          { id: 'theta', label: 'Launch Angle (θ)', min: 5, max: 85, step: 1, defaultValue: 45, unit: '°' },
        ]}
        compute={({ v0, theta }) => (v0 * v0 * Math.sin((2 * theta * Math.PI) / 180)) / 9.8}
        interpret={(vals) =>
          vals.theta === 45
            ? '45° gives the longest possible range for this launch speed.'
            : vals.theta < 45
            ? 'Below 45°, the shot is flatter and lands sooner — try pushing the angle toward 45° to go further.'
            : 'Above 45°, the shot goes higher but spends more time exposed to gravity pulling it down before it travels as far.'
        }
      />
    ),
  },
];

// ─── Challenge Yourself: H3 / calculus-based extension ─────────────────────────
export const PROJECTILE_CHALLENGE: ConceptSection[] = [
  {
    id: 'optimizing-range-with-derivatives',
    icon: '📐',
    title: 'Optimizing Range with Derivatives',
    body: [
      'You already know 45° maximizes range — but WHY 45° specifically, beyond "sin(2θ) peaks there"? Calculus gives a general tool for finding a maximum of any function: at the peak, its slope (derivative) is exactly zero, because the function is momentarily flat right before it turns around and starts decreasing.',
      'Treat range as a function of angle, R(θ) = (v₀²/g)sin(2θ), and differentiate with respect to θ using the chain rule: dR/dθ = (v₀²/g) · 2cos(2θ) = (2v₀²/g)cos(2θ). Setting this equal to zero: cos(2θ) = 0, which happens when 2θ = 90°, i.e. θ = 45°.',
      "This is the same technique used to optimize almost anything in physics and engineering — cost, energy, stress, range — find the derivative, set it to zero, solve for the variable.",
    ],
    formulaLatex: '\\dfrac{dR}{d\\theta} = \\dfrac{2v_0^2}{g}\\cos(2\\theta) = 0 \\quad\\Rightarrow\\quad \\theta = 45°',
    symbols: [
      { symbol: 'dR/dθ', meaning: 'The rate at which range changes as launch angle changes' },
    ],
  },
  {
    id: 'projectile-self-check',
    icon: '✅',
    title: 'Self-Check',
    body: [],
    interactive: (
      <RevealAnswer
        question="Differentiate R(θ) = (v₀²/g)sin(2θ) and confirm that θ = 45° is where dR/dθ = 0, not just a value that happens to maximize sin(2θ)."
        answer={
          <>
            <p>Using the chain rule on sin(2θ), the derivative of the inner function 2θ is 2, so:</p>
            <Katex latex={'\\dfrac{dR}{d\\theta} = \\dfrac{v_0^2}{g}\\cdot 2\\cos(2\\theta)'} displayMode />
            <p>Setting dR/dθ = 0 means cos(2θ) = 0 (since v₀²/g ≠ 0). cos is zero at 90°, so 2θ = 90°, giving <strong>θ = 45°</strong> — confirming the maximum algebraically rather than just reading it off a graph.</p>
          </>
        }
      />
    ),
  },
];
