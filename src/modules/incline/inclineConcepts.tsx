import { type ConceptSection } from '../../components/concepts/ConceptNotes';
import { TryIt } from '../../components/concepts/TryIt';
import { RevealAnswer } from '../../components/concepts/RevealAnswer';
import { Katex } from '../../components/ui/Katex';
import { SlopeSplit } from '../../components/concepts/diagrams/SlopeSplit';

export const INCLINE_CONCEPTS: ConceptSection[] = [
  {
    id: 'what-is-a-force',
    icon: '💪',
    title: 'Forces 101: Pushes, Pulls and Newtons',
    summary: 'A force is a push or a pull, measured in newtons. Weight is the pull of gravity, and it is not the same thing as mass.',
    body: [
      "A force is a push or a pull on an object. Forces are measured in newtons (N). One newton is roughly the weight of a small apple. A force has a size AND a direction, so we draw forces as arrows: the longer the arrow, the bigger the force.",
      "Mass (in kilograms) is how much matter an object contains. Weight is the downward pull of gravity on that mass: weight = mass × g, where g is about 9.8 (newtons per kilogram, which is the same as m/s²). A 5 kg block weighs 5 × 9.8 = 49 N. On the Moon your mass would be the same but your weight would be much smaller. Questions that say g = 10 are just rounding to keep the sums easy.",
      "A free-body diagram (FBD) is a quick sketch of ONE object, drawn as a box or a dot, with an arrow for every force acting ON it. Leave out forces the object exerts on other things. Drawing a careful free-body diagram is the most useful habit in mechanics, and it is the first step in this module's simulation.",
    ],
    watchOut: 'Mass and weight are different. Mass is in kilograms. Weight is a force, in newtons.',
    formulaLatex: 'W = mg',
    symbols: [
      { symbol: 'W', meaning: 'Weight: the pull of gravity on the object', unit: 'N' },
      { symbol: 'm', meaning: 'Mass of the object', unit: 'kg' },
      { symbol: 'g', meaning: 'Gravitational acceleration, about 9.8', unit: 'm/s²' },
    ],
    interactive: (
      <TryIt
        resultLabel="Weight"
        resultUnit="N"
        formulaLatex={'W = mg'}
        variables={[
          { id: 'weightMass', label: 'Mass (m)', min: 1, max: 100, step: 1, defaultValue: 60, unit: 'kg' },
          { id: 'weightG', label: 'Gravity (g): Moon 1.6, Earth 9.8, Jupiter 24.8', min: 1.6, max: 24.8, step: 0.1, defaultValue: 9.8, unit: 'm/s²' },
        ]}
        compute={({ weightMass, weightG }) => weightMass * weightG}
        interpret={({ weightMass, weightG }) =>
          `The mass is ${weightMass} kg wherever you are. The weight changes with g: here it is ${(weightMass * weightG).toFixed(0)} N, compared with ${(weightMass * 9.8).toFixed(0)} N on Earth.`
        }
      />
    ),
  },
  {
    id: 'newtons-laws',
    icon: '🍎',
    title: "Newton's Three Laws in Plain Words",
    summary: 'No net force means no change in velocity. A net force makes a mass accelerate (F = ma). Forces come in equal and opposite pairs.',
    body: [
      "First law: if the forces on an object cancel out (the net force is zero), its velocity does not change. A resting object stays at rest. A moving object keeps moving in a straight line at a steady speed.",
      "Second law: if the forces do NOT cancel, the object accelerates in the direction of the net force. F_net = ma, or a = F_net ÷ m. For the same force, a heavy object accelerates less than a light one.",
      "Third law: when object A pushes on object B, B pushes back on A with a force of the same size in the opposite direction. The two forces act on DIFFERENT objects.",
    ],
    watchOut: 'The two forces in a third-law pair act on different objects, which is why they never cancel each other. Only forces acting on the SAME object can cancel.',
    formulaLatex: 'F_{net} = ma',
    symbols: [
      { symbol: 'F_{net}', meaning: 'Net force: all the forces on the object added up, with directions', unit: 'N' },
      { symbol: 'm', meaning: 'Mass of the object', unit: 'kg' },
      { symbol: 'a', meaning: 'Acceleration of the object', unit: 'm/s²' },
    ],
    interactive: (
      <TryIt
        resultLabel="Acceleration"
        resultUnit="m/s²"
        formulaLatex={'a = \\dfrac{F_{net}}{m}'}
        variables={[
          { id: 'lawForce', label: 'Net force (F)', min: 0, max: 100, step: 5, defaultValue: 30, unit: 'N' },
          { id: 'lawMass', label: 'Mass (m)', min: 1, max: 20, step: 1, defaultValue: 6, unit: 'kg' },
        ]}
        compute={({ lawForce, lawMass }) => lawForce / lawMass}
        interpret={({ lawMass }, result) =>
          result === 0
            ? 'No net force means no acceleration: the velocity stays the same (the first law).'
            : `Try doubling the mass to ${lawMass * 2} kg: the same force now gives half the acceleration, ${(result / 2).toFixed(2)} m/s².`
        }
      />
    ),
  },
  {
    id: 'normal-force',
    icon: '👉',
    title: 'What Is the Normal Force?',
    summary: 'A surface pushes back on whatever rests on it, at right angles to the surface.',
    body: [
      "When two surfaces touch, they push on each other. This push is the normal force, N. In physics 'normal' means 'at right angles to', not 'ordinary'. The normal force always points straight out of the surface.",
      "A surface can only PUSH, never pull. So the normal force always points away from the surface, toward whatever is resting on it. Squeeze a spring between your hands and you feel exactly this: a push straight back along the line of the squeeze.",
      "On a flat floor, the normal force just balances the weight, so N = mg, and nobody thinks twice about it. On a slope the surface is tilted, so N tilts with it. It then balances only the part of the weight that presses into the slope (see two sections down).",
    ],
    watchOut: 'On a slope, N is NOT equal to mg. It is smaller, and it does not point straight up.',
    formulaLatex: 'N = mg\\cos\\theta \\quad \\text{(on a slope)}',
    symbols: [
      { symbol: 'N', meaning: 'Normal force: the surface pushing back', unit: 'N' },
      { symbol: 'm', meaning: 'Mass of the object', unit: 'kg' },
      { symbol: 'g', meaning: 'Gravitational acceleration', unit: 'm/s²' },
      { symbol: 'θ', meaning: 'Angle of the slope from the horizontal', unit: 'degrees' },
    ],
  },
  {
    id: 'normal-force-stacking',
    icon: '📦',
    title: 'Normal Force in a Stack',
    summary: 'Each surface only supports what is resting directly on it. Work from the top box down.',
    body: [
      "N = mg is the whole story only when one object sits alone on the ground. When objects are stacked (a box on a box, a book on a box on a table), each surface only has to support what is actually pressing on it.",
      "Work from the TOP down. For the top box, the only thing touching it from below is the box under it, and that push just has to equal the top box's own weight. Move down one level: that surface supports everything above it.",
      "So the table under a stack must push up with the COMBINED weight of everything above it. The load passes down one contact at a time, growing by one box's weight at each level.",
    ],
    interactive: (
      <TryIt
        resultLabel="Force the table pushes up on the bottom box"
        resultUnit="N"
        formulaLatex={'N_{table} = (m_{top} + m_{bottom})\\,g'}
        variables={[
          { id: 'topMass', label: 'Top box mass', min: 1, max: 10, step: 1, defaultValue: 3, unit: 'kg' },
          { id: 'bottomMass', label: 'Bottom box mass', min: 1, max: 15, step: 1, defaultValue: 5, unit: 'kg' },
        ]}
        compute={({ topMass, bottomMass }) => (topMass + bottomMass) * 9.8}
        interpret={({ topMass }, result) =>
          `The table pushes up on the bottom box with ${result.toFixed(0)} N, the COMBINED weight. But the bottom box only pushes up on the top box with ${(topMass * 9.8).toFixed(0)} N, because that is all that rests on it.`
        }
      />
    ),
  },
  {
    id: 'decomposing-gravity',
    icon: '📐',
    title: 'Splitting Gravity on a Slope',
    summary: 'On a slope, split the weight into a part that pulls the block down the slope (mg sin θ) and a part that presses it into the slope (mg cos θ).',
    body: [
      "Weight (mg) always points straight down. The slope's tilt does not change that. But it helps to split the weight into two parts lined up with the slope. One part presses INTO the surface and the other pulls the block DOWN along the slope.",
      "It is the same trick as splitting a launch velocity in Module 2, this time applied to a force. The angle between the weight and the 'into the slope' direction is the same θ as the slope's angle (the diagram shows this). So the part into the slope uses cosine, and the part down the slope uses sine.",
      "As the slope gets steeper, sin θ grows and cos θ shrinks. More of the weight pulls along the slope and less presses into it. That is why steep ramps make things slide faster. At 0° there is no pull along the slope at all. At 90° the whole weight acts along the (now vertical) surface.",
    ],
    watchOut: 'The two parts are not extra forces. They are just a different way of writing the same weight. Never draw both the weight and its parts as separate forces on your free-body diagram.',
    formulaLatex: 'W_\\parallel = mg\\sin\\theta \\qquad W_\\perp = mg\\cos\\theta',
    symbols: [
      { symbol: 'W_\\parallel', meaning: 'Part of the weight along the slope (pulls the block down the ramp)', unit: 'N' },
      { symbol: 'W_\\perp', meaning: 'Part of the weight at right angles to the slope (presses into it)', unit: 'N' },
      { symbol: 'm', meaning: 'Mass of the block', unit: 'kg' },
      { symbol: 'θ', meaning: 'Angle of the slope from the horizontal', unit: 'degrees' },
    ],
    interactive: <SlopeSplit />,
  },
  {
    id: 'slope-acceleration',
    icon: '🛷',
    title: 'How Fast Does It Slide?',
    summary: 'Once a block slides, use F = ma along the slope. With no friction the acceleration is g sin θ, whatever the mass.',
    body: [
      "Once the block is sliding, apply F = ma along the slope. The pull down the slope is mg sin θ. Friction (kinetic friction, μₖN = μₖ mg cos θ) pushes back up the slope. So the net force down the slope is mg sin θ − μₖ mg cos θ.",
      "Divide by m (it cancels) to get the acceleration: a = g sin θ − μₖ g cos θ. With no friction at all it becomes a = g sin θ. On a 30° slope that is g ÷ 2, about 4.9 m/s², whatever the mass of the block.",
    ],
    formulaLatex: 'a = g\\sin\\theta - \\mu_k g\\cos\\theta \\qquad (\\text{no friction: } a = g\\sin\\theta)',
    symbols: [
      { symbol: 'a', meaning: 'Acceleration down the slope', unit: 'm/s²' },
      { symbol: 'μₖ', meaning: 'Coefficient of kinetic friction' },
    ],
    interactive: (
      <TryIt
        resultLabel="Acceleration down the slope"
        resultUnit="m/s²"
        formulaLatex={'a = g\\sin\\theta - \\mu_k g\\cos\\theta'}
        variables={[
          { id: 'slideAngle', label: 'Slope angle (θ)', min: 5, max: 85, step: 1, defaultValue: 30, unit: '°' },
          { id: 'slideMu', label: 'Kinetic friction (μₖ)', min: 0, max: 0.8, step: 0.05, defaultValue: 0.2, unit: '' },
        ]}
        compute={({ slideAngle, slideMu }) => {
          const t = (slideAngle * Math.PI) / 180;
          return Math.max(0, 9.8 * Math.sin(t) - slideMu * 9.8 * Math.cos(t));
        }}
        interpret={({ slideAngle, slideMu }, result) =>
          result === 0
            ? `At ${slideAngle}° with μₖ = ${slideMu.toFixed(2)}, friction is too strong for the block to speed up (it would not slide, or it slides at a steady speed).`
            : `With no friction the acceleration would be ${(9.8 * Math.sin((slideAngle * Math.PI) / 180)).toFixed(2)} m/s². Friction takes ${(9.8 * Math.sin((slideAngle * Math.PI) / 180) - result).toFixed(2)} m/s² off that.`
        }
      />
    ),
  },
  {
    id: 'static-vs-kinetic-friction',
    icon: '🧲',
    title: 'Static vs. Kinetic Friction',
    summary: 'Friction resists sliding. Static friction holds a still object, up to a limit. Kinetic friction acts once it slides, and is usually a bit smaller.',
    body: [
      "Friction is a force that resists sliding between two surfaces. It comes from tiny bumps and from the surfaces sticking to each other, even when they feel smooth.",
      "Static friction acts while the surfaces are NOT sliding. It adjusts itself, from zero up to a maximum, to match whatever is pulling the object. Think of a helper who pushes back exactly as hard as needed, until they cannot keep up any more.",
      "Kinetic friction takes over once the object IS sliding. It is usually a bit smaller than the maximum static friction. That is why it is harder to get something moving than to keep it moving.",
      "Both depend on the normal force N: the harder the surfaces are pressed together, the more friction. They also depend on a coefficient μ (the Greek letter 'mu') for that pair of materials. Rubber on a dry road has a high μ. Steel on ice has a very low one. The contact area does not matter in this simple model.",
      "The block slides when the pull down the slope (mg sin θ) is bigger than the maximum static friction.",
    ],
    watchOut: 'Friction is NOT always μN. That is only the MAXIMUM static friction, or the friction while sliding. A block sitting still on a gentle slope has less friction than μN: just enough to cancel the pull.',
    formulaLatex: 'f_{s,max} = \\mu_s N \\qquad\\qquad f_k = \\mu_k N',
    symbols: [
      { symbol: 'f_{s,max}', meaning: 'Maximum static friction before sliding begins', unit: 'N' },
      { symbol: 'f_k', meaning: 'Kinetic friction, once sliding', unit: 'N' },
      { symbol: 'μ_s', meaning: 'Coefficient of static friction (depends on the two materials)' },
      { symbol: 'μ_k', meaning: 'Coefficient of kinetic friction (usually a bit less than μ_s)' },
      { symbol: 'N', meaning: 'Normal force pressing the surfaces together', unit: 'N' },
    ],
  },
  {
    id: 'critical-angle',
    icon: '📏',
    title: 'The Critical Angle',
    summary: 'A block just starts to slip when tan θ = μₛ. The mass does not matter.',
    body: [
      "Tilt a ramp higher and higher. At some angle the block just begins to slip. At exactly that angle, the pull down the slope (mg sin θ) equals the maximum static friction (μₛ mg cos θ).",
      "Cancel mg from both sides and you get sin θ ÷ cos θ = μₛ. And sin ÷ cos is the definition of tan, so tan θ = μₛ. The mass cancelled, so a heavy block and a light block of the same material slip at the same angle.",
      "This gives an experiment that needs no force meter: tilt the surface until the object just starts to slide, then take the tangent of that angle to find μₛ.",
    ],
    formulaLatex: '\\tan\\theta_{critical} = \\mu_s',
    symbols: [
      { symbol: 'θ_{critical}', meaning: 'The tilt angle at which sliding just begins', unit: 'degrees' },
      { symbol: 'μ_s', meaning: 'Coefficient of static friction for the pair of surfaces' },
    ],
    interactive: (
      <TryIt
        resultLabel="Critical angle"
        resultUnit="°"
        formulaLatex={'\\theta_{critical} = \\tan^{-1}(\\mu_s)'}
        variables={[
          { id: 'critMu', label: 'Static friction (μₛ)', min: 0.1, max: 1.5, step: 0.05, defaultValue: 0.5, unit: '' },
        ]}
        compute={({ critMu }) => (Math.atan(critMu) * 180) / Math.PI}
        interpret={({ critMu }) =>
          critMu >= 1
            ? 'With μₛ of 1 or more, the surface has to be tilted past 45° before the block slips: very grippy.'
            : 'Below this angle the block stays put, whatever its mass. Above it, the block slides.'
        }
      />
    ),
  },
  {
    id: 'accelerating-reference-frames',
    icon: '🛗',
    title: 'The Elevator Effect',
    summary: 'In an elevator that speeds up while going up, the floor pushes harder on you, so a scale reads more than your normal weight.',
    body: [
      "So far we assumed the ground is not accelerating. Stand on a scale in an accelerating elevator and the reading changes, even though your weight has not. The scale shows the normal force, and that depends on the acceleration as well as on gravity.",
      "Take UP as positive and use F = ma on yourself: N − mg = ma. So N = m(g + a). If the elevator accelerates upward (a is positive), N is bigger than mg and you feel heavier. If it accelerates downward (a is negative), N is smaller and you feel lighter.",
      "A handy shortcut: pretend gravity has changed to g_eff = g + a. Every formula you know for a floor or a slope still works if you use g_eff in place of g. So a block on a frictionless slope inside a downward-accelerating elevator slides more slowly than usual.",
    ],
    watchOut: "'Accelerating upward' includes slowing down while moving downward. What matters is the direction of the ACCELERATION, not the direction the elevator is travelling.",
    formulaLatex: 'N = m(g + a) \\qquad\\qquad g_{eff} = g + a',
    symbols: [
      { symbol: 'N', meaning: 'Normal force (what a scale would read)', unit: 'N' },
      { symbol: 'a', meaning: "The elevator's acceleration (positive = upward, negative = downward)", unit: 'm/s²' },
      { symbol: 'g_{eff}', meaning: 'Effective gravity felt inside the accelerating elevator', unit: 'm/s²' },
    ],
    interactive: (
      <TryIt
        resultLabel="Scale reading (normal force)"
        resultUnit="N"
        formulaLatex={'N = m(g + a)'}
        variables={[
          { id: 'mass', label: "Person's mass", min: 30, max: 100, step: 5, defaultValue: 60, unit: 'kg' },
          { id: 'elevatorAccel', label: 'Elevator acceleration (+ up / − down)', min: -5, max: 5, step: 0.5, defaultValue: 2, unit: 'm/s²' },
        ]}
        compute={({ mass, elevatorAccel }) => mass * (9.8 + elevatorAccel)}
        interpret={({ mass, elevatorAccel }, result) =>
          `Resting weight would read ${(mass * 9.8).toFixed(0)} N. With the elevator accelerating at ${elevatorAccel} m/s², the scale reads ${result.toFixed(0)} N: ${elevatorAccel > 0 ? 'heavier, because the elevator is accelerating upward' : elevatorAccel < 0 ? 'lighter, because the elevator is accelerating downward' : 'the same, because there is no acceleration'}.`
        }
      />
    ),
  },
  {
    id: 'contact-forces',
    icon: '🧱',
    title: 'Contact Forces Between Pushed Blocks',
    summary: 'To find the push between touching blocks, first find the shared acceleration, then apply F = ma to just one block.',
    body: [
      "Blocks do not need a slope to need a careful diagram. Imagine two touching blocks on a smooth table. You push block 1, and block 1 pushes block 2. Block 2 is only pushed by block 1, so that one contact force is what accelerates it.",
      "Step 1: treat both blocks as ONE object with the total mass, to find the shared acceleration: a = F ÷ (m₁ + m₂). Step 2: look at block 2 alone. The only horizontal force on it is the push from block 1, so that contact force is m₂ × a.",
      "Newton's third law then says block 2 pushes back on block 1 with exactly the same force, in the opposite direction, whatever the masses are.",
    ],
    watchOut: 'The contact force is smaller than your push. Part of your push is used up accelerating block 1 itself.',
    formulaLatex: 'a = \\dfrac{F}{m_1+m_2} \\qquad\\qquad F_{contact} = m_2 a',
    symbols: [
      { symbol: 'F', meaning: 'Your push on block 1', unit: 'N' },
      { symbol: 'm_1, m_2', meaning: 'Mass of block 1 (the one you push) and of block 2 (the one it pushes)', unit: 'kg' },
      { symbol: 'F_{contact}', meaning: 'The push between the two blocks', unit: 'N' },
    ],
    interactive: (
      <TryIt
        resultLabel="Contact force on block 2"
        resultUnit="N"
        formulaLatex={'F_{contact} = F \\cdot \\dfrac{m_2}{m_1+m_2}'}
        variables={[
          { id: 'appliedForce', label: 'Your push (F)', min: 10, max: 100, step: 5, defaultValue: 50, unit: 'N' },
          { id: 'm1', label: 'Block 1 mass (the one you push)', min: 1, max: 10, step: 1, defaultValue: 4, unit: 'kg' },
          { id: 'm2', label: 'Block 2 mass (the one block 1 pushes)', min: 1, max: 10, step: 1, defaultValue: 6, unit: 'kg' },
        ]}
        compute={({ appliedForce, m1, m2 }) => (appliedForce * m2) / (m1 + m2)}
        interpret={({ appliedForce, m1, m2 }, result) =>
          `Both blocks accelerate at ${(appliedForce / (m1 + m2)).toFixed(2)} m/s². Only ${result.toFixed(1)} N of your ${appliedForce} N push reaches block 2. The other ${(appliedForce - result).toFixed(1)} N goes into accelerating block 1 itself.`
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
    summary: "F = ma is really an equation about a second derivative. Solving it by integrating twice gives the motion.",
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
