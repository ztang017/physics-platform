import { type ConceptSection } from '../../components/concepts/ConceptNotes';
import { TryIt } from '../../components/concepts/TryIt';
import { RevealAnswer } from '../../components/concepts/RevealAnswer';
import { Katex } from '../../components/ui/Katex';

// Order follows the course: how to measure a turn (radians, ω) → how fast a
// point on a turning body moves (v = ωr) → why turning needs an acceleration
// → which real force supplies it → why "centrifugal force" is not real → the
// four-step method, then the three tutorial set-ups (turntable, cords, puck on
// a table, vertical circle) and, last, speeding up and slowing down (α).
export const CIRCULAR_CONCEPTS: ConceptSection[] = [
  {
    id: 'measuring-turns',
    icon: '🔄',
    title: 'Measuring a Turn: Radians, ω, f and T',
    body: [
      "Anything that spins is described by how much it has turned and how fast. Angles in degrees work, but physics prefers RADIANS, because they make the formulas simple. One radian is the angle at which the arc along the edge of a circle is exactly as long as the circle's radius. A full turn, 360°, is 2π radians (about 6.28).",
      "Angular velocity (ω, the Greek letter omega) is how quickly the angle changes: ω = dθ/dt, measured in radians per second. Everyday machines are labelled in other units, so you will often convert. Frequency f is turns per second, and the period T is the time for one turn, so f = 1/T and ω = 2πf = 2π/T.",
      "The one conversion you will use constantly is from rpm (revolutions per minute) to rad/s. Each revolution is 2π radians and each minute is 60 seconds, so multiply by 2π and divide by 60. A record at 60 rpm turns once a second, so ω = 2π ≈ 6.28 rad/s.",
    ],
    formulaLatex: '\\omega = 2\\pi f = \\dfrac{2\\pi}{T} \\qquad \\omega\\ (\\text{rad/s}) = \\text{rpm} \\times \\dfrac{2\\pi}{60}',
    symbols: [
      { symbol: 'ω', meaning: 'Angular velocity: how fast the angle changes', unit: 'rad/s' },
      { symbol: 'f', meaning: 'Frequency: turns per second', unit: 'Hz' },
      { symbol: 'T', meaning: 'Period: time for one full turn', unit: 's' },
      { symbol: 'rpm', meaning: 'Revolutions per minute', unit: 'rev/min' },
    ],
    interactive: (
      <TryIt
        resultLabel="Angular velocity"
        resultUnit="rad/s"
        formulaLatex={'\\omega = \\text{rpm} \\times \\dfrac{2\\pi}{60}'}
        variables={[
          { id: 'turnRpm', label: 'Turning rate', min: 0, max: 1000, step: 10, defaultValue: 60, unit: 'rpm' },
        ]}
        compute={({ turnRpm }) => (turnRpm * 2 * Math.PI) / 60}
        interpret={({ turnRpm }) =>
          turnRpm === 0
            ? 'Not turning at all.'
            : `That is ${(turnRpm / 60).toFixed(2)} turns every second, so one full turn takes ${(60 / turnRpm).toFixed(2)} s.`
        }
      />
    ),
  },
  {
    id: 'linear-from-angular',
    icon: '📏',
    title: 'Same Spin, Different Speeds: v = ωr',
    body: [
      "Every point on a turning disc goes round once in the same time, so every point has the SAME angular velocity ω. But a point near the rim has a much bigger circle to cover than a point near the centre in that same time, so it moves faster. Its speed along the circle, the tangential speed, is v = ωr.",
      "Two coins on a record, one 5 cm from the centre and the other 10 cm, turn together at the same ω. The outer coin has twice the radius, so it moves at twice the speed. This is also why the tip of a blender blade, only a few centimetres out, can be moving at several metres per second.",
      "This relation is always true for a point on a turning body. (Later, when something ROLLS, you will meet a second relation, v = Rω for the centre of the wheel, which is true only if it does not slip. Do not mix the two up.)",
    ],
    formulaLatex: 'v = \\omega r',
    symbols: [
      { symbol: 'v', meaning: 'Speed along the circle (tangential speed)', unit: 'm/s' },
      { symbol: 'ω', meaning: 'Angular velocity, in rad/s (not rpm!)', unit: 'rad/s' },
      { symbol: 'r', meaning: 'Distance from the axis of rotation', unit: 'm' },
    ],
    interactive: (
      <TryIt
        resultLabel="Speed of a point on the disc"
        resultUnit="m/s"
        formulaLatex={'v = \\omega r'}
        variables={[
          { id: 'vOmega', label: 'Angular velocity (ω)', min: 1, max: 100, step: 1, defaultValue: 20, unit: 'rad/s' },
          { id: 'vRadius', label: 'Distance from the axis (r)', min: 0.01, max: 0.5, step: 0.01, defaultValue: 0.05, unit: 'm' },
        ]}
        compute={({ vOmega, vRadius }) => vOmega * vRadius}
        interpret={({ vRadius }) =>
          `Slide r to ${(vRadius * 2).toFixed(2)} m and the speed doubles. Everything on the disc has the same ω, but the further out you go, the faster you move.`
        }
      />
    ),
  },
  {
    id: 'centripetal-acceleration',
    icon: '🎯',
    title: 'Turning Needs an Acceleration: a = v²/r',
    body: [
      "Acceleration means a change in VELOCITY, and velocity is a vector: it has a direction as well as a size. An object going round a circle at a perfectly constant speed is still changing its direction every instant, so it is accelerating. That surprises almost everyone the first time.",
      "The acceleration points toward the centre of the circle, which is why it is called centripetal (\"centre-seeking\") acceleration. Its size is a = v²/r. Using v = ωr, that is the same as a = ω²r. Doubling the speed on the same circle needs FOUR times the acceleration, and a tighter bend (smaller r) needs more.",
      "By Newton's second law, if there is an acceleration there must be a net force in the same direction. So going round a circle needs a net force pointing at the centre, of size mv²/r. The next two sections are about where that force comes from.",
    ],
    formulaLatex: 'a_c = \\dfrac{v^2}{r} = \\omega^2 r \\qquad F_{net,\\,inward} = \\dfrac{mv^2}{r} = m\\omega^2 r',
    symbols: [
      { symbol: 'a c', meaning: 'Centripetal acceleration, always pointing toward the centre', unit: 'm/s²' },
      { symbol: 'v', meaning: 'Speed along the circle', unit: 'm/s' },
      { symbol: 'r', meaning: 'Radius of the circle', unit: 'm' },
    ],
    interactive: (
      <TryIt
        resultLabel="Centripetal acceleration"
        resultUnit="m/s²"
        formulaLatex={'a_c = \\dfrac{v^2}{r}'}
        variables={[
          { id: 'acSpeed', label: 'Speed (v)', min: 1, max: 30, step: 1, defaultValue: 10, unit: 'm/s' },
          { id: 'acRadius', label: 'Radius of the bend (r)', min: 5, max: 100, step: 5, defaultValue: 50, unit: 'm' },
        ]}
        compute={({ acSpeed, acRadius }) => (acSpeed * acSpeed) / acRadius}
        interpret={({ acSpeed, acRadius }) => {
          const a = (acSpeed * acSpeed) / acRadius;
          return `That is ${(a / 9.8).toFixed(2)} g. Try doubling the speed: the acceleration needed jumps to ${((4 * a) / 9.8).toFixed(2)} g, four times as much.`;
        }}
      />
    ),
  },
  {
    id: 'centripetal-is-a-job',
    icon: '🧲',
    title: 'Centripetal Is a Job, Not a New Force',
    body: [
      "\"Centripetal force\" is not a new kind of force to add to your list. It is the NAME for the job of pointing toward the centre. Some real force, one you already know, has to do that job: the tension in a string, static friction on a turntable or a road, gravity for a satellite, the normal force on a banked track, or a combination of these.",
      "So when you draw a free-body diagram, draw only the real forces: weight, normal force, tension, friction and so on. Do NOT add an extra arrow labelled \"centripetal force\". Instead, add up the real forces that point toward the centre and say that this total equals mv²/r.",
      "For the coin on the turntable, the weight and the normal force are vertical and cancel. The only horizontal force is static friction from the turntable, pointing toward the centre. So friction IS the centripetal force: f = mω²r.",
    ],
    formulaLatex: '\\Sigma F_{toward\\ centre} = \\dfrac{mv^2}{r}',
    symbols: [
      { symbol: 'ΣF toward centre', meaning: 'Add up the parts of the real forces that point at the centre, and subtract any that point away', unit: 'N' },
    ],
  },
  {
    id: 'no-centrifugal-force',
    icon: '🚫',
    title: 'Why There Is No Outward Force',
    body: [
      "In a car going round a bend you feel pushed toward the outside, as if a force were flinging you outward. But look at it from the road. You were moving in a straight line, and your body wanted to carry on that way (Newton's first law). The car turned, and the door pushed you inward so that you turned with it. The \"outward push\" you feel is just your own inertia.",
      "The same is true when a string breaks while you whirl a ball, or when a coin slips off a turntable. Nothing flings it outward. Once nothing pulls it inward any more, it simply carries on in the direction it was already moving, which is along the TANGENT to the circle at that moment, not along the radius.",
      "A \"centrifugal force\" appears only if you insist on describing everything from inside the spinning frame, such as someone riding on the turntable. That frame is accelerating, so Newton's laws seem to break, and people invent a fictitious outward force to patch them up. For these problems, work from the ground and you never need it. The Observe phase lets you watch the same coin from both views.",
    ],
  },
  {
    id: 'four-step-method',
    icon: '🧭',
    title: 'A Four-Step Method for Any Circular Problem',
    body: [
      "1. Draw the circle and mark the object at the moment you care about. Mark the direction to the centre.",
      "2. Draw the free-body diagram with only the real forces on the object (weight, normal force, tension, friction ...).",
      "3. Take \"toward the centre\" as the positive direction and add up the force components along it. Forces pointing away from the centre count as negative.",
      "4. Set that total equal to mv²/r (or mω²r) and solve. Check that the units work: forces in newtons, speeds in m/s and angular velocities in rad/s (convert rpm first).",
    ],
  },
  {
    id: 'turntable-coin',
    icon: '🪙',
    title: 'The Coin on the Turntable',
    body: [
      "Put a coin a distance r from the axis and speed the turntable up slowly. Friction supplies the centripetal force, so the friction needed is f = mω²r. Static friction has a maximum, μₛN = μₛmg (the normal force equals the weight). The coin stays on while mω²r ≤ μₛmg, and slips at the moment they are equal.",
      "Solve that for the slipping speed: ω² r = μₛ g, so ω = √(μₛg/r). Look at what happened to the mass: it cancelled. A heavier coin needs more friction but also has more friction available, so the slipping speed does not depend on the mass at all.",
      "The radius matters, though: ω ∝ 1/√r. A coin four times as far out slips at half the speed. A rougher surface (bigger μₛ) lets the coin ride faster. And you can run the same equation backwards: if you measure the speed at which a coin slips, then μₛ = ω²r/g.",
    ],
    formulaLatex: 'm\\omega^2 r \\le \\mu_s mg \\;\\Rightarrow\\; \\omega_{max} = \\sqrt{\\dfrac{\\mu_s g}{r}} \\qquad \\mu_s = \\dfrac{\\omega^2 r}{g}',
    symbols: [
      { symbol: 'μₛ', meaning: 'Coefficient of static friction between the coin and the turntable' },
      { symbol: 'ω max', meaning: 'The fastest turntable speed at which the coin still stays on', unit: 'rad/s' },
      { symbol: 'g', meaning: 'Gravitational acceleration, about 9.8', unit: 'm/s²' },
    ],
    interactive: (
      <TryIt
        resultLabel="Turntable speed at which the coin slips"
        resultUnit="rpm"
        formulaLatex={'\\omega = \\sqrt{\\dfrac{\\mu_s g}{r}}\\ \\text{(then} \\times \\tfrac{60}{2\\pi}\\text{ for rpm)}'}
        variables={[
          { id: 'slipMu', label: 'Friction (μₛ)', min: 0.1, max: 1, step: 0.05, defaultValue: 0.4, unit: '' },
          { id: 'slipR', label: 'Distance from the axis (r)', min: 0.05, max: 0.3, step: 0.01, defaultValue: 0.12, unit: 'm' },
        ]}
        compute={({ slipMu, slipR }) => (Math.sqrt((slipMu * 9.8) / slipR) * 60) / (2 * Math.PI)}
        interpret={({ slipMu, slipR }) =>
          `Notice there is no mass slider: it cancelled. Move the coin out to ${(slipR * 4).toFixed(2)} m and the slipping speed halves.${slipMu >= 0.9 ? ' A very grippy surface!' : ''}`
        }
      />
    ),
  },
  {
    id: 'linked-cords',
    icon: '🔗',
    title: 'Masses on Cords: One Free-Body Diagram Each',
    body: [
      "When two masses whirl together on cords, treat each mass separately. Each one is on its own circle and needs its own centripetal force. Start from the OUTERMOST mass: only one cord pulls on it (toward the centre), so that cord's tension supplies all of its centripetal force.",
      "The next cord in has a harder job. It has to supply the centripetal force for ITS mass and also pull inward on the outer cord. So its tension is the sum of the two. That is why the cord nearest the centre always has the largest tension, and why it is the one that snaps first as you spin faster.",
    ],
    formulaLatex: 'T_{outer} = m_B \\omega^2 r_B \\qquad T_{inner} = T_{outer} + m_A \\omega^2 r_A',
    symbols: [
      { symbol: 'A, B', meaning: 'The inner and the outer mass' },
      { symbol: 'T inner', meaning: 'Tension in the cord from the centre to mass A', unit: 'N' },
      { symbol: 'T outer', meaning: 'Tension in the cord between A and B', unit: 'N' },
    ],
    interactive: (
      <RevealAnswer
        question="A 0.50 kg block A (0.30 m from the pivot) and a 1.5 kg block B (0.60 m from the pivot) are joined in a line by cords: pivot to A, then A to B. They whirl at 2.0 revolutions per second on a frictionless table. Find the tension in each cord."
        answer={
          <>
            <p>First convert: ω = 2π × 2.0 = 12.57 rad/s, so ω² ≈ 157.9 rad²/s². The outer cord pulls B inward, and that is B's only horizontal force:</p>
            <Katex latex={'T_{outer} = m_B\\omega^2 r_B = 1.5 \\times 157.9 \\times 0.60 \\approx 142\\ \\text{N}'} displayMode />
            <p>The inner cord pulls A inward, while the outer cord pulls A outward with 142 N. The net inward force on A must be m_Aω²r_A = 0.50 × 157.9 × 0.30 ≈ 23.7 N, so:</p>
            <Katex latex={'T_{inner} - T_{outer} = 23.7 \\;\\Rightarrow\\; T_{inner} \\approx 142 + 23.7 \\approx 166\\ \\text{N}'} displayMode />
            <p>As expected, the inner cord carries the larger tension.</p>
          </>
        }
      />
    ),
  },
  {
    id: 'puck-and-hanging-mass',
    icon: '🪢',
    title: 'A Puck Held in Orbit by a Hanging Mass',
    body: [
      "A puck circles on a frictionless table, held by a string that runs through a hole in the middle of the table and down to a mass hanging beneath it. The hanging mass is not accelerating, so the string must hold it up with a tension equal to its weight: T = mg.",
      "The same string pulls the puck toward the hole, and that tension is the puck's only horizontal force, so it IS the centripetal force: T = Mv²/R. Equate the two tensions and solve: v = √(mgR/M). A heavier hanging mass pulls harder, so the puck must go faster to stay on its circle.",
      "Check the units to catch slips: mgR/M has units of (kg · m/s² · m)/kg = m²/s², and its square root is m/s.",
    ],
    formulaLatex: 'T = mg = \\dfrac{Mv^2}{R} \\;\\Rightarrow\\; v = \\sqrt{\\dfrac{mgR}{M}}',
    symbols: [
      { symbol: 'M', meaning: 'Mass of the puck on the table', unit: 'kg' },
      { symbol: 'm', meaning: 'Mass of the hanging weight', unit: 'kg' },
      { symbol: 'R', meaning: 'Radius of the puck\'s circle', unit: 'm' },
    ],
    interactive: (
      <TryIt
        resultLabel="Speed of the puck"
        resultUnit="m/s"
        formulaLatex={'v = \\sqrt{\\dfrac{mgR}{M}}'}
        variables={[
          { id: 'puckM', label: 'Puck mass (M)', min: 0.1, max: 2, step: 0.1, defaultValue: 0.5, unit: 'kg' },
          { id: 'hangM', label: 'Hanging mass (m)', min: 0.05, max: 1, step: 0.05, defaultValue: 0.2, unit: 'kg' },
          { id: 'puckR', label: 'Radius of the circle (R)', min: 0.1, max: 1, step: 0.05, defaultValue: 0.3, unit: 'm' },
        ]}
        compute={({ puckM, hangM, puckR }) => Math.sqrt((hangM * 9.8 * puckR) / puckM)}
        interpret={({ puckM }) =>
          `Make the puck heavier (try ${(puckM * 2).toFixed(1)} kg) and the speed DROPS: a heavier puck needs more force to go round, but the hanging mass only supplies the same tension.`
        }
      />
    ),
  },
  {
    id: 'vertical-circle',
    icon: '🪣',
    title: 'Whirling in a Vertical Circle',
    body: [
      "Swing a bucket in a vertical circle and its speed is NOT constant: gravity speeds it up on the way down and slows it on the way up. So the net force has two parts. The part pointing toward the centre (radial) keeps changing the direction, and must equal mv²/r. The part along the path (tangential) changes the speed.",
      "At the lowest point the rope pulls up (toward the centre) and the weight pulls down (away from it), so T − mg = mv²/r, giving T = mg + mv²/r. The rope has to hold the weight AND provide the turning force, so the tension is at its largest here.",
      "At the top, both the rope and the weight point toward the centre, so T + mg = mv²/r. The slowest the bucket can go and still keep the rope tight is when the tension just drops to zero and gravity alone provides the turning force: mg = mv²/r, so v_min = √(gr). Go slower and the rope goes slack and the bucket leaves its circle.",
      "At a general point, measured by an angle φ from the lowest point, the tangential force is mg sin φ (slowing the bucket as it climbs) and the radial equation is T − mg cos φ = mv²/r.",
    ],
    formulaLatex: 'T_{bottom} = mg + \\dfrac{mv^2}{r} \\qquad T_{top} = \\dfrac{mv^2}{r} - mg \\qquad v_{min,\\,top} = \\sqrt{gr}',
    symbols: [
      { symbol: 'T', meaning: 'Tension in the rope', unit: 'N' },
      { symbol: 'v', meaning: 'Speed of the bucket at that point', unit: 'm/s' },
      { symbol: 'v min', meaning: 'Slowest speed at the top at which the rope stays taut', unit: 'm/s' },
    ],
    interactive: (
      <RevealAnswer
        question="A 1.5 kg bucket is whirled in a vertical circle of radius 0.80 m. At the lowest point its speed is 3.0 m/s. What is the rope's tension there, and what is the slowest speed at which the rope stays taut at the top? (g = 9.8 m/s²)"
        answer={
          <>
            <p>At the bottom the tension must carry the weight and supply the centripetal force:</p>
            <Katex latex={'T = mg + \\dfrac{mv^2}{r} = 14.7 + \\dfrac{1.5 \\times 3.0^2}{0.80} = 14.7 + 16.9 \\approx 31.6\\ \\text{N}'} displayMode />
            <p>At the top, the slowest taut speed has T = 0, so gravity alone must provide the centripetal force:</p>
            <Katex latex={'mg = \\dfrac{mv^2}{r} \\;\\Rightarrow\\; v = \\sqrt{gr} = \\sqrt{9.8 \\times 0.80} \\approx 2.8\\ \\text{m/s}'} displayMode />
            <p>Notice that the mass cancelled in the second answer: a heavy bucket and a light one both need 2.8 m/s.</p>
          </>
        }
      />
    ),
  },
  {
    id: 'banked-curves',
    icon: '🛣️',
    title: 'Banked Curves: Letting the Slope Help',
    body: [
      "On a flat road only friction can turn a car, which is why a curve is dangerous on ice. Engineers therefore TILT (bank) the road. The normal force is always perpendicular to the surface, so on a banked road it leans toward the centre of the bend, and its horizontal part pushes the car round.",
      "First take a perfectly icy road, with no friction at all. The only forces are the weight mg (down) and the normal force N (perpendicular to the road, at angle θ from the vertical). Vertically nothing accelerates: N cos θ = mg. Horizontally, toward the centre: N sin θ = mv²/R. Divide the second equation by the first and both N and m disappear: tan θ = v²/(Rg). So there is exactly one speed at which the car needs no friction, the design speed v₀ = √(Rg tan θ).",
      "Now add friction. Go slower than v₀ and the normal force provides too much turning force, so the car tends to slide DOWN the slope toward the inside; friction acts UP the slope to stop it. Go faster and the car tends to slide UP and out; friction acts DOWN the slope. At each end of the safe band friction is at its limit, f = μₛN.",
      "To find the two limiting speeds, write Newton's second law twice, once along the slope and once at right angles to it (or horizontally and vertically), put f = μₛN, and solve once with friction pointing up the slope (the slowest speed) and once with it pointing down (the fastest). A rougher road gives a wider band. The worked example below carries this through with numbers.",
    ],
    formulaLatex: '\\tan\\theta = \\dfrac{v_0^2}{Rg} \\;\\Rightarrow\\; v_0 = \\sqrt{Rg\\tan\\theta} \\qquad f = \\mu_s N \\ \\text{at each end of the safe band}',
    symbols: [
      { symbol: 'θ', meaning: 'Banking angle of the road', unit: 'degrees' },
      { symbol: 'v₀', meaning: 'Design speed: the speed at which no friction is needed', unit: 'm/s' },
      { symbol: 'R', meaning: 'Radius of the bend', unit: 'm' },
      { symbol: 'N', meaning: 'Normal force, perpendicular to the road surface', unit: 'N' },
    ],
    interactive: (
      <RevealAnswer
        question="A bend of radius 60 m is banked at 20°, and the tyres have μₛ = 0.20. Find the design speed and the slowest and fastest safe speeds. (g = 9.8 m/s², tan 20° = 0.364)"
        answer={
          <>
            <p>Design speed (no friction needed):</p>
            <Katex latex={'v_0 = \\sqrt{Rg\\tan\\theta} = \\sqrt{60 \\times 9.8 \\times 0.364} \\approx 14.6\\ \\text{m/s}'} displayMode />
            <p>Use the same two equations for both ends of the band, with a = v²/R (the centripetal acceleration), cos 20° = 0.940 and sin 20° = 0.342. Across the slope: N = m(g cos θ + a sin θ) = m(9.21 + 0.342a). Along the slope, taking down-the-slope (toward the centre) as positive: mg sin θ ∓ μN = m a cos θ.</p>
            <p><strong>Slowest speed</strong>: friction at its limit pointing UP the slope, so it takes away from the downhill pull:</p>
            <Katex latex={'3.35 - 0.20\\,(9.21 + 0.342a) = 0.940a \\;\\Rightarrow\\; 1.51 = 1.008a \\;\\Rightarrow\\; a \\approx 1.50\\ \\text{m/s}^2'} displayMode />
            <Katex latex={'v_{min} = \\sqrt{aR} = \\sqrt{1.50 \\times 60} \\approx 9.5\\ \\text{m/s}'} displayMode />
            <p><strong>Fastest speed</strong>: friction at its limit pointing DOWN the slope, so it adds to the downhill pull:</p>
            <Katex latex={'3.35 + 0.20\\,(9.21 + 0.342a) = 0.940a \\;\\Rightarrow\\; 5.19 = 0.871a \\;\\Rightarrow\\; a \\approx 5.96\\ \\text{m/s}^2'} displayMode />
            <Katex latex={'v_{max} = \\sqrt{aR} = \\sqrt{5.96 \\times 60} \\approx 18.9\\ \\text{m/s}'} displayMode />
            <p>So the safe band is about 9.5 to 18.9 m/s, centred on the design speed of 14.6 m/s. If a question gives you the design speed v₀ instead of the angle, find θ first from tan θ = v₀²/(Rg). To get a formula for the band, solve the same two equations with letters instead of numbers.</p>
          </>
        }
      />
    ),
  },
  {
    id: 'rotational-kinematics',
    icon: '⏱️',
    title: 'Speeding Up and Slowing Down: Angular Acceleration α',
    body: [
      "If ω is changing, the rate of change is the angular acceleration α = dω/dt, in rad/s². Everything you learned about straight-line motion carries over, with the angle taking the place of position: angular displacement θ replaces x, ω replaces v, and α replaces a.",
      "When α is constant the equations are exactly the constant-acceleration equations from the kinematics module, dressed in Greek letters. A blender slowing to a stop has a negative α: it is the SIGN that says it is slowing, because ω is positive.",
      "Now a point on the body has two accelerations. The centripetal one, ω²r, points to the centre and changes the direction. The tangential one, αr, points along the circle and changes the speed. When the turning rate is steady, α = 0 and only the centripetal one is left.",
    ],
    formulaLatex: '\\omega = \\omega_0 + \\alpha t \\qquad \\theta = \\omega_0 t + \\tfrac{1}{2}\\alpha t^2 \\qquad \\omega^2 = \\omega_0^2 + 2\\alpha\\theta \\qquad a_{tan} = \\alpha r',
    symbols: [
      { symbol: 'α', meaning: 'Angular acceleration (negative when slowing down)', unit: 'rad/s²' },
      { symbol: 'θ', meaning: 'Angle turned through', unit: 'rad' },
      { symbol: 'ω₀', meaning: 'Starting angular velocity', unit: 'rad/s' },
      { symbol: 'a tan', meaning: 'Acceleration along the circle, which changes the speed', unit: 'm/s²' },
    ],
    interactive: (
      <TryIt
        resultLabel="Angular acceleration while stopping"
        resultUnit="rad/s²"
        formulaLatex={'\\alpha = \\dfrac{\\omega_f - \\omega_0}{t} = \\dfrac{0 - \\omega_0}{t}'}
        variables={[
          { id: 'stopRpm', label: 'Starting speed', min: 100, max: 1500, step: 50, defaultValue: 600, unit: 'rpm' },
          { id: 'stopTime', label: 'Time to stop', min: 1, max: 20, step: 1, defaultValue: 5, unit: 's' },
        ]}
        compute={({ stopRpm, stopTime }) => -((stopRpm * 2 * Math.PI) / 60) / stopTime}
        interpret={({ stopRpm, stopTime }) => {
          const w0 = (stopRpm * 2 * Math.PI) / 60;
          const turns = (0.5 * w0 * stopTime) / (2 * Math.PI);
          return `It turns ${turns.toFixed(1)} full turns before stopping (θ = ½ω₀t, then divide by 2π). The minus sign just means it is slowing down.`;
        }}
      />
    ),
  },
];

// ─── Challenge Yourself: H3 / calculus-based extension ────────────────────────
// Lecture 5 reviews the same relations by differentiating: l = Rθ, ω = dθ/dt,
// α = dω/dt, a_rad = −ω²r. These sections show where they come from.
export const CIRCULAR_CHALLENGE: ConceptSection[] = [
  {
    id: 'centripetal-from-calculus',
    icon: '∂',
    title: 'Deriving a = ω²r by Differentiating',
    body: [
      "Describe a point moving round a circle of radius R at constant ω by its position vector r(t) = R(cos ωt, sin ωt). Differentiate once for the velocity and again for the acceleration, using the chain rule (each differentiation brings down a factor of ω):",
      "v(t) = Rω(−sin ωt, cos ωt) has constant size Rω and is perpendicular to r, which proves that the velocity is along the tangent. a(t) = −Rω²(cos ωt, sin ωt) = −ω² r(t): the acceleration has size ω²R and points opposite to the position vector, that is, toward the centre. Because v · a = 0, it never changes the speed, only the direction.",
    ],
    formulaLatex: '\\vec r = R(\\cos\\omega t,\\ \\sin\\omega t) \\;\\Rightarrow\\; \\vec v = \\dfrac{d\\vec r}{dt} = R\\omega(-\\sin\\omega t,\\ \\cos\\omega t) \\;\\Rightarrow\\; \\vec a = \\dfrac{d\\vec v}{dt} = -\\omega^2 \\vec r',
    symbols: [
      { symbol: 'r(t)', meaning: 'Position vector of the point, measured from the centre' },
    ],
    interactive: (
      <TryIt
        resultLabel="Size of the acceleration"
        resultUnit="m/s²"
        formulaLatex={'|\\vec a| = \\omega^2 R'}
        variables={[
          { id: 'calcOmega', label: 'Angular velocity (ω)', min: 1, max: 20, step: 0.5, defaultValue: 3, unit: 'rad/s' },
          { id: 'calcR', label: 'Radius (R)', min: 0.5, max: 5, step: 0.5, defaultValue: 2, unit: 'm' },
        ]}
        compute={({ calcOmega, calcR }) => calcOmega * calcOmega * calcR}
        interpret={({ calcOmega, calcR }) =>
          `The speed is constant at Rω = ${(calcOmega * calcR).toFixed(1)} m/s, yet the acceleration is not zero: the direction of v keeps changing.`
        }
      />
    ),
  },
  {
    id: 'angular-calculus',
    icon: '∫',
    title: 'Angular Acceleration That Changes with Time',
    body: [
      "The constant-α equations only work when α is constant. In general ω = dθ/dt and α = dω/dt, so going the other way you integrate: ω(t) = ω₀ + ∫α dt and θ(t) = θ₀ + ∫ω dt. If a motor ramps up so that α = ct, then ω = ½ct² and θ = ct³/6 (starting from rest at angle zero).",
    ],
    formulaLatex: '\\omega(t) = \\omega_0 + \\int_0^t \\alpha\\,dt\' \\qquad \\theta(t) = \\theta_0 + \\int_0^t \\omega\\,dt\'',
    symbols: [
      { symbol: 'c', meaning: 'A constant telling how quickly α grows', unit: 'rad/s³' },
    ],
    interactive: (
      <RevealAnswer
        question="A turntable starts from rest and its angular acceleration grows steadily, α = 0.20 t rad/s² (t in seconds). Find its angular velocity and the angle it has turned through after 5.0 s."
        answer={
          <>
            <p>Integrate the acceleration to get the angular velocity (it starts from rest, so ω₀ = 0):</p>
            <Katex latex={'\\omega(t) = \\int_0^t 0.20\\,t\'\\,dt\' = 0.10\\,t^2 \\;\\Rightarrow\\; \\omega(5.0) = 2.5\\ \\text{rad/s}'} displayMode />
            <p>Integrate again for the angle:</p>
            <Katex latex={'\\theta(t) = \\int_0^t 0.10\\,t\'^2\\,dt\' = \\dfrac{0.10\\,t^3}{3} \\;\\Rightarrow\\; \\theta(5.0) \\approx 4.2\\ \\text{rad}'} displayMode />
            <p>That is about two thirds of a turn (4.2 ÷ 2π ≈ 0.66).</p>
          </>
        }
      />
    ),
  },
  {
    id: 'vertical-circle-tension',
    icon: '📐',
    title: 'Tension Around a Vertical Circle',
    body: [
      "Let the bucket have speed v₀ at the bottom. Energy conservation (from the work-energy module) gives its speed at an angle φ above the bottom: v² = v₀² − 2gr(1 − cos φ). The radial equation is T − mg cos φ = mv²/r. Substituting v² gives the tension at every point on the circle:",
      "T(φ) = mv₀²/r − 2mg + 3mg cos φ. Check the two ends: at the bottom (φ = 0) it gives mv₀²/r + mg, and at the top (φ = π) it gives mv₀²/r − 5mg. The rope stays taut all the way round only if T ≥ 0 at the top, which requires v₀² ≥ 5gr. So to complete the circle the bucket must pass the bottom at no less than √(5gr). (Compare the minimum speed at the TOP, √(gr): the extra speed at the bottom pays for the climb of 2r, since v_top² = v₀² − 4gr.)",
    ],
    formulaLatex: 'T(\\varphi) = \\dfrac{mv_0^2}{r} - 2mg + 3mg\\cos\\varphi \\qquad v_{0,\\,min} = \\sqrt{5gr}',
    symbols: [
      { symbol: 'φ', meaning: 'Angle round from the lowest point (0 at the bottom, 180° at the top)', unit: 'degrees' },
      { symbol: 'v₀', meaning: 'Speed at the lowest point', unit: 'm/s' },
    ],
    interactive: (
      <TryIt
        resultLabel="Rope tension at this point"
        resultUnit="N"
        formulaLatex={'T = \\dfrac{mv_0^2}{r} - 2mg + 3mg\\cos\\varphi'}
        variables={[
          { id: 'vcSpeed', label: 'Speed at the bottom (v₀)', min: 1, max: 10, step: 0.5, defaultValue: 5, unit: 'm/s' },
          { id: 'vcAngle', label: 'Angle from the bottom (φ)', min: 0, max: 180, step: 10, defaultValue: 180, unit: '°' },
        ]}
        compute={({ vcSpeed, vcAngle }) => {
          const m = 1;
          const r = 1;
          const g = 9.8;
          return (m * vcSpeed * vcSpeed) / r - 2 * m * g + 3 * m * g * Math.cos((vcAngle * Math.PI) / 180);
        }}
        interpret={({ vcSpeed, vcAngle }) =>
          vcSpeed * vcSpeed < 5 * 9.8
            ? `For a 1 kg mass on a 1 m rope. At ${vcSpeed} m/s the bucket cannot complete the circle: the rope goes slack somewhere before the top (the tension goes negative). The minimum speed at the bottom is √(5gr) ≈ 7.0 m/s.${vcAngle === 180 ? ' Here at the top the result is negative: not possible for a rope.' : ''}`
            : `For a 1 kg mass on a 1 m rope. The tension is positive all the way round, because ${vcSpeed} m/s is above the minimum √(5gr) ≈ 7.0 m/s. It is biggest at the bottom and smallest at the top.`
        }
      />
    ),
  },
  {
    id: 'bucket-slack-point',
    icon: '📍',
    title: 'Where the Rope Goes Slack',
    body: [
      "If the bottom speed is between √(2gr) and √(5gr), the bucket rises above the level of the centre but cannot make the top. Somewhere on the way the tension reaches zero and the rope goes slack, after which the bucket flies off as a projectile. Find that point by setting T(φ) = mv₀²/r − 2mg + 3mg cos φ equal to zero:",
      "cos φ = (2g − v₀²/r) / (3g). A real answer above 90° exists only when 2gr < v₀² < 5gr. Below √(2gr) the bucket never rises above the centre, so it swings back with the rope still tight; at √(5gr) or more the slack point has been pushed all the way to the top and beyond.",
    ],
    formulaLatex: 'T(\\varphi_s) = 0 \\;\\Rightarrow\\; \\cos\\varphi_s = \\dfrac{2g - v_0^2/r}{3g} \\qquad (2gr < v_0^2 < 5gr)',
    symbols: [
      { symbol: 'φ s', meaning: 'Angle round from the bottom at which the rope goes slack', unit: 'degrees' },
    ],
    interactive: (
      <TryIt
        resultLabel="Angle at which the rope goes slack"
        resultUnit="°"
        formulaLatex={'\\varphi_s = \\cos^{-1}\\!\\left(\\dfrac{2g - v_0^2/r}{3g}\\right)'}
        variables={[
          { id: 'slackSpeed', label: 'Speed at the bottom (v₀), for a 1 m rope', min: 4.5, max: 6.9, step: 0.1, defaultValue: 5, unit: 'm/s' },
        ]}
        compute={({ slackSpeed }) => (Math.acos((2 * 9.8 - slackSpeed * slackSpeed) / (3 * 9.8)) * 180) / Math.PI}
        interpret={({ slackSpeed }) =>
          `The rope goes slack ${((Math.acos((2 * 9.8 - slackSpeed * slackSpeed) / (3 * 9.8)) * 180) / Math.PI).toFixed(0)}° round from the bottom. Push v₀ up toward √(5gr) ≈ 7.0 m/s and the slack point climbs toward the top (180°).`
        }
      />
    ),
  },
  {
    id: 'circular-self-check',
    icon: '✅',
    title: 'Self-Check',
    body: [],
    interactive: (
      <RevealAnswer
        question="A particle moves so that its position is r(t) = (2 cos 3t, 2 sin 3t) metres. Find its speed and the size and direction of its acceleration."
        answer={
          <>
            <p>Differentiate once for the velocity:</p>
            <Katex latex={'\\vec v = (-6\\sin 3t,\\ 6\\cos 3t) \\;\\Rightarrow\\; |\\vec v| = 6\\ \\text{m/s}'} displayMode />
            <p>Differentiate again for the acceleration:</p>
            <Katex latex={'\\vec a = (-18\\cos 3t,\\ -18\\sin 3t) = -9\\,\\vec r \\;\\Rightarrow\\; |\\vec a| = 18\\ \\text{m/s}^2'} displayMode />
            <p>The speed is constant at 6 m/s, and the acceleration is 18 m/s² pointing toward the centre. That matches ω²R = 3² × 2 = 18 and v²/R = 36/2 = 18.</p>
          </>
        }
      />
    ),
  },
];
