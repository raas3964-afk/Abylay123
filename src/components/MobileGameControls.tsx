import { useRef, useState } from 'react';
import './MobileGameControls.css';
import './MobileRun.css';
import './AnalogJoystick.css';

function pressKey(code: string) {
  window.dispatchEvent(new CustomEvent('swish-control', { detail: { code, pressed: true } }));
}

function releaseKey(code: string) {
  window.dispatchEvent(new CustomEvent('swish-control', { detail: { code, pressed: false } }));
}

type HoldButtonProps = { code: string; label: string; className?: string };

function HoldButton({ code, label, className = '' }: HoldButtonProps) {
  return (
    <button
      className={className}
      onPointerDown={(event) => { event.preventDefault(); event.currentTarget.setPointerCapture(event.pointerId); pressKey(code); }}
      onPointerUp={() => releaseKey(code)}
      onPointerCancel={() => releaseKey(code)}
      onContextMenu={(event) => event.preventDefault()}
    >{label}</button>
  );
}

export function MobileGameControls() {
  const stickRef = useRef<HTMLDivElement>(null);
  const activeDirections = useRef(new Set<string>());
  const [knob, setKnob] = useState({ x: 0, y: 0 });

  const updateDirections = (next: Set<string>) => {
    activeDirections.current.forEach((code) => { if (!next.has(code)) releaseKey(code); });
    next.forEach((code) => { if (!activeDirections.current.has(code)) pressKey(code); });
    activeDirections.current = next;
  };

  const moveJoystick = (clientX: number, clientY: number) => {
    const rect = stickRef.current?.getBoundingClientRect();
    if (!rect) return;
    const maxDistance = rect.width * .29;
    const rawX = clientX - (rect.left + rect.width / 2);
    const rawY = clientY - (rect.top + rect.height / 2);
    const distance = Math.hypot(rawX, rawY) || 1;
    const scale = Math.min(1, maxDistance / distance);
    const x = rawX * scale;
    const y = rawY * scale;
    setKnob({ x, y });
    const threshold = maxDistance * .24;
    const next = new Set<string>();
    if (x < -threshold) next.add('KeyA');
    if (x > threshold) next.add('KeyD');
    if (y < -threshold) next.add('KeyW');
    if (y > threshold) next.add('KeyS');
    updateDirections(next);
  };

  const stopJoystick = () => {
    updateDirections(new Set());
    setKnob({ x: 0, y: 0 });
  };

  return (
    <div className="mobile-game-controls" aria-label="Мобильное управление">
      <div
        className="mobile-stick analog-stick"
        ref={stickRef}
        onPointerDown={(event) => { event.preventDefault(); event.currentTarget.setPointerCapture(event.pointerId); moveJoystick(event.clientX, event.clientY); }}
        onPointerMove={(event) => { if (event.currentTarget.hasPointerCapture(event.pointerId)) moveJoystick(event.clientX, event.clientY); }}
        onPointerUp={stopJoystick}
        onPointerCancel={stopJoystick}
      >
        <span className="stick-ring" />
        <i className="stick-knob" style={{ transform: `translate(${knob.x}px, ${knob.y}px)` }} />
      </div>
      <div className="mobile-actions">
        <HoldButton code="ControlLeft" label="БЕГ" className="mobile-run" />
        <HoldButton code="ShiftLeft" label="ФИНТ" className="mobile-faint" />
        <HoldButton code="KeyE" label="ПАС" className="mobile-pass" />
        <HoldButton code="Space" label="ДАНК" className="mobile-dunk" />
        <button
          className="mobile-shoot"
          onPointerDown={(event) => { event.preventDefault(); event.currentTarget.setPointerCapture(event.pointerId); window.dispatchEvent(new Event('swish-shot-start')); }}
          onPointerUp={() => window.dispatchEvent(new Event('swish-shot-end'))}
          onPointerCancel={() => window.dispatchEvent(new Event('swish-shot-end'))}
        >БРОСОК</button>
        <HoldButton code="Tab" label="↻" className="mobile-switch" />
      </div>
    </div>
  );
}
