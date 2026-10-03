import { useState } from 'react';
import styles from './diagrams.module.css';

const HYP = 10; // the hypotenuse is always 10 units long, so every side reads straight off as a ratio
const PX = 15;  // pixels per unit

/** A right-angled triangle whose angle the student can change, with sin, cos and tan
 *  shown as the side ratios they really are. Meant to be the first thing a beginner
 *  sees before any formula uses sin θ or cos θ. */
export function TrigTriangle() {
  const [deg, setDeg] = useState(35);
  const theta = (deg * Math.PI) / 180;
  const opposite = HYP * Math.sin(theta);
  const adjacent = HYP * Math.cos(theta);

  const ax = 36, ay = 176;                     // the corner with the angle θ
  const bx = ax + adjacent * PX, by = ay;      // the right-angle corner
  const cx = bx, cy = ay - opposite * PX;      // the top corner
  const arcR = 34;

  return (
    <figure className={styles.figure}>
      <figcaption className={styles.title}>📐 Sine, cosine and tangent are just side ratios</figcaption>
      <svg
        className={styles.svg}
        viewBox="0 0 340 200"
        role="img"
        aria-label={`A right-angled triangle with a ${deg} degree angle. The hypotenuse is 10, the opposite side is ${opposite.toFixed(2)} and the adjacent side is ${adjacent.toFixed(2)}.`}
      >
        <polygon points={`${ax},${ay} ${bx},${by} ${cx},${cy}`} fill="rgba(79,70,229,0.08)" stroke="#4f46e5" strokeWidth="2.5" strokeLinejoin="round" />
        {/* right-angle marker */}
        <polyline points={`${bx - 12},${by} ${bx - 12},${by - 12} ${bx},${by - 12}`} fill="none" stroke="#4f46e5" strokeWidth="1.5" />
        {/* angle arc */}
        <path d={`M ${ax + arcR},${ay} A ${arcR},${arcR} 0 0 0 ${ax + arcR * Math.cos(theta)},${ay - arcR * Math.sin(theta)}`} fill="none" stroke="#b45309" strokeWidth="2" />
        <text className={styles.svgText} x={ax + arcR + 6} y={ay - 6} fill="#b45309">θ = {deg}°</text>
        <text className={styles.svgText} x={(ax + bx) / 2 - 38} y={ay + 18} fill="#15803d">adjacent = {adjacent.toFixed(1)}</text>
        <text className={styles.svgText} x={bx + 8} y={(by + cy) / 2 + 4} fill="#7c3aed">opposite = {opposite.toFixed(1)}</text>
        <text className={styles.svgText} x={(ax + cx) / 2 - 18} y={(ay + cy) / 2 - 10} fill="#4f46e5" transform={`rotate(${-deg} ${(ax + cx) / 2} ${(ay + cy) / 2})`} textAnchor="middle">hypotenuse = 10</text>
      </svg>

      <div className="slider-wrap">
        <label className="slider-label" htmlFor="trig-angle">
          Angle (θ) <span className="value">{deg}°</span>
        </label>
        <input id="trig-angle" type="range" min="5" max="85" step="1" value={deg} onChange={(e) => setDeg(+e.target.value)} />
      </div>

      <dl className={styles.readouts} aria-live="polite">
        <div className={styles.readout}>
          <dt>sin θ = opposite ÷ hypotenuse</dt>
          <dd>{opposite.toFixed(1)} ÷ 10 = {Math.sin(theta).toFixed(2)}</dd>
        </div>
        <div className={styles.readout}>
          <dt>cos θ = adjacent ÷ hypotenuse</dt>
          <dd>{adjacent.toFixed(1)} ÷ 10 = {Math.cos(theta).toFixed(2)}</dd>
        </div>
        <div className={styles.readout}>
          <dt>tan θ = opposite ÷ adjacent</dt>
          <dd>{opposite.toFixed(1)} ÷ {adjacent.toFixed(1)} = {Math.tan(theta).toFixed(2)}</dd>
        </div>
      </dl>
      <p className={styles.caption}>
        Drag the angle. As θ grows, the opposite side grows (so sin θ grows) and the adjacent side shrinks (so cos θ shrinks).
        Try 30°, 45° and 60°: you should see sin 30° = 0.50 and cos 60° = 0.50.
      </p>
    </figure>
  );
}
