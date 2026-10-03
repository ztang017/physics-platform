import { useRef, useState, useEffect } from 'react';
import { type CollisionParams, solveCollision, interpolateCollision } from '../../core/physics/collision';
import { useHiDPICanvas } from '../../components/canvas/useHiDPICanvas';
import { POEShell } from '../../components/poe/POEShell';
import { FormulaPanel } from '../../components/ui/FormulaPanel';
import { useGameStore } from '../../core/store/gameStore';
import { useSessionStore, type ExplainQuestion } from '../../core/store/sessionStore';
import { ConceptNotes } from '../../components/concepts/ConceptNotes';
import { COLLISION_CONCEPTS, COLLISION_CHALLENGE } from './collisionConcepts';
import styles from './CollisionModule.module.css';

export const COLLISION_EXPLAIN_QUESTIONS: ExplainQuestion[] = [
  {
    id: 'momentum-calc',
    question: "A 2 kg cart moves to the right at 3 m/s. What is its momentum?",
    options: ["6 kg·m/s to the right", "1.5 kg·m/s to the right", "6 kg·m/s to the left", "5 kg·m/s to the right"],
    correctIndex: 0,
    hint: "Momentum is mass × velocity, and it points the same way as the velocity.",
    explanation: "p = mv = 2 × 3 = 6 kg·m/s, in the same direction as the velocity (to the right). Dividing instead would give 1.5, and a minus sign (left) only appears if the velocity points left.",
  },
  {
    id: 'momentum-conserved',
    question: 'After the collision, total momentum is:',
    options: ['Less than before (some is lost)', 'Greater than before', 'The same as before', 'Always zero'],
    correctIndex: 2,
    hint: 'This holds for EVERY collision in a closed system, no matter how bouncy or how mismatched the masses are — what\'s the one quantity in this chapter that\'s always conserved, without exception?',
    explanation: 'Momentum is always conserved in a closed system. This is Newton\'s Third Law in action — the impulse cart 1 exerts on cart 2 is equal and opposite to what cart 2 exerts on cart 1.',
  },
  {
    id: 'action-reaction',
    question: 'During the collision, how do the forces cart 1 exerts on cart 2 compare to the forces cart 2 exerts on cart 1?',
    options: [
      'The heavier cart exerts more force',
      'The faster cart exerts more force',
      'They are equal in magnitude, opposite in direction',
      'They depend on the coefficient of restitution',
    ],
    correctIndex: 2,
    hint: 'This is one of Newton\'s three laws, and it applies to EVERY pair of interacting objects regardless of their mass or speed — not just collisions. Which law describes force pairs?',
    explanation: 'Newton\'s Third Law: action-reaction pairs are always equal and opposite, regardless of mass or speed. This is why a truck colliding with a small car exerts the same force on the car as the car exerts on the truck — the difference in damage is due to the difference in mass, not force.',
  },
  {
    id: 'elastic-vs-inelastic',
    question: 'In a perfectly inelastic collision (e = 0), what is special about the carts afterward?',
    options: ['They bounce apart at equal speeds', 'They stick together and move as one', 'All kinetic energy is converted to momentum', 'Momentum is lost'],
    correctIndex: 1,
    hint: "e = 0 means the carts are not moving apart after the hit. What does that look like for two touching carts?",
    explanation: "In a perfectly inelastic collision e = 0, so the carts do not separate at all after the impact: they stick together. This is the collision that loses the most kinetic energy, which turns into heat and sound.",
  },
  {
    id: 'equal-mass-elastic',
    question: 'In a perfectly elastic collision between a moving cart and an identical stationary cart, what happens?',
    options: ['They stick together and move as one', 'They exchange velocities exactly — the first cart stops, the second moves off at the original speed', 'Both end up moving at half the original speed', 'The moving cart bounces straight back at the same speed'],
    correctIndex: 1,
    hint: 'Try it in the simulation: set equal masses and e = 1 (fully elastic). Watch what the FIRST cart does right after impact, not just the second one.',
    explanation: "With equal masses and a perfectly elastic collision, the moving cart stops and the other cart leaves at the first one's speed. They swap velocities. This is why a cue ball stops dead when it hits another ball straight on.",
  },
  {
    id: 'perfectly-inelastic-calc',
    question: 'Cart A (2 kg, moving at 6 m/s) collides head-on and sticks to stationary Cart B (4 kg). What is their combined velocity afterward?',
    options: ['1 m/s', '2 m/s', '3 m/s', '6 m/s'],
    correctIndex: 1,
    hint: 'Total momentum before = total momentum after. Before: (2 kg)(6 m/s) + (4 kg)(0 m/s). After, both masses move together at one shared speed v — set up the equation and solve for v.',
    explanation: 'Momentum before = 2(6) + 4(0) = 12 kg·m/s. After sticking together, total mass = 6 kg, so v = 12/6 = 2 m/s. Notice kinetic energy before (36 J) is more than after (12 J) — energy was lost even though momentum balanced exactly.',
  },
  {
    id: 'push-apart-momentum',
    question: 'Two carts, 1 kg and 3 kg, sit at rest with a compressed spring between them. When the spring is released, the 1 kg cart shoots off to the left at 6 m/s. What is the velocity of the 3 kg cart?',
    options: ['2 m/s to the right', '2 m/s to the left', '6 m/s to the right', '18 m/s to the right'],
    correctIndex: 0,
    hint: 'Before the release, both carts are at rest, so the total momentum is zero. Momentum must still add up to zero afterward. If the 1 kg cart carries momentum to the left, what must the 3 kg cart carry?',
    explanation: 'Total momentum stays at zero: (1)(−6) + (3)v = 0, so v = +2 m/s — to the right, the opposite way. The lighter cart moves three times faster because it has one third of the mass: equal and opposite momenta, but different speeds.',
  },
  {
    id: 'sequential-collisions',
    question: 'Cart A (2 kg, moving at 6 m/s) has an elastic head-on collision with an identical stationary Cart B (2 kg). Cart B then goes on to have its own elastic head-on collision with a third identical stationary Cart C (2 kg), further down the track. What is Cart C\'s velocity right after its collision?',
    options: ['6 m/s', '3 m/s', '2 m/s', '0 m/s'],
    correctIndex: 0,
    hint: "You know the rule: an equal-mass elastic hit swaps the velocities. Use it twice, once for A hitting B and once for B hitting C.",
    explanation: "Equal masses swap velocities. First A (6 m/s) hits B: A stops and B leaves at 6 m/s. Then B (now at 6 m/s) hits C: B stops and C leaves at 6 m/s. The motion passes down the line unchanged, which is how a Newton's cradle works.",
  },
  {
    id: 'cm-invariance-boat',
    question: 'A 60 kg person stands still on a 40 kg boat floating on calm water (no friction from the water). The person then walks 2 m toward the front of the boat, relative to the boat. Since there\'s no external horizontal force on the person+boat system, how far — and which way — does the boat move?',
    options: ['1.2 m backward (opposite the walk)', '2.0 m backward, same distance as the person\'s step', '0.8 m forward, following the person', 'The boat doesn\'t move at all'],
    correctIndex: 0,
    hint: "The centre of mass of person + boat cannot move. If the person goes one way, the boat must go the other way, by an amount that balances the masses.",
    explanation: "No outside force acts sideways, so the centre of mass of person + boat stays in place. If the boat moves by Δ, the person moves 2 + Δ relative to the water, so 60(2 + Δ) + 40Δ = 0. That gives Δ = −1.2 m: the boat moves 1.2 m backward. The heavier person makes the lighter boat move further.",
  },
  {
    id: 'collision-2d-momentum',
    question: 'A 3 kg puck moving east at 4 m/s (so its momentum is entirely in the x-direction) strikes an identical stationary 3 kg puck off-center. After the collision, the first puck moves off with velocity components (2 m/s east, 2 m/s north). What must the SECOND puck\'s velocity components be, for momentum to be conserved in both directions?',
    options: ['2 m/s east, 2 m/s south', '2 m/s west, 2 m/s north', '2 m/s east, 2 m/s north', '4 m/s east, 2 m/s south'],
    correctIndex: 0,
    hint: "Momentum is conserved separately in each direction. Was there any north-south momentum before the collision?",
    explanation: "Before the collision all the momentum is eastward: pₓ = 3 × 4 = 12 and p_y = 0. Puck 1 afterwards has pₓ = 3 × 2 = 6 and p_y = 3 × 2 = 6. Each direction must balance on its own. So puck 2 needs pₓ = 12 − 6 = 6 (2 m/s east) and p_y = 0 − 6 = −6 (2 m/s south).",
  },
  {
    id: 'wedge-momentum-energy',
    question: 'A 0.500 kg block is released from rest at the top of a frictionless curved wedge of mass 3.00 kg, which sits on a frictionless horizontal surface. When the block leaves the wedge, its speed is 4.00 m/s to the right. What was the height h of the wedge? (g = 9.8 m/s²)',
    options: ['0.952 m', '0.816 m', '1.63 m', '0.408 m'],
    correctIndex: 0,
    hint: 'Two steps. First, the block and wedge start at rest and nothing pushes them sideways, so momentum conservation gives the wedge\'s speed from the block\'s. Then use energy: the potential energy the block loses (mgh) becomes the kinetic energy of BOTH the block and the wedge.',
    explanation: 'Momentum: (0.5)(4.00) + (3.00)V = 0, so the wedge recoils at V = −0.667 m/s. Energy: mgh = ½mv² + ½MV² = ½(0.5)(16) + ½(3)(0.444) = 4.00 + 0.667 = 4.667 J, so h = 4.667 / (0.5 × 9.8) = 0.952 m. Counting only the block\'s kinetic energy would give v²/2g ≈ 0.82 m — too low, because part of the released energy went into moving the wedge.',
  },
];

type FasterCart = 'cart1' | 'cart2' | 'same' | 'stop';

const PREDICTION_OPTIONS: { id: FasterCart; label: string }[] = [
  { id: 'cart1', label: 'Cart 1 (indigo) moves faster' },
  { id: 'cart2', label: 'Cart 2 (violet) moves faster' },
  { id: 'same', label: 'They move at the same speed' },
  { id: 'stop', label: 'Both stop' },
];

/** Which cart is moving faster once the collision is over (speed, ignoring direction). */
function fasterAfter(r: ReturnType<typeof solveCollision>): FasterCart {
  const s1 = Math.abs(r.v1f);
  const s2 = Math.abs(r.v2f);
  if (s1 < 0.05 && s2 < 0.05) return 'stop';
  if (Math.abs(s1 - s2) < 0.05) return 'same';
  return s1 > s2 ? 'cart1' : 'cart2';
}

/** A plain-words reason for what happened, based on the masses and the bounciness. */
function collisionReason(m1: number, m2: number, e: number): string {
  if (e === 0) return 'The carts stick together (e = 0), so they leave with one shared velocity. Momentum is conserved, but a lot of kinetic energy turns into heat and sound.';
  if (m1 === m2 && e === 1) return 'Equal masses in a perfectly elastic collision swap velocities: the first cart stops and the second leaves at the first one\'s speed.';
  if (m1 > m2) return 'Cart 1 is heavier, so it hardly slows down and keeps going forward. The lighter cart 2 is knocked off ahead of it, moving faster.';
  if (m1 < m2) return 'Cart 1 is lighter, so it loses most of its momentum to the heavier cart 2. Cart 1 slows a lot (or bounces back) and the heavy cart 2 moves off slowly.';
  return 'Equal masses share the motion: the two carts end up moving apart from each other.';
}

const TRACK_W = 560, TRACK_H = 200;

function CollisionCanvas({
  params,
  tNorm,
  result,
}: {
  params: CollisionParams;
  tNorm: number;
  result: ReturnType<typeof solveCollision>;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // The shared canvas hook clears the picture whenever layout resizes the canvas, so repaint when that happens.
  const [redrawTick, setRedrawTick] = useState(0);
  useHiDPICanvas(canvasRef, TRACK_W, TRACK_H, () => setRedrawTick((n) => n + 1));

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    ctx.clearRect(0, 0, TRACK_W, TRACK_H);

    const state = interpolateCollision(params, result, tNorm);
    const trackY = TRACK_H * 0.6;
    const SCALE = TRACK_W / 11; // pixels per meter

    // Track
    ctx.fillStyle = '#e2e5ee';
    ctx.fillRect(0, trackY + 16, TRACK_W, 8);
    ctx.strokeStyle = '#c7ccdb';
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(0, trackY + 16); ctx.lineTo(TRACK_W, trackY + 16); ctx.stroke();

    // Cart 1
    const c1x = state.x1 * SCALE;
    const c2x = state.x2 * SCALE;
    const cartH = 28, cartW = 44;

    // Cart 1 (indigo)
    ctx.fillStyle = 'rgba(79, 70, 229, 0.15)';
    ctx.strokeStyle = '#4f46e5';
    ctx.lineWidth = 2.5;
    ctx.fillRect(c1x - cartW / 2, trackY - cartH, cartW, cartH);
    ctx.strokeRect(c1x - cartW / 2, trackY - cartH, cartW, cartH);

    // Cart 1 label
    ctx.fillStyle = '#4f46e5';
    ctx.font = 'bold 12px JetBrains Mono';
    ctx.textAlign = 'center';
    ctx.fillText(`${params.m1}kg`, c1x, trackY - cartH - 4);
    ctx.fillText(`${state.v1.toFixed(1)}m/s`, c1x, trackY + 14);

    // Cart 2 (violet)
    ctx.fillStyle = 'rgba(124, 58, 237, 0.15)';
    ctx.strokeStyle = '#7c3aed';
    ctx.lineWidth = 2.5;
    ctx.fillRect(c2x - cartW / 2, trackY - cartH, cartW, cartH);
    ctx.strokeRect(c2x - cartW / 2, trackY - cartH, cartW, cartH);

    ctx.fillStyle = '#7c3aed';
    ctx.fillText(`${params.m2}kg`, c2x, trackY - cartH - 4);
    ctx.fillText(`${state.v2.toFixed(1)}m/s`, c2x, trackY + 14);

    // Momentum arrows
    const arrowScale = 4;
    if (Math.abs(state.v1) > 0.1) {
      const dir = state.v1 > 0 ? 1 : -1;
      const len = Math.min(Math.abs(state.v1) * arrowScale * params.m1 / 5, 80);
      drawArrow(ctx, c1x, trackY - cartH - 18, c1x + dir * len, trackY - cartH - 18, '#4f46e5', `p=${(params.m1 * state.v1).toFixed(1)}`);
    }
    if (Math.abs(state.v2) > 0.1) {
      const dir = state.v2 > 0 ? 1 : -1;
      const len = Math.min(Math.abs(state.v2) * arrowScale * params.m2 / 5, 80);
      drawArrow(ctx, c2x, trackY - cartH - 18, c2x + dir * len, trackY - cartH - 18, '#7c3aed', `p=${(params.m2 * state.v2).toFixed(1)}`);
    }

    // Phase label
    ctx.fillStyle = 'rgba(23,27,38,0.55)';
    ctx.font = 'bold 11px JetBrains Mono';
    ctx.textAlign = 'left';
    const phaseMap: Record<string, string> = { approach: '→ Approaching...', collision: '💥 COLLISION!', separation: '← Separating...' };
    ctx.fillText(phaseMap[state.phase] ?? '', 8, 20);
  }, [params, tNorm, result, redrawTick]);

  return (
    <canvas ref={canvasRef}
      className={styles.canvas}
      aria-label="Collision simulation showing two carts on a track with momentum vectors"
      role="img"
    />
  );
}

function drawArrow(ctx: CanvasRenderingContext2D, x1: number, y1: number, x2: number, y2: number, color: string, label: string) {
  const headLen = 7;
  const angle = Math.atan2(y2 - y1, x2 - x1);
  ctx.strokeStyle = color; ctx.fillStyle = color; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x2, y2);
  ctx.lineTo(x2 - headLen * Math.cos(angle - 0.4), y2 - headLen * Math.sin(angle - 0.4));
  ctx.lineTo(x2 - headLen * Math.cos(angle + 0.4), y2 - headLen * Math.sin(angle + 0.4));
  ctx.closePath(); ctx.fill();
  ctx.font = '11px JetBrains Mono'; ctx.textAlign = 'center';
  ctx.fillText(label, (x1 + x2) / 2, y1 - 5);
}

export function CollisionModule() {
  const { addXP, unlockBadge, completeModule } = useGameStore();
  const { setPOEPhase } = useSessionStore();
  const [m1, setM1] = useState(3); const [v1, setV1] = useState(5);
  const [m2, setM2] = useState(1); const [v2] = useState(0);
  const [e, setE] = useState(1);
  const [tNorm, setTNorm] = useState(0);
  const [predicted, setPredicted] = useState<FasterCart | null>(null);
  const [predictionLocked, setPredictionLocked] = useState(false);
  const [playing, setPlaying] = useState(false);
  const animRef = useRef<number>(0);

  const playAnimation = () => {
    setTNorm(0);
    setPlaying(true);
    const startTime = performance.now();
    const DURATION = 2500; // ms for full playthrough
    const tick = (now: number) => {
      const t = Math.min((now - startTime) / DURATION, 1);
      setTNorm(t);
      if (t < 1) {
        animRef.current = requestAnimationFrame(tick);
      } else {
        setPlaying(false);
      }
    };
    animRef.current = requestAnimationFrame(tick);
  };

  // Stop animation when params change
  useEffect(() => {
    cancelAnimationFrame(animRef.current);
    setPlaying(false);
    setTNorm(0);
  }, [m1, v1, m2, e]);

  // Cancel any in-flight animation frame on unmount — without this, a RAF
  // callback already queued when the student navigates away (e.g. clicking
  // "Courses" mid-play) still fires once more and calls setState on an
  // unmounted component.
  useEffect(() => () => cancelAnimationFrame(animRef.current), []);

  const params: CollisionParams = { m1, v1, m2, v2, e };
  const result = solveCollision(params);
  // Cart 1 only actually catches up to (and collides with) cart 2 if it's
  // closing the gap; otherwise the "approach → collision" animation would be
  // fictitious (the physics engine still plays it via a floor value so the
  // demo never stalls — see interpolateCollision — but presenting that as a
  // real collision here would be misleading).
  const isApproaching = v1 > v2;
  const actualFaster = fasterAfter(result);

  const handleComplete = (score: number, perfectExplain: boolean) => {
    addXP(50 + score);
    if (result.isEnergyConserved) unlockBadge('conservationist');
    unlockBadge('momentum-guardian');
    if (perfectExplain) unlockBadge('sharp-shooter');
    completeModule('collision');
  };

  // "Try Again" resets every input and any in-flight animation — without
  // this, stale `predicted`/`tNorm`/`playing` state would carry into the next
  // attempt, and re-selecting a prediction would still be re-awardable.
  const handleTryAgain = () => {
    cancelAnimationFrame(animRef.current);
    setM1(3);
    setV1(5);
    setM2(1);
    setE(1);
    setTNorm(0);
    setPlaying(false);
    setPredicted(null);
    setPredictionLocked(false);
  };

  const PredictPhase = (
    <div className={styles.predictWrap}>
      <p className={styles.scenario}>
        <strong>The scenario:</strong> two carts on a smooth, level track. Cart 1 (indigo) rolls to the right and hits Cart 2 (violet),
        which is sitting still. You choose the masses, how fast cart 1 is going, and how bouncy the collision is. Then you predict who ends
        up faster.
      </p>
      <div className={styles.sliders}>
        <div className="slider-wrap">
          <label className="slider-label" htmlFor="col-m1">Cart 1 Mass <span className="value">{m1} kg</span></label>
          <input id="col-m1" type="range" min="1" max="10" step="0.5" value={m1} onChange={(e) => setM1(+e.target.value)} />
        </div>
        <div className="slider-wrap">
          <label className="slider-label" htmlFor="col-v1">Cart 1 Velocity <span className="value">{v1} m/s</span></label>
          <input id="col-v1" type="range" min="-10" max="10" step="0.5" value={v1} onChange={(e) => setV1(+e.target.value)} />
        </div>
        <div className="slider-wrap">
          <label className="slider-label" htmlFor="col-m2">Cart 2 Mass <span className="value">{m2} kg</span></label>
          <input id="col-m2" type="range" min="1" max="10" step="0.5" value={m2} onChange={(e) => setM2(+e.target.value)} />
        </div>
        <div className="slider-wrap">
          <label className="slider-label" htmlFor="col-e">
            Bounciness (restitution, e)
            <span className="value">{e === 0 ? '0: stick together' : e === 1 ? '1: perfect bounce' : e.toFixed(2)}</span>
          </label>
          <input id="col-e" type="range" min="0" max="1" step="0.05" value={e} onChange={(e) => setE(+e.target.value)} />
        </div>
      </div>

      <div className={styles.questionCard}>
        <p className={styles.questionText}>Cart 1 ({m1} kg moving right at {v1} m/s) hits Cart 2 ({m2} kg, sitting still). Which cart will be moving faster once the collision is over?</p>
        <div className={styles.predOptions}>
          {PREDICTION_OPTIONS.map((opt) => (
            <button
              key={opt.id}
              className={`${styles.predBtn} ${predicted === opt.id ? styles.predBtnActive : ''}`}
              onClick={() => setPredicted(opt.id)}
              role="radio"
              aria-checked={predicted === opt.id}
            >
              {opt.label}
            </button>
          ))}
        </div>
        {predicted && (
          <button
            className="btn btn--primary"
            onClick={() => {
              // Only award XP the first time — if the student uses Back to
              // revisit Predict and re-locks, this must stay a no-op.
              if (!predictionLocked) { addXP(10); setPredictionLocked(true); }
              setPOEPhase('observe');
            }}
          >
            🔮 Lock In Prediction
          </button>
        )}
      </div>
    </div>
  );

  const ObservePhase = (
    <div className={styles.observeWrap}>
      {predicted && isApproaching && (
        <div className={styles.predictionFeedback}>
          <p>
            <strong>Your prediction: {PREDICTION_OPTIONS.find((o) => o.id === predicted)?.label}. </strong>
            <strong className={predicted === actualFaster ? 'text-green' : 'text-amber'}>
              {predicted === actualFaster ? '✓ Correct' : `✗ Actually: ${PREDICTION_OPTIONS.find((o) => o.id === actualFaster)?.label.toLowerCase()}`}
            </strong>
          </p>
          <p>
            After the collision, cart 1 moves at {result.v1f.toFixed(2)} m/s and cart 2 at {result.v2f.toFixed(2)} m/s (a negative number means moving left).
            {' '}{collisionReason(m1, m2, e)}
          </p>
        </div>
      )}
      {!isApproaching && (
        <div className={styles.notApproachingNotice} role="alert">
          ⚠️ Cart 1 isn't moving faster than Cart 2, so it never actually catches up — there's no real
          collision here. Go back and increase Cart 1's velocity above {v2} m/s to see a genuine impact.
        </div>
      )}

      <CollisionCanvas params={params} tNorm={tNorm} result={result} />

      <div className={styles.scrubberWrap}>
        <div className={styles.playRow}>
          <button
            className={`btn ${playing ? 'btn--secondary' : 'btn--primary'}`}
            onClick={() => {
              if (playing) { cancelAnimationFrame(animRef.current); setPlaying(false); }
              else { playAnimation(); }
            }}
            disabled={!isApproaching}
            aria-label={playing ? 'Pause animation' : 'Play collision animation'}
          >
            {playing ? '⏸ Pause' : '▶ Play'}
          </button>
          <button className="btn btn--secondary" onClick={() => { cancelAnimationFrame(animRef.current); setPlaying(false); setTNorm(0); }} aria-label="Reset to start">
            ⏮ Reset
          </button>
        </div>
        <label className="slider-label" htmlFor="scrubber">
          ⏱ Slow-Motion Scrubber
          <span className="value">{tNorm < 0.45 ? 'Approach' : tNorm < 0.55 ? 'Impact' : 'Separation'}</span>
        </label>
        <input
          id="scrubber"
          type="range" min="0" max="1" step="0.01"
          value={tNorm} onChange={(e) => setTNorm(+e.target.value)}
          disabled={!isApproaching}
          aria-label="Scrub through collision timeline"
        />
        <div className={styles.scrubMarkers}>
          <span>Start</span><span>Impact</span><span>After</span>
        </div>
      </div>

      <div className={styles.readoutsGrid}>
        <div className={styles.readout}>
          <span>Cart 1 velocity after</span>
          <strong className="text-cyan">{result.v1f.toFixed(2)} m/s</strong>
        </div>
        <div className={styles.readout}>
          <span>Cart 2 velocity after</span>
          <strong className="text-cyan">{result.v2f.toFixed(2)} m/s</strong>
        </div>
        <div className={styles.readout}>
          <span>p before</span>
          <strong className="text-cyan">{result.totalMomentumBefore.toFixed(2)} kg·m/s</strong>
        </div>
        <div className={styles.readout}>
          <span>p after</span>
          <strong className="text-cyan">{result.totalMomentumAfter.toFixed(2)} kg·m/s</strong>
        </div>
        <div className={styles.readout}>
          <span>KE before</span>
          <strong className="text-green">{result.totalKEBefore.toFixed(2)} J</strong>
        </div>
        <div className={styles.readout}>
          <span>KE after</span>
          <strong className={result.isEnergyConserved ? 'text-green' : 'text-amber'}>{result.totalKEAfter.toFixed(2)} J</strong>
        </div>
        <div className={styles.readout}>
          <span>KE lost</span>
          <strong className="text-amber">{result.keLost.toFixed(2)} J</strong>
        </div>
        <div className={styles.readout}>
          <span>Conserved</span>
          <strong className={result.isEnergyConserved ? 'text-green' : 'text-amber'}>
            {result.isEnergyConserved ? '✓ Elastic' : '✗ Inelastic'}
          </strong>
        </div>
      </div>

      <FormulaPanel
        title="Collision Equations"
        formulas={[
          { label: 'Momentum', latex: 'p = mv', liveValue: `total = ${result.totalMomentumBefore.toFixed(2)} kg·m/s`, accentColor: 'cyan' },
          { label: 'Conservation', latex: 'm_1v_1 + m_2v_2 = m_1v_{1f} + m_2v_{2f}', accentColor: 'violet' },
          { label: 'Restitution', latex: 'e = -\\frac{v_{1f} - v_{2f}}{v_1 - v_2}', liveValue: `e = ${e.toFixed(2)}`, accentColor: 'amber' },
        ]}
      />
    </div>
  );

  return (
    <div className={styles.module}>
      <div className={styles.moduleHeader}>
        <h2>💥 1D Elastic & Inelastic Collisions</h2>
        <p>Explore momentum conservation and the coefficient of restitution.</p>
      </div>

      <div className={styles.conceptWrap}>
        <ConceptNotes
          title="Momentum & Collisions"
          intro="What momentum means, why it's always conserved, and what 'elastic' means."
          sections={COLLISION_CONCEPTS}
        />
        <ConceptNotes
          variant="challenge"
          title="Momentum & Collisions"
          intro="Impulse as an integral — how a varying force during impact still conserves momentum."
          sections={COLLISION_CHALLENGE}
        />
      </div>

      <POEShell
        moduleId="collision"
        predictComponent={PredictPhase}
        observeComponent={ObservePhase}
        explainQuestions={COLLISION_EXPLAIN_QUESTIONS}
        onComplete={handleComplete}
        onTryAgain={handleTryAgain}
        predictHint="Total momentum before the collision must equal total momentum after — that's the one rule that never breaks. Think about a heavy cart hitting a much lighter one: for momentum (mass × velocity) to balance out, what does that usually mean for how fast the lighter cart ends up moving?"
      />
    </div>
  );
}
