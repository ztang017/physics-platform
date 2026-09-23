import { type ConceptSection } from '../../components/concepts/ConceptNotes';
import { TryIt } from '../../components/concepts/TryIt';
import { RevealAnswer } from '../../components/concepts/RevealAnswer';
import { Katex } from '../../components/ui/Katex';

export const KINEMATICS_CONCEPTS: ConceptSection[] = [
  {
    id: 'position-distance-displacement',
    icon: '📍',
    title: 'Position, Distance, and Displacement',
    body: [
      'Position tells you where an object is, measured from some reference point you choose (the "origin"). Think of it like a mile-marker on a road — a single number, with a sign, telling you where you are along a line. Move the origin and every position value shifts, but the PHYSICS never changes — this is why physicists are free to put the origin wherever is most convenient.',
      "Distance is the total length of the path traveled — it only ever adds up, so it can never be negative, and it doesn't care which direction you were going. Displacement is different: it's the CHANGE in position, Δx = x_final − x_initial, and it can be positive, negative, or zero depending on where you ended up relative to where you started.",
      "Example: walk 5 m east, then 5 m back west. You've covered a distance of 10 m — your legs did real work either way — but your displacement is 0 m, because position-wise you ended up exactly where you started. A car's odometer measures distance; a GPS measuring 'how far from home' measures something closer to displacement.",
    ],
    formulaLatex: '\\Delta x = x_f - x_i',
    symbols: [
      { symbol: 'Δx', meaning: 'Displacement — the straight-line change in position', unit: 'm' },
      { symbol: 'x_f', meaning: 'Final position' },
      { symbol: 'x_i', meaning: 'Initial position' },
    ],
  },
  {
    id: 'velocity-vs-speed',
    icon: '🏃',
    title: 'Velocity vs. Speed',
    body: [
      'Speed just tells you how fast something is moving — always a positive number, like "60 km/h". Velocity tells you speed AND direction, like "60 km/h north". In one dimension (a straight line), direction shows up as a sign: positive usually means moving one way along your chosen axis, negative the other.',
      "This distinction matters more than it sounds: a car going around a circular track at a perfectly constant SPEED still has a constantly CHANGING velocity, because its direction keeps changing. That changing velocity is exactly why the car needs a continuous sideways force (more on that in the Forces module) — 'constant speed' does not mean 'no acceleration'.",
      'Average velocity is total displacement divided by total time — it only cares about start and end points, not the twists and turns in between. Instantaneous velocity is what a speedometer-with-direction would read at one exact moment; mathematically, it\'s the slope of the position-time graph at that single instant.',
    ],
    formulaLatex: 'v_{avg} = \\dfrac{\\Delta x}{\\Delta t}',
    symbols: [
      { symbol: 'v_{avg}', meaning: 'Average velocity over the time interval', unit: 'm/s' },
      { symbol: 'Δx', meaning: 'Displacement during that interval', unit: 'm' },
      { symbol: 'Δt', meaning: 'Elapsed time (t_final − t_initial)', unit: 's' },
    ],
  },
  {
    id: 'acceleration',
    icon: '⚡',
    title: 'Acceleration — the Rate Velocity Changes',
    body: [
      "Acceleration measures how quickly velocity itself is changing: a = Δv/Δt. It has nothing to do with how fast you're going right now — a car cruising at a constant 100 km/h on a straight highway has ZERO acceleration, even though its speed is high. A car pulling away from a stoplight at just 20 km/h can have enormous acceleration, because its velocity is changing fast.",
      'A common misconception ("impetus theory") is that a moving object needs a continuous push to keep moving, and will naturally slow down and stop on its own once that push is removed. That\'s false. By Newton\'s First Law, an object in motion stays in motion at constant velocity forever unless a net force — like friction or air resistance — acts on it. In everyday life things DO slow down, but only because friction is quietly doing exactly that: applying a force.',
      "The sign of acceleration relative to velocity tells you the whole story: same sign (both positive or both negative) means speeding up; opposite signs mean slowing down, regardless of which direction is 'positive'. A car braking while moving in the negative direction is actually accelerating in the positive direction — this trips up almost everyone the first time they see it.",
    ],
    formulaLatex: 'a = \\dfrac{\\Delta v}{\\Delta t}',
    symbols: [
      { symbol: 'a', meaning: 'Acceleration', unit: 'm/s²' },
      { symbol: 'Δv', meaning: 'Change in velocity (v_final − v_initial)', unit: 'm/s' },
      { symbol: 'Δt', meaning: 'Elapsed time', unit: 's' },
    ],
  },
  {
    id: 'equations-of-motion',
    icon: '🧮',
    title: 'The Constant-Acceleration Equations',
    body: [
      'When acceleration is constant (not changing over time — the situation this whole module simulates), two simple equations describe the ENTIRE motion, for any time t you plug in. They\'re worth memorizing because they show up constantly throughout physics.',
      'The first says velocity grows steadily from its starting value at a constant rate a. The second says position is the starting position, plus what you\'d travel at the ORIGINAL velocity, plus an extra term that accounts for the fact that velocity was also changing along the way — that\'s where the "one-half" and the squared time come from.',
      'Notice both equations reduce to the everyday case when a = 0: velocity stays at v₀ forever, and position grows linearly with time — exactly the "distance = speed × time" formula you already know intuitively.',
    ],
    formulaLatex: 'v = v_0 + at \\qquad\\qquad x = x_0 + v_0 t + \\tfrac{1}{2}at^2',
    symbols: [
      { symbol: 'v', meaning: 'Velocity at time t', unit: 'm/s' },
      { symbol: 'v_0', meaning: 'Initial velocity, at t = 0', unit: 'm/s' },
      { symbol: 'x', meaning: 'Position at time t', unit: 'm' },
      { symbol: 'x_0', meaning: 'Initial position, at t = 0', unit: 'm' },
      { symbol: 'a', meaning: 'Constant acceleration', unit: 'm/s²' },
      { symbol: 't', meaning: 'Elapsed time since the start', unit: 's' },
    ],
  },
  {
    id: 'reading-graphs',
    icon: '📈',
    title: 'Reading Motion Graphs',
    body: [
      'Graphs let you "see" motion instead of just reading numbers. On a position-time (x-t) graph, the SLOPE at any point equals the velocity at that instant — a flat line means the object is momentarily at rest, a steep line means it\'s moving fast, and a downward-sloping line means it\'s moving in the negative direction.',
      "On a velocity-time (v-t) graph, the slope equals acceleration, and — less obviously — the AREA under the curve between two times equals the displacement over that interval. This is because area = (height) × (width) = velocity × time, which is exactly the displacement for constant velocity, and calculus generalizes this to changing velocity too.",
      'A parabola on the x-t graph and a straight diagonal line on the v-t graph are really the SAME motion described two different ways — constant acceleration. Learning to translate between the two views (and to a-t graphs too) is one of the most useful skills in introductory mechanics.',
    ],
    interactive: (
      <TryIt
        resultLabel="Displacement (Δx)"
        resultUnit="m"
        formulaLatex={'\\Delta x = v \\cdot t'}
        variables={[
          { id: 'v', label: 'Velocity (v)', min: -10, max: 10, step: 0.5, defaultValue: 4, unit: 'm/s' },
          { id: 't', label: 'Time (t)', min: 0, max: 10, step: 0.5, defaultValue: 3, unit: 's' },
        ]}
        compute={({ v, t }) => v * t}
        interpret={(vals, result) =>
          result === 0
            ? 'Zero velocity or zero time means nothing has moved yet.'
            : `At a constant ${vals.v} m/s, the object ends up ${Math.abs(result).toFixed(1)} m ${result >= 0 ? 'ahead of' : 'behind'} where it started — this is the area under a flat line on a v-t graph.`
        }
      />
    ),
  },
];

// ─── Challenge Yourself: H3 / calculus-based extension ─────────────────────────
// Optional enrichment for students moving into calculus-based mechanics. It
// deliberately reframes formulas already taught above as calculus statements,
// rather than introducing new physics — the goal is recognition, not a new
// syllabus grafted on top of a beginner module.
export const KINEMATICS_CHALLENGE: ConceptSection[] = [
  {
    id: 'derivatives-of-motion',
    icon: '📐',
    title: 'Derivatives: The Calculus Behind the Slopes',
    body: [
      "You already know velocity is the slope of an x-t graph, and acceleration is the slope of a v-t graph. Calculus just gives that idea a name and a symbol: the slope AT AN INSTANT is called a derivative, written dx/dt.",
      'So velocity is formally defined as v(t) = dx/dt — the instantaneous rate of change of position. Acceleration is the derivative of velocity, a(t) = dv/dt, which makes it the SECOND derivative of position: a(t) = d²x/dt². Every "slope of the graph" statement from the basics section above is really this, just without the notation.',
    ],
    formulaLatex: 'v(t) = \\dfrac{dx}{dt} \\qquad\\qquad a(t) = \\dfrac{dv}{dt} = \\dfrac{d^2x}{dt^2}',
    symbols: [
      { symbol: 'dx/dt', meaning: 'The instantaneous rate of change of position — velocity' },
      { symbol: 'd²x/dt²', meaning: 'The rate of change of velocity — acceleration, found by differentiating twice' },
    ],
  },
  {
    id: 'integrating-variable-acceleration',
    icon: '∫',
    title: 'Integrating Variable Acceleration',
    body: [
      "The constant-acceleration equations (v = v₀ + at, x = x₀ + v₀t + ½at²) aren't arbitrary — they're what you get from integrating a(t) = a (a constant) once to get v(t), then integrating again to get x(t). Integration is the reverse of differentiation: instead of finding a slope, you're finding the area under a graph, which accumulates change over time.",
      "This matters because real acceleration often ISN'T constant. Suppose a(t) = 6t (it grows steadily with time) and the object starts from rest at the origin. Integrating once: v(t) = ∫6t dt = 3t² + C. Since v(0) = 0, C = 0, so v(t) = 3t². Integrating again: x(t) = ∫3t² dt = t³ + C. Since x(0) = 0, C = 0, so x(t) = t³.",
      'None of the algebra-based formulas above could handle this case — they only work when a is constant. This is exactly the situation H3/university mechanics is built to handle.',
    ],
    interactive: (
      <TryIt
        resultLabel="Velocity v(t) = ½kt²"
        resultUnit="m/s"
        formulaLatex={'a(t) = kt \\quad\\Rightarrow\\quad v(t) = \\int_0^t kt\\,dt = \\tfrac{1}{2}kt^2'}
        variables={[
          { id: 'k', label: 'Rate constant (k)', min: 0.5, max: 6, step: 0.5, defaultValue: 2, unit: 'm/s³' },
          { id: 't', label: 'Time (t)', min: 0, max: 6, step: 0.5, defaultValue: 2, unit: 's' },
        ]}
        compute={({ k, t }) => 0.5 * k * t * t}
        interpret={(vals, result) =>
          `With acceleration growing linearly as a(t) = ${vals.k}t, integrating gives v(t) = ½(${vals.k})t² — at t = ${vals.t}s that works out to ${result.toFixed(1)} m/s, starting from rest.`
        }
      />
    ),
  },
  {
    id: 'kinematics-self-check',
    icon: '✅',
    title: 'Self-Check',
    body: [],
    interactive: (
      <RevealAnswer
        question="An object starts from rest and experiences acceleration a(t) = 4t (m/s²). What is its velocity at t = 3 s?"
        answer={
          <>
            <p>Integrate a(t) with respect to time: v(t) = ∫4t dt = 2t² + C.</p>
            <Katex latex={'v(t) = 2t^2 + C'} displayMode />
            <p>Since the object starts from rest, v(0) = 0, so C = 0, giving v(t) = 2t².</p>
            <p>At t = 3 s: v(3) = 2(3)² = 2(9) = <strong>18 m/s</strong>.</p>
          </>
        }
      />
    ),
  },
];
