import { type ConceptSection } from '../../components/concepts/ConceptNotes';
import { TryIt } from '../../components/concepts/TryIt';
import { RevealAnswer } from '../../components/concepts/RevealAnswer';
import { Katex } from '../../components/ui/Katex';
import { TrigTriangle } from '../../components/concepts/diagrams/TrigTriangle';
import { LaunchSplit } from '../../components/concepts/diagrams/LaunchSplit';

export const PROJECTILE_CONCEPTS: ConceptSection[] = [
  {
    id: 'trig-refresher',
    icon: '📐',
    title: 'Refresher: Triangles, Sine and Cosine',
    summary: 'Sine, cosine and tangent are ratios of the sides of a right-angled triangle. Pythagoras\'s rule gives the long side.',
    body: [
      "Many physics problems split a slanted arrow into a sideways part and an up-and-down part. We do that with a right-angled triangle: a triangle with one 90° corner. Its longest side, opposite the right angle, is the hypotenuse. For the angle θ you care about, the side across from it is the opposite side, and the side touching it (that is not the hypotenuse) is the adjacent side.",
      "Sine, cosine and tangent are just ratios of those sides: sin θ = opposite ÷ hypotenuse, cos θ = adjacent ÷ hypotenuse, and tan θ = opposite ÷ adjacent. Your calculator gives their values. Make sure it is set to degrees, not radians.",
      "A few values are worth remembering. sin 30° = 0.5. sin 45° and cos 45° are both about 0.71. cos 30° and sin 60° are both about 0.87. Also sin 0° = 0, sin 90° = 1, cos 0° = 1 and cos 90° = 0.",
      "Pythagoras's rule gives the long side from the two short ones: hypotenuse² = opposite² + adjacent². For short sides of 3 and 4, the hypotenuse is √(9 + 16) = 5.",
    ],
    watchOut: 'Opposite and adjacent depend on which angle you are looking at. Always find the angle first, then decide which side is across from it.',
    formulaLatex: '\\sin\\theta = \\dfrac{\\text{opposite}}{\\text{hypotenuse}} \\quad \\cos\\theta = \\dfrac{\\text{adjacent}}{\\text{hypotenuse}} \\quad \\tan\\theta = \\dfrac{\\text{opposite}}{\\text{adjacent}}',
    symbols: [
      { symbol: 'θ', meaning: 'The angle you are looking at', unit: 'degrees' },
      { symbol: 'hypotenuse', meaning: 'The longest side, opposite the right angle' },
    ],
    interactive: <TrigTriangle />,
  },
  {
    id: 'independence-of-motion',
    icon: '↔️',
    title: 'Sideways and Up-and-Down Motion Are Independent',
    summary: 'Sideways motion and up-and-down motion do not affect each other. Gravity only changes the up-and-down part.',
    body: [
      "Here is the big idea of projectile motion. Sideways motion and up-and-down motion happen separately, like two unrelated problems running side by side. Gravity only pulls straight down, so it never changes how fast something moves sideways.",
      "Imagine dropping one ball and, at the same instant, firing an identical ball sideways from the same height. They hit the ground at exactly the same moment. The fired ball travels far sideways, but that does not change how long it takes to fall.",
      "This is why we can solve a curved flight by solving two simple problems separately and then putting the results together.",
    ],
    watchOut: 'It is tempting to think a faster sideways speed keeps a projectile in the air longer. It does not. Time in the air depends only on the up-and-down motion.',
  },
  {
    id: 'launch-components',
    icon: '↗️',
    title: 'Splitting the Launch Velocity into Two Parts',
    summary: 'Split the launch velocity into a sideways part (v₀ cos θ) and an upward part (v₀ sin θ), then treat them separately.',
    body: [
      "A launch at speed v₀ and angle θ above the ground is partly sideways and partly upward. To work with it, split it into a sideways part and an upward part. These are the two short sides of a right-angled triangle whose long side is the launch velocity itself.",
      "Use the triangle refresher above. The sideways part is next to the angle, so it uses cosine. The upward part is across from the angle, so it uses sine. Drag the angle below to see the two parts trade off.",
      "Once split, each part is handled on its own. The sideways part never changes, because nothing pushes sideways. The upward part is slowed, stopped and then reversed by gravity.",
    ],
    watchOut: 'θ is measured from the horizontal. If a problem gives the angle from the vertical instead, sine and cosine swap places.',
    formulaLatex: 'v_x = v_0\\cos\\theta \\qquad\\qquad v_y = v_0\\sin\\theta',
    symbols: [
      { symbol: 'v_0', meaning: 'Launch speed: the total speed at the moment of launch', unit: 'm/s' },
      { symbol: 'θ', meaning: 'Launch angle, measured from the horizontal', unit: 'degrees' },
      { symbol: 'v_x', meaning: 'Sideways part of the launch velocity (stays constant)', unit: 'm/s' },
      { symbol: 'v_y', meaning: 'Upward part of the launch velocity (changes under gravity)', unit: 'm/s' },
    ],
    interactive: <LaunchSplit />,
  },
  {
    id: 'horizontal-motion',
    icon: '➡️',
    title: 'Sideways Motion: Steady Speed',
    summary: 'Sideways, the projectile moves at a steady speed, so distance = speed × time.',
    body: [
      "With no sideways force (ignoring air resistance), the sideways velocity never changes during the flight. The sideways distance simply grows steadily with time: distance = speed × time, like a car cruising at a steady speed.",
      "This part decides the RANGE, which is how far away the projectile lands. The longer it stays in the air, the farther the steady sideways motion carries it. The time in the air comes from the up-and-down motion, described next.",
    ],
    formulaLatex: 'x = x_0 + v_x t',
    symbols: [
      { symbol: 'x', meaning: 'Sideways position at time t', unit: 'm' },
      { symbol: 'x_0', meaning: 'Starting sideways position', unit: 'm' },
      { symbol: 'v_x', meaning: 'Sideways velocity (constant throughout the flight)', unit: 'm/s' },
      { symbol: 't', meaning: 'Time since launch', unit: 's' },
    ],
  },
  {
    id: 'vertical-motion',
    icon: '⬇️',
    title: 'Up-and-Down Motion: Gravity at Work',
    summary: 'Up and down, gravity changes the velocity by 9.8 m/s every second. This is the same constant acceleration from Module 1.',
    body: [
      "Gravity gives every object the same downward acceleration, g ≈ 9.8 m/s². Each second, the upward velocity drops by 9.8 m/s (so a rising object slows down), or the downward velocity grows by 9.8 m/s (so a falling object speeds up). For quick sums we sometimes round g to 10.",
      "This is the same constant-acceleration formula from Module 1, with the acceleration pointing down. The launch angle only changes the STARTING upward velocity, v_y.",
      "Rising takes a time of v_y ÷ g, because gravity removes v_y of velocity at g per second. At the very top the upward velocity is zero. Falling back to the launch height takes the same time again. So the total time in the air is 2v_y ÷ g.",
      "Example: v₀ = 20 m/s at 30°. The upward part is v_y = 20 × sin 30° = 10 m/s. With g = 10, the time in the air is 2 × 10 ÷ 10 = 2 s.",
    ],
    watchOut: 'The time in the air does not depend on the sideways speed at all, only on the upward part of the launch.',
    formulaLatex: 'y = y_0 + v_y t - \\tfrac{1}{2} g t^2 \\qquad\\qquad t_{air} = \\dfrac{2v_y}{g}',
    symbols: [
      { symbol: 'y', meaning: 'Height at time t', unit: 'm' },
      { symbol: 'y_0', meaning: 'Starting height', unit: 'm' },
      { symbol: 'v_y', meaning: 'Starting upward velocity', unit: 'm/s' },
      { symbol: 'g', meaning: 'Gravitational acceleration (constant, about 9.8)', unit: 'm/s²' },
      { symbol: 't_{air}', meaning: 'Total time in the air, when landing at the launch height', unit: 's' },
    ],
  },
  {
    id: 'why-parabola',
    icon: '🌙',
    title: 'The Parabola, and How Range Depends on Angle',
    summary: 'The path is a curve called a parabola. 45° gives the longest range on level ground, and two angles that add up to 90° land in the same place.',
    body: [
      "Put the steady sideways motion together with the steadily accelerating up-and-down motion and the path is a curve called a parabola. Sideways position grows in proportion to the time, while height depends on t². That mix of linear and squared is what makes a parabola.",
      "The launch angle trades distance against hang time. A low angle gives lots of sideways speed but very little time in the air. A steep angle gives lots of time in the air but little sideways speed. On level ground the best compromise is exactly 45°.",
      "Any two angles that add up to 90° (like 30° and 60°) land at the same place. The steeper one goes higher and takes longer to get there.",
    ],
    watchOut: 'The 45° rule only works when the launch and landing heights are the same and air resistance is ignored.',
    formulaLatex: 'R = \\dfrac{v_0^2 \\sin(2\\theta)}{g}',
    formulaCaption: 'Valid for launch and landing at the same height.',
    symbols: [
      { symbol: 'R', meaning: 'Range: the total sideways distance travelled before landing', unit: 'm' },
      { symbol: 'v_0', meaning: 'Launch speed', unit: 'm/s' },
      { symbol: 'θ', meaning: 'Launch angle above the horizontal', unit: 'degrees' },
      { symbol: 'g', meaning: 'Gravitational acceleration', unit: 'm/s²' },
    ],
    interactive: (
      <TryIt
        resultLabel="Range"
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
            ? 'Below 45° the shot is flatter and lands sooner. Try moving the angle toward 45° to go further.'
            : 'Above 45° the shot goes higher but spends so long going up and down that it lands closer than at 45°.'
        }
      />
    ),
  },
  {
    id: 'relative-velocity',
    icon: '🧭',
    title: 'Relative Velocity: Combining Two Motions',
    summary: 'If something moves through a moving medium, combine the two velocities. Same direction: add. Opposite: subtract. At right angles: use Pythagoras.',
    body: [
      "So far every velocity has been measured against the ground. But sometimes something moves through a medium that is itself moving: a boat on a flowing river, a plane in the wind, a person on a moving walkway. Someone standing on the ground sees the two velocities combined.",
      "If both velocities are along the same line, just add or subtract. A boat that can do 8 m/s, heading downstream in a 3 m/s current, moves at 8 + 3 = 11 m/s over the ground. Heading upstream, it moves at 8 − 3 = 5 m/s.",
      "If the velocities point in different directions, such as a boat aimed straight across a flowing river, draw them head to tail. The straight line from the start to the finish is the actual velocity over the ground. For velocities at right angles, its size comes from Pythagoras: the square root of (a² + b²).",
    ],
    watchOut: 'The boat does not move in the direction it is pointing. The current carries it sideways as well.',
    formulaLatex: '\\vec{v}_{ground} = \\vec{v}_{object/medium} + \\vec{v}_{medium/ground}',
    symbols: [
      { symbol: 'v_{ground}', meaning: "The object's actual velocity, as seen by someone standing still on the ground", unit: 'm/s' },
      { symbol: 'v_{object/medium}', meaning: "The object's own velocity through the medium (e.g. a boat's speed through the water)", unit: 'm/s' },
      { symbol: 'v_{medium/ground}', meaning: "The medium's own velocity relative to the ground (e.g. the current or the wind)", unit: 'm/s' },
    ],
    interactive: (
      <TryIt
        resultLabel="Boat's actual speed over the ground"
        resultUnit="m/s"
        formulaLatex={'v_{ground} = \\sqrt{v_{boat}^2 + v_{current}^2}'}
        variables={[
          { id: 'boatSpeed', label: "Boat's speed (aimed straight across)", min: 1, max: 10, step: 0.5, defaultValue: 4, unit: 'm/s' },
          { id: 'currentSpeed', label: 'Current speed (at right angles to the boat)', min: 0, max: 8, step: 0.5, defaultValue: 3, unit: 'm/s' },
        ]}
        compute={({ boatSpeed, currentSpeed }) => Math.sqrt(boatSpeed * boatSpeed + currentSpeed * currentSpeed)}
        interpret={({ boatSpeed }, result) =>
          `Even though the boat is aimed straight across at ${boatSpeed} m/s, the current drags it downstream at the same time. Its actual speed over the ground is ${result.toFixed(1)} m/s, along a diagonal path.`
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
    summary: "Calculus shows why 45° is the best angle: it is where the slope of the range-against-angle curve is zero.",
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
