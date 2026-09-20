import { useRef, useState, useEffect } from 'react';
import { type CollisionParams, solveCollision, interpolateCollision } from '../../core/physics/collision';
import { useHiDPICanvas } from '../../components/canvas/useHiDPICanvas';
import { POEShell } from '../../components/poe/POEShell';
import { FormulaPanel } from '../../components/ui/FormulaPanel';
import { useGameStore } from '../../core/store/gameStore';
import { useSessionStore, type ExplainQuestion } from '../../core/store/sessionStore';
import { ConceptNotes } from '../../components/concepts/ConceptNotes';
import { COLLISION_CONCEPTS } from './collisionConcepts';
import styles from './CollisionModule.module.css';

const EXPLAIN_QUESTIONS: ExplainQuestion[] = [
  {
    id: 'momentum-conserved',
    question: 'After the collision, total momentum is:',
    options: ['Less than before (some is lost)', 'Greater than before', 'The same as before', 'Always zero'],
    correctIndex: 2,
    hint: 'This holds for EVERY collision in a closed system, no matter how bouncy or how mismatched the masses are — what\'s the one quantity in this chapter that\'s always conserved, without exception?',
    explanation: 'Momentum is always conserved in a closed system. This is Newton\'s Third Law in action — the impulse cart 1 exerts on cart 2 is equal and opposite to what cart 2 exerts on cart 1.',
  },
  {
    id: 'elastic-vs-inelastic',
    question: 'In a perfectly inelastic collision (e = 0), what is special about the carts afterward?',
    options: ['They bounce apart at equal speeds', 'They stick together and move as one', 'All kinetic energy is converted to momentum', 'Momentum is lost'],
    correctIndex: 1,
    hint: 'e = 0 means the "separation speed" after impact is zero — the two objects aren\'t moving apart from each other at all afterward. What does zero relative velocity between two touching objects actually look like?',
    explanation: 'In a perfectly inelastic collision, the coefficient of restitution e = 0. The relative velocity after impact is zero, so the objects stick together. Maximum kinetic energy is lost (converted to heat/sound).',
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
];

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

  useHiDPICanvas(canvasRef, TRACK_W, TRACK_H);

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
    ctx.font = 'bold 10px JetBrains Mono';
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
      drawArrow(ctx, c1x, trackY - cartH - 18, c1x + dir * len, trackY - cartH - 18, '#4f46e5', `p=${(params.m1 * state.v1).toFixed(0)}`);
    }
    if (Math.abs(state.v2) > 0.1) {
      const dir = state.v2 > 0 ? 1 : -1;
      const len = Math.min(Math.abs(state.v2) * arrowScale * params.m2 / 5, 80);
      drawArrow(ctx, c2x, trackY - cartH - 18, c2x + dir * len, trackY - cartH - 18, '#7c3aed', `p=${(params.m2 * state.v2).toFixed(0)}`);
    }

    // Phase label
    ctx.fillStyle = 'rgba(23,27,38,0.55)';
    ctx.font = 'bold 11px JetBrains Mono';
    ctx.textAlign = 'left';
    const phaseMap: Record<string, string> = { approach: '→ Approaching...', collision: '💥 COLLISION!', separation: '← Separating...' };
    ctx.fillText(phaseMap[state.phase] ?? '', 8, 20);
  }, [params, tNorm, result]);

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
  ctx.font = '9px JetBrains Mono'; ctx.textAlign = 'center';
  ctx.fillText(label, (x1 + x2) / 2, y1 - 5);
}

export function CollisionModule() {
  const { addXP, unlockBadge, completeModule } = useGameStore();
  const { setPOEPhase } = useSessionStore();
  const [m1, setM1] = useState(3); const [v1, setV1] = useState(5);
  const [m2, setM2] = useState(1); const [v2] = useState(0);
  const [e, setE] = useState(1);
  const [tNorm, setTNorm] = useState(0);
  const [predicted, setPredicted] = useState<string | null>(null);
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

  const params: CollisionParams = { m1, v1, m2, v2, e };
  const result = solveCollision(params);

  const handleComplete = (score: number) => {
    addXP(50 + score);
    if (result.isEnergyConserved) unlockBadge('conservationist');
    unlockBadge('momentum-guardian');
    completeModule('collision');
  };

  const PredictPhase = (
    <div className={styles.predictWrap}>
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
            Restitution (e)
            <span className="value">{e === 0 ? 'Perfectly Inelastic' : e === 1 ? 'Perfectly Elastic' : e.toFixed(2)}</span>
          </label>
          <input id="col-e" type="range" min="0" max="1" step="0.05" value={e} onChange={(e) => setE(+e.target.value)} />
        </div>
      </div>

      <div className={styles.questionCard}>
        <p className={styles.questionText}>Cart 1 ({m1}kg at {v1}m/s) hits Cart 2 ({m2}kg at {v2}m/s). Which cart will move faster after the collision?</p>
        <div className={styles.predOptions}>
          {['Cart 1 (indigo)', 'Cart 2 (violet)', 'They move at the same speed', 'Both stop'].map((opt, i) => (
            <button
              key={i}
              className={`${styles.predBtn} ${predicted === opt ? styles.predBtnActive : ''}`}
              onClick={() => { setPredicted(opt); addXP(10); }}
            >
              {opt}
            </button>
          ))}
        </div>
        {predicted && (
          <button className="btn btn--primary" onClick={() => { addXP(10); setPOEPhase('observe'); }}>🔮 Lock In Prediction</button>
        )}
      </div>
    </div>
  );

  const ObservePhase = (
    <div className={styles.observeWrap}>
      <CollisionCanvas params={params} tNorm={tNorm} result={result} />

      <div className={styles.scrubberWrap}>
        <div className={styles.playRow}>
          <button
            className={`btn ${playing ? 'btn--secondary' : 'btn--primary'}`}
            onClick={() => {
              if (playing) { cancelAnimationFrame(animRef.current); setPlaying(false); }
              else { playAnimation(); }
            }}
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
          aria-label="Scrub through collision timeline"
        />
        <div className={styles.scrubMarkers}>
          <span>Start</span><span>Impact</span><span>After</span>
        </div>
      </div>

      <div className={styles.readoutsGrid}>
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
      </div>

      <POEShell
        moduleId="collision"
        predictComponent={PredictPhase}
        observeComponent={ObservePhase}
        explainQuestions={EXPLAIN_QUESTIONS}
        onComplete={handleComplete}
      />
    </div>
  );
}
