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
  { type: 'fact', text: "Terminal velocity for a skydiver belly-to-earth is roughly 195 km/h (~54 m/s) — not infinite, because drag grows with speed until it exactly balances gravity." },
  { type: 'fact', text: "Weight and mass aren't the same thing: your mass is identical on the Moon, but your weight (mg) drops to about 1/6 of its Earth value because the Moon's gravity is weaker." },
  { type: 'fact', text: 'A curveball in baseball really does curve — spin creates a pressure difference across the ball (the Magnus effect) that pushes it sideways as it flies.' },
  { type: 'fact', text: "Apollo 15's commander famously dropped a hammer and a feather on the airless Moon — with no air resistance, they hit the ground at exactly the same time." },
  { type: 'fact', text: "Astronaut 'weightlessness' isn't the absence of gravity — at the ISS's altitude, Earth's pull is still about 90% as strong as on the surface. Astronauts are actually in continuous free fall around the planet." },
  { type: 'fact', text: 'A ladder leaning against a wall stays up thanks to static friction at the floor and a balance of torques — lean it too shallow and it slides out no matter how strong the wall is.' },
  { type: 'fact', text: "In an elastic collision between two equal masses, they simply swap velocities — that's why a cue ball 'stops dead' after hitting another ball head-on." },
  { type: 'fact', text: "A sonic boom isn't a one-time event at the instant of breaking the sound barrier — a supersonic jet drags a cone-shaped shockwave behind it the whole flight, so people on the ground hear the boom as that cone sweeps past." },
  { type: 'fact', text: 'Airbags and crumple zones both work the same way: spreading a fixed change in momentum over a longer time reduces the peak force on your body (impulse = force × time).' },
  { type: 'fact', text: "A pendulum's period depends only on its length and gravity — not on the mass of the bob, and (for small swings) not even on how far it swings." },
  { type: 'fact', text: 'Free-fall acceleration g isn\'t perfectly constant across Earth — it ranges from about 9.78 m/s² at the equator to about 9.83 m/s² at the poles.' },
  { type: 'fact', text: 'A fast-spinning top or bicycle wheel resists tipping over because of angular momentum — the faster it spins, the more torque it takes to change its orientation.' },
  { type: 'fact', text: "A satellite in low Earth orbit isn't 'above gravity' — it's moving sideways so fast (~7.8 km/s) that as it falls, the curve of the Earth falls away beneath it at the same rate." },
  { type: 'fact', text: 'Air resistance grows with the SQUARE of speed — which is exactly why terminal velocity exists: drag keeps growing until it matches gravity and net acceleration hits zero.' },

  { type: 'quote', text: 'If I have seen further, it is by standing on the shoulders of giants.', author: 'Isaac Newton' },
  { type: 'quote', text: 'The important thing is not to stop questioning. Curiosity has its own reason for existing.', author: 'Albert Einstein' },
  { type: 'quote', text: "Study hard what interests you the most, in the most undisciplined, irreverent, and original manner possible.", author: 'Richard Feynman' },
  { type: 'quote', text: 'What I cannot create, I do not understand.', author: 'Richard Feynman' },
  { type: 'quote', text: 'Nature is pleased with simplicity.', author: 'Isaac Newton' },
  { type: 'quote', text: 'The universe is under no obligation to make sense to you.', author: 'Neil deGrasse Tyson' },
  { type: 'quote', text: 'Physics is really nothing more than a search for ultimate simplicity.', author: 'Bill Bryson' },
  { type: 'quote', text: 'Somewhere, something incredible is waiting to be known.', author: 'Carl Sagan' },
  { type: 'quote', text: 'Physics is, hopefully, simple. Physicists are not.', author: 'Edward Teller' },
  { type: 'quote', text: "The most exciting phrase to hear in science is not 'Eureka!' but 'That's funny...'", author: 'Isaac Asimov' },
  { type: 'quote', text: 'Equipped with his five senses, man explores the universe around him and calls the adventure Science.', author: 'Edwin Hubble' },
  { type: 'quote', text: 'Remember to look up at the stars and not down at your feet.', author: 'Stephen Hawking' },
  { type: 'quote', text: 'Science is a way of thinking much more than it is a body of knowledge.', author: 'Carl Sagan' },
  { type: 'quote', text: "The good thing about science is that it's true whether or not you believe in it.", author: 'Neil deGrasse Tyson' },
  { type: 'quote', text: "I have not failed. I've just found 10,000 ways that won't work.", author: 'Thomas Edison' },
  { type: 'quote', text: 'It is the theory that decides what can be observed.', author: 'Albert Einstein' },
  { type: 'quote', text: 'Nothing in life is to be feared, it is only to be understood.', author: 'Marie Curie' },
  { type: 'quote', text: 'An expert is a person who has made all the mistakes that can be made in a very narrow field.', author: 'Niels Bohr' },
  { type: 'quote', text: 'Mathematics is the language in which God has written the universe.', author: 'Galileo Galilei' },
  { type: 'quote', text: 'The energy of the mind is the essence of life.', author: 'Aristotle' },

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
  {
    type: 'myth',
    text: 'Heavier objects always fall faster than lighter ones.',
    reality: 'Gravity gives every object the same free-fall acceleration (g ≈ 9.8 m/s²) regardless of mass. Heavier objects only seem to fall faster in air because drag affects low-mass, high-drag objects like feathers proportionally more — not because gravity pulls harder on more mass.',
  },
  {
    type: 'myth',
    text: 'If an object isn\'t moving, no forces are acting on it.',
    reality: 'An object can have several forces acting on it that perfectly cancel out. A book resting on a table has gravity pulling it down AND the normal force pushing up with equal size — two real forces, zero net force, and therefore no motion.',
  },
  {
    type: 'myth',
    text: "A projectile's velocity is zero at the very top of its trajectory.",
    reality: 'Only the VERTICAL component of velocity is zero at the peak. The horizontal component (v₀cosθ) never changes during the flight, which is exactly why the projectile keeps moving forward even at its highest point.',
  },
  {
    type: 'myth',
    text: 'Friction always opposes motion, so it always slows things down.',
    reality: "Friction opposes relative sliding, but that isn't always a braking effect — static friction between your shoes and the ground is exactly what pushes you forward when you walk, and between tires and road it's what lets a car accelerate at all.",
  },
  {
    type: 'myth',
    text: "Momentum isn't conserved in an inelastic collision because energy is lost.",
    reality: 'Momentum is conserved in every collision — elastic or inelastic — as long as no external force acts on the system. Only kinetic energy fails to be conserved in inelastic collisions; momentum conservation and energy conservation are separate rules.',
  },
  {
    type: 'myth',
    text: 'Acceleration means an object is speeding up.',
    reality: "Acceleration is any change in velocity — speeding up, slowing down, or even just changing direction at constant speed (like circular motion) all count, because velocity is a vector and acceleration tracks changes in its direction too, not just its size.",
  },
];
