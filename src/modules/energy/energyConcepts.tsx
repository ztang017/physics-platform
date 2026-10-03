import { type ConceptSection } from '../../components/concepts/ConceptNotes';
import { TryIt } from '../../components/concepts/TryIt';
import { RevealAnswer } from '../../components/concepts/RevealAnswer';
import { Katex } from '../../components/ui/Katex';

// Order follows Lecture 3 (Work and Energy): work → net work → work-energy
// theorem → potential energies → conservative forces → conservation of energy
// → power. The last two sections tie everything to the Energy Ramp simulation.
export const ENERGY_CONCEPTS: ConceptSection[] = [
  {
    id: 'what-is-work',
    icon: '💪',
    title: 'What Is Work?',
    summary: "Work happens when a force acts while the object moves. Effort that does not move the object does no work on it.",
    body: [
      "In everyday language 'work' means effort. In physics it has a precise meaning: a force does work on an object only when the object MOVES while the force acts on it. Holding a heavy box motionless is tiring, but physically it does zero work on the box, because the box doesn't go anywhere.",
      "Only the part of the force pointing ALONG the direction of motion counts. Push straight along the motion and all of the force counts (cos 0° = 1). Push at an angle and only the component along the motion counts. Push exactly sideways to the motion (cos 90° = 0) and you do no work at all. That is why carrying a bag at a steady height across a room does zero work on the bag.",
      "Work is a scalar with a sign. Positive work adds energy to the object (the force helps the motion). Negative work removes it (the force opposes the motion — friction always does this). Zero work changes nothing. The unit is the joule: 1 J = 1 N·m.",
    ],
    formulaLatex: 'W = F\\,s\\cos\\theta',
    symbols: [
      { symbol: 'W', meaning: 'Work done by the force', unit: 'J' },
      { symbol: 'F', meaning: 'Size of the force', unit: 'N' },
      { symbol: 's', meaning: 'How far the object moves (its displacement)', unit: 'm' },
      { symbol: 'θ', meaning: 'Angle between the force and the direction of motion', unit: 'degrees' },
    ],
    interactive: (
      <TryIt
        resultLabel="Work done by the force"
        resultUnit="J"
        formulaLatex={'W = F\\,s\\cos\\theta'}
        variables={[
          { id: 'workForce', label: 'Force (F)', min: 1, max: 100, step: 1, defaultValue: 20, unit: 'N' },
          { id: 'workDist', label: 'Distance moved (s)', min: 0, max: 10, step: 0.5, defaultValue: 5, unit: 'm' },
          { id: 'workAngle', label: 'Angle to the motion (θ)', min: 0, max: 180, step: 5, defaultValue: 0, unit: '°' },
        ]}
        compute={({ workForce, workDist, workAngle }) =>
          workForce * workDist * Math.cos((workAngle * Math.PI) / 180)
        }
        interpret={({ workAngle }) =>
          workAngle === 90
            ? 'At exactly 90° the force is sideways to the motion, so it does zero work — like the upward force on a bag carried across a room.'
            : workAngle < 90
              ? 'The force has a component along the motion, so it does positive work: it adds energy to the object.'
              : 'The force points against the motion, so it does negative work: it removes energy, just as friction does.'
        }
      />
    ),
  },
  {
    id: 'net-work',
    icon: '➕',
    title: 'Net Work: Adding Up Every Force',
    summary: "Net work is the work done by all the forces added together.",
    body: [
      'Usually several forces act on an object at once — a push, gravity, friction, the normal force. Each one does its own work, positive or negative. The NET (or total) work is simply the sum of them all, which is the same as the work done by the net force.',
      "Example: you push a crate 4 m across a floor with 50 N while friction pushes back with 30 N. Your push does +200 J and friction does −120 J. Gravity and the normal force are perpendicular to the motion, so they do 0 J. The net work is +200 − 120 = +80 J.",
      "The sign of the net work decides what happens to the object's speed — which is exactly what the next section makes precise.",
    ],
    formulaLatex: 'W_{net} = W_1 + W_2 + \\dots = F_{net}\\,s\\cos\\theta',
    symbols: [
      { symbol: 'W_{net}', meaning: 'Total work done on the object by all forces', unit: 'J' },
      { symbol: 'W_1, W_2', meaning: 'Work done by each individual force', unit: 'J' },
      { symbol: 'F_{net}', meaning: 'The single combined (net) force on the object', unit: 'N' },
    ],
  },
  {
    id: 'work-energy-theorem',
    icon: '🏃',
    title: 'Kinetic Energy and the Work–Energy Theorem',
    summary: "The net work done on an object equals the change in its kinetic energy (its energy of motion).",
    body: [
      "Kinetic energy (K) is the energy an object has because it is moving: K = ½mv². But don't just memorise the formula — its real meaning is that K is the amount of work it took to get the object up to that speed from rest.",
      'That gives the work-energy theorem: the net work done on an object equals the change in its kinetic energy. Positive net work speeds it up, negative net work slows it down, and zero net work leaves its speed unchanged — even if several large forces are acting at once.',
      'Because K depends on v², doubling the speed quadruples the kinetic energy. That is why a car at 100 km/h needs about four times the braking distance of the same car at 50 km/h. Stopping it means removing four times as much energy.',
    ],
    formulaLatex: 'W_{net} = \\Delta K = \\tfrac{1}{2}mv_f^2 - \\tfrac{1}{2}mv_i^2',
    symbols: [
      { symbol: 'ΔK', meaning: 'Change in kinetic energy (final minus initial)', unit: 'J' },
      { symbol: 'm', meaning: 'Mass of the object', unit: 'kg' },
      { symbol: 'v_i, v_f', meaning: 'Initial and final speed', unit: 'm/s' },
    ],
    interactive: (
      <TryIt
        resultLabel="Final speed (starting from rest)"
        resultUnit="m/s"
        formulaLatex={'F_{net}\\,s = \\tfrac{1}{2}mv^2 \\;\\Rightarrow\\; v = \\sqrt{\\dfrac{2F_{net}s}{m}}'}
        variables={[
          { id: 'keForce', label: 'Net force (F)', min: 1, max: 100, step: 1, defaultValue: 20, unit: 'N' },
          { id: 'keDist', label: 'Distance pushed (s)', min: 0.5, max: 10, step: 0.5, defaultValue: 4, unit: 'm' },
          { id: 'keMass', label: 'Mass (m)', min: 1, max: 20, step: 1, defaultValue: 4, unit: 'kg' },
        ]}
        compute={({ keForce, keDist, keMass }) => Math.sqrt((2 * keForce * keDist) / keMass)}
        interpret={({ keForce, keDist }) =>
          `The net force does ${(keForce * keDist).toFixed(0)} J of work, and all of it becomes kinetic energy. Try doubling the mass: the same work now gives a smaller speed, because the energy is shared out over more mass.`
        }
      />
    ),
  },
  {
    id: 'gravitational-pe',
    icon: '⛰️',
    title: 'Gravitational Potential Energy',
    summary: "Lifting an object stores energy in it. Only the change in height matters, not where you call zero.",
    body: [
      "When you lift an object you do work against gravity. That work isn't lost — it is stored as gravitational potential energy (U), ready to turn back into motion if the object falls.",
      "Near Earth's surface the change in potential energy depends only on the change in height: ΔU = mgΔy. Notice that only the CHANGE matters. You can call 'zero height' the floor, the table, or the top of a building — every choice gives the same ΔU, and so the same physics. Pick whichever makes the problem easiest.",
      "Gravity is fully reversible: lift a book up and gravity does negative work on it; let it fall and gravity pays every joule back as positive work.",
    ],
    formulaLatex: '\\Delta U = mg\\,\\Delta y',
    symbols: [
      { symbol: 'ΔU', meaning: 'Change in gravitational potential energy', unit: 'J' },
      { symbol: 'm', meaning: 'Mass', unit: 'kg' },
      { symbol: 'g', meaning: 'Gravitational acceleration, about 9.8', unit: 'm/s²' },
      { symbol: 'Δy', meaning: 'Change in height (upward is positive)', unit: 'm' },
    ],
    interactive: (
      <TryIt
        resultLabel="Potential energy gained"
        resultUnit="J"
        formulaLatex={'\\Delta U = mg\\,\\Delta y'}
        variables={[
          { id: 'peMass', label: 'Mass (m)', min: 1, max: 20, step: 1, defaultValue: 5, unit: 'kg' },
          { id: 'peHeight', label: 'Height gained (Δy)', min: 0, max: 10, step: 0.5, defaultValue: 2, unit: 'm' },
        ]}
        compute={({ peMass, peHeight }) => peMass * 9.8 * peHeight}
        interpret={({ peMass, peHeight }) =>
          `Lifting ${peMass} kg by ${peHeight} m stores this much energy. It would be exactly the same whether you measured the height from the floor, the table, or the ceiling.`
        }
      />
    ),
  },
  {
    id: 'elastic-pe',
    icon: '🌀',
    title: 'Springs and Elastic Potential Energy',
    summary: "A squashed or stretched spring stores energy of ½kx², which grows with the square of how far it is squashed.",
    body: [
      "Stretch or squash a spring by an amount x from its natural length and it pushes back with a force F = −kx. Here k is the spring constant: a stiffer spring has a bigger k. The minus sign says the force always points back toward the natural length.",
      "The force grows as you stretch, so the work isn't simply force × distance. It is the AREA of the triangle under the force-against-stretch graph: ½ × x × kx = ½kx². That stored work is the spring's elastic potential energy.",
      "Because x is squared, stretching a spring twice as far stores FOUR times the energy. And x is the extension from the natural length — not the spring's total length.",
    ],
    formulaLatex: 'F = -kx \\qquad\\qquad U_{el} = \\tfrac{1}{2}kx^2',
    symbols: [
      { symbol: 'k', meaning: 'Spring constant (stiffness)', unit: 'N/m' },
      { symbol: 'x', meaning: 'Extension or compression from the natural length', unit: 'm' },
      { symbol: 'U_{el}', meaning: 'Elastic potential energy stored in the spring', unit: 'J' },
    ],
    interactive: (
      <TryIt
        resultLabel="Energy stored in the spring"
        resultUnit="J"
        formulaLatex={'U_{el} = \\tfrac{1}{2}kx^2'}
        variables={[
          { id: 'springK', label: 'Spring constant (k)', min: 50, max: 500, step: 10, defaultValue: 200, unit: 'N/m' },
          { id: 'springX', label: 'Compression (x)', min: 0, max: 1, step: 0.05, defaultValue: 0.3, unit: 'm' },
        ]}
        compute={({ springK, springX }) => 0.5 * springK * springX * springX}
        interpret={({ springX }) =>
          `Try doubling the compression from ${springX} m to ${(springX * 2).toFixed(2)} m — the stored energy goes up by a factor of 4, not 2.`
        }
      />
    ),
  },
  {
    id: 'conservative-forces',
    icon: '🔁',
    title: 'Conservative and Non-Conservative Forces',
    summary: "Gravity and springs give back the energy you put in. Friction does not: it turns energy into heat.",
    body: [
      "Forces come in two families. A force is CONSERVATIVE if the work it does between two points depends only on where the object starts and ends. The path it takes does not matter. Gravity and spring forces are conservative.",
      'An equivalent test: a conservative force does zero net work around any closed loop. Carry a book up a hill and back down to where you began, and gravity has given back exactly what it took. Conservative forces are the ones that let us define a potential energy — energy stored that can be fully recovered.',
      "Friction is NON-conservative: the longer the path you drag a box between two points, the more work friction does. Its work can't be stored as potential energy — it becomes thermal energy, warming the surfaces. The energy isn't destroyed; it's just no longer available as motion.",
    ],
  },
  {
    id: 'conservation-of-energy',
    icon: '♻️',
    title: 'Conservation of Energy',
    summary: "Energy changes form but the total never changes. Friction turns some of it into heat.",
    body: [
      'Now put it together. If only conservative forces do work, the mechanical energy E = K + U never changes. Whatever the object loses in potential energy it gains in kinetic energy, and the other way round. A ball thrown upward trades speed for height; a roller coaster trades height for speed.',
      "When friction (or any non-conservative force) also does work, mechanical energy changes by exactly that amount: W_nc = ΔK + ΔU. Friction's work is negative, so the mechanical energy drops — and the missing energy shows up as heat. Total energy, counting the heat, is always conserved.",
      "A puzzle to test your intuition: a pendulum bob swings down and its string is snagged by a bar partway through the swing. How high does it rise on the other side? The same height it was released from, as long as the string stays taut. The bar changes the PATH, but energy conservation only cares about height, because gravity is conservative.",
    ],
    formulaLatex: 'K_i + U_i + W_{nc} = K_f + U_f',
    symbols: [
      { symbol: 'K, U', meaning: 'Kinetic and potential energy at the start (i) and the end (f)', unit: 'J' },
      { symbol: 'W_{nc}', meaning: 'Work done by non-conservative forces such as friction (negative when it slows things down)', unit: 'J' },
    ],
    interactive: (
      <TryIt
        resultLabel="Speed at the bottom of a frictionless slope"
        resultUnit="m/s"
        formulaLatex={'mgh = \\tfrac{1}{2}mv^2 \\;\\Rightarrow\\; v = \\sqrt{2gh}'}
        variables={[
          { id: 'consHeight', label: 'Release height (h)', min: 0.5, max: 10, step: 0.5, defaultValue: 2, unit: 'm' },
        ]}
        compute={({ consHeight }) => Math.sqrt(2 * 9.8 * consHeight)}
        interpret={() =>
          'Notice that mass never appears: a heavy block and a light one reach the bottom at the same speed. Nor does the shape of the slope matter — only the height dropped.'
        }
      />
    ),
  },
  {
    id: 'power',
    icon: '⚡',
    title: 'Power: How Fast Energy Is Transferred',
    summary: "Power is how fast energy is transferred: energy per second, measured in watts.",
    body: [
      'Power is the rate at which work is done (or energy is transferred): P = W/t. Two people climb the same staircase, so they do the same work against gravity. The one who runs up has more power, because they do the work in less time.',
      'When a force acts along the direction of motion at speed v, the power is P = Fv. This is why pushing hard at high speed takes so much power. A cyclist fighting air resistance needs far more power at higher speeds, because the drag force itself grows with speed and is then multiplied by the speed again.',
      'The unit is the watt: 1 W = 1 J/s. A 100 W light bulb converts 100 joules of electrical energy every second.',
    ],
    formulaLatex: 'P = \\dfrac{W}{t} \\qquad\\qquad P = Fv',
    symbols: [
      { symbol: 'P', meaning: 'Power', unit: 'W' },
      { symbol: 'W', meaning: 'Work done (energy transferred)', unit: 'J' },
      { symbol: 't', meaning: 'Time taken', unit: 's' },
      { symbol: 'v', meaning: 'Speed at which the force is moving its point of application', unit: 'm/s' },
    ],
    interactive: (
      <TryIt
        resultLabel="Power needed"
        resultUnit="W"
        formulaLatex={'P = Fv'}
        variables={[
          { id: 'powerForce', label: 'Force (F)', min: 10, max: 500, step: 10, defaultValue: 100, unit: 'N' },
          { id: 'powerSpeed', label: 'Speed (v)', min: 0.5, max: 15, step: 0.5, defaultValue: 5, unit: 'm/s' },
        ]}
        compute={({ powerForce, powerSpeed }) => powerForce * powerSpeed}
        interpret={({ powerSpeed }) =>
          `Moving at ${powerSpeed} m/s against this force costs the power shown. Double the speed and the power needed doubles too — before you even count the extra drag that higher speeds bring.`
        }
      />
    ),
  },
  {
    id: 'energy-bar-charts',
    icon: '📊',
    title: 'Energy Bar Charts: Keeping the Books',
    summary: "An energy bar chart is a snapshot of where the energy is. The bars must add up to the same total every time.",
    body: [
      "An energy bar chart is a snapshot of where an object's energy is at one moment: one bar each for kinetic energy, gravitational potential energy, spring energy, and heat. Draw a chart for the start of a process and another for the end. The rule is simple: the bars at the end must add up to the same total as the bars at the start. Energy is only ever moved between bars, never created or lost.",
      "Heat is what makes friction fit the picture. Without it, a block sliding over a rough patch would seem to lose energy. With a heat bar, the kinetic bar shrinks and the heat bar grows by exactly the same amount, so the total stays put.",
      "In the Energy Ramp, the chart at release is one tall gravitational bar. To build the chart for the moment the block first comes to rest, ask two questions: how much has friction already turned into heat? And is any energy left, stored in the spring? Kinetic energy is zero at that moment, because the block is momentarily at rest.",
    ],
    formulaLatex: 'K + U_g + U_s + Q = \\text{the same total at every moment}',
    symbols: [
      { symbol: 'K', meaning: 'Kinetic energy bar', unit: 'J' },
      { symbol: 'U_g', meaning: 'Gravitational potential energy bar', unit: 'J' },
      { symbol: 'U_s', meaning: 'Spring (elastic) potential energy bar', unit: 'J' },
      { symbol: 'Q', meaning: 'Heat bar: energy turned into thermal energy by friction', unit: 'J' },
    ],
  },
  {
    id: 'crossing-budget',
    icon: '🎢',
    title: 'Reading the Energy Ramp: The Crossing Budget',
    summary: "Each crossing of the rough patch costs the same amount of energy. The question is how many crossings the block can afford.",
    body: [
      'The Energy Ramp puts every idea so far into a single scene. The block starts with mgh of gravitational potential energy. Sliding down the smooth ramp just converts that into kinetic energy. Each time the block crosses the rough patch, friction removes exactly μmg·d of it as heat — and, like a budget, that cost is the same every crossing.',
      "So the outcome is simple accounting. If mgh is smaller than one crossing's cost, the block stops on the patch. If it can afford one crossing but not two, it reaches the spring, bounces back, and stops on the way back. If it can afford more than two, it makes it back across and climbs the ramp again — though not as high as it started.",
      'Notice that mass cancels when you compare mgh with μmgd: a heavier block starts with more energy but pays more friction too, so the outcome does not change. Mass only affects things the spring decides, like how far it compresses.',
    ],
    formulaLatex: '\\text{crossings affordable} = \\dfrac{mgh}{\\mu mg\\,d} = \\dfrac{h}{\\mu d}',
    symbols: [
      { symbol: 'h', meaning: 'Release height of the block', unit: 'm' },
      { symbol: 'μ', meaning: 'Coefficient of friction of the rough patch' },
      { symbol: 'd', meaning: 'Length of the rough patch (3 m in the simulation)', unit: 'm' },
    ],
    interactive: (
      <TryIt
        resultLabel="Crossings the energy can pay for"
        resultUnit="crossings"
        formulaLatex={'\\dfrac{h}{\\mu d} \\quad (d = 3\\text{ m})'}
        variables={[
          { id: 'budgetHeight', label: 'Release height (h)', min: 0.5, max: 3, step: 0.1, defaultValue: 2, unit: 'm' },
          { id: 'budgetMu', label: 'Friction (μ)', min: 0.05, max: 0.6, step: 0.05, defaultValue: 0.4, unit: '' },
        ]}
        compute={({ budgetHeight, budgetMu }) => budgetHeight / (budgetMu * 3)}
        interpret={(_vals, result) =>
          result <= 1
            ? 'Less than one crossing: the block stops on the rough patch before it ever reaches the spring.'
            : result <= 2
              ? 'Between one and two crossings: it reaches the spring, bounces back, and stops on the patch on the return trip.'
              : 'More than two crossings: it makes it all the way back across and climbs the ramp again.'
        }
      />
    ),
  },
  {
    id: 'stopping-distance',
    icon: '🛑',
    title: 'How Far Does Friction Let It Slide?',
    summary: "A block on a rough floor stops when friction has used up all its energy: s = h ÷ μ.",
    body: [
      'A block released from height h arrives at the foot of the ramp with kinetic energy mgh. On a rough floor it stops only when friction has removed all of that energy. Friction removes μmg of energy for every metre the block slides, so over a distance s it removes μmg × s.',
      'Setting the two equal gives μmg × s = mgh. The m and g cancel, leaving s = h/μ. A block released twice as high slides twice as far, and a rougher floor stops it sooner. A heavier block slides exactly the same distance: it starts with more energy, but friction pushes back on it harder.',
      "This is how the Stop Zone challenge works. You know where the zone is and you know μ, so you can work out the release height you need: h = μ × s. No trial and error needed.",
    ],
    formulaLatex: '\\mu mg\\,s = mgh \\;\\Rightarrow\\; s = \\dfrac{h}{\\mu}',
    symbols: [
      { symbol: 's', meaning: 'Distance the block slides along the rough floor before stopping', unit: 'm' },
      { symbol: 'h', meaning: 'Height the block was released from', unit: 'm' },
      { symbol: 'μ', meaning: 'Coefficient of friction of the floor' },
    ],
    interactive: (
      <TryIt
        resultLabel="Sliding distance before stopping"
        resultUnit="m"
        formulaLatex={'s = \\dfrac{h}{\\mu}'}
        variables={[
          { id: 'stopHeight', label: 'Release height (h)', min: 0.2, max: 2, step: 0.1, defaultValue: 0.6, unit: 'm' },
          { id: 'stopMu', label: 'Friction (μ)', min: 0.1, max: 0.8, step: 0.05, defaultValue: 0.3, unit: '' },
        ]}
        compute={({ stopHeight, stopMu }) => stopHeight / stopMu}
        interpret={({ stopHeight, stopMu }) =>
          `Starting ${stopHeight.toFixed(1)} m up with μ = ${stopMu.toFixed(2)}, the block slides this far. Notice that no mass appears anywhere in the formula.`
        }
      />
    ),
  },
  {
    id: 'climber-worked-example',
    icon: '🧗',
    title: 'Worked Example: The Falling Climber',
    body: [],
    interactive: (
      <RevealAnswer
        question="A 60 kg climber is tied to an anchor by a stretchy rope that behaves like a spring (k = 1200 N/m, unstretched length ℓ = 5 m). She slips when she is 5 m above the anchor, falls freely until the rope goes taut (a drop of 10 m), and then the rope stretches by x before stopping her. Find x. (g = 10 m/s²)"
        answer={
          <>
            <p>She starts and ends at rest, so her kinetic energy is zero at both ends. Choose the lowest point as the end: the gravitational potential energy she loses goes entirely into the spring. The total drop is 10 m of free fall plus the stretch x:</p>
            <Katex latex={'mg(2\\ell + x) = \\tfrac{1}{2}kx^2 \\;\\Rightarrow\\; 600(10 + x) = 600x^2'} displayMode />
            <p>Dividing by 600 gives x² − x − 10 = 0. The quadratic formula gives x = (1 + √41)/2, taking the positive root:</p>
            <Katex latex={'x \\approx 3.7\\ \\text{m}'} displayMode />
            <p>This matches the general result x = (mg/k)[1 + √(1 + 4kℓ/mg)] from the tutorial: mg/k = 0.5 and 4kℓ/mg = 40, so x = 0.5 × (1 + √41) ≈ <strong>3.7 m</strong>.</p>
          </>
        }
      />
    ),
  },
];

// ─── Challenge Yourself: H3 / calculus-based extension ─────────────────────────
// Follows the calculus in Lecture 3 itself: work as a line integral, the
// derivation of the work-energy theorem, and F = −dU/dx.
export const ENERGY_CHALLENGE: ConceptSection[] = [
  {
    id: 'work-as-integral',
    icon: '∫',
    title: 'Work as an Integral',
    summary: "When the force changes along the way, the work is the area under the force-distance graph, which is an integral.",
    body: [
      "W = Fs only works when the force stays constant. For a force that changes with position — like a spring — chop the path into tiny steps dx, over each of which the force is almost constant, and add up F(x)dx over every step. In the limit this is an integral: W = ∫F(x)dx, which is exactly the area under the force-against-position graph.",
      "Check it on a spring: F = kx, so W = ∫₀ˣ ks ds = ½kx². The '½' in elastic potential energy isn't arbitrary — it is the integral of a straight line. Try a different force: if F = cx², the work from 0 to x is cx³/3.",
    ],
    formulaLatex: 'W = \\int_{x_1}^{x_2} F(x)\\,dx',
    symbols: [
      { symbol: '∫F(x)dx', meaning: 'The area under the force-position graph between x₁ and x₂' },
    ],
    interactive: (
      <TryIt
        resultLabel="Work done by F = cx² from 0 to x"
        resultUnit="J"
        formulaLatex={'W = \\int_0^x cs^2\\,ds = \\dfrac{cx^3}{3}'}
        variables={[
          { id: 'integralC', label: 'Constant (c)', min: 1, max: 10, step: 1, defaultValue: 3, unit: 'N/m²' },
          { id: 'integralX', label: 'Distance (x)', min: 0, max: 3, step: 0.25, defaultValue: 2, unit: 'm' },
        ]}
        compute={({ integralC, integralX }) => (integralC * integralX ** 3) / 3}
        interpret={({ integralX }) =>
          `Because the force grows with x², the work grows with x³: doubling the distance from ${integralX} m to ${integralX * 2} m would multiply the work by 8.`
        }
      />
    ),
  },
  {
    id: 'work-energy-derivation',
    icon: '📐',
    title: 'Deriving the Work–Energy Theorem',
    summary: "The work-energy theorem is Newton's second law added up over a distance.",
    body: [
      "Start from Newton's second law in one dimension, F = m dv/dt, and write the work as W = ∫F dx. Substituting gives W = ∫m (dv/dt) dx. Now use the chain rule: dv/dt = (dv/dx)(dx/dt) = v dv/dx, because dx/dt is just the velocity v.",
      "So W = ∫m v (dv/dx) dx = ∫m v dv, which integrates to ½mv_f² − ½mv_i². The ½ in kinetic energy is just ∫v dv = ½v². The work-energy theorem isn't a separate law of nature — it is Newton's second law integrated over distance.",
    ],
    formulaLatex: 'W = \\int m\\dfrac{dv}{dt}\\,dx = \\int_{v_i}^{v_f} mv\\,dv = \\tfrac{1}{2}mv_f^2 - \\tfrac{1}{2}mv_i^2',
    symbols: [
      { symbol: 'dv/dt', meaning: 'Acceleration, written as the derivative of velocity' },
    ],
  },
  {
    id: 'force-from-potential',
    icon: '📉',
    title: 'Force from Potential Energy: F = −dU/dx',
    summary: "Force is the negative slope of the potential-energy graph: things get pushed downhill in energy.",
    body: [
      "For any conservative force in one dimension, the force is the NEGATIVE SLOPE of the potential energy curve: F(x) = −dU/dx. A steep U(x) means a strong force, and the minus sign means the force always pushes toward LOWER potential energy — like a ball rolling downhill.",
      "Check it: U = ½kx² gives F = −kx, which is Hooke's law. U = mgy gives F = −mg, gravity pointing down. Reading a U(x) graph: a flat slope means zero force (an equilibrium); the bottom of a dip is a stable equilibrium, where a small push is restored; the top of a hill is unstable, where a small push sends the object away.",
    ],
    formulaLatex: 'F(x) = -\\dfrac{dU}{dx}',
    symbols: [
      { symbol: 'dU/dx', meaning: 'The slope of the potential energy curve at position x' },
    ],
    interactive: (
      <TryIt
        resultLabel="Spring force at this position"
        resultUnit="N"
        formulaLatex={'U = \\tfrac{1}{2}kx^2 \\;\\Rightarrow\\; F = -\\dfrac{dU}{dx} = -kx'}
        variables={[
          { id: 'slopeK', label: 'Spring constant (k)', min: 50, max: 500, step: 10, defaultValue: 200, unit: 'N/m' },
          { id: 'slopeX', label: 'Position (x)', min: -1, max: 1, step: 0.1, defaultValue: 0.4, unit: 'm' },
        ]}
        compute={({ slopeK, slopeX }) => -slopeK * slopeX}
        interpret={({ slopeX }) =>
          slopeX === 0
            ? 'At x = 0 the slope of U is zero, so there is no force: the bottom of the dip is the equilibrium.'
            : slopeX > 0
              ? 'To the right of the dip the slope of U is positive, so the force is negative: it pushes back left, toward the lower energy.'
              : 'To the left of the dip the slope of U is negative, so the force is positive: it pushes back right, toward the lower energy.'
        }
      />
    ),
  },
  {
    id: 'instantaneous-power',
    icon: '⏱️',
    title: 'Instantaneous Power',
    summary: "Power is the rate at which work is done, P = dW/dt, which works out as force times velocity.",
    body: [
      "Average power is W/t, but what if the rate of doing work changes moment to moment? Take the limit of small time intervals: P = dW/dt. Since dW = F dx, this becomes P = F dx/dt = Fv — the same formula as in the basics, now seen as a derivative.",
      'Going the other way, the work done over a stretch of time is the integral of the power: W = ∫P dt, the area under the power-time graph.',
    ],
    formulaLatex: 'P = \\dfrac{dW}{dt} = Fv \\qquad\\qquad W = \\int P\\,dt',
    symbols: [
      { symbol: 'dW/dt', meaning: 'The instantaneous rate at which work is being done' },
    ],
  },
  {
    id: 'energy-self-check',
    icon: '✅',
    title: 'Self-Check',
    body: [],
    interactive: (
      <RevealAnswer
        question="A force F(x) = 3x² N acts on a 4 kg block as it moves from x = 0 to x = 2 m. How much work does it do, and if the block starts from rest, what is its speed at x = 2 m?"
        answer={
          <>
            <p>Integrate the force over the distance:</p>
            <Katex latex={'W = \\int_0^2 3x^2\\,dx = \\left[x^3\\right]_0^2 = 8\\ \\text{J}'} displayMode />
            <p>By the work-energy theorem, this 8 J becomes kinetic energy: ½(4)v² = 8, so v² = 4 and <strong>v = 2 m/s</strong>.</p>
          </>
        }
      />
    ),
  },
];
