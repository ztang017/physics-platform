import { type ConceptSection } from '../../components/concepts/ConceptNotes';
import { TryIt } from '../../components/concepts/TryIt';
import { RevealAnswer } from '../../components/concepts/RevealAnswer';
import { Katex } from '../../components/ui/Katex';

export const COLLISION_CONCEPTS: ConceptSection[] = [
  {
    id: 'what-is-momentum',
    icon: '🏋️',
    title: 'What Is Momentum?',
    body: [
      'Momentum (p = mv) combines how much mass is moving with how fast it\'s moving — roughly, "how hard something is to stop". A slow-moving truck and a fast-moving bicycle can carry similar momentum, even though their masses and speeds are wildly different — the truck compensates for less speed with vastly more mass.',
      "Momentum is a vector — it has a direction, inherited from velocity's direction. Two objects moving toward each other have momenta pointing OPPOSITE ways, which is why, in the formulas below, one object's velocity is often negative relative to the other.",
      "This one quantity is the key to solving collisions without needing to know anything about the (often complicated, hard-to-measure) forces involved during the impact itself.",
    ],
    formulaLatex: 'p = mv',
    symbols: [
      { symbol: 'p', meaning: 'Momentum', unit: 'kg·m/s' },
      { symbol: 'm', meaning: 'Mass of the object', unit: 'kg' },
      { symbol: 'v', meaning: 'Velocity of the object', unit: 'm/s' },
    ],
    interactive: (
      <TryIt
        resultLabel="Momentum (p)"
        resultUnit="kg·m/s"
        formulaLatex="p = mv"
        variables={[
          { id: 'mass', label: 'Mass (m)', min: 1, max: 20, step: 1, defaultValue: 3, unit: 'kg' },
          { id: 'v', label: 'Velocity (v)', min: -15, max: 15, step: 0.5, defaultValue: 5, unit: 'm/s' },
        ]}
        compute={({ mass, v }) => mass * v}
        interpret={({ mass, v }, result) =>
          result === 0
            ? "Zero mass or zero velocity means there's nothing to stop."
            : `A ${mass} kg object at ${v} m/s takes the same effort to stop as, say, a ${Math.max(1, Math.round(mass * 3))} kg object moving at ${(v / 3).toFixed(1)} m/s — same momentum, different combinations of mass and speed.`
        }
      />
    ),
  },
  {
    id: 'conservation-of-momentum',
    icon: '⚖️',
    title: 'Conservation of Momentum',
    body: [
      'In a system with no outside forces acting on it — like two carts colliding on a frictionless track — the TOTAL momentum before a collision always equals the total momentum after. No exceptions, and it doesn\'t matter how violent, bouncy, or messy the collision is. Momentum can move between objects, but the system\'s total never changes.',
      "Think of it like a closed bank account shared between two people: money can move from one person's wallet to the other's during a \"transaction\" (the collision), but the total amount in the account stays exactly the same, no matter how the money gets split during the transfer.",
      "This law follows directly from Newton's Third Law: whatever force cart 1 exerts on cart 2 during impact, cart 2 exerts an exactly equal and opposite force back on cart 1, for exactly the same duration. Those two impulses (force × time) are equal and opposite, so they cancel out perfectly when you add up the whole system's momentum.",
    ],
    formulaLatex: 'm_1 v_{1i} + m_2 v_{2i} \\;=\\; m_1 v_{1f} + m_2 v_{2f}',
    symbols: [
      { symbol: 'm_1, m_2', meaning: 'Masses of cart 1 and cart 2', unit: 'kg' },
      { symbol: 'v_{1i}, v_{2i}', meaning: 'Initial (before-collision) velocities', unit: 'm/s' },
      { symbol: 'v_{1f}, v_{2f}', meaning: 'Final (after-collision) velocities', unit: 'm/s' },
    ],
  },
  {
    id: 'elastic-vs-inelastic',
    icon: '💥',
    title: 'Elastic vs. Inelastic Collisions',
    body: [
      'Momentum is ALWAYS conserved in a collision — that part never changes. Kinetic energy (½mv², the energy of motion) is a different story: in a perfectly ELASTIC collision, like two billiard balls or two hard steel balls, kinetic energy is ALSO conserved — none of it is lost to other forms.',
      'In an INELASTIC collision, like a car crash or a ball of clay hitting the floor, some kinetic energy converts into heat, sound, and permanent deformation of the materials. The objects may even stick together afterward and move as one combined mass — that extreme case is called a perfectly inelastic collision, and it\'s where the MOST kinetic energy possible is lost while still conserving momentum.',
      'Real-world collisions almost always fall somewhere between these two extremes — a small amount of energy is nearly always lost as heat and sound, even in a "bouncy" collision that looks fairly elastic.',
    ],
  },
  {
    id: 'coefficient-of-restitution',
    icon: '🏀',
    title: 'Coefficient of Restitution',
    body: [
      'The coefficient of restitution (e) measures how "bouncy" a collision is, on a scale from 0 (perfectly inelastic — objects stick together, zero separation afterward) to 1 (perfectly elastic — no kinetic energy lost). It\'s defined as the ratio of how fast the two objects separate from each other after the collision to how fast they approached each other before it.',
      "A basketball dropped on concrete has e close to 0.75–0.85 (it bounces back to most, but not all, of its drop height); a ball of wet clay dropped on the floor has e ≈ 0 (it just stops). This single number lets you solve for both final velocities without knowing anything about the material properties or the details of the impact.",
    ],
    formulaLatex: 'e = \\dfrac{v_{2f} - v_{1f}}{v_{1i} - v_{2i}}',
    formulaCaption: 'Separation speed after impact, divided by approach speed before impact.',
    symbols: [
      { symbol: 'e', meaning: 'Coefficient of restitution (0 = stick together, 1 = perfectly bouncy)' },
      { symbol: 'v_{1i}, v_{2i}', meaning: 'Velocities before the collision', unit: 'm/s' },
      { symbol: 'v_{1f}, v_{2f}', meaning: 'Velocities after the collision', unit: 'm/s' },
    ],
  },
];

// ─── Challenge Yourself: H3 / calculus-based extension ─────────────────────────
export const COLLISION_CHALLENGE: ConceptSection[] = [
  {
    id: 'impulse-as-integral',
    icon: '∫',
    title: 'Impulse as an Integral',
    body: [
      "The algebra-based module treats collisions as instantaneous — velocities just change. In reality, the force between two colliding objects isn't constant: it rises sharply as they compress into each other, peaks, then falls back to zero as they separate, all within a tiny fraction of a second.",
      "The total effect of that changing force is called impulse, J — and since force varies with time, impulse is the AREA UNDER the force-time graph, which is exactly what a definite integral computes: J = ∫F(t)dt. Crucially, impulse always equals the resulting change in momentum, Δp, no matter what shape the force curve takes.",
      "This is why airbags and crumple zones work: they don't change Δp (that's fixed by the crash) — they stretch out the collision TIME, which lowers the PEAK force needed to deliver the same impulse, since the same area under the curve can be a tall narrow spike or a shorter, wider hump.",
    ],
    formulaLatex: 'J = \\int F(t)\\,dt = \\Delta p',
    symbols: [
      { symbol: 'J', meaning: 'Impulse — the area under the force-time graph', unit: 'N·s' },
      { symbol: '∫F(t)dt', meaning: 'The integral of force over the duration of contact' },
    ],
    interactive: (
      <TryIt
        resultLabel="Impulse (triangular force pulse)"
        resultUnit="N·s"
        formulaLatex={'J = \\tfrac{1}{2}F_{peak}\\Delta t'}
        variables={[
          { id: 'fpeak', label: 'Peak force', min: 50, max: 500, step: 10, defaultValue: 200, unit: 'N' },
          { id: 'dt', label: 'Contact duration', min: 0.005, max: 0.05, step: 0.005, defaultValue: 0.02, unit: 's' },
        ]}
        compute={({ fpeak, dt }) => 0.5 * fpeak * dt}
        interpret={({ fpeak, dt }, result) =>
          `A force rising to ${fpeak}N and back down over ${dt.toFixed(3)}s (a triangular pulse) delivers the same impulse as a constant ${(result / dt).toFixed(0)}N applied for the same time — stretching Δt while keeping J fixed is exactly how crumple zones lower peak force.`
        }
      />
    ),
  },
  {
    id: 'collision-self-check',
    icon: '✅',
    title: 'Self-Check',
    body: [],
    interactive: (
      <RevealAnswer
        question="A 0.4 kg ball experiences a force that rises linearly from 0 to 200 N over 0.01 s, then falls back to 0 over another 0.01 s (a triangular pulse). Find the impulse and the resulting change in velocity."
        answer={
          <>
            <p>The area under a triangular force-time graph is J = ½ × base × height = ½ × (0.02 s) × (200 N).</p>
            <Katex latex={'J = \\tfrac{1}{2}(0.02)(200) = 2\\ \\text{N·s}'} displayMode />
            <p>Since J = Δp = mΔv, rearranging gives Δv = J/m = 2 / 0.4 = <strong>5 m/s</strong> — found without ever needing to know the exact shape of the force curve, only the area underneath it.</p>
          </>
        }
      />
    ),
  },
];
