import { useState } from 'react';
import styles from './diagrams.module.css';

const SPEED = 20; // m/s
const PX = 7;     // pixels per m/s

/** One launch velocity split into a sideways part and an upward part. */
export function LaunchSplit() {
  const [deg, setDeg] = useState(40);
  const theta = (deg * Math.PI) / 180;
  const vx = SPEED * Math.cos(theta);
  const vy = SPEED * Math.sin(theta);

  const ox = 40, oy = 180;
  const tx = ox + vx * PX, ty = oy - vy * PX;
  const arcR = 38;

  return (
    <figure className={styles.figure}>
      <figcaption className={styles.title}>↗️ One launch, two separate motions</figcaption>
      <svg
        className={styles.svg}
        viewBox="0 0 340 210"
        role="img"
        aria-label={`A launch at 20 metres per second and ${deg} degrees. Its sideways part is ${vx.toFixed(1)} and its upward part is ${vy.toFixed(1)} metres per second.`}
      >
        <line x1="10" y1={oy} x2="330" y2={oy} stroke="#c7ccdb" strokeWidth="2" />
        {/* sideways part */}
        <line x1={ox} y1={oy + 1} x2={tx} y2={oy + 1} stroke="#15803d" strokeWidth="3" strokeDasharray="6 4" />
        {/* upward part */}
        <line x1={tx} y1={oy} x2={tx} y2={ty} stroke="#7c3aed" strokeWidth="3" strokeDasharray="6 4" />
        {/* the launch velocity itself */}
        <line x1={ox} y1={oy} x2={tx} y2={ty} stroke="#4f46e5" strokeWidth="4" strokeLinecap="round" />
        <circle cx={ox} cy={oy} r="5" fill="#4f46e5" />
        <circle cx={tx} cy={ty} r="5" fill="#4f46e5" />
        <path d={`M ${ox + arcR},${oy} A ${arcR},${arcR} 0 0 0 ${ox + arcR * Math.cos(theta)},${oy - arcR * Math.sin(theta)}`} fill="none" stroke="#b45309" strokeWidth="2" />
        <text className={styles.svgText} x={ox + arcR + 6} y={oy - 8} fill="#b45309">θ</text>
        <text className={styles.svgText} x={(ox + tx) / 2 - 20} y={oy + 24} fill="#15803d">sideways part v<tspan dy="3" fontSize="10">x</tspan></text>
        <text className={styles.svgText} x={Math.min(tx + 8, 250)} y={(oy + ty) / 2 + 4} fill="#7c3aed">upward part v<tspan dy="3" fontSize="10">y</tspan></text>
        <text className={styles.svgText} x={ox + 6} y={ty > 60 ? ty - 12 : 24} fill="#4f46e5">launch v₀ = 20 m/s</text>
      </svg>

      <div className="slider-wrap">
        <label className="slider-label" htmlFor="launch-angle">
          Launch angle (θ) <span className="value">{deg}°</span>
        </label>
        <input id="launch-angle" type="range" min="0" max="90" step="1" value={deg} onChange={(e) => setDeg(+e.target.value)} />
      </div>

      <dl className={styles.readouts} aria-live="polite">
        <div className={styles.readout}>
          <dt>Sideways part: vₓ = v₀ cos θ</dt>
          <dd>20 × {Math.cos(theta).toFixed(2)} = {vx.toFixed(1)} m/s</dd>
        </div>
        <div className={styles.readout}>
          <dt>Upward part: v_y = v₀ sin θ</dt>
          <dd>20 × {Math.sin(theta).toFixed(2)} = {vy.toFixed(1)} m/s</dd>
        </div>
      </dl>
      <p className={styles.caption}>
        At 0° everything goes sideways. At 90° everything goes up. In between the speed is shared, and the two parts always fit together
        like the sides of a right triangle.
      </p>
    </figure>
  );
}
