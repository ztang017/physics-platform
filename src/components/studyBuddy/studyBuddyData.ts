import type { ModuleId } from '../../core/store/gameStore';

export interface StudyTopic {
  id: string;
  moduleId: ModuleId | 'general';
  /** Framed as the question a stuck student would actually ask. */
  question: string;
  /** Words/phrases that route a free-typed question to this topic. */
  keywords: string[];
  /** Socratic prompts, revealed one at a time — never the numeric answer. */
  prompts: string[];
  /** The underlying principle, shown only after the prompts are exhausted. */
  principle: string;
}

export const STUDY_TOPICS: StudyTopic[] = [
  // ─── Kinematics ───────────────────────────────────────────────────────────
  {
    id: 'kin-flat-vt',
    moduleId: 'kinematics',
    question: "My v-t graph looks flat even though I set a nonzero acceleration.",
    keywords: ['flat', 'v-t', 'vt graph', 'velocity graph', 'not changing', 'straight line velocity'],
    prompts: [
      "On a velocity-time graph, what does the SLOPE of the line represent physically?",
      "If acceleration is the slope of the v-t graph, what should a flat (zero-slope) line tell you about the acceleration during that interval?",
      "Now check the slider you actually moved — did you change the acceleration slider, or a different one? It's easy to nudge the wrong control.",
    ],
    principle: "The slope of a velocity-time graph IS the acceleration. A flat v-t line always means a = 0, no matter what other numbers are on screen — so if you expected a slope and got a flat line, the acceleration value feeding the graph is zero.",
  },
  {
    id: 'kin-curvy-xt',
    moduleId: 'kinematics',
    question: "Why does my x-t graph curve instead of being a straight line?",
    keywords: ['curve', 'curving', 'parabola', 'x-t graph', 'position graph', 'not straight'],
    prompts: [
      "A straight line on a graph means a constant rate of change. What quantity is changing when velocity itself is not constant?",
      "If velocity is changing over time (i.e. there's acceleration), can position vs. time possibly be a straight line?",
      "What shape does position vs. time trace out specifically when acceleration is constant and nonzero?",
    ],
    principle: "Position-time is a straight line ONLY when velocity is constant (a = 0). Any nonzero, constant acceleration makes x(t) a parabola — that curve isn't a bug, it's the direct graphical signature of acceleration.",
  },
  {
    id: 'kin-graph-match',
    moduleId: 'kinematics',
    question: "My Graph-Match score won't go above 60% no matter what I do.",
    keywords: ['graph match', 'score', "won't improve", 'stuck at', 'match challenge'],
    prompts: [
      "A v-t line is fully described by two things: where it starts, and how steep it is. Which slider controls each of those?",
      "Try adjusting just ONE slider at a time and watching which part of the line moves — the starting point, or the tilt?",
      "Have you matched the starting height (v₀) well but the tilt (a) is still off, or the other way around? Fixing them one at a time is easier than guessing both together.",
    ],
    principle: "A straight line needs both its intercept (v₀) and slope (a) to match — getting only one right caps your score. Isolate each slider's effect before combining them.",
  },

  // ─── Projectile ───────────────────────────────────────────────────────────
  {
    id: 'proj-short-range',
    moduleId: 'projectile',
    question: "I increased the launch angle but the package still lands short.",
    keywords: ['short', 'landed short', 'not far enough', 'increase angle', "didn't reach"],
    prompts: [
      "Range depends on sin(2θ). What happens to sin(2θ) as θ goes past 45° and keeps climbing toward 90°?",
      "At a very steep angle, is more of your launch speed going into going UP, or going SIDEWAYS?",
      "If most of v₀ is now vertical, is there much horizontal speed left to carry the package forward, even though it stays airborne longer?",
    ],
    principle: "Range = v₀²sin(2θ)/g peaks at θ = 45° and DECREASES on either side of it. Steeper than 45° trades horizontal speed for hang time — the package flies higher and longer, but not farther. If you fell short past 45°, you likely need to come back down toward 45°, not go steeper.",
  },
  {
    id: 'proj-independence',
    moduleId: 'projectile',
    question: "Why doesn't changing the vertical motion affect how far the package goes sideways per second?",
    keywords: ['horizontal', 'independent', 'independence', 'vertical affects horizontal', 'sideways speed'],
    prompts: [
      "What is the only force acting on the package after launch (ignoring air resistance)?",
      "Which direction does gravity point — and does it have any sideways (horizontal) component at all?",
      "If nothing ever pushes or pulls sideways, what has to happen to whatever sideways velocity the package started with?",
    ],
    principle: "Gravity acts purely vertically, so it can only change vertical velocity. With zero horizontal force, horizontal velocity (v₀cosθ) stays exactly constant for the whole flight — the two directions are mathematically independent even though they happen at the same time.",
  },
  {
    id: 'proj-clear-wall',
    moduleId: 'projectile',
    question: "How do I actually check whether my shot clears the wall?",
    keywords: ['wall', 'clear the wall', 'clears', 'hit the wall'],
    prompts: [
      "The wall is at a specific horizontal distance. What do you need to know about the package at exactly that x-position?",
      "Given the package's horizontal speed, how would you find the TIME at which it reaches the wall's x-position?",
      "Once you have that time, how do you find the package's height at that exact instant — and how does that height compare to the wall's height?",
    ],
    principle: "Clearing the wall isn't about the overall trajectory shape — it's about one specific check: find the time t when x(t) = wallX, then confirm y(t) at that same t is greater than the wall's height. Maximum height reached elsewhere in the flight doesn't matter if it happens at the wrong x-position.",
  },

  // ─── Incline ──────────────────────────────────────────────────────────────
  {
    id: 'inc-slide-or-stay',
    moduleId: 'incline',
    question: "How do I know whether the block will slide or stay put before I check?",
    keywords: ['slide or stay', 'will it slide', 'move or not', 'stationary or sliding'],
    prompts: [
      "Gravity pulls straight down, but the surface is tilted. What are the two useful directions to break gravity into on an incline?",
      "One of those components pulls the block DOWN the slope. What force opposes that, up to some maximum?",
      "If the down-slope pull is bigger than the maximum friction can ever provide, what has to happen?",
    ],
    principle: "Compare mg·sin(θ) (the down-slope pull) against the MAXIMUM available static friction, μₛ·N. If the down-slope pull exceeds that maximum, no amount of static friction can hold the block — it slides. If it doesn't, friction settles at exactly mg·sin(θ) and the block stays still.",
  },
  {
    id: 'inc-normal-force',
    moduleId: 'incline',
    question: "Why isn't the normal force just equal to the block's full weight?",
    keywords: ['normal force', "isn't equal", 'not equal to weight', 'normal not weight'],
    prompts: [
      "The normal force balances whichever component of gravity pushes INTO the surface. Is that the full weight vector, or only part of it?",
      "As the incline gets steeper, does more of gravity point into the surface, or more of it point along the surface?",
      "So as the angle increases, should the normal force get bigger, smaller, or stay the same?",
    ],
    principle: "The normal force only balances the component of gravity perpendicular to the surface: N = mg·cos(θ). On a flat surface (θ = 0°) that's the full weight, but as the incline steepens, more of gravity is redirected along the slope instead of into it, so N shrinks.",
  },
  {
    id: 'inc-still-moving',
    moduleId: 'incline',
    question: "I predicted 'stationary' but the animation still shows the block sliding.",
    keywords: ['still moving', 'predicted stationary', 'block still slides', 'prediction wrong incline'],
    prompts: [
      "Static friction has a maximum value it can supply — it doesn't have unlimited grip. What determines that maximum in this simulation (which two sliders)?",
      "Try recomputing: is the down-slope pull (mg·sinθ) actually smaller than μₛ·mg·cosθ with your current mass, angle, and μₛ?",
      "If those numbers are closer than you thought, try nudging just ONE variable (e.g. angle) and watch at what value the verified outcome flips.",
    ],
    principle: "Your prediction is a guess to be tested, not graded on vibes — the animation reflects the actual comparison between the down-slope force and maximum static friction for the exact numbers you set. If it disagrees with your intuition, that's the whole point of the Observe phase: find out which force was actually bigger.",
  },

  // ─── Energy ───────────────────────────────────────────────────────────────
  {
    id: 'en-zero-work',
    moduleId: 'energy',
    question: "Why is the work zero when I carry a heavy box across the room? It felt like a lot of effort.",
    keywords: ['zero work', 'carry', 'carrying', 'holding', 'effort', 'no work', 'box across'],
    prompts: [
      "In physics, work needs a force AND a displacement. Which direction is your supporting force pointing while you carry the box?",
      "Which direction is the box moving while you walk across the room?",
      "Work = F·s·cosθ. What angle is between those two directions — and what is cos of that angle?",
    ],
    principle: "Work only counts the part of a force that points along the motion. Your upward supporting force is perpendicular to your horizontal walk (θ = 90°, cos 90° = 0), so it does zero work on the box. Feeling tired is about your muscles, not about work done on the box.",
  },
  {
    id: 'en-energy-lost',
    moduleId: 'energy',
    question: "The block lost energy on the rough patch. Does that mean energy isn't conserved?",
    keywords: ['friction energy', 'rough patch', 'where did the energy go', 'energy go on the', 'mechanical energy', 'thermal energy'],
    prompts: [
      "Look at the energy ledger while the block crosses the rough patch. Which bar is growing as the kinetic bar shrinks?",
      "Friction is a non-conservative force. What happens to the surfaces when you rub them together?",
      "If you add the heat bar to the other three bars, what do you get — does that total ever change?",
    ],
    principle: "Mechanical energy (K + U) can be lost to friction, but total energy cannot. The 'missing' energy becomes thermal energy in the block and the patch. The ledger's total always equals mgh: friction moves energy between bars, it never destroys it.",
  },
  {
    id: 'en-mass-cancels',
    moduleId: 'energy',
    question: "Why does doubling the block's mass not change where it stops on the patch?",
    keywords: ['mass', 'heavier', 'double the mass', 'doubling mass', 'mass cancels', 'same outcome'],
    prompts: [
      "Write down the energy the block starts with. Does it depend on the mass?",
      "Now write down the energy one crossing of the rough patch costs. Does THAT depend on the mass?",
      "If both sides have a factor of m, what happens when you compare them?",
    ],
    principle: "The starting energy is mgh and the friction cost is μmg·d — both contain m, so it cancels when you compare them. A heavier block brings more energy but pays proportionally more friction. Mass only matters for things it doesn't cancel from, like how far the spring compresses.",
  },
  {
    id: 'en-speed-not-shape',
    moduleId: 'energy',
    question: "Why doesn't the shape of a slide change the speed at the bottom?",
    keywords: ['shape', 'slide', 'steeper', 'curved', 'same speed', 'path', 'conservative'],
    prompts: [
      "Is gravity a conservative force? What does that say about how much work it does between two heights?",
      "If the work gravity does depends only on the start and end heights, what does the path between them matter for?",
      "Use the work-energy theorem: if the work is the same, what must be the same about the final kinetic energy?",
    ],
    principle: "Gravity is conservative, so the work it does depends only on the height dropped, not the path. By the work-energy theorem that work becomes kinetic energy, giving v = √(2gh) for any frictionless path. A gentler slide takes longer, but it ends with the same speed.",
  },

  {
    id: 'en-stop-zone',
    moduleId: 'energy',
    question: "How do I get the block to stop inside the Stop Zone without guessing?",
    keywords: ['stop zone', 'parking', 'park the block', 'stopping distance', 'how far will it slide', 'release height'],
    prompts: [
      "The block stops once friction has taken away ALL the energy it started with. How much energy does it start with, in terms of m, g and h?",
      "Friction takes away μmg for every metre it slides. How much does it take away over a distance s?",
      "Set those two amounts equal. What cancels, and what does that tell you about whether the mass slider matters?",
    ],
    principle: "The energy at the foot of the ramp, mgh, is all burned by friction over the sliding distance: μmg × s = mgh, so s = h/μ. To park at a distance s you need a release height h = μs. Mass cancels completely, so it never matters.",
  },
  {
    id: 'en-bar-chart',
    moduleId: 'energy',
    question: "I'm not sure what to put in the energy bar chart for the moment the block stops.",
    keywords: ['bar chart', 'energy chart', 'energy bars', 'which bars', 'first moment at rest'],
    prompts: [
      "At the moment the block is momentarily at rest, how much kinetic energy does it have?",
      "The ramp's height is long gone. What is the gravitational energy bar at that moment?",
      "So the starting energy has to be sitting in only two places. How much has friction already turned into heat, and is the rest stored in the spring?",
    ],
    principle: "At the first moment of rest, K = 0 and Ug = 0, so only the spring and heat bars hold energy, and together they must add up to the full starting energy mgh. If the block never reaches the spring, all of it is heat. If it does, heat equals one crossing's cost and the spring holds the rest.",
  },

  // ─── Collision ────────────────────────────────────────────────────────────
  {
    id: 'col-momentum-mismatch',
    moduleId: 'collision',
    question: "My total momentum before and after the collision don't seem to match.",
    keywords: ['momentum mismatch', "don't match", 'not conserved', 'momentum before after'],
    prompts: [
      "Momentum has a direction, not just a size. Are you adding the two carts' momenta as plain numbers, or accounting for which way each one is moving?",
      "If one cart moves right and the other moves left after the collision, should their momenta be added, or does one need a minus sign?",
      "Redo the total with signed velocities (positive one way, negative the other) — does it balance now?",
    ],
    principle: "Momentum is a vector. In this 1D setup, that means picking a positive direction and giving any velocity going the opposite way a negative sign before summing. Total momentum is always conserved — an apparent mismatch almost always comes from a dropped sign, not physics breaking down.",
  },
  {
    id: 'col-elastic-vs-inelastic',
    moduleId: 'collision',
    question: "What's actually different between an elastic and an inelastic collision?",
    keywords: ['elastic vs inelastic', 'difference elastic', 'what is elastic', 'what is inelastic'],
    prompts: [
      "Is momentum conserved in BOTH elastic and inelastic collisions, or only in one of them?",
      "Now think about kinetic energy specifically — is there any rule saying it must be conserved in a collision?",
      "What happens to a lump of clay compared to a bouncy ball when they collide with something — where might energy be going in one case but not the other?",
    ],
    principle: "Momentum is conserved in every collision, elastic or not — that's universal. Kinetic energy is only conserved in perfectly elastic collisions. In inelastic ones, some kinetic energy converts into heat, sound, or permanent deformation, so total KE after is less than before, even though momentum still balances exactly.",
  },
  {
    id: 'col-ke-decrease',
    moduleId: 'collision',
    question: "Why did the total kinetic energy decrease after my collision?",
    keywords: ['kinetic energy decrease', 'ke lower', 'energy lost', 'energy disappeared'],
    prompts: [
      "Did you set the restitution/elasticity to a perfectly elastic value, or something less than that?",
      "If the collision isn't perfectly elastic, is kinetic energy guaranteed to be conserved?",
      "Energy can't vanish — if it's not kinetic energy anymore, what other forms could it have taken during the impact?",
    ],
    principle: "Only perfectly elastic collisions conserve kinetic energy exactly. Any other collision converts some KE into heat, sound, and deformation of the objects — the energy isn't lost from the universe, just no longer in the form of the carts' motion.",
  },
  {
    id: 'col-wedge-both-laws',
    moduleId: 'collision',
    question: "Why do I need both momentum AND energy for the block-on-a-sliding-wedge problem?",
    keywords: ['wedge', 'recoil', 'sliding wedge', 'block on a wedge', 'both momentum and energy', 'push apart'],
    prompts: [
      "Nothing pushes the block-and-wedge system sideways. What does that say about the total horizontal momentum, starting from rest?",
      "That gives you the wedge's speed in terms of the block's. Does it tell you how big the block's speed actually is?",
      "Where does the block's speed come from? Think about what happened to its height. Is any of that energy going into moving the wedge too?",
    ],
    principle: "Momentum conservation links the two speeds (m₁v₁ + m₂v₂ = 0) but can't fix their size. Energy conservation supplies the size: the potential energy lost becomes the kinetic energy of BOTH objects. Leaving out the heavy wedge's small kinetic energy is the classic mistake.",
  },
  // ─── Circular motion ──────────────────────────────────────────────────────
  {
    id: 'circ-centrifugal',
    moduleId: 'circular',
    question: "Why does it feel like something is pushing me outward when a car turns? Isn't that a centrifugal force?",
    keywords: ['centrifugal', 'outward force', 'pushed outward', 'pushed to the outside', 'flung out', 'thrown outward', 'fictitious force'],
    prompts: [
      "Before the car turned, you were moving in a straight line. What does Newton's first law say your body wants to keep doing when no force acts on it?",
      "Now the car turns. Which real force makes YOU turn with the car, and which direction does it point?",
      "If the door stopped pushing you inward (say you slid out through an open door), which way would you actually move: straight outward, or straight along the way you were already going?",
    ],
    principle: "There is no outward force on you. You feel pushed outward because your body tends to keep going straight (inertia) while the car turns, and the door has to push you inward to make you turn. In the Observe view from the room you never need a centrifugal force; it only appears if you insist on describing things from inside the spinning frame.",
  },
  {
    id: 'circ-coin-slips',
    moduleId: 'circular',
    question: "How do I work out the speed at which the coin slips off the turntable?",
    keywords: ['coin slips', 'slips off', 'slip off', 'coin on a turntable', 'turntable', 'when does the coin', 'static friction limit', 'record player'],
    prompts: [
      "Which real force acts sideways on the coin, and which way does it point? That force has to do the job of the centripetal force.",
      "How much friction does the coin NEED to keep going in its circle (in terms of m, ω and r)? And what is the MOST static friction can give (in terms of μ, m and g)?",
      "The coin slips at the moment those two are equal. Write the equation and look at the masses: what happens to m? Then solve for ω, and convert to rpm if the question asks for it.",
    ],
    principle: "Friction supplies the centripetal force, so the force needed is mω²r. Static friction can give at most μₛmg. The coin slips when mω²r = μₛmg, so ω = √(μₛg/r), and the mass cancels. Convert rad/s to rpm by multiplying by 60 ÷ 2π. Run it backwards to find μₛ = ω²r/g from a measured slipping speed.",
  },
  {
    id: 'circ-rpm-units',
    moduleId: 'circular',
    question: "My circular motion answers come out wrong by a huge factor when the question gives rpm.",
    keywords: ['rpm', 'rad/s', 'revolutions per minute', 'convert rpm', 'angular velocity units', 'radians per second', 'revolutions'],
    prompts: [
      "The formulas v = ωr and a = ω²r only work if ω is in radians per second. What unit was the speed given in?",
      "How many radians are there in one full revolution?",
      "How many seconds are there in one minute? Combine the two: what do you multiply the rpm by, and what do you divide by?",
    ],
    principle: "ω (rad/s) = rpm × 2π ÷ 60. One revolution is 2π radians and one minute is 60 seconds. Always convert before using v = ωr or a = ω²r, and give distances in metres. A 60 rpm record turns once a second, so its ω is about 6.3 rad/s, not 60.",
  },
  {
    id: 'circ-centripetal-fbd',
    moduleId: 'circular',
    question: "Do I draw a centripetal force on my free-body diagram?",
    keywords: ['centripetal force', 'free body diagram circular', 'fbd circular', 'which force is centripetal', 'draw the centripetal', 'net force toward the centre'],
    prompts: [
      "Is centripetal force a new kind of force, or is it the name for what some other force is doing? Name a real force in your problem that points toward the centre.",
      "List the real forces: weight, normal force, tension, friction. Which of them (or which parts of them) point toward the centre, and which point away?",
      "Add up those toward-the-centre parts (subtract any pointing away) and set the total equal to mv²/r. Do you still need an extra arrow?",
    ],
    principle: "Never add a separate 'centripetal force' arrow. Draw only the real forces, take 'toward the centre' as positive, add up their components along that direction, and set the total equal to mv²/r (or mω²r). The real force can be friction, tension, a normal force, gravity, or a mix.",
  },
  {
    id: 'circ-vertical-circle',
    moduleId: 'circular',
    question: "Why does the bucket have to move fast enough at the top of the circle, and how do I find the minimum speed?",
    keywords: ['vertical circle', 'bucket', 'top of the circle', 'rope slack', 'goes slack', 'minimum speed at the top', 'water stays in', 'loop the loop'],
    prompts: [
      "At the very top, which way do the weight and the tension each point: toward the centre or away from it?",
      "At the slowest possible speed the rope is just barely taut. What number is the tension then?",
      "With the tension at that value, which force alone supplies the centripetal force? Write 'that force = mv²/r' and see what happens to the mass.",
    ],
    principle: "At the top both the tension and the weight point toward the centre: T + mg = mv²/r. The rope stays taut while T ≥ 0, so the slowest speed is where T = 0 and gravity alone does the job: mg = mv²/r, giving v = √(gr). The mass cancels. At the bottom the tension must also hold up the weight: T = mg + mv²/r.",
  },
  {
    id: 'circ-banked-friction',
    moduleId: 'circular',
    question: "On a banked curve, which way does friction act, and why is there a lowest AND a highest safe speed?",
    keywords: ['banked', 'banking', 'bank angle', 'banked curve', 'highway curve', 'safe speed band', 'vmin', 'vmax', 'maximum speed on a curve'],
    prompts: [
      "At the design speed the car needs no friction at all. If it goes slower, does the road's normal force provide too much turning force, or too little? Which way would that push the car along the slope?",
      "Friction always opposes the tendency to slide. If the car tends to slide down the slope, which way does friction point? What about a car that tends to slide up?",
      "At each end of the safe band friction is at its limit, f = μN. Write Newton's second law along the slope and at right angles to it, once for each direction of friction. What changes between the two cases?",
    ],
    principle: "At the design speed v₀ = √(Rg tan θ) the slope alone supplies the centripetal force. Slower, the car tends to slide down the slope so friction acts up it; faster, it tends to slide up so friction acts down. At each limit f = μₛN, and solving gives v_min and v_max. A larger μₛ widens the band on both sides.",
  },
  {
    id: 'circ-full-loop',
    moduleId: 'circular',
    question: "How do I find the slowest speed at the bottom that gets the bucket all the way round?",
    keywords: ['complete the loop', 'full loop', 'all the way round', 'slowest speed at the bottom', 'bottom speed', 'rope goes slack before', 'minimum speed at the bottom'],
    prompts: [
      "Start at the top. What is the slowest speed there that keeps the rope taut? (Think about what the tension is, and what alone supplies the centripetal force.)",
      "Now go from the top down to the bottom. How much height does the bucket lose, and what happens to its kinetic energy?",
      "Write energy conservation between the top and the bottom. What is v₀² in terms of g and r, and does the mass appear?",
    ],
    principle: "At the top the slowest taut speed has v_top² = gr. Energy conservation over the 2r drop gives v₀² = v_top² + 4gr = 5gr, so the bucket must pass the bottom at no less than √(5gr). The mass cancels. Below √(2gr) it swings back; between √(2gr) and √(5gr) the rope goes slack on the way up.",
  },
  {
    id: "kin-units",
    moduleId: "kinematics",
    question: "What does m/s² actually mean?",
    keywords: ["m/s²", "m/s^2", "meters per second squared", "metres per second squared", "units of acceleration", "per second per second"],
    prompts: [
      "Read the unit out loud: 'metres per second, per second'. What does the first 'metres per second' measure?",
      "If the velocity changes by 3 m/s every single second, what is the change in velocity per second?",
      "So what does an acceleration of 3 m/s² tell you about the velocity after 1, 2 and 3 seconds, starting from rest?",
    ],
    principle: "m/s² means (m/s) per second. An acceleration of 3 m/s² means the velocity grows by 3 m/s every second: 3, 6, 9 m/s and so on. It is a rate of change of velocity, not a speed.",
  },
  {
    id: "proj-sin-or-cos",
    moduleId: "projectile",
    question: "How do I know whether to use sine or cosine for a component?",
    keywords: ["sin or cos", "sine or cosine", "cos or sin", "which trig", "soh cah toa", "sohcahtoa", "opposite adjacent", "sin vs cos"],
    prompts: [
      "Draw the right-angled triangle with the launch velocity as the long side. Which side touches the angle θ, and which side is across from it?",
      "Cosine is adjacent ÷ hypotenuse and sine is opposite ÷ hypotenuse. Is the sideways part the side touching the angle, or the side across from it?",
      "Check your answer at the extremes. At 0° the ball goes completely sideways, so the sideways part should be as big as possible. Which function equals 1 at 0°?",
    ],
    principle: "The side touching the angle (adjacent) uses cosine. The side across from the angle (opposite) uses sine. For a launch angle measured from the horizontal, the sideways part is v₀ cos θ and the upward part is v₀ sin θ. Test with 0° and 90° to catch a swap.",
  },
  {
    id: "inc-mass-weight",
    moduleId: "incline",
    question: "What is the difference between mass and weight, and what is a newton?",
    keywords: ["mass and weight", "weight and mass", "mass vs weight", "weight vs mass", "what is a newton", "difference between mass", "kg or n"],
    prompts: [
      "If you travelled to the Moon, which would change: the amount of matter in your body, or the pull of gravity on it?",
      "Weight = mg. Which of those two letters is different on the Moon?",
      "Which unit measures a force: kilograms or newtons?",
    ],
    principle: "Mass is the amount of matter, measured in kilograms, and it does not change from place to place. Weight is the pull of gravity on that mass, W = mg, a force measured in newtons. One newton is about the weight of a small apple.",
  },
  {
    id: "inc-draw-fbd",
    moduleId: "incline",
    question: "How do I draw a free-body diagram?",
    keywords: ["draw a free body", "how to draw a free body", "free body diagram", "free-body diagram", "draw the forces", "how do i draw the forces"],
    prompts: [
      "Pick ONE object and draw it as a simple box. Which object is it?",
      "List everything touching it (surfaces, ropes, other blocks) and anything that pulls it from a distance (gravity). Each one gets an arrow pointing the way it pushes or pulls.",
      "For each arrow ask: which way does this force point? A surface pushes at right angles to itself, friction acts along the surface against the sliding, and gravity points straight down.",
    ],
    principle: "A free-body diagram shows ONE object and an arrow for every force acting ON it. Include weight, normal force, friction, tension or applied pushes as they apply. Leave out forces the object exerts on other things, and never draw a force and its components together.",
  },
];
