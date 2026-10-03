import { type ConceptSection } from '../../components/concepts/ConceptNotes';
import { TryIt } from '../../components/concepts/TryIt';
import { RevealAnswer } from '../../components/concepts/RevealAnswer';
import { Katex } from '../../components/ui/Katex';

export const COLLISION_CONCEPTS: ConceptSection[] = [
  {
    id: 'what-is-momentum',
    icon: '🏋️',
    title: 'What Is Momentum?',
    summary: 'Momentum is mass times velocity. It tells you how hard something is to stop.',
    body: [
      "Momentum, p = mv, combines how much mass is moving with how fast it is moving. Roughly, it tells you how hard something is to stop. A slow truck and a fast bicycle can have similar momentum, because the truck makes up for its low speed with a huge mass.",
      "Momentum has a direction, the same as the direction of the velocity. Two carts heading toward each other have momenta pointing in opposite directions. That is why one of the velocities gets a minus sign in the formulas.",
      "Why do we care? Because momentum lets you solve a collision without knowing anything about the complicated forces during the crash itself.",
    ],
    watchOut: 'Momentum has a sign. If moving right counts as positive, then moving left is negative. Keep the signs when you add momenta.',
    formulaLatex: 'p = mv',
    symbols: [
      { symbol: 'p', meaning: 'Momentum', unit: 'kg·m/s' },
      { symbol: 'm', meaning: 'Mass of the object', unit: 'kg' },
      { symbol: 'v', meaning: 'Velocity of the object (with a sign for direction)', unit: 'm/s' },
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
            ? 'Zero mass or zero velocity means zero momentum: there is nothing to stop.'
            : `A ${mass * 2} kg object would need to move at ${(v / 2).toFixed(1)} m/s to have the same momentum. Double the mass, half the speed: same momentum.`
        }
      />
    ),
  },
  {
    id: 'conservation-of-momentum',
    icon: '⚖️',
    title: 'Conservation of Momentum',
    summary: 'In a collision, the total momentum before equals the total momentum after. Always.',
    body: [
      "If no outside forces act on the carts (two carts on a smooth, level track, for example), the TOTAL momentum before a collision equals the total momentum afterwards. There are no exceptions, however violent or bouncy the crash is. Momentum can move from one cart to the other, but the total never changes.",
      "Think of a bank account shared by two people. Money can move from one wallet to the other during a transaction, but the total in the account stays the same.",
      "Why does this work? Newton's third law. During the crash, cart 1 pushes cart 2 with some force. Cart 2 pushes back on cart 1 with a force of the same size, for the same short time. Force × time is called impulse, and an impulse changes momentum. The two impulses are equal and opposite, so one cart's gain is exactly the other cart's loss.",
    ],
    watchOut: 'Add momenta with their signs, not as plain numbers. A cart moving left carries negative momentum.',
    formulaLatex: 'm_1 v_{1i} + m_2 v_{2i} \\;=\\; m_1 v_{1f} + m_2 v_{2f}',
    symbols: [
      { symbol: 'm_1, m_2', meaning: 'Masses of cart 1 and cart 2', unit: 'kg' },
      { symbol: 'v_{1i}, v_{2i}', meaning: 'Velocities before the collision (the i is for initial)', unit: 'm/s' },
      { symbol: 'v_{1f}, v_{2f}', meaning: 'Velocities after the collision (the f is for final)', unit: 'm/s' },
    ],
  },
  {
    id: 'elastic-vs-inelastic',
    icon: '💥',
    title: 'Elastic vs. Inelastic Collisions',
    summary: 'Momentum is always conserved. Kinetic energy is conserved only in a perfectly elastic (bouncy) collision.',
    body: [
      "Momentum is ALWAYS conserved in a collision. Kinetic energy (½mv², the energy of motion) is different. In a perfectly ELASTIC collision, like two steel balls, no kinetic energy is lost at all.",
      "In an INELASTIC collision, like a car crash or clay hitting the floor, some kinetic energy turns into heat, sound and dents. If the objects stick together and move off as one, that is a perfectly inelastic collision. It loses the MOST kinetic energy possible, while momentum is still conserved.",
      "Real collisions fall in between. Even a very bouncy one wastes a little energy as heat and sound.",
      "One special case is worth remembering. Two EQUAL masses in a perfectly elastic head-on collision swap velocities: the mover stops dead and the other one takes off at the first one's speed. Line up several equal masses and the swap repeats down the line. That is a Newton's cradle.",
    ],
    watchOut: "'Inelastic' does not mean momentum is lost. Only kinetic energy is lost. Momentum is conserved in every collision.",
    formulaLatex: 'v_{final} = \\dfrac{m_1 v_1 + m_2 v_2}{m_1 + m_2} \\quad \\text{(if they stick together)}',
    symbols: [
      { symbol: 'v_{final}', meaning: 'The shared velocity of the two carts after they stick together', unit: 'm/s' },
    ],
    interactive: (
      <TryIt
        resultLabel="Speed of the two carts after sticking together"
        resultUnit="m/s"
        formulaLatex={'v_{final} = \\dfrac{m_1 v_1}{m_1 + m_2} \\quad (\\text{cart 2 starts at rest})'}
        variables={[
          { id: 'stickM1', label: 'Moving cart mass (m₁)', min: 1, max: 10, step: 1, defaultValue: 2, unit: 'kg' },
          { id: 'stickV1', label: 'Moving cart velocity (v₁)', min: 1, max: 10, step: 1, defaultValue: 6, unit: 'm/s' },
          { id: 'stickM2', label: 'Resting cart mass (m₂)', min: 1, max: 10, step: 1, defaultValue: 4, unit: 'kg' },
        ]}
        compute={({ stickM1, stickV1, stickM2 }) => (stickM1 * stickV1) / (stickM1 + stickM2)}
        interpret={({ stickM1, stickV1, stickM2 }, result) => {
          const keBefore = 0.5 * stickM1 * stickV1 ** 2;
          const keAfter = 0.5 * (stickM1 + stickM2) * result ** 2;
          return `Momentum before and after is ${(stickM1 * stickV1).toFixed(1)} kg·m/s. But kinetic energy drops from ${keBefore.toFixed(1)} J to ${keAfter.toFixed(1)} J: ${(keBefore - keAfter).toFixed(1)} J became heat, sound and dents.`;
        }}
      />
    ),
  },
  {
    id: 'coefficient-of-restitution',
    icon: '🏀',
    title: 'Coefficient of Restitution (Bounciness)',
    summary: 'The number e measures bounciness: e = 0 means the carts stick together, e = 1 means a perfect bounce.',
    body: [
      "The coefficient of restitution, e, measures how bouncy a collision is. It is the speed at which the objects move APART after the collision, divided by the speed at which they moved TOWARD each other before it.",
      "So e = 0 means they do not separate at all: they stick together. And e = 1 means they separate as fast as they came together: a perfect bounce, with no kinetic energy lost.",
      "A basketball dropped on concrete has e of about 0.8. A lump of wet clay has e of about 0. Together with conservation of momentum, e gives you both final velocities, without knowing anything about the materials.",
    ],
    watchOut: "Subtract in the order shown in the formula: 'cart 2 minus cart 1' on top (after the collision) and 'cart 1 minus cart 2' underneath (before it). The signs then make e come out positive.",
    formulaLatex: 'e = \\dfrac{v_{2f} - v_{1f}}{v_{1i} - v_{2i}}',
    formulaCaption: 'Speed of separation after the impact, divided by the speed of approach before it.',
    symbols: [
      { symbol: 'e', meaning: 'Coefficient of restitution (0 = stick together, 1 = perfectly bouncy)' },
      { symbol: 'v_{1i}, v_{2i}', meaning: 'Velocities before the collision', unit: 'm/s' },
      { symbol: 'v_{1f}, v_{2f}', meaning: 'Velocities after the collision', unit: 'm/s' },
    ],
  },
  {
    id: 'momentum-and-energy-together',
    icon: '🤝',
    title: 'Momentum and Energy Together',
    summary: 'When things push themselves apart, momentum tells you the ratio of their speeds and energy tells you the actual speeds.',
    body: [
      "Some systems start at rest and then push themselves apart. Examples are two carts released from a squashed spring, a person stepping off a boat, or a block sliding down a wedge that can itself slide. Nothing outside pushes sideways, so the total momentum stays at zero. Whatever momentum one part gains, the other gains the opposite amount.",
      "That gives one equation linking the two velocities: m₁v₁ + m₂v₂ = 0. The lighter object always ends up moving faster, in proportion to the mass ratio. But it does not tell you the actual speeds. For that you need the second conservation law, energy: the energy released (spring energy, or height lost) becomes the kinetic energy of BOTH parts together.",
      "The recipe: use momentum to find the second object's speed from the first, then use energy with BOTH kinetic energies included.",
    ],
    watchOut: 'The classic mistake is to count only the fast, light object\'s kinetic energy and forget that the heavy, slow one has some too.',
    formulaLatex: 'm_1v_1 + m_2v_2 = 0 \\qquad\\qquad m_1 g h = \\tfrac{1}{2}m_1v_1^2 + \\tfrac{1}{2}m_2v_2^2',
    symbols: [
      { symbol: 'm_1, v_1', meaning: 'Mass and final speed of the block', unit: 'kg, m/s' },
      { symbol: 'm_2, v_2', meaning: 'Mass and final speed of the wedge (it recoils the other way)', unit: 'kg, m/s' },
      { symbol: 'h', meaning: 'Height the block slides down', unit: 'm' },
    ],
    interactive: (
      <TryIt
        resultLabel="Height of the wedge"
        resultUnit="m"
        formulaLatex={'h = \\dfrac{\\tfrac{1}{2}m v^2 + \\tfrac{1}{2}MV^2}{mg} \\quad\\text{with}\\quad V = \\dfrac{mv}{M}'}
        variables={[
          { id: 'wedgeBlockMass', label: 'Block mass (m)', min: 0.1, max: 2, step: 0.1, defaultValue: 0.5, unit: 'kg' },
          { id: 'wedgeMass', label: 'Wedge mass (M)', min: 1, max: 10, step: 0.5, defaultValue: 3, unit: 'kg' },
          { id: 'wedgeSpeed', label: 'Block speed leaving the wedge (v)', min: 1, max: 8, step: 0.5, defaultValue: 4, unit: 'm/s' },
        ]}
        compute={({ wedgeBlockMass, wedgeMass, wedgeSpeed }) => {
          const wedgeRecoil = (wedgeBlockMass * wedgeSpeed) / wedgeMass;
          return (0.5 * wedgeBlockMass * wedgeSpeed ** 2 + 0.5 * wedgeMass * wedgeRecoil ** 2) / (wedgeBlockMass * 9.8);
        }}
        interpret={({ wedgeBlockMass, wedgeMass, wedgeSpeed }) =>
          `The wedge recoils at ${((wedgeBlockMass * wedgeSpeed) / wedgeMass).toFixed(2)} m/s. Counting only the block's kinetic energy would give ${(wedgeSpeed ** 2 / (2 * 9.8)).toFixed(2)} m, which is too low, because part of the released energy moves the wedge.`
        }
      />
    ),
  },
  {
    id: 'center-of-mass-invariance',
    icon: '🛶',
    title: "The Centre of Mass Doesn't Move Without an Outside Push",
    summary: 'If nothing pushes the system from outside, its centre of mass stays put, whatever the parts inside do to each other.',
    body: [
      "The centre of mass is the average position of all the mass in a system, where heavier parts count for more. If nothing pushes the system sideways from outside, its centre of mass cannot shift sideways at all, no matter what the parts do to each other. This works even when nothing looks like a collision.",
      "Classic example: a person walks across a boat floating on calm water. With every step the person pushes backward on the boat, and the boat pushes forward on the person (Newton's third law). As the person moves one way, the boat drifts the OTHER way, by just enough to keep the shared centre of mass in the same place.",
      "This is momentum conservation again, applied to position. The total momentum starts at zero and stays zero, so the centre of mass never gets any velocity, and so never moves.",
    ],
    formulaLatex: '\\Delta x_{boat} = -\\dfrac{m_{person}}{m_{person}+m_{boat}}\\, d',
    symbols: [
      { symbol: 'Δx_{boat}', meaning: "The boat's movement relative to the water (opposite to the person's walk)", unit: 'm' },
      { symbol: 'd', meaning: "How far the person walks along the boat's deck, relative to the boat", unit: 'm' },
    ],
    interactive: (
      <TryIt
        resultLabel="How far the boat drifts (opposite to the walk)"
        resultUnit="m"
        formulaLatex={'|\\Delta x_{boat}| = \\dfrac{m_{person}}{m_{person}+m_{boat}}\\,d'}
        variables={[
          { id: 'personMass', label: 'Person mass', min: 30, max: 100, step: 5, defaultValue: 60, unit: 'kg' },
          { id: 'boatMass', label: 'Boat mass', min: 10, max: 100, step: 5, defaultValue: 40, unit: 'kg' },
          { id: 'walkDist', label: 'Distance walked (relative to the boat)', min: 0.5, max: 5, step: 0.5, defaultValue: 2, unit: 'm' },
        ]}
        compute={({ personMass, boatMass, walkDist }) => (personMass * walkDist) / (personMass + boatMass)}
        interpret={({ personMass, boatMass }, result) =>
          `The heavier the person is compared with the boat, the further the boat recoils. Here a ${personMass} kg person on a ${boatMass} kg boat makes it drift ${result.toFixed(2)} m the other way.`
        }
      />
    ),
  },
  {
    id: 'momentum-2d',
    icon: '🧭',
    title: 'Momentum in Two Dimensions',
    summary: 'In a collision that is not head-on, conserve momentum separately in the x-direction and in the y-direction.',
    body: [
      "So far every collision has been head-on, along one line. Real collisions, like two billiard balls meeting off-centre, usually send things off at angles. The good news is that nothing new is needed. Momentum is conserved SEPARATELY in the x-direction and in the y-direction, like two independent sets of accounts that each have to balance.",
      "The method: split every velocity into an x-part and a y-part (the same splitting you did for launch velocities in Module 2). Add up all the x-momentum before the collision. It must equal all the x-momentum after, whatever is happening in the y-direction. Then do the same for y.",
      "This is powerful when one object starts with ALL its momentum along one axis and none along the other. Any y-momentum one object gains must be cancelled by the other, because the y-total started at zero and has to stay at zero.",
    ],
    formulaLatex: '\\sum p_x \\text{ (before)} = \\sum p_x \\text{ (after)} \\qquad \\sum p_y \\text{ (before)} = \\sum p_y \\text{ (after)}',
    symbols: [
      { symbol: 'p_x', meaning: 'The x-part of the momentum, tracked separately from y', unit: 'kg·m/s' },
      { symbol: 'p_y', meaning: 'The y-part of the momentum, tracked separately from x', unit: 'kg·m/s' },
    ],
  },
];

// ─── Challenge Yourself: H3 / calculus-based extension ─────────────────────────
export const COLLISION_CHALLENGE: ConceptSection[] = [
  {
    id: 'impulse-as-integral',
    icon: '∫',
    title: 'Impulse as an Integral',
    summary: "Impulse is the area under a force-time graph, and it equals the change in momentum.",
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
    id: 'variable-mass-rocket-thrust',
    icon: '🚀',
    title: 'Variable-Mass Systems: Rocket Thrust',
    summary: "A rocket's thrust comes from throwing mass backward: the exhaust speed times the rate at which fuel is ejected.",
    body: [
      "Newton's Second Law says net force equals dp/dt = d(mv)/dt. Every calculation so far assumed mass stays constant, letting F = ma fall right out. But for a rocket burning fuel — or an astronaut firing a handheld thruster — MASS ITSELF is changing over time, so differentiating d(mv)/dt properly needs the product rule: d(mv)/dt = m(dv/dt) + v(dm/dt). The second term doesn't vanish just because it's inconvenient.",
      "Here's the trick that makes this manageable: work in the frame where the EXHAUST leaves at a constant speed u relative to the rocket, not relative to the ground. Conserving momentum between the rocket and the tiny bit of ejected mass over an instant dt leads to a clean result: the net thrust force on the rocket is F = u·|dm/dt| — exhaust speed times how fast mass is being flung out the back.",
      "Notice this looks completely different from F = ma, yet it's the SAME law, just applied to a system where mass isn't fixed. A more powerful thruster ejects fuel faster (bigger dm/dt) or ejects it at higher speed (bigger u) — either one increases thrust, exactly as intuition suggests.",
    ],
    formulaLatex: 'F_{thrust} = u\\left|\\dfrac{dm}{dt}\\right|',
    symbols: [
      { symbol: 'u', meaning: 'Exhaust speed, measured RELATIVE TO the rocket/thruster', unit: 'm/s' },
      { symbol: 'dm/dt', meaning: 'Rate at which the rocket loses mass (fuel being ejected)', unit: 'kg/s' },
    ],
    interactive: (
      <TryIt
        resultLabel="Thrust force"
        resultUnit="N"
        formulaLatex={'F_{thrust} = u \\cdot \\dfrac{dm}{dt}'}
        variables={[
          { id: 'exhaustSpeed', label: 'Exhaust speed (u)', min: 50, max: 1000, step: 10, defaultValue: 490, unit: 'm/s' },
          { id: 'massFlow', label: 'Mass flow rate (dm/dt)', min: 0.005, max: 0.2, step: 0.005, defaultValue: 0.01, unit: 'kg/s' },
        ]}
        compute={({ exhaustSpeed, massFlow }) => exhaustSpeed * massFlow}
        interpret={({ exhaustSpeed, massFlow }, result) =>
          `Ejecting mass at ${massFlow.toFixed(3)} kg/s with an exhaust speed of ${exhaustSpeed} m/s produces ${result.toFixed(1)} N of thrust — the same force you'd get from F = ma on a fixed mass, but here it comes entirely from flinging mass away rather than accelerating a constant one.`
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
