export interface PhysicsTidbit {
  type: 'fact' | 'quote' | 'myth';
  /** Fact/quote body text, or the misconception itself for a 'myth' entry. */
  text: string;
  author?: string;
  /** Only present for 'myth' entries — the correction. */
  reality?: string;
}

// A handful are chosen at random each time the Dashboard loads, so the set
// varies session to session (and student to student) without needing any
// backend. Myths double as the old "Common Misconceptions" list, folded in
// here instead of sitting in their own separate, easy-to-skip section.
export const PHYSICS_TIDBITS: PhysicsTidbit[] = [
  { type: 'fact', text: "Light from the Sun takes about 8 minutes and 20 seconds to reach Earth — you're always seeing the Sun very slightly in the past." },
  { type: 'fact', text: 'A ball thrown straight up and a ball dropped from the peak of its flight hit the ground at exactly the same speed — ignoring air resistance.' },
  { type: 'fact', text: "There's no such thing as 'centrifugal force' pushing you outward in a turning car — what you feel is your own inertia resisting the car's inward turn." },
  { type: 'fact', text: 'Friction is why you can walk at all. Without it, your shoes would just slide uselessly against the ground with every step.' },
  { type: 'fact', text: 'A rocket doesn\'t "push against" the air to fly — it works the same in the vacuum of space, by throwing mass backward and being pushed forward in return.' },
  { type: 'fact', text: 'The normal force is not always equal to an object\'s weight — stand on a scale in an accelerating elevator and watch the reading change.' },
  { type: 'fact', text: 'Astronauts on the International Space Station see about 16 sunrises and sunsets every single day, orbiting Earth roughly once every 90 minutes.' },
  { type: 'fact', text: 'If you could fold a single piece of paper in half 42 times, it would be thick enough to reach the Moon.' },
  { type: 'fact', text: 'A neutron star is so dense that one teaspoon of its material would weigh roughly a billion tons on Earth.' },
  { type: 'fact', text: 'Coefficient of restitution isn\'t just a textbook term — a regulation basketball is manufactured to bounce with e ≈ 0.75–0.80 on a hard court.' },

  { type: 'quote', text: 'If I have seen further, it is by standing on the shoulders of giants.', author: 'Isaac Newton' },
  { type: 'quote', text: 'The important thing is not to stop questioning. Curiosity has its own reason for existing.', author: 'Albert Einstein' },
  { type: 'quote', text: "Study hard what interests you the most, in the most undisciplined, irreverent, and original manner possible.", author: 'Richard Feynman' },
  { type: 'quote', text: 'What I cannot create, I do not understand.', author: 'Richard Feynman' },
  { type: 'quote', text: 'Nature is pleased with simplicity.', author: 'Isaac Newton' },
  { type: 'quote', text: 'The universe is under no obligation to make sense to you.', author: 'Neil deGrasse Tyson' },
  { type: 'quote', text: 'Physics is really nothing more than a search for ultimate simplicity.', author: 'Bill Bryson' },

  {
    type: 'myth',
    text: 'Motion requires a continuous force to keep going.',
    reality: "Newton's first law says the opposite: an object in motion stays in motion at constant velocity unless a net force acts on it. Everyday motion looks like it needs constant pushing only because friction and air resistance are quietly decelerating it the whole time.",
  },
  {
    type: 'myth',
    text: 'Velocity and acceleration are basically the same thing.',
    reality: "They're independent quantities. You can have velocity with zero acceleration (cruising at constant speed) or acceleration with momentarily zero velocity (the instant a thrown ball is at the top of its arc). Confusing the two is one of the most common sources of sign errors in kinematics.",
  },
  {
    type: 'myth',
    text: 'In a collision, the heavier object exerts more force than the lighter one.',
    reality: "Newton's third law guarantees the force each object exerts on the other is exactly equal in magnitude, regardless of mass — a truck and a bicycle push on each other with identical force during a crash. What differs is each object's resulting acceleration (F = ma), not the force itself.",
  },
];
