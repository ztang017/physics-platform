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
    id: 'friction-doubles-mass',
    question: 'If you double the mass of the block (angle unchanged), what happens to the frictional force?',
    options: ['It stays the same', 'It doubles', 'It halves', 'It becomes zero'],
    correctIndex: 1,
    hint: 'Friction depends on the normal force N, and N itself depends on weight (mg·cosθ). If you double m, what happens to N first — and then to friction?',
    explanation: 'Friction = μN = μ·mg·cos(θ). Doubling m doubles N, which doubles friction. The coefficient μ does not change — it depends only on the surface materials.',
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
    id: 'normal-force-steep-limit',
    question: 'As the incline angle increases toward 90° (a vertical wall), what happens to the normal force?',
    options: ['It approaches the full weight, mg', 'It approaches zero', 'It stays exactly the same', 'It becomes negative'],
    correctIndex: 1,
    hint: 'N = mg·cos(θ). What does cos(θ) approach as θ approaches 90°?',
    explanation: 'N = mg·cos(θ), and cos(90°) = 0, so the normal force shrinks to zero as the surface becomes vertical — a block can\'t rest on a perfectly vertical wall with nothing else holding it there, which matches the formula perfectly.',
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

  useHiDPICanvas(canvasRef, W, H);

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
  }, [angleDeg, forces, validated, slideT]);

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
  };

  const handleComplete = (score: number) => {
    addXP(50 + score);
    unlockBadge('equilibrium-master');
    completeModule('incline');
  };

  const PredictPhase = (
    <div className={styles.predictWrap}>
      <div className={styles.sliders}>
        <div className="slider-wrap">
          <label className="slider-label" htmlFor="inc-angle">Incline Angle <span className="value">{angleDeg}°</span></label>
          <input id="inc-angle" type="range" min="5" max="75" step="1" value={angleDeg} onChange={(e) => { setAngleDeg(+e.target.value); setValidated(false); setVerifyResult(null); }} />
        </div>
        <div className="slider-wrap">
          <label className="slider-label" htmlFor="inc-mu">Static Friction (μₛ) <span className="value">{muStatic.toFixed(2)}</span></label>
          <input id="inc-mu" type="range" min="0.1" max="0.9" step="0.05" value={muStatic} onChange={(e) => { setMuStatic(+e.target.value); setValidated(false); setVerifyResult(null); }} />
        </div>
        <div className="slider-wrap">
          <label className="slider-label" htmlFor="inc-mass">Mass (m) <span className="value">{mass} kg</span></label>
          <input id="inc-mass" type="range" min="1" max="20" step="1" value={mass} onChange={(e) => { setMass(+e.target.value); setValidated(false); setVerifyResult(null); }} />
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
        <div className={`${styles.statusRow} ${styles.statusResult}`}>
          <span>Block will:</span>
          <strong className={forces.isStationary ? 'text-green' : 'text-amber'}>
            {forces.isStationary ? '✓ Stay still' : '⚡ Slide down!'}
          </strong>
        </div>
      </div>

      <div className={styles.fbdBuilder}>
        <p className={styles.hint}>
          🖱️ <strong>Drag each force out from the block</strong> — direction AND length both matter. Use the numbers above to work out what each vector should be, then place it.
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

      <button className="btn btn--primary" onClick={handleValidate} disabled={!allVectorsPlaced}>
        ⚡ Verify My FBD
      </button>
      {!allVectorsPlaced && <p className={styles.hint}>Place all three vectors (W, N, f) before verifying.</p>}
    </div>
  );

  const ObservePhase = (
    <div className={styles.observeWrap}>
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
        predictHint="Before reading the 'Block will...' readout below, try comparing the two numbers just above it yourself: the ∥ component (pulling the block down the slope) versus the Max Static Friction (the most grip the surface can offer). Whichever one is bigger wins."
      />
    </div>
  );
}
