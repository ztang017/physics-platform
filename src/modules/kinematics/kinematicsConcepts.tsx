import { type ConceptSection } from '../../components/concepts/ConceptNotes';
import { TryIt } from '../../components/concepts/TryIt';
import { RevealAnswer } from '../../components/concepts/RevealAnswer';
import { Katex } from '../../components/ui/Katex';

export const KINEMATICS_CONCEPTS: ConceptSection[] = [
  {
    id: 'toolkit',
    icon: '🧰',
    title: 'Your Toolkit: Symbols, Units and Graphs',
    summary: 'Physics uses short symbols and units as shorthand. Once you can read them, every formula is just a sentence.',
    body: [
      "Physicists write quantities as letters. The letter x stands for position (where something is), v for velocity (how fast, and which way), a for acceleration and t for time. A small mark next to a letter tells you when. A subscript 0 or i, as in x₀ or xᵢ, means 'at the start'. A subscript f, as in x_f, means 'at the end'.",
      "The Greek letter Δ (say 'delta') means 'change in'. So Δx is the change in position: the final position minus the starting position. If you walk from the 2 m mark to the 7 m mark, then Δx = 7 − 2 = 5 m.",
      "Every number needs a unit. Metres (m) measure distance and seconds (s) measure time. The word 'per' means 'divide by', so m/s ('metres per second') is a distance divided by a time. You will also see m/s², which means 'metres per second, per second'. A little 2 on a letter (like t²) means the number multiplied by itself, and ½ simply means one half.",
      "A graph shows how one quantity changes as another one does. Time is usually along the bottom. The slope of a line (how steep it is) tells you how fast the quantity is changing. The area under a line adds up the total change. You will use both ideas in this module.",
    ],
    watchOut: 'Always check the units. If you are asked for a speed and your answer is in metres, something has gone wrong.',
    interactive: (
      <TryIt
        resultLabel="Average velocity"
        resultUnit="m/s"
        formulaLatex={'v_{avg} = \\dfrac{\\Delta x}{\\Delta t} = \\dfrac{x_f - x_i}{t}'}
        variables={[
          { id: 'startPos', label: 'Starting position (xᵢ)', min: -10, max: 10, step: 1, defaultValue: 2, unit: 'm' },
          { id: 'endPos', label: 'Final position (x_f)', min: -10, max: 20, step: 1, defaultValue: 12, unit: 'm' },
          { id: 'elapsed', label: 'Time taken (t)', min: 1, max: 10, step: 1, defaultValue: 4, unit: 's' },
        ]}
        compute={({ startPos, endPos, elapsed }) => (endPos - startPos) / elapsed}
        interpret={({ startPos, endPos, elapsed }, result) =>
          `The position changed by Δx = ${endPos} − (${startPos}) = ${endPos - startPos} m in ${elapsed} s, so the average velocity is ${result.toFixed(2)} m/s${result < 0 ? ' (negative, so it moved in the negative direction)' : ''}.`
        }
      />
    ),
  },
  {
    id: 'position-distance-displacement',
    icon: '📍',
    title: 'Position, Distance, and Displacement',
    summary: 'Distance is how much ground you covered. Displacement is how far you ended up from where you started, in a particular direction.',
    body: [
      "Position tells you where something is, measured from a starting point you choose, called the origin. Think of the numbered markers beside a road. Position is one number with a sign: positive on one side of the origin and negative on the other.",
      "Distance is the total length of the path you travelled. It only ever adds up, so it is never negative. Displacement is different. It is the change in position, final minus initial, and it can be positive, negative or zero.",
      "Example: walk 5 m east, then 5 m back west. Your distance is 10 m, because you really did walk that far. Your displacement is 0 m, because you finished exactly where you started.",
      "A car's odometer measures distance. The question 'how far am I from home right now?' is closer to displacement.",
    ],
    watchOut: 'Moving the origin changes every position number, but it never changes a displacement. Put the origin wherever makes the problem easiest.',
    formulaLatex: '\\Delta x = x_f - x_i',
    symbols: [
      { symbol: 'Δx', meaning: 'Displacement: the straight-line change in position', unit: 'm' },
      { symbol: 'x_f', meaning: 'Final position' },
      { symbol: 'x_i', meaning: 'Initial position' },
    ],
  },
  {
    id: 'velocity-vs-speed',
    icon: '🏃',
    title: 'Velocity vs. Speed',
    summary: 'Speed says how fast. Velocity says how fast and which way.',
    body: [
      "Speed tells you how fast something is moving. It is never negative, for example '60 km/h'. Velocity tells you the speed and the direction, for example '60 km/h north'. On a straight line, the direction is shown by a sign: plus for one way and minus for the other.",
      "Average velocity is the displacement divided by the time taken. It only cares about where you started and finished, not about the twists and turns in between.",
      "Instantaneous velocity is the velocity at one exact moment, like a speedometer that also shows direction. On a position-time graph it is the slope of the line at that moment.",
    ],
    watchOut: "A steady speed does not always mean a steady velocity. A car going round a track at 60 km/h keeps changing direction, so its velocity keeps changing. (You will meet circular motion in Module 6.)",
    formulaLatex: 'v_{avg} = \\dfrac{\\Delta x}{\\Delta t}',
    symbols: [
      { symbol: 'v_{avg}', meaning: 'Average velocity over the time interval', unit: 'm/s' },
      { symbol: 'Δx', meaning: 'Displacement during that interval', unit: 'm' },
      { symbol: 'Δt', meaning: 'Elapsed time (final time minus initial time)', unit: 's' },
    ],
  },
  {
    id: 'acceleration',
    icon: '⚡',
    title: 'Acceleration: How Quickly Velocity Changes',
    summary: 'Acceleration is how quickly velocity changes: speeding up, slowing down or turning.',
    body: [
      "Acceleration measures how quickly velocity changes: a = Δv/Δt. An acceleration of 2 m/s² means that every second the velocity changes by 2 m/s. Starting from rest, you would be moving at 2, 4 and 6 m/s after 1, 2 and 3 seconds.",
      "Acceleration is about CHANGE, not about being fast. A car cruising at a steady 100 km/h has zero acceleration. A car pulling away from a red light has a large acceleration, even though it is still moving slowly.",
      "Compare the signs to see what is happening. If velocity and acceleration have the SAME sign, the object is speeding up. If the signs are OPPOSITE, it is slowing down. A car moving in the negative direction and braking has a positive acceleration.",
      "Many people believe a moving object needs a steady push to keep going. It does not. Newton's First Law says an object keeps moving at a steady velocity unless a force acts on it. Everyday things slow down because friction and air resistance are forces pushing back.",
    ],
    watchOut: 'Zero acceleration does not mean zero velocity. It means the velocity is not changing.',
    formulaLatex: 'a = \\dfrac{\\Delta v}{\\Delta t}',
    symbols: [
      { symbol: 'a', meaning: 'Acceleration', unit: 'm/s²' },
      { symbol: 'Δv', meaning: 'Change in velocity (final minus initial)', unit: 'm/s' },
      { symbol: 'Δt', meaning: 'Time taken for that change', unit: 's' },
    ],
    interactive: (
      <TryIt
        resultLabel="Acceleration"
        resultUnit="m/s²"
        formulaLatex={'a = \\dfrac{\\Delta v}{\\Delta t} = \\dfrac{v_f - v_i}{t}'}
        variables={[
          { id: 'vStart', label: 'Starting velocity (vᵢ)', min: -15, max: 15, step: 1, defaultValue: 4, unit: 'm/s' },
          { id: 'vEnd', label: 'Final velocity (v_f)', min: -15, max: 15, step: 1, defaultValue: 0, unit: 'm/s' },
          { id: 'accelTime', label: 'Time taken (t)', min: 1, max: 10, step: 1, defaultValue: 4, unit: 's' },
        ]}
        compute={({ vStart, vEnd, accelTime }) => (vEnd - vStart) / accelTime}
        interpret={({ vStart, vEnd }, result) => {
          if (result === 0) return 'The velocity did not change, so the acceleration is zero.';
          const speedingUp = Math.abs(vEnd) > Math.abs(vStart) && Math.sign(vEnd) * Math.sign(vStart) >= 0;
          return speedingUp
            ? 'The speed is growing, so the object is speeding up. Notice that velocity and acceleration have the same sign.'
            : 'The speed is shrinking (or the direction is reversing), so the object is slowing down. Notice that velocity and acceleration have opposite signs.';
        }}
      />
    ),
  },
  {
    id: 'equations-of-motion',
    icon: '🧮',
    title: 'The Constant-Acceleration Equations',
    summary: 'When acceleration stays the same, two short formulas give the velocity and the position at any time.',
    body: [
      "In this module the acceleration stays constant. In that case two formulas describe the whole motion, for any time t. The first says: velocity now = starting velocity + acceleration × time.",
      "The second gives the position. Start from where you began (x₀). Add the distance you would have covered at your starting velocity (v₀t). Then add a bonus (½at²), because your velocity was growing as you went. That bonus is where the half and the squared time come from.",
      "If a = 0 the bonus disappears. The velocity never changes, and the position grows by speed × time, which you already know.",
      "Worked example: a cyclist starts at 2 m/s and speeds up at 1 m/s². After 4 s, v = 2 + 1×4 = 6 m/s and x = 2×4 + ½×1×4² = 8 + 8 = 16 m from the start.",
    ],
    watchOut: 'These formulas only work when the acceleration is constant. If the acceleration changes during the motion, they give wrong answers.',
    formulaLatex: 'v = v_0 + at \\qquad\\qquad x = x_0 + v_0 t + \\tfrac{1}{2}at^2',
    symbols: [
      { symbol: 'v', meaning: 'Velocity at time t', unit: 'm/s' },
      { symbol: 'v_0', meaning: 'Initial velocity, at t = 0', unit: 'm/s' },
      { symbol: 'x', meaning: 'Position at time t', unit: 'm' },
      { symbol: 'x_0', meaning: 'Initial position, at t = 0', unit: 'm' },
      { symbol: 'a', meaning: 'Constant acceleration', unit: 'm/s²' },
      { symbol: 't', meaning: 'Time since the start', unit: 's' },
    ],
    interactive: (
      <TryIt
        resultLabel="Position after time t (starting at x₀ = 0)"
        resultUnit="m"
        formulaLatex={'x = v_0 t + \\tfrac{1}{2}at^2'}
        variables={[
          { id: 'eomV0', label: 'Starting velocity (v₀)', min: -10, max: 10, step: 1, defaultValue: 2, unit: 'm/s' },
          { id: 'eomA', label: 'Acceleration (a)', min: -4, max: 4, step: 0.5, defaultValue: 1, unit: 'm/s²' },
          { id: 'eomT', label: 'Time (t)', min: 0, max: 10, step: 1, defaultValue: 4, unit: 's' },
        ]}
        compute={({ eomV0, eomA, eomT }) => eomV0 * eomT + 0.5 * eomA * eomT * eomT}
        interpret={({ eomV0, eomA, eomT }) =>
          `After ${eomT} s the velocity is v = ${eomV0} + (${eomA})(${eomT}) = ${(eomV0 + eomA * eomT).toFixed(1)} m/s. The first part of the position (v₀t = ${(eomV0 * eomT).toFixed(1)} m) is the distance at the starting velocity; the rest (${(0.5 * eomA * eomT * eomT).toFixed(1)} m) is the bonus from accelerating.`
        }
      />
    ),
  },
  {
    id: 'meeting-point',
    icon: '🤝',
    title: 'When Two Objects Meet',
    summary: 'To find when two moving things meet, write each one\'s position formula and set the two equal.',
    body: [
      "Some problems ask WHEN and WHERE two moving objects are at the same place at the same time, such as a second ball thrown after the first. This is not new physics. Write the position formula for each object, set the two equal, and solve for t.",
      "There is one trap: the clock. If the second object starts Δt seconds late, write (t − Δt) wherever its formula has a t. By the shared clock, it has only been moving for (t − Δt) seconds.",
    ],
    watchOut: 'Use ONE clock for both objects. Mixing a separate clock for each is the most common mistake in these problems.',
    interactive: (
      <RevealAnswer
        question="Ball A is thrown straight up at 20 m/s. Exactly 1 s later, Ball B is thrown straight up from the same point at 30 m/s. Measuring t from when Ball A is thrown, when do the two balls meet? (Use g = 10 m/s², so ½g = 5.)"
        answer={
          <>
            <p>Write a height formula for each ball, both on the same clock t. Ball A has been flying for t seconds:</p>
            <Katex latex={'x_A = 20t - 5t^2'} displayMode />
            <p>Ball B has only been flying for (t − 1) seconds:</p>
            <Katex latex={'x_B = 30(t-1) - 5(t-1)^2'} displayMode />
            <p>Expand Ball B. First, 30(t − 1) = 30t − 30. Then (t − 1)² = t² − 2t + 1, so −5(t − 1)² = −5t² + 10t − 5. Adding the two parts:</p>
            <Katex latex={'x_B = 40t - 35 - 5t^2'} displayMode />
            <p>The balls meet when x_A = x_B:</p>
            <Katex latex={'20t - 5t^2 = 40t - 35 - 5t^2'} displayMode />
            <p>The −5t² terms cancel (both balls feel the same gravity). That leaves 20t = 40t − 35, so 20t = 35 and <strong>t = 1.75 s</strong>.</p>
            <p>Check: x_A = 20(1.75) − 5(1.75)² ≈ 19.7 m, and x_B = 30(0.75) − 5(0.75)² ≈ 19.7 m. Both balls are about 19.7 m up at that moment.</p>
          </>
        }
      />
    ),
  },
  {
    id: 'reading-graphs',
    icon: '📈',
    title: 'Reading Motion Graphs',
    summary: 'On a position-time graph the slope is the velocity. On a velocity-time graph the slope is the acceleration and the area is the displacement.',
    body: [
      "Graphs let you SEE motion. On a position-time (x-t) graph, the slope at any point is the velocity. A flat line means the object is at rest. A steep line means it is moving fast. A line sloping downward means it is moving in the negative direction.",
      "On a velocity-time (v-t) graph, the slope is the acceleration. The area between the line and the time axis is the displacement. Why? Area is height × width, which here is velocity × time, and that is the distance travelled.",
      "A straight sloping line on the v-t graph and a curved parabola on the x-t graph are the SAME motion shown in two ways: constant acceleration.",
    ],
    watchOut: 'A graph is not a picture of the path. A rising line on a v-t graph does not mean the object is going uphill. It means the velocity is increasing.',
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
            : `At a steady ${vals.v} m/s, the object ends up ${Math.abs(result).toFixed(1)} m ${result >= 0 ? 'ahead of' : 'behind'} where it started. That is the area under a flat line on a v-t graph.`
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
    summary: "Velocity is the derivative of position and acceleration is the derivative of velocity: slopes, written in calculus notation.",
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
    summary: "Integrating acceleration gives velocity, and integrating velocity gives position. This works even when the acceleration changes.",
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
    id: 'terminal-velocity-ode',
    icon: '🪂',
    title: 'Terminal Velocity: A Differential Equation',
    summary: "With air resistance the acceleration shrinks as you speed up, so the velocity levels off at a maximum called the terminal velocity.",
    body: [
      "Every equation so far assumed CONSTANT acceleration. But a falling object with air resistance doesn't accelerate at a constant rate — the faster it falls, the more the air pushes back, so its acceleration actually shrinks over time. Approximately, a = dv/dt = g − kv, where k is a constant capturing how strong the air resistance is. This is a differential equation: it relates v to its OWN derivative, not just to t directly.",
      "Solving it takes a technique called separation of variables: rearrange so every v term is on one side and every t term is on the other, dv/(g−kv) = dt, then integrate both sides. Starting from rest (v = 0 at t = 0), the result works out to v(t) = (g/k)(1 − e^(−kt)) — velocity that rises quickly at first, then FLATTENS OUT as e^(−kt) shrinks toward zero.",
      "That flat ceiling is the terminal velocity: as t → ∞, e^(−kt) → 0, so v approaches g/k and never exceeds it. This is exactly why a skydiver stops speeding up after a while and instead falls at a constant, maximum speed — the air resistance has grown large enough to exactly cancel gravity, making the net acceleration zero.",
    ],
    formulaLatex: 'a = \\dfrac{dv}{dt} = g - kv \\quad\\Rightarrow\\quad v(t) = \\dfrac{g}{k}\\left(1 - e^{-kt}\\right)',
    symbols: [
      { symbol: 'k', meaning: 'A constant capturing how strongly air resistance grows with speed', unit: '1/s' },
      { symbol: 'v_{max} = g/k', meaning: 'Terminal velocity — the speed v(t) approaches but never exceeds' },
    ],
    interactive: (
      <TryIt
        resultLabel="Velocity at time t"
        resultUnit="m/s"
        formulaLatex={'v(t) = \\dfrac{g}{k}\\left(1-e^{-kt}\\right)'}
        variables={[
          { id: 'k', label: 'Air-resistance constant (k)', min: 0.1, max: 2, step: 0.1, defaultValue: 0.5, unit: '1/s' },
          { id: 't', label: 'Time since falling from rest (t)', min: 0, max: 15, step: 0.5, defaultValue: 4, unit: 's' },
        ]}
        compute={({ k, t }) => (9.8 / k) * (1 - Math.exp(-k * t))}
        interpret={({ k, t }, result) =>
          `With k = ${k}, terminal velocity is g/k ≈ ${(9.8 / k).toFixed(1)} m/s. At t = ${t}s the falling object has reached ${result.toFixed(1)} m/s — ${result / (9.8 / k) > 0.95 ? "already essentially at its terminal speed" : "still speeding up, but the rate of increase is slowing down"}.`
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
