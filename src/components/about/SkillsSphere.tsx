import { useEffect, useRef } from "react";

// Esfera 3D de tecnologias, em canvas 2D com projeção em perspectiva.
// Os pontos ficam distribuídos numa espiral de Fibonacci (espaçamento uniforme).
// Gira sozinha; arrastar com mouse/dedo controla a rotação.

type Props = { items: string[]; highlight?: Set<string>; label: string; reducedMotion?: boolean };

const FONT = (size: number, weight: number) =>
  `${weight} ${size}px "JetBrains Mono Variable", "JetBrains Mono", ui-monospace, monospace`;

export function SkillsSphere({ items, highlight, label, reducedMotion = false }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const n = items.length;
    const golden = Math.PI * (3 - Math.sqrt(5));
    const points = items.map((text, i) => {
      const y = 1 - (i / Math.max(1, n - 1)) * 2;
      const r = Math.sqrt(1 - y * y);
      const theta = golden * i;
      return { text, x: Math.cos(theta) * r, y, z: Math.sin(theta) * r, hot: highlight?.has(text) ?? false };
    });

    let size = 0;
    let rotX = -0.25;
    let rotY = 0;
    let velX = 0;
    let velY = reducedMotion ? 0 : 0.0032;
    let raf = 0;
    let running = false;
    const drag = { active: false, x: 0, y: 0 };

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      size = rect.width;
      canvas.width = Math.round(rect.width * dpr);
      canvas.height = Math.round(rect.height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      draw();
    };

    const draw = () => {
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      ctx.clearRect(0, 0, w, h);
      const radius = Math.min(w, h) * 0.38;
      const cx = w / 2;
      const cy = h / 2;
      const cosY = Math.cos(rotY);
      const sinY = Math.sin(rotY);
      const cosX = Math.cos(rotX);
      const sinX = Math.sin(rotX);

      // anel do "equador" e meridiano, para dar volume
      ctx.strokeStyle = "rgba(233, 237, 231, 0.07)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.ellipse(cx, cy, radius, radius * Math.abs(sinX) + 0.001, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.stroke();

      const projected = points.map((p) => {
        const x1 = p.x * cosY - p.z * sinY;
        const z1 = p.x * sinY + p.z * cosY;
        const y1 = p.y * cosX - z1 * sinX;
        const z2 = p.y * sinX + z1 * cosX;
        const perspective = 2.6 / (2.6 - z2);
        return { ...p, px: cx + x1 * radius * perspective, py: cy + y1 * radius * perspective, depth: z2, perspective };
      });
      projected.sort((a, b) => a.depth - b.depth);

      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      for (const p of projected) {
        const t = (p.depth + 1) / 2; // 0 = fundo, 1 = frente
        const fontSize = Math.max(9, (size < 420 ? 10.5 : 12.5) * p.perspective);
        ctx.font = FONT(fontSize, p.hot ? 700 : 500);
        const alpha = 0.18 + t * 0.82;
        if (p.hot && t > 0.55) {
          const width = ctx.measureText(p.text).width + 12;
          ctx.strokeStyle = `rgba(200, 255, 61, ${alpha * 0.8})`;
          ctx.lineWidth = 1;
          ctx.strokeRect(p.px - width / 2, p.py - fontSize * 0.85, width, fontSize * 1.7);
        }
        ctx.fillStyle = p.hot ? `rgba(200, 255, 61, ${alpha})` : `rgba(233, 237, 231, ${alpha * 0.9})`;
        ctx.fillText(p.text, p.px, p.py);
      }
    };

    const loop = () => {
      if (!drag.active) {
        rotY += velY;
        rotX += velX;
        velX *= 0.95;
        // volta devagar para a rotação automática
        velY += ((reducedMotion ? 0 : 0.0032) - velY) * 0.02;
      }
      rotX = Math.max(-1.1, Math.min(1.1, rotX));
      draw();
      raf = requestAnimationFrame(loop);
    };

    const start = () => {
      if (running) return;
      running = true;
      raf = requestAnimationFrame(loop);
    };
    const stop = () => {
      running = false;
      cancelAnimationFrame(raf);
    };

    const onDown = (event: PointerEvent) => {
      drag.active = true;
      drag.x = event.clientX;
      drag.y = event.clientY;
      canvas.setPointerCapture(event.pointerId);
      start();
    };
    const onMove = (event: PointerEvent) => {
      if (!drag.active) return;
      const dx = event.clientX - drag.x;
      const dy = event.clientY - drag.y;
      drag.x = event.clientX;
      drag.y = event.clientY;
      rotY += dx * 0.008;
      rotX += dy * 0.008;
      velY = dx * 0.0008;
      velX = dy * 0.0008;
      if (reducedMotion) draw();
    };
    const onUp = () => {
      drag.active = false;
      if (reducedMotion) stop();
    };

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(canvas);
    const intersection = new IntersectionObserver(([entry]) => {
      if (entry?.isIntersecting && !reducedMotion) start();
      else stop();
    });
    intersection.observe(canvas);
    canvas.addEventListener("pointerdown", onDown);
    canvas.addEventListener("pointermove", onMove);
    canvas.addEventListener("pointerup", onUp);
    canvas.addEventListener("pointercancel", onUp);

    resize();
    return () => {
      stop();
      resizeObserver.disconnect();
      intersection.disconnect();
      canvas.removeEventListener("pointerdown", onDown);
      canvas.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("pointerup", onUp);
      canvas.removeEventListener("pointercancel", onUp);
    };
  }, [items, highlight, reducedMotion]);

  return (
    <canvas
      ref={canvasRef}
      role="img"
      aria-label={label}
      style={{ width: "100%", aspectRatio: "1", cursor: "grab", touchAction: "pan-y" }}
    />
  );
}
