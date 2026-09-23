import { useRef, useState } from 'react';
import type { ForceComponents } from '../../core/physics/incline';
import styles from './InclineFBDPlacer.module.css';

const W = 420, H = 300;
export const MAX_ARROW_LEN = 90; // px — the longest a placed vector can be dragged

export interface PlacedVector {
  id: 'weight' | 'normal' | 'friction';
  dx: number;
  dy: number; // SVG coords: +y is down
}

/** Converts a dragged (dx, dy) pixel offset into a real magnitude + angle,
 *  using the same scale the placer draws with, so what the student sees is
 *  exactly what gets validated. Angle is standard math convention (0° =
 *  positive x-axis, counterclockwise) — screen dy is inverted first. */
export function pixelVectorToForce(dx: number, dy: number, scale: number): { magnitude: number; angleDeg: number } {
  const magnitude = Math.sqrt(dx * dx + dy * dy) / scale;
  let angleDeg = (Math.atan2(-dy, dx) * 180) / Math.PI;
  if (angleDeg < 0) angleDeg += 360;
  return { magnitude, angleDeg };
}

const VECTOR_DEFS: { id: PlacedVector['id']; label: string; color: string; chipLabel: string }[] = [
  { id: 'weight', label: 'W', color: '#dc2626', chipLabel: 'Weight' },
  { id: 'normal', label: 'N', color: '#4f46e5', chipLabel: 'Normal' },
  { id: 'friction', label: 'f', color: '#16a34a', chipLabel: 'Friction' },
];

// Purely visual "resting" offsets for each handle before it's been dragged —
// without these, all three start stacked exactly on top of each other at
// the block's origin, and only the last one drawn is ever grabbable. The
// underlying vector value stays (0, 0) — not yet "placed" — until the
// student actually drags past NEST_RADIUS.
const NEST_RADIUS = 20;
const NEST_OFFSETS: Record<PlacedVector['id'], { dx: number; dy: number }> = {
  weight: { dx: 0, dy: NEST_RADIUS },
  normal: { dx: -NEST_RADIUS * 0.87, dy: -NEST_RADIUS * 0.5 },
  friction: { dx: NEST_RADIUS * 0.87, dy: -NEST_RADIUS * 0.5 },
};

const KEY_NUDGE = 4; // px per arrow-key press, for keyboard-only placement

/** A drag-and-place free-body-diagram builder: the student drags each of the
 *  three force vectors out from the block by hand (both direction AND length
 *  come from a single pointer drag), instead of the diagram simply appearing
 *  already-correct. Mirrors the geometry of the read-only canvas FBD shown
 *  later in Observe, so the "reveal" comparison lines up visually. */
export function InclineFBDPlacer({
  angleDeg,
  forces,
  vectors,
  onChange,
}: {
  angleDeg: number;
  forces: ForceComponents;
  vectors: Record<PlacedVector['id'], { dx: number; dy: number }>;
  onChange: (id: PlacedVector['id'], dx: number, dy: number) => void;
}) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [dragging, setDragging] = useState<PlacedVector['id'] | null>(null);

  const angle = (angleDeg * Math.PI) / 180;
  const baseX = 40, baseY = H - 40;
  const hyp = 280;
  const travelFrac = 0.48;
  const bx = baseX + hyp * travelFrac * Math.cos(angle);
  const by = baseY - hyp * travelFrac * Math.sin(angle);
  const originX = bx - Math.sin(angle) * 15;
  const originY = by - Math.cos(angle) * 15;

  const scale = MAX_ARROW_LEN / Math.max(forces.weight, 1);

  const toSvgPoint = (clientX: number, clientY: number) => {
    const svg = svgRef.current;
    if (!svg) return null;
    const rect = svg.getBoundingClientRect();
    // Guard against a zero-sized bounding rect (e.g. a pointer event landing
    // in the same frame the SVG is first laid out) — dividing by zero here
    // would silently poison the dragged vector's position with NaN forever.
    if (rect.width === 0 || rect.height === 0) return null;
    const x = ((clientX - rect.left) / rect.width) * W;
    const y = ((clientY - rect.top) / rect.height) * H;
    return { x, y };
  };

  const clampVector = (dx: number, dy: number) => {
    const len = Math.sqrt(dx * dx + dy * dy);
    if (len <= MAX_ARROW_LEN) return { dx, dy };
    const f = MAX_ARROW_LEN / len;
    return { dx: dx * f, dy: dy * f };
  };

  const handlePointerDown = (id: PlacedVector['id']) => (e: React.PointerEvent) => {
    e.preventDefault();
    (e.target as Element).setPointerCapture(e.pointerId);
    setDragging(id);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!dragging) return;
    const p = toSvgPoint(e.clientX, e.clientY);
    if (!p) return;
    const { dx, dy } = clampVector(p.x - originX, p.y - originY);
    if (!Number.isFinite(dx) || !Number.isFinite(dy)) return;
    onChange(dragging, dx, dy);
  };

  const handlePointerUp = () => setDragging(null);

  const handleKeyDown = (id: PlacedVector['id']) => (e: React.KeyboardEvent) => {
    const raw = vectors[id];
    // Nudge from the visible nested resting spot, not (0,0), so the first
    // arrow-key press continues smoothly from where the handle actually
    // appears instead of jumping there from the true origin.
    const v = raw.dx === 0 && raw.dy === 0 ? NEST_OFFSETS[id] : raw;
    const moves: Record<string, { dx: number; dy: number }> = {
      ArrowRight: { dx: v.dx + KEY_NUDGE, dy: v.dy },
      ArrowLeft: { dx: v.dx - KEY_NUDGE, dy: v.dy },
      ArrowUp: { dx: v.dx, dy: v.dy - KEY_NUDGE },
      ArrowDown: { dx: v.dx, dy: v.dy + KEY_NUDGE },
    };
    if (moves[e.key]) {
      e.preventDefault();
      const clamped = clampVector(moves[e.key].dx, moves[e.key].dy);
      onChange(id, clamped.dx, clamped.dy);
    }
  };

  const vectorReadout = (dx: number, dy: number) => {
    const len = Math.sqrt(dx * dx + dy * dy);
    if (len < 6) return null;
    return pixelVectorToForce(dx, dy, scale);
  };

  return (
    <div className={styles.wrap}>
      <svg
        ref={svgRef}
        viewBox={`0 0 ${W} ${H}`}
        className={styles.svg}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        role="img"
        aria-label="Drag the three force vectors onto the block to build the free-body diagram"
      >
        {/* Ramp */}
        <polygon
          points={`${baseX},${baseY} ${baseX + hyp * Math.cos(angle)},${baseY - hyp * Math.sin(angle)} ${baseX + hyp * Math.cos(angle)},${baseY}`}
          fill="#eef1f7"
          stroke="#c7ccdb"
          strokeWidth={2}
        />
        <line x1={baseX} y1={baseY} x2={baseX + hyp * Math.cos(angle)} y2={baseY - hyp * Math.sin(angle)} stroke="#8890a3" strokeWidth={3} />

        {/* Block */}
        <g transform={`translate(${bx},${by}) rotate(${-angleDeg})`}>
          <rect x={-16} y={-32} width={32} height={32} fill="rgba(79,70,229,0.12)" stroke="#4f46e5" strokeWidth={2} />
        </g>

        {/* Angle label */}
        <text x={baseX + 40} y={baseY - 8} fontSize={12} fontWeight="bold" fill="#b45309" fontFamily="JetBrains Mono, monospace">{angleDeg}°</text>

        {/* Placed vectors */}
        {VECTOR_DEFS.map(({ id, label, color }) => {
          const v = vectors[id];
          const tipX = originX + v.dx;
          const tipY = originY + v.dy;
          const readout = vectorReadout(v.dx, v.dy);
          const angleRad = Math.atan2(v.dy, v.dx);
          const headLen = 9;
          // Before it's dragged, show the handle at a small "nested" resting
          // spot so the three starting handles aren't stacked exactly on top
          // of each other (only the last one drawn would ever be grabbable).
          const handleX = readout ? tipX : originX + NEST_OFFSETS[id].dx;
          const handleY = readout ? tipY : originY + NEST_OFFSETS[id].dy;

          return (
            <g key={id}>
              {readout && (
                <>
                  <line x1={originX} y1={originY} x2={tipX} y2={tipY} stroke={color} strokeWidth={3} />
                  <polygon
                    points={`${tipX},${tipY} ${tipX - headLen * Math.cos(angleRad - 0.4)},${tipY - headLen * Math.sin(angleRad - 0.4)} ${tipX - headLen * Math.cos(angleRad + 0.4)},${tipY - headLen * Math.sin(angleRad + 0.4)}`}
                    fill={color}
                  />
                  <text x={tipX + 10} y={tipY - 10} fontSize={10} fontFamily="JetBrains Mono, monospace" fill={color} stroke="rgba(255,255,255,0.9)" strokeWidth={3} paintOrder="stroke">
                    {label}: {readout.magnitude.toFixed(0)}N @ {readout.angleDeg.toFixed(0)}°
                  </text>
                </>
              )}
              <circle
                cx={handleX}
                cy={handleY}
                r={9}
                fill={color}
                stroke="#fff"
                strokeWidth={2}
                className={styles.handle}
                tabIndex={0}
                role="slider"
                aria-label={`${label} vector — drag or use arrow keys to set direction and magnitude`}
                aria-valuenow={readout ? Math.round(readout.magnitude) : 0}
                onPointerDown={handlePointerDown(id)}
                onKeyDown={handleKeyDown(id)}
              />
            </g>
          );
        })}
      </svg>

      <div className={styles.tray}>
        {VECTOR_DEFS.map(({ id, color, chipLabel }) => {
          const placed = vectorReadout(vectors[id].dx, vectors[id].dy) !== null;
          return (
            <span key={id} className={styles.chip} data-placed={placed} style={{ '--chip-color': color } as React.CSSProperties}>
              <span className={styles.chipDot} />
              {chipLabel} {placed ? '✓' : '— drag from the block'}
            </span>
          );
        })}
      </div>
    </div>
  );
}
