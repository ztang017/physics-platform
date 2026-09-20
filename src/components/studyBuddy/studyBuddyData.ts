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
];
