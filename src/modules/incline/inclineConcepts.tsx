import { type ConceptSection } from '../../components/concepts/ConceptNotes';
import { TryIt } from '../../components/concepts/TryIt';
import { RevealAnswer } from '../../components/concepts/RevealAnswer';
import { Katex } from '../../components/ui/Katex';

export const INCLINE_CONCEPTS: ConceptSection[] = [
  {
    id: 'normal-force',
    icon: '👉',
    title: 'What Is the Normal Force?',
    body: [
      'When two surfaces touch, they push against each other — this is the normal force (N), and it always points perpendicular ("normal" in the geometric, right-angle sense — not "ordinary") to the surface, never along it.',
      "Crucially, a surface can only PUSH, never pull. That's why the normal force always points away from the surface, into whatever is resting on it. Squeeze a spring between your hands and you'll feel exactly this: a push straight back at you along the direction you're compressing it, never a sideways drag.",
      "On a FLAT floor, the normal force simply balances weight, so N = mg and nobody thinks twice about it. The interesting physics on a slope is that the surface is tilted, so N is no longer straight up — it tilts WITH the ramp, and only cancels the part of gravity that presses directly into it (see the next section).",
    ],
    formulaLatex: 'N = mg\\cos\\theta \\quad \\text{(on an incline)}',
    symbols: [
      { symbol: 'N', meaning: 'Normal force — the surface pushing back', unit: 'N' },
      { symbol: 'm', meaning: 'Mass of the object', unit: 'kg' },
      { symbol: 'g', meaning: 'Gravitational acceleration', unit: 'm/s²' },
      { symbol: 'θ', meaning: 'Incline angle from the horizontal', unit: 'degrees' },
    ],
  },
  {
    id: 'decomposing-gravity',
    icon: '📐',
    title: 'Decomposing Gravity on a Slope',
    body: [
      "Weight (mg) always points straight down toward the center of the Earth — the incline's tilt doesn't change that. But it's often far more useful to split that single downward force into two perpendicular pieces relative to the SLOPE'S OWN orientation: one pressing directly INTO the surface, and one pulling the object DOWN along the slope.",
      "This is the exact same 'launch velocity into components' trick used in the Projectile module, just applied to a force instead of a velocity: cosine gives the piece perpendicular to the surface, sine gives the piece parallel to it — because θ is the angle between the incline and the horizontal ground.",
      'As the incline gets steeper (θ increases), sin θ grows and cos θ shrinks — so more of gravity acts along the slope (pulling the block down) and less presses into the surface. That\'s the mathematical reason steep ramps make things slide faster, and near-flat ramps barely move them at all: at θ = 0° there is no "down the slope" at all, and at θ = 90° the entire weight acts along the (now vertical) surface.',
    ],
    formulaLatex: 'W_\\parallel = mg\\sin\\theta \\qquad W_\\perp = mg\\cos\\theta',
    symbols: [
      { symbol: 'W_\\parallel', meaning: 'Weight component parallel to the slope (pulls it down the ramp)', unit: 'N' },
      { symbol: 'W_\\perp', meaning: 'Weight component perpendicular to the slope (presses into it)', unit: 'N' },
      { symbol: 'm', meaning: 'Mass of the block', unit: 'kg' },
      { symbol: 'g', meaning: 'Gravitational acceleration', unit: 'm/s²' },
      { symbol: 'θ', meaning: 'Incline angle from the horizontal', unit: 'degrees' },
    ],
    interactive: (
      <TryIt
        resultLabel="Component pulling down the slope"
        resultUnit="N"
        formulaLatex={'W_\\parallel = mg\\sin\\theta'}
        variables={[
          { id: 'mass', label: 'Mass (m)', min: 1, max: 20, step: 1, defaultValue: 5, unit: 'kg' },
          { id: 'theta', label: 'Incline Angle (θ)', min: 5, max: 85, step: 1, defaultValue: 30, unit: '°' },
        ]}
        compute={({ mass, theta }) => mass * 9.8 * Math.sin((theta * Math.PI) / 180)}
        interpret={({ mass, theta }) =>
          `At ${theta}°, the surface only has to push back with ${(mass * 9.8 * Math.cos((theta * Math.PI) / 180)).toFixed(1)} N to support the block — the rest of gravity pulls it along the slope.`
        }
      />
    ),
  },
  {
    id: 'static-vs-kinetic-friction',
    icon: '🧲',
    title: 'Static vs. Kinetic Friction',
    body: [
      "Friction resists sliding between two surfaces, and comes from microscopic roughness and molecular attraction between them, even on surfaces that feel smooth. Static friction acts on objects that aren't yet moving relative to each other, and automatically adjusts its strength — from zero up to a maximum — to prevent sliding, exactly like a helper matching whatever push you apply, until it can't keep up any more.",
      "Kinetic friction takes over once the object IS sliding, and is usually a bit SMALLER than the maximum static friction — which is why it typically takes more force to get something moving from rest than to keep it moving once it's already sliding.",
      'Both depend on the normal force N (more force pressing surfaces together means more friction) and a coefficient (μ, the Greek letter "mu") that captures how rough or slippery the specific pair of materials is — rubber on dry concrete has a high μ; steel on ice has a very low one. The coefficient does NOT depend on the size of the contact area, which is why this simple model works surprisingly well.',
      'If the force trying to cause sliding (here, the down-slope pull of gravity, mg sin θ) exceeds the maximum static friction, the object starts to slide, and kinetic friction takes over.',
    ],
    formulaLatex: 'f_{s,max} = \\mu_s N \\qquad\\qquad f_k = \\mu_k N',
    symbols: [
      { symbol: 'f_{s,max}', meaning: 'Maximum static friction before sliding begins', unit: 'N' },
      { symbol: 'f_k', meaning: 'Kinetic friction, once sliding', unit: 'N' },
      { symbol: 'μ_s', meaning: 'Coefficient of static friction (depends on the two materials)' },
      { symbol: 'μ_k', meaning: 'Coefficient of kinetic friction (usually slightly less than μ_s)' },
      { symbol: 'N', meaning: 'Normal force pressing the surfaces together', unit: 'N' },
    ],
  },
  {
    id: 'critical-angle',
    icon: '📏',
    title: 'The Critical Angle',
    body: [
      'As you tilt a ramp higher, at some angle the block just barely starts to slip. At that exact critical angle, the force pulling it down the slope (mg sin θ) exactly equals the maximum static friction holding it in place (μₛ mg cos θ).',
      "Setting those equal and canceling mg from both sides leaves sin θ / cos θ = μₛ — and sin/cos is exactly the definition of tangent, giving a beautifully simple result: tan θ_critical = μₛ. Notice mass completely cancels out: a heavy block and a light block made of the SAME material slip at exactly the same angle.",
      "This gives a simple real experiment for measuring a surface's coefficient of static friction without any force sensors at all: place an object on the material, slowly tilt it, note the angle at which it just starts to slide, and take the tangent of that angle.",
    ],
    formulaLatex: '\\tan\\theta_{critical} = \\mu_s',
    symbols: [
      { symbol: 'θ_{critical}', meaning: 'The tilt angle at which sliding just begins', unit: 'degrees' },
      { symbol: 'μ_s', meaning: 'Coefficient of static friction of the surface pair' },
    ],
  },
];

// ─── Challenge Yourself: H3 / calculus-based extension ─────────────────────────
export const INCLINE_CHALLENGE: ConceptSection[] = [
  {
    id: 'newtons-second-law-as-ode',
    icon: '📐',
    title: "Newton's Second Law as a Differential Equation",
    body: [
      "F = ma looks like simple algebra, but a is really a derivative — a = d²x/dt² — which makes Newton's Second Law a DIFFERENTIAL EQUATION: it relates a function (position) to its own second derivative. Solving 'the motion' really means solving this equation for x(t).",
      "On the incline, once you know the block is sliding, the net force along the slope is constant: F_net = mg sinθ − μₖmg cosθ. Since F_net = ma and this is constant, a is constant too, so m(d²x/dt²) = mg sinθ − μₖmg cosθ, giving a single constant value of a.",
      'Integrating this ODE twice — exactly like the Kinematics module\'s calculus section — recovers the familiar x(t) = x₀ + v₀t + ½at². The genuinely new idea here isn\'t the integration itself; it\'s recognizing that "the forces determine a constant acceleration" is what justifies solving it this way in the first place.',
    ],
    formulaLatex: 'm\\dfrac{d^2x}{dt^2} = mg\\sin\\theta - \\mu_k mg\\cos\\theta',
    symbols: [
      { symbol: 'd²x/dt²', meaning: 'Acceleration, written as the second derivative of position along the slope' },
    ],
  },
  {
    id: 'incline-self-check',
    icon: '✅',
    title: 'Self-Check',
    body: [],
    interactive: (
      <RevealAnswer
        question="A block slides from rest down a slope with constant acceleration a = 2 m/s² (found from solving the ODE above). Integrating twice, how far has it traveled after t = 3 s?"
        answer={
          <>
            <p>Integrate a once: v(t) = ∫2 dt = 2t + C₁. Starting from rest, v(0) = 0, so C₁ = 0, giving v(t) = 2t.</p>
            <p>Integrate again: x(t) = ∫2t dt = t² + C₂. Starting at x(0) = 0, C₂ = 0, giving x(t) = t².</p>
            <Katex latex={'x(t) = t^2'} displayMode />
            <p>At t = 3 s: x(3) = 3² = <strong>9 m</strong> — matching the familiar x = ½at² = ½(2)(9) = 9 m from the algebra-based formula.</p>
          </>
        }
      />
    ),
  },
];
