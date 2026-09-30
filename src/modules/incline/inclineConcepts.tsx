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
    id: 'normal-force-stacking',
    icon: '📦',
    title: 'Normal Force in a Stack',
    body: [
      "N = mg only tells the whole story when a single object sits directly on the ground with nothing else involved. As soon as objects are STACKED — a box on a box, a book on a box on a table — each surface only has to react to whatever is ACTUALLY pressing on it, not automatically 'the whole weight'.",
      "The trick is to work from the TOP down. Isolate the topmost object by itself: the only thing touching it from below is the object right underneath, so that contact force has to equal just the top object's own weight — nothing more. Move down one level, and THAT surface now supports everything above it: the object directly on it, plus everything that object is itself holding up.",
      "This is why the table under a stack of boxes has to push back with the COMBINED weight of everything above it, even though no single box between the table and the top one 'feels' that whole total directly — the load simply passes down, one contact force at a time, growing by one box's weight at each level.",
    ],
    interactive: (
      <TryIt
        resultLabel="Normal force the table exerts on the bottom box"
        resultUnit="N"
        formulaLatex={'N_{table} = (m_{top} + m_{bottom})\\,g'}
        variables={[
          { id: 'topMass', label: 'Top box mass', min: 1, max: 10, step: 1, defaultValue: 3, unit: 'kg' },
          { id: 'bottomMass', label: 'Bottom box mass', min: 1, max: 15, step: 1, defaultValue: 5, unit: 'kg' },
        ]}
        compute={({ topMass, bottomMass }) => (topMass + bottomMass) * 10}
        interpret={({ topMass }, result) =>
          `The table pushes up on the bottom box with ${result.toFixed(0)} N — the COMBINED weight. But the bottom box only has to push up on the top box with ${(topMass * 10).toFixed(0)} N, since that's all that's actually resting on it.`
        }
      />
    ),
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
  {
    id: 'accelerating-reference-frames',
    icon: '🛗',
    title: 'Accelerating Reference Frames: The Elevator Effect',
    body: [
      "Every normal-force calculation so far assumed the ground underneath is NOT accelerating. Stand on a scale inside an accelerating elevator, though, and the reading changes — even though your actual weight (mg) hasn't changed at all. The scale is reporting the NORMAL FORCE, and that depends on your acceleration too, not just gravity.",
      "Apply Newton's Second Law to you alone, taking 'up' as positive: N − mg = ma, where a is the elevator's acceleration (positive if accelerating upward, negative if accelerating downward). Solving for N gives N = m(g + a) — heavier than your resting weight when accelerating upward, lighter when accelerating downward.",
      "A useful shortcut: treat it as if gravity were temporarily a different, 'effective' value, g_eff = g + a. Every formula you already know for a stationary incline or floor still works — just substitute g_eff wherever you'd normally use g. This is why a downward-accelerating elevator makes a block on a frictionless incline inside it slide SLOWER than it would sitting still: the effective gravity pulling it down the slope has temporarily shrunk.",
    ],
    formulaLatex: 'N = m(g + a) \\qquad\\qquad g_{eff} = g + a',
    symbols: [
      { symbol: 'N', meaning: 'Normal force (what a scale would read)', unit: 'N' },
      { symbol: 'a', meaning: "The elevator's acceleration (positive = upward, negative = downward)", unit: 'm/s²' },
      { symbol: 'g_{eff}', meaning: 'Effective gravity felt inside the accelerating elevator' },
    ],
    interactive: (
      <TryIt
        resultLabel="Scale reading (normal force)"
        resultUnit="N"
        formulaLatex={'N = m(g + a)'}
        variables={[
          { id: 'mass', label: 'Person\'s mass', min: 30, max: 100, step: 5, defaultValue: 60, unit: 'kg' },
          { id: 'elevatorAccel', label: 'Elevator acceleration (+ up / − down)', min: -5, max: 5, step: 0.5, defaultValue: 2, unit: 'm/s²' },
        ]}
        compute={({ mass, elevatorAccel }) => mass * (10 + elevatorAccel)}
        interpret={({ mass, elevatorAccel }, result) =>
          `Resting weight would read ${(mass * 10).toFixed(0)} N. With the elevator accelerating at ${elevatorAccel} m/s², the scale instead reads ${result.toFixed(0)} N — ${elevatorAccel > 0 ? 'heavier, since the elevator is speeding up going up (or slowing down going down)' : elevatorAccel < 0 ? 'lighter, since the elevator is speeding up going down (or slowing down going up)' : 'unchanged, since there is no acceleration'}.`
        }
      />
    ),
  },
  {
    id: 'contact-forces',
    icon: '🧱',
    title: 'Contact Forces Between Pushed Objects',
    body: [
      "Blocks don't need a slope to require a careful free-body diagram. Push two blocks that are touching each other, and the block in FRONT only feels a contact push from the block BEHIND it — nothing else is touching it horizontally. That single contact force is entirely what accelerates the front block, by Newton's Second Law applied to it alone.",
      "The trick to these problems: first treat the touching objects as ONE combined system to find their shared acceleration, using F = ma with the TOTAL mass. Then isolate just ONE of the objects — usually the one with only a single force acting on it — and apply F = ma to it individually. The only unknown left in that equation is the contact force itself.",
      "Newton's Third Law then guarantees the force the front block pushes back on the block behind it is exactly equal and opposite — same size, opposite direction, no matter what the two masses are.",
    ],
    formulaLatex: 'a = \\dfrac{F}{m_1+m_2} \\qquad\\qquad F_{contact} = m_2 a',
    symbols: [
      { symbol: 'F', meaning: 'The single external push applied to the front block', unit: 'N' },
      { symbol: 'm_1, m_2', meaning: 'Mass of the pushed (front) block and the block behind it', unit: 'kg' },
      { symbol: 'F_{contact}', meaning: "The contact force transmitted to the block being pushed from behind", unit: 'N' },
    ],
    interactive: (
      <TryIt
        resultLabel="Contact force on the back block"
        resultUnit="N"
        formulaLatex={'F_{contact} = F \\cdot \\dfrac{m_2}{m_1+m_2}'}
        variables={[
          { id: 'appliedForce', label: 'Applied force (F)', min: 10, max: 100, step: 5, defaultValue: 50, unit: 'N' },
          { id: 'm1', label: 'Front block mass (m₁)', min: 1, max: 10, step: 1, defaultValue: 4, unit: 'kg' },
          { id: 'm2', label: 'Back block mass (m₂)', min: 1, max: 10, step: 1, defaultValue: 6, unit: 'kg' },
        ]}
        compute={({ appliedForce, m1, m2 }) => (appliedForce * m2) / (m1 + m2)}
        interpret={({ appliedForce, m1, m2 }, result) =>
          `The whole system accelerates at ${(appliedForce / (m1 + m2)).toFixed(2)} m/s². Only ${result.toFixed(1)} N of the ${appliedForce} N push actually reaches the back block — the rest (${(appliedForce - result).toFixed(1)} N) goes into accelerating the front block itself.`
        }
      />
    ),
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
