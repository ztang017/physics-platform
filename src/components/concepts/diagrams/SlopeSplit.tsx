import { useState } from 'react';
import styles from './diagrams.module.css';

const MASS = 5; // kg
const G = 9.8;
const WEIGHT_PX = 80;

/** The weight of a block on a slope, split into the part that pulls it down the slope
 *  and the part that presses it into the slope. The two parts add up (head to tail)
 *  to the weight arrow, which is what makes the split make sense. */
export function SlopeSplit() {
  const [deg, setDeg] = useState(30);
  const theta = (deg * Math.PI) / 180;
  const sin = Math.sin(theta);
  const cos = Math.cos(theta);
  const weight = MASS * G;

  // Slope drawn rising to the right
  const baseX = 24, baseY = 190, len = 260;
  const topX = baseX + len * cos, topY = baseY - len * sin;
  // Block sits 55% of the way up, its centre half a block-height above the surface
  const along = 0.55 * len;
  const surfX = baseX + along * cos, surfY = baseY - along * sin;
  const px = surfX - 16 * sin, py = surfY - 16 * cos;

  // Components in screen coordinates
  const down = { x: 0, y: WEIGHT_PX };
  const par = { x: -WEIGHT_PX * sin * cos, y: WEIGHT_PX * sin * sin };   // down the slope
  const perp = { x: WEIGHT_PX * sin * cos, y: WEIGHT_PX * cos * cos };   // into the slope

  const arrow = (dx: number, dy: number, color: string, dash = false) => {
    const len2 = Math.hypot(dx, dy);
    if (len2 < 2) return null;
    const ux = dx / len2, uy = dy / len2;
    const tx = px + dx, ty = py + dy;
    return (
      <g>
        <line x1={px} y1={py} x2={tx} y2={ty} stroke={color} strokeWidth="3.5" strokeLinecap="round" strokeDasharray={dash ? '7 4' : undefined} />
        <polygon points={`${tx},${ty} ${tx - ux * 10 - uy * 5},${ty - uy * 10 + ux * 5} ${tx - ux * 10 + uy * 5},${ty - uy * 10 - ux * 5}`} fill={color} />
      </g>
    );
  };

  const arcR = 26;
  return (
    <figure className={styles.figure}>
      <figcaption className={styles.title}>⛰️ Weight splits into two parts on a slope</figcaption>
      <svg
        className={styles.svg}
        viewBox="0 0 340 230"
        role="img"
        aria-label={`A block on a ${deg} degree slope. Its weight of ${weight.toFixed(0)} newtons splits into ${(weight * sin).toFixed(1)} newtons along the slope and ${(weight * cos).toFixed(1)} newtons into the slope.`}
      >
        <polygon points={`${baseX},${baseY} ${topX},${topY} ${topX},${baseY}`} fill="#eef1f7" stroke="#c7ccdb" strokeWidth="2" />
        <line x1={baseX} y1={baseY} x2={topX} y2={topY} stroke="#8890a3" strokeWidth="4" />
        <path d={`M ${baseX + 46},${baseY} A 46,46 0 0 0 ${baseX + 46 * cos},${baseY - 46 * sin}`} fill="none" stroke="#b45309" strokeWidth="2" />
        <text className={styles.svgText} x={baseX + 52} y={baseY - 6} fill="#b45309">{deg}°</text>

        {/* the block */}
        <g transform={`translate(${surfX} ${surfY}) rotate(${-deg})`}>
          <rect x="-18" y="-32" width="36" height="32" fill="rgba(79,70,229,0.15)" stroke="#4f46e5" strokeWidth="2" />
        </g>

        {/* the two parts, then the weight on top */}
        <line x1={px + par.x} y1={py + par.y} x2={px + down.x} y2={py + down.y} stroke="#9aa3b5" strokeWidth="1.5" strokeDasharray="3 3" />
        <line x1={px + perp.x} y1={py + perp.y} x2={px + down.x} y2={py + down.y} stroke="#9aa3b5" strokeWidth="1.5" strokeDasharray="3 3" />
        {arrow(perp.x, perp.y, '#4f46e5')}
        {arrow(par.x, par.y, '#15803d')}
        {arrow(down.x, down.y, '#dc2626')}

        {/* the same angle, repeated at the block */}
        <path d={`M ${px + arcR * sin},${py + arcR * cos} A ${arcR},${arcR} 0 0 1 ${px},${py + arcR}`} fill="none" stroke="#b45309" strokeWidth="2" />

        <text className={styles.svgText} x={px + 8} y={py + down.y + 16} fill="#dc2626">weight mg</text>
        <text className={styles.svgText} x={Math.max(100, px + par.x - 6)} y={py + par.y - 4} textAnchor="end" fill="#15803d">down the slope</text>
        <text className={styles.svgText} x={px + perp.x + 6} y={py + perp.y + 18} fill="#4f46e5">into the slope</text>
      </svg>

      <div className="slider-wrap">
        <label className="slider-label" htmlFor="slope-split-angle">
          Slope angle (θ) <span className="value">{deg}°</span>
        </label>
        <input id="slope-split-angle" type="range" min="0" max="85" step="1" value={deg} onChange={(e) => setDeg(+e.target.value)} />
      </div>

      <dl className={styles.readouts} aria-live="polite">
        <div className={styles.readout}>
          <dt>Weight of a {MASS} kg block</dt>
          <dd>{weight.toFixed(1)} N</dd>
        </div>
        <div className={styles.readout}>
          <dt>Down the slope: mg sin θ</dt>
          <dd>{(weight * sin).toFixed(1)} N</dd>
        </div>
        <div className={styles.readout}>
          <dt>Into the slope: mg cos θ</dt>
          <dd>{(weight * cos).toFixed(1)} N</dd>
        </div>
      </dl>
      <p className={styles.caption}>
        Steepen the slope: the "down the slope" part grows and the "into the slope" part shrinks. At 0° there is no pull along the slope at
        all. The small arc at the block shows the slope's angle appearing again, between the weight and the "into the slope" arrow.
      </p>
    </figure>
  );
}
