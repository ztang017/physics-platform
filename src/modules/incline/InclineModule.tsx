import { useRef, useState, useEffect } from 'react';
import { useHiDPICanvas } from '../../components/canvas/useHiDPICanvas';
import { computeInclineForces, validateFBD, type InclineParams, type FBDVector, type FBDValidationResult } from '../../core/physics/incline';
import { POEShell } from '../../components/poe/POEShell';
import { FormulaPanel } from '../../components/ui/FormulaPanel';
import { useGameStore } from '../../core/store/gameStore';
import { useSessionStore, type ExplainQuestion } from '../../core/store/sessionStore';
import { ConceptNotes } from '../../components/concepts/ConceptNotes';
import { INCLINE_CONCEPTS, INCLINE_CHALLENGE } from './inclineConcepts';
import { InclineFBDPlacer, MAX_ARROW_LEN, pixelVectorToForce, type PlacedVector } from './InclineFBDPlacer';
import styles from './InclineModule.module.css';

const EMPTY_VECTORS: Record<PlacedVector['id'], { dx: number; dy: number }> = {
  weight: { dx: 0, dy: 0 },
  normal: { dx: 0, dy: 0 },
  friction: { dx: 0, dy: 0 },
};

export const INCLINE_EXPLAIN_QUESTIONS: ExplainQuestion[] = [
  {
    id: 'mass-vs-weight',
    question: "A 5 kg block is taken from the Earth to the Moon. What happens to its mass and its weight?",
    options: ["Its mass stays 5 kg and its weight gets smaller", "Both stay the same", "Both get smaller", "Its mass gets smaller and its weight stays the same"],
    correctIndex: 0,
    hint: "Mass is how much matter there is. Weight is the pull of gravity on that matter, W = mg. Which of the two depends on g?",
    explanation: "Mass is the amount of matter, so it does not change. Weight = mg, and g is smaller on the Moon, so the weight is smaller (about one sixth). Kilograms measure mass; newtons measure weight.",
  },
  {
    id: 'second-law-basic',
    question: "A 2 kg cart is pushed along a smooth table by a net force of 10 N. What is its acceleration?",
    options: ["5 m/s²", "20 m/s²", "0.2 m/s²", "12 m/s²"],
    correctIndex: 0,
    hint: "Newton's second law: F = ma, so a = F ÷ m.",
    explanation: "a = F ÷ m = 10 ÷ 2 = 5 m/s². The 20 comes from multiplying instead of dividing, and 0.2 from dividing the wrong way round.",
  },
  {
    id: 'third-law-pair',
    question: "A book rests on a table, and the table pushes up on the book. What is the third-law partner of that force?",
    options: ["The book pushing down on the table", "The book's weight", "The ground pushing up on the table", "The book's mass"],
    correctIndex: 0,
    hint: "A third-law pair acts between the same two objects, in opposite directions. The table pushes on the book, so what does the book do to the table?",
    explanation: "The partner of 'table pushes up on book' is 'book pushes down on table'. The weight of the book is a different force (gravity pulling on the book) that happens to be equal in size here. Pairs always act on different objects.",
  },
  {
    id: 'normal-direction',
    question: 'Why does the normal force point perpendicular to the surface — not straight up?',
    options: [
      'Because friction acts upward',
      'Because the surface can only push perpendicular to itself',
      'Because gravity is always horizontal',
      'Because the block is accelerating',
    ],
    correctIndex: 1,
    hint: 'Think about what a solid surface physically CAN do to an object touching it — can it grab and pull, or only push?',
    explanation: 'The normal force is a contact force — surfaces can only push objects perpendicular to their own plane. It cannot pull, and it always opposes the component of force pressing into the surface.',
  },
  {
    id: 'stacked-boxes-normal',
    question: 'A 3 kg box rests on top of a 5 kg box, which sits still on a table. What is the normal force between the two boxes (the force the 5 kg box exerts upward on the 3 kg box)? (g = 10 m/s²)',
    options: ['80 N', '30 N', '50 N', '15 N'],
    correctIndex: 1,
    hint: "Look at the top box on its own. What single force holds it up?",
    explanation: "Look at the top box alone. Only the box below holds it up, so that push just equals the top box's weight: 3 kg × 10 m/s² = 30 N. The table has to hold up both boxes (80 N), but that is a different contact. Each surface only supports what rests directly on it.",
  },
  {
    id: 'friction-doubles-mass',
    question: 'If you double the mass of the block (angle unchanged), what happens to the frictional force?',
    options: ['It stays the same', 'It doubles', 'It halves', 'It becomes zero'],
    correctIndex: 1,
    hint: 'Friction depends on the normal force N, and N itself depends on weight (mg·cosθ). If you double m, what happens to N first — and then to friction?',
    explanation: 'Friction = μN = μ·mg·cos(θ). Doubling m doubles N, which doubles friction. The coefficient μ does not change — it depends only on the surface materials.',
  },
  {
    id: 'normal-force-steep-limit',
    question: 'As the incline angle increases toward 90° (a vertical wall), what happens to the normal force?',
    options: ['It approaches the full weight, mg', 'It approaches zero', 'It stays exactly the same', 'It becomes negative'],
    correctIndex: 1,
    hint: 'N = mg·cos(θ). What does cos(θ) approach as θ approaches 90°?',
    explanation: "N = mg cos θ, and cos 90° = 0, so N shrinks to zero as the slope gets steeper. A block cannot rest on a vertical wall with nothing else holding it there.",
  },
  {
    id: 'critical-angle',
    question: 'At the critical angle where the block just starts to slide, what is true?',
    options: [
      'Normal force = 0',
      'The parallel gravity component equals maximum static friction',
      'Kinetic friction equals zero',
      'The block has infinite acceleration',
    ],
    correctIndex: 1,
    hint: '"Just starts to slide" means the block is right on the edge of equilibrium — the force pulling it down the slope must be exactly balanced by something. What force has been holding it in place up to this point?',
    explanation: 'At the critical angle: mg·sin(θ) = μₛ·mg·cos(θ), which simplifies to tan(θ) = μₛ. This is how we measure the coefficient of static friction experimentally.',
  },
  {
    id: 'slide-or-stay-calc',
    question: 'A 5 kg block sits on a 30° incline with μₛ = 0.3 (g = 10 m/s²). Does it slide?',
    options: [
      'No — friction easily holds it in place',
      'Yes — the down-slope pull exceeds the maximum friction available',
      'Impossible to tell without the block\'s exact shape',
      'No — but only because the mass is under 10 kg',
    ],
    correctIndex: 1,
    hint: 'Down-slope pull: mg·sin(30°) = 5×10×0.5 = 25 N. Maximum static friction: μₛ·mg·cos(30°) = 0.3×5×10×cos(30°) ≈ 13 N. Which one is bigger?',
    explanation: 'The down-slope pull (25 N) is nearly double the maximum available friction (≈13 N), so friction cannot hold the block — it slides. Mass itself never decides this on its own; it\'s always the ratio between the two forces that matters.',
  },
  {
    id: 'contact-force-blocks',
    question: 'A 4 kg block and a 6 kg block sit in contact on a frictionless table. A 50 N force pushes on the 4 kg block, driving both blocks forward together. What is the contact force between the two blocks?',
    options: ['50 N', '30 N', '20 N', '10 N'],
    correctIndex: 1,
    hint: "First find the acceleration of both blocks together, using F = ma with the total mass. Then look at the 6 kg block alone: what push does it need to get that acceleration?",
    explanation: "Step 1: treat both blocks as one 10 kg object. Its acceleration is a = F ÷ m = 50 ÷ 10 = 5 m/s². Step 2: look at the 6 kg block alone. The only horizontal force on it is the push from the 4 kg block, so that push is ma = 6 × 5 = 30 N. It is less than 50 N because 20 N is used up accelerating the 4 kg block.",
  },
  {
    id: 'elevator-normal-force',
    question: 'A 60 kg person stands on a scale inside an elevator. When the elevator accelerates upward at 2 m/s², what does the scale read? (g = 10 m/s²)',
    options: ['600 N', '480 N', '720 N', '120 N'],
    correctIndex: 2,
    hint: "Draw the weight (down) and the normal force (up). The net force must point up, the way the elevator accelerates. Must N be bigger or smaller than mg?",
    explanation: "Take up as positive and use F = ma on the person: N − mg = ma, so N = m(g + a) = 60 × (10 + 2) = 720 N. The scale reads more than the resting weight of 600 N, because the floor must push up harder to accelerate you upward.",
  },
  {
    id: 'incline-in-elevator',
    question: "A block sits on a frictionless 30° slope inside an elevator that accelerates DOWNWARD at 2 m/s². How fast does the block accelerate down the slope? (g = 10 m/s²)",
    options: ['4 m/s²', '5 m/s²', '6 m/s²', '8 m/s²'],
    correctIndex: 0,
    hint: "Swap g for an effective gravity, g_eff = g − a (a is the elevator's downward acceleration). Then use a = g_eff × sin θ.",
    explanation: "In a downward-accelerating elevator gravity effectively gets weaker: g_eff = 10 − 2 = 8 m/s². On a frictionless slope the acceleration is g_eff × sin 30° = 8 × 0.5 = 4 m/s². In a stationary elevator it would be 5 m/s², so the block slides more slowly.",
  },
];

const W = 420, H = 300;

// Vector colors — also used by the HTML legend so the two stay in sync.
const VEC_COLOR = { weight: '#dc2626', normal: '#4f46e5', friction: '#16a34a', angle: '#b45309' };

function drawIncline(
  ctx: CanvasRenderingContext2D,
  angleDeg: number,
  forces: ReturnType<typeof computeInclineForces>,
  validated: boolean,
  slideT: number
) {
  ctx.clearRect(0, 0, W, H);

  const angle = (angleDeg * Math.PI) / 180;
  const baseX = 40, baseY = H - 40;
  const hyp = 280;

  // Incline surface (a right triangle: horizontal ground, vertical back, hypotenuse ramp)
  ctx.strokeStyle = '#c7ccdb';
  ctx.lineWidth = 2;
  ctx.fillStyle = '#eef1f7';
  ctx.beginPath();
  ctx.moveTo(baseX, baseY);
  ctx.lineTo(baseX + hyp * Math.cos(angle), baseY - hyp * Math.sin(angle));
  ctx.lineTo(baseX + hyp * Math.cos(angle), baseY);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Ramp surface line, drawn heavier so it clearly reads as the contact surface
  ctx.strokeStyle = '#8890a3';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(baseX, baseY);
  ctx.lineTo(baseX + hyp * Math.cos(angle), baseY - hyp * Math.sin(angle));
  ctx.stroke();

  // Block position along the incline. A stationary block sits still at the
  // 48% mark; a sliding block visibly travels down the slope over time, using
  // a quadratic ease-in (position ∝ t²) to read as "starting from rest and
  // accelerating" without needing a literal meters-per-pixel scale — this
  // canvas is a schematic diagram, not a distance-accurate simulation.
  let travelFrac = 0.48;
  if (validated && !forces.isStationary) {
    const REFERENCE_ACCEL = 4; // m/s² — tuned so a "typical" case slides in ~2.2s
    const loopDuration = 2.6 * Math.sqrt(REFERENCE_ACCEL / Math.max(forces.acceleration, 0.5));
    const loopT = slideT % loopDuration;
    const progress = Math.min(1, (loopT / loopDuration) ** 2);
    travelFrac = 0.48 - progress * 0.42; // slides from 48% down to 6% up the ramp
  }
  const bx = baseX + (hyp * travelFrac) * Math.cos(angle);
  const by = baseY - (hyp * travelFrac) * Math.sin(angle);
  // Vectors are drawn from the block's geometric centre, not its surface contact point
  const cx = bx - Math.sin(angle) * 15;
  const cy = by - Math.cos(angle) * 15;

  // Block
  ctx.save();
  ctx.translate(bx, by);
  ctx.rotate(-angle);
  const bSize = 32;
  ctx.fillStyle = 'rgba(79, 70, 229, 0.12)';
  ctx.strokeStyle = '#4f46e5';
  ctx.lineWidth = 2;
  ctx.fillRect(-bSize / 2, -bSize, bSize, bSize);
  ctx.strokeRect(-bSize / 2, -bSize, bSize, bSize);
  ctx.restore();

  // Force vectors (always show weight; the rest appear once the FBD is verified).
  // Scale is derived from the CURRENT weight (the largest of the three forces,
  // since N ≤ W and f ≤ N) so the longest arrow is always a fixed, sane pixel
  // length — a literal fixed scale previously sent the weight arrow (up to
  // mg ≈ 196 N at max mass) hundreds of pixels past the bottom of the canvas,
  // so its arrowhead and label never actually appeared on screen.
  const MAX_ARROW_LEN = 70;
  const scale = MAX_ARROW_LEN / Math.max(forces.weight, 1);

  // Weight: mg, straight down — always vertical regardless of incline angle
  drawVector(ctx, cx, cy, 0, forces.weight * scale, VEC_COLOR.weight, 'W');

  if (validated) {
    // Normal: perpendicular to the surface, pointing AWAY from the ramp material
    // (up and to the left of the slope, not into it).
    const nx = -Math.sin(angle) * forces.normal * scale;
    const ny = -Math.cos(angle) * forces.normal * scale;
    drawVector(ctx, cx, cy, nx, ny, VEC_COLOR.normal, 'N');

    // Friction: along the surface, pointing UP the slope (same direction the
    // ramp rises), opposing the block's tendency to slide down.
    const fMag = forces.isStationary ? forces.weightParallel : forces.frictionKinetic;
    const fx = Math.cos(angle) * fMag * scale;
    const fy = -Math.sin(angle) * fMag * scale;
    drawVector(ctx, cx, cy, fx, fy, VEC_COLOR.friction, 'f');
  }

  // Angle arc + label
  ctx.strokeStyle = VEC_COLOR.angle;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(baseX, baseY, 35, -angle, 0);
  ctx.stroke();
  ctx.fillStyle = VEC_COLOR.angle;
  ctx.font = 'bold 12px JetBrains Mono';
  ctx.textAlign = 'left';
  ctx.fillText(`${angleDeg}°`, baseX + 40, baseY - 8);
}

function drawVector(ctx: CanvasRenderingContext2D, ox: number, oy: number, dx: number, dy: number, color: string, label: string) {
  const len = Math.sqrt(dx * dx + dy * dy);
  if (len < 5) return;
  const angle = Math.atan2(dy, dx);
  const headLen = 9;

  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = 3;

  ctx.beginPath();
  ctx.moveTo(ox, oy);
  ctx.lineTo(ox + dx, oy + dy);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(ox + dx, oy + dy);
  ctx.lineTo(ox + dx - headLen * Math.cos(angle - 0.4), oy + dy - headLen * Math.sin(angle - 0.4));
  ctx.lineTo(ox + dx - headLen * Math.cos(angle + 0.4), oy + dy - headLen * Math.sin(angle + 0.4));
  ctx.closePath();
  ctx.fill();

  // White halo behind the label so it stays legible over the ramp fill or block
  const lx = ox + dx + 8, ly = oy + dy - 2;
  ctx.font = 'bold 12px JetBrains Mono';
  ctx.textAlign = 'left';
  ctx.lineWidth = 3;
  ctx.strokeStyle = 'rgba(255,255,255,0.9)';
  ctx.strokeText(label, lx, ly);
  ctx.fillStyle = color;
  ctx.fillText(label, lx, ly);
}

// Rendered fresh each time the Observe phase mounts, so its Hi-DPI sizing
// effect always attaches to a canvas that actually exists in the DOM (unlike
// a ref/effect declared in the parent, which never remounts across phases).
function InclineCanvas({
  angleDeg,
  forces,
  validated,
}: {
  angleDeg: number;
  forces: ReturnType<typeof computeInclineForces>;
  validated: boolean;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);
  const [slideT, setSlideT] = useState(0);

  // The shared canvas hook clears the picture whenever layout resizes the canvas, so repaint when that happens.
  const [redrawTick, setRedrawTick] = useState(0);
  useHiDPICanvas(canvasRef, W, H, () => setRedrawTick((n) => n + 1));

  const isSliding = validated && !forces.isStationary;

  // Animate the block sliding down the ramp whenever the verified FBD says it
  // should move. A stationary block never gets this loop, so it visibly stays
  // put — answering "is the block supposed to move?" unambiguously either way.
  useEffect(() => {
    setSlideT(0);
    if (!isSliding) return;
    let start: number | null = null;
    const tick = (now: number) => {
      if (start === null) start = now;
      setSlideT((now - start) / 1000);
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
    // forces/mass/muStatic intentionally omitted from deps: restarting the
    // loop only needs to happen when sliding starts/stops or the ramp angle
    // changes (which resets the block's visual position); reacting to every
    // recomputed `forces` object would restart the animation on each render.
  }, [isSliding, angleDeg]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    drawIncline(ctx, angleDeg, forces, validated, slideT);
  }, [angleDeg, forces, validated, slideT, redrawTick]);

  return (
    <>
      <canvas
        ref={canvasRef}
        className={styles.canvas}
        aria-label="Free body diagram of block on incline showing force vectors"
        role="img"
      />
      {validated && (
        <p className={styles.motionStatus}>
          {isSliding
            ? '⚡ Sliding: friction can\'t hold it — the block accelerates down the slope.'
            : '✓ Static: friction fully cancels the down-slope pull — the block stays put.'}
        </p>
      )}
    </>
  );
}

export function InclineModule() {
  const { addXP, unlockBadge, completeModule } = useGameStore();
  const { setPOEPhase } = useSessionStore();

  const [angleDeg, setAngleDeg] = useState(30);
  const [muStatic, setMuStatic] = useState(0.4);
  const [mass, setMass] = useState(5);
  const [validated, setValidated] = useState(false);
  const [firstAttempt, setFirstAttempt] = useState(true);
  const [vectors, setVectors] = useState(EMPTY_VECTORS);
  const [verifyResult, setVerifyResult] = useState<FBDValidationResult | null>(null);
  // The student commits to "stay" or "slide" BEFORE seeing any verdict; it is graded in Observe.
  const [slidePrediction, setSlidePrediction] = useState<'stay' | 'slide' | null>(null);

  const inclineParams: InclineParams = { mass, angleDeg, muStatic, muKinetic: muStatic * 0.75 };
  const forces = computeInclineForces(inclineParams);

  const handleVectorChange = (id: PlacedVector['id'], dx: number, dy: number) => {
    setVectors((prev) => ({ ...prev, [id]: { dx, dy } }));
  };

  const handleResetVectors = () => {
    setVectors(EMPTY_VECTORS);
    setVerifyResult(null);
  };

  const allVectorsPlaced = (['weight', 'normal', 'friction'] as const).every(
    (id) => Math.sqrt(vectors[id].dx ** 2 + vectors[id].dy ** 2) >= 6
  );

  // Real drag-and-place validation: the student's dragged vectors are
  // converted back to (magnitude, angle) using the same scale the placer
  // drew them with, then checked against the actual physics. Only a fully
  // correct diagram (all 3 vectors within tolerance) advances the phase —
  // this is what finally makes the "perfect FBD on the first attempt"
  // badge description true; previously any click here always "succeeded".
  const handleValidate = () => {
    const scale = MAX_ARROW_LEN / Math.max(forces.weight, 1);
    const studentVectors: FBDVector[] = (['weight', 'normal', 'friction'] as const).map((id) => {
      const { magnitude, angleDeg: vecAngle } = pixelVectorToForce(vectors[id].dx, vectors[id].dy, scale);
      return { id, magnitude, angleDeg: vecAngle };
    });
    const result = validateFBD(studentVectors, forces, angleDeg);
    setVerifyResult(result);

    if (result.isValid) {
      if (firstAttempt) unlockBadge('force-whisperer');
      // Only award XP the first time this specific attempt is verified — if the
      // student uses Back to revisit Predict and re-verifies, this is a no-op.
      if (!validated) addXP(25);
      setValidated(true);
      setPOEPhase('observe');
    }
    setFirstAttempt(false);
  };

  // "Try Again" resets firstAttempt too — now that verification is real,
  // fumbling the drag interaction on a genuine first try (before you've
  // gotten the hang of it) shouldn't permanently lock out the "perfect on
  // the first attempt" badge for the rest of the session; a fresh run
  // through the module earns a fresh first attempt.
  const handleTryAgain = () => {
    setAngleDeg(30);
    setMuStatic(0.4);
    setMass(5);
    setValidated(false);
    setVectors(EMPTY_VECTORS);
    setVerifyResult(null);
    setFirstAttempt(true);
    setSlidePrediction(null);
  };

  const handleComplete = (score: number, perfectExplain: boolean) => {
    addXP(50 + score);
    unlockBadge('equilibrium-master');
    if (perfectExplain) unlockBadge('sharp-shooter');
    completeModule('incline');
  };

  const PredictPhase = (
    <div className={styles.predictWrap}>
      <div className={styles.sliders}>
        <div className="slider-wrap">
          <label className="slider-label" htmlFor="inc-angle">Incline Angle <span className="value">{angleDeg}°</span></label>
          <input id="inc-angle" type="range" min="5" max="75" step="1" value={angleDeg} onChange={(e) => { setAngleDeg(+e.target.value); setValidated(false); setVerifyResult(null); setSlidePrediction(null); }} />
        </div>
        <div className="slider-wrap">
          <label className="slider-label" htmlFor="inc-mu">Static Friction (μₛ) <span className="value">{muStatic.toFixed(2)}</span></label>
          <input id="inc-mu" type="range" min="0.1" max="0.9" step="0.05" value={muStatic} onChange={(e) => { setMuStatic(+e.target.value); setValidated(false); setVerifyResult(null); setSlidePrediction(null); }} />
        </div>
        <div className="slider-wrap">
          <label className="slider-label" htmlFor="inc-mass">Mass (m) <span className="value">{mass} kg</span></label>
          <input id="inc-mass" type="range" min="1" max="20" step="1" value={mass} onChange={(e) => { setMass(+e.target.value); setValidated(false); setVerifyResult(null); setSlidePrediction(null); }} />
        </div>
      </div>

      <div className={styles.statusCard}>
        <div className={styles.statusRow}>
          <span>Weight (mg)</span><strong className="text-amber">{forces.weight.toFixed(1)} N</strong>
        </div>
        <div className={styles.statusRow}>
          <span>∥ Component</span><strong className="text-amber">{forces.weightParallel.toFixed(1)} N</strong>
        </div>
        <div className={styles.statusRow}>
          <span>⊥ Component</span><strong className="text-cyan">{forces.weightPerpendicular.toFixed(1)} N</strong>
        </div>
        <div className={styles.statusRow}>
          <span>Max Static Friction</span><strong className="text-green">{forces.frictionMax.toFixed(1)} N</strong>
        </div>
      </div>

      <div className={styles.slideQuestion}>
        <p className={styles.slideQuestionTitle}>Step 1. Will the block stay still or slide down?</p>
        <p className={styles.hint}>
          Compare two numbers from the card above: the pull down the slope (∥ component) and the most friction the surface can give.
          If the pull is bigger than the friction limit, friction cannot hold the block.
        </p>
        <div className={styles.slideChoices} role="radiogroup" aria-label="Predict whether the block slides">
          {([['stay', '✋ It stays still'], ['slide', '⚡ It slides down']] as const).map(([id, label]) => (
            <button
              key={id}
              className={`${styles.slideChoice} ${slidePrediction === id ? styles.slideChoiceActive : ''}`}
              onClick={() => setSlidePrediction(id)}
              role="radio"
              aria-checked={slidePrediction === id}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.fbdBuilder}>
        <p className={styles.hint}>
          🖱️ <strong>Step 2. Drag each force out from the block.</strong> Direction AND length both matter, so use the numbers above.
          Friction points up the slope. If you predicted it stays still, friction exactly cancels the pull down the slope (the ∥ component).
          If you predicted it slides, friction is the sliding kind, which is 75% of the maximum static friction here.
        </p>
        <InclineFBDPlacer angleDeg={angleDeg} forces={forces} vectors={vectors} onChange={handleVectorChange} />
        <button className="btn btn--secondary" onClick={handleResetVectors} disabled={!allVectorsPlaced && !verifyResult}>
          ↺ Reset Vectors
        </button>
      </div>

      {verifyResult && !verifyResult.isValid && (
        <div className={styles.fbdFeedback} role="alert">
          <p><strong>Score: {verifyResult.score}%</strong> — not quite right yet:</p>
          <ul>
            {verifyResult.errors.map((err, i) => <li key={i}>{err}</li>)}
          </ul>
          <p className={styles.fbdFeedbackHint}>Adjust the vectors above and verify again.</p>
        </div>
      )}

      <button className="btn btn--primary" onClick={handleValidate} disabled={!allVectorsPlaced || slidePrediction === null}>
        ⚡ Verify My Prediction and FBD
      </button>
      {slidePrediction === null && <p className={styles.hint}>First choose whether the block will stay still or slide (Step 1).</p>}
      {!allVectorsPlaced && <p className={styles.hint}>Place all three vectors (W, N, f) before verifying.</p>}
    </div>
  );

  const ObservePhase = (
    <div className={styles.observeWrap}>
      {slidePrediction && (
        <div className={styles.predictionFeedback}>
          <p>
            <strong>Your prediction: {slidePrediction === 'slide' ? 'it slides' : 'it stays still'}. </strong>
            <strong className={(slidePrediction === 'stay') === forces.isStationary ? 'text-green' : 'text-amber'}>
              {(slidePrediction === 'stay') === forces.isStationary ? '✓ Correct' : `✗ It actually ${forces.isStationary ? 'stays still' : 'slides'}`}
            </strong>
          </p>
          <p>
            {forces.isStationary
              ? `The pull down the slope is ${forces.weightParallel.toFixed(1)} N and the most friction available is ${forces.frictionMax.toFixed(1)} N. Friction can cancel the pull, so the block stays put.`
              : `The pull down the slope is ${forces.weightParallel.toFixed(1)} N but the most friction available is only ${forces.frictionMax.toFixed(1)} N. Friction cannot cancel the pull, so the block slides.`}
          </p>
        </div>
      )}
      <InclineCanvas angleDeg={angleDeg} forces={forces} validated={validated} />

      <div className={styles.legend}>
        <span className={styles.legendItem}><span className={styles.legendSwatch} style={{ background: VEC_COLOR.weight }} />W — Weight (mg), straight down</span>
        <span className={styles.legendItem}><span className={styles.legendSwatch} style={{ background: VEC_COLOR.normal }} />N — Normal force, perpendicular to the ramp</span>
        <span className={styles.legendItem}><span className={styles.legendSwatch} style={{ background: VEC_COLOR.friction }} />f — Friction, up the slope</span>
      </div>

      <FormulaPanel
        title="Incline Force Equations"
        formulas={[
          { label: 'Weight', latex: 'W = mg', liveValue: `= ${forces.weight.toFixed(1)} N`, accentColor: 'amber' },
          { label: 'Parallel', latex: 'W_\\parallel = mg\\sin\\theta', liveValue: `= ${forces.weightParallel.toFixed(1)} N`, accentColor: 'amber' },
          { label: 'Normal', latex: 'N = mg\\cos\\theta', liveValue: `= ${forces.normal.toFixed(1)} N`, accentColor: 'cyan' },
          { label: 'Friction', latex: 'f \\leq \\mu_s N', liveValue: `max = ${forces.frictionMax.toFixed(1)} N`, accentColor: 'green' },
        ]}
      />
    </div>
  );

  return (
    <div className={styles.module}>
      <div className={styles.moduleHeader}>
        <h2>⚖️ Free-Body Diagram on an Incline</h2>
        <p>Decompose forces on a block and explore static vs. kinetic friction.</p>
      </div>

      <div className={styles.conceptWrap}>
        <ConceptNotes
          title="Forces on an Incline"
          intro="Normal force, friction, and why gravity splits into two pieces on a slope."
          sections={INCLINE_CONCEPTS}
        />
        <ConceptNotes
          variant="challenge"
          title="Forces on an Incline"
          intro="See F = ma as a differential equation, and solve it by integrating."
          sections={INCLINE_CHALLENGE}
        />
      </div>

      <POEShell
        moduleId="incline"
        predictComponent={PredictPhase}
        observeComponent={ObservePhase}
        explainQuestions={INCLINE_EXPLAIN_QUESTIONS}
        onComplete={handleComplete}
        onTryAgain={handleTryAgain}
        predictHint="Compare two numbers on the card above: the ∥ component (the pull down the slope) and the Max Static Friction (the most grip the surface can offer). Whichever one is bigger wins. Then draw friction at the length that matches your prediction."
      />
    </div>
  );
}
