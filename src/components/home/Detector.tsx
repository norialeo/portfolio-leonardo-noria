import { useEffect, useRef } from "react";

// Detector "estilo YOLO" desenhado em canvas 2D.
//
// Cada skill vira um objeto rastreado: caixa com cantos, rótulo com classe e
// confiança, ID de track e rastro. O cursor do visitante também é detectado
// (caixa âmbar) e os objetos desviam dele. De tempos em tempos um track é
// "perdido" e reaparece com outro ID, como num rastreador de verdade.
//
// Nada de biblioteca: é tudo matemática simples + requestAnimationFrame,
// pausado quando o canvas sai da tela ou a aba fica em segundo plano.

export type DetectorStats = { fps: number; tracks: number };

type Props = {
  labels: string[];
  visitorLabel: string;
  lostLabel: string;
  onStats?: (stats: DetectorStats) => void;
  reducedMotion?: boolean;
};

type Track = {
  id: number;
  label: string;
  conf: number;
  shownConf: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  w: number;
  h: number;
  seed: number;
  jitter: [number, number, number, number];
  trail: { x: number; y: number }[];
  bornAt: number;
  lostAt: number | null;
};

type Keypoint = { x: number; y: number; life: number; ttl: number };

const LIME = "200, 255, 61";
const AMBER = "255, 178, 36";
const RED = "255, 77, 61";
const BONE = "233, 237, 231";
const FONT = '500 11px "JetBrains Mono Variable", "JetBrains Mono", ui-monospace, monospace';

const rand = (min: number, max: number) => min + Math.random() * (max - min);
const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

export function Detector({ labels, visitorLabel, lostLabel, onStats, reducedMotion = false }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const statsRef = useRef(onStats);
  useEffect(() => {
    statsRef.current = onStats;
  }, [onStats]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    let width = 0;
    let height = 0;
    let scale = 1;
    let nextId = 1;
    let labelCursor = 0;
    let tracks: Track[] = [];
    let keypoints: Keypoint[] = [];
    let raf = 0;
    let running = false;
    let visible = true;
    let last = performance.now();
    let frames = 0;
    let fpsClock = last;
    let nextLoss = last + rand(5000, 9000);

    const pointer = { x: 0, y: 0, sx: 0, sy: 0, active: false, seen: 0 };
    const visitorId = Math.floor(rand(10, 99));

    const nextLabel = () => {
      const label = labels[labelCursor % labels.length] ?? "object";
      labelCursor += 1;
      return label;
    };

    const spawn = (now: number, delay = 0): Track => {
      const w = rand(64, 150) * scale;
      const h = w * rand(0.55, 1.2);
      const margin = 16;
      return {
        id: nextId++,
        label: nextLabel(),
        conf: rand(0.84, 0.99),
        shownConf: 0,
        x: rand(w / 2 + margin, Math.max(w / 2 + margin + 1, width - w / 2 - margin)),
        y: rand(h / 2 + margin + 40, Math.max(h / 2 + margin + 41, floor() - h / 2 - margin)),
        vx: rand(-1, 1) * 0.03,
        vy: rand(-1, 1) * 0.03,
        w,
        h,
        seed: Math.random() * 1000,
        jitter: [0, 0, 0, 0],
        trail: [],
        bornAt: now + delay,
        lostAt: null,
      };
    };

    // limite inferior da área dos objetos: no celular ficam acima do texto
    const floor = () => (width < 640 ? height * 0.46 : height * 0.82);

    const targetCount = () => (width < 640 ? 6 : width < 1100 ? 9 : 12);

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const prevW = width;
      const prevH = height;
      width = Math.max(1, rect.width);
      height = Math.max(1, rect.height);
      // mantém as posições proporcionais quando a tela muda de tamanho
      if (prevW > 0 && prevH > 0) {
        for (const t of tracks) {
          t.x *= width / prevW;
          t.y *= height / prevH;
          t.trail = [];
        }
      }
      scale = width < 640 ? 0.72 : 1;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const now = performance.now();
      for (const t of tracks) {
        t.x = clamp(t.x, t.w / 2, width - t.w / 2);
        t.y = clamp(t.y, t.h / 2, height - t.h / 2);
      }
      while (tracks.length < targetCount()) tracks.push(spawn(now, tracks.length * 140));
      if (tracks.length > targetCount()) tracks = tracks.slice(0, targetCount());
      if (reducedMotion) draw(now, 0);
    };

    /* ------------------------------ simulação ------------------------------ */

    const step = (now: number, dt: number) => {
      // suaviza o cursor (o "detector" nunca é perfeito)
      pointer.sx += (pointer.x - pointer.sx) * Math.min(1, dt * 0.012);
      pointer.sy += (pointer.y - pointer.sy) * Math.min(1, dt * 0.012);

      for (const t of tracks) {
        if (now < t.bornAt) continue;
        const ax = Math.cos(now * 0.00031 + t.seed) * 0.00004;
        const ay = Math.sin(now * 0.00027 + t.seed * 1.7) * 0.00004;
        t.vx += ax * dt;
        t.vy += ay * dt;

        if (pointer.active) {
          const dx = t.x - pointer.sx;
          const dy = t.y - pointer.sy;
          const dist = Math.hypot(dx, dy) || 1;
          const radius = 240 * scale;
          if (dist < radius) {
            const force = (1 - dist / radius) * 0.00018 * dt;
            t.vx += (dx / dist) * force;
            t.vy += (dy / dist) * force;
          }
        }

        const speed = Math.hypot(t.vx, t.vy);
        const max = 0.05;
        if (speed > max) {
          t.vx = (t.vx / speed) * max;
          t.vy = (t.vy / speed) * max;
        }
        t.vx *= 0.999;
        t.vy *= 0.999;

        t.x += t.vx * dt;
        t.y += t.vy * dt;

        const hw = t.w / 2;
        const hh = t.h / 2;
        // quica nas bordas (o topo deixa espaço para o HUD)
        if (t.x < hw) {
          t.x = hw;
          t.vx = Math.abs(t.vx);
        } else if (t.x > width - hw) {
          t.x = width - hw;
          t.vx = -Math.abs(t.vx);
        }
        if (t.y < hh + 40) {
          t.y = hh + 40;
          t.vy = Math.abs(t.vy);
        } else if (t.y > floor() - hh) {
          t.y = floor() - hh;
          t.vy = -Math.abs(t.vy);
        }

        // ruído do detector: bordas e confiança mudam um pouco
        if (Math.random() < dt / 110) t.jitter = [rand(-2, 2), rand(-2, 2), rand(-2, 2), rand(-2, 2)];
        if (Math.random() < dt / 350) t.shownConf = clamp(t.conf + rand(-0.03, 0.02), 0.5, 0.99);

        const lastPoint = t.trail[t.trail.length - 1];
        if (!lastPoint || Math.hypot(lastPoint.x - t.x, lastPoint.y - t.y) > 6) {
          t.trail.push({ x: t.x, y: t.y });
          if (t.trail.length > 28) t.trail.shift();
        }
      }

      // track perdido → some e volta com outro ID
      if (now > nextLoss && tracks.length) {
        const candidate = tracks[Math.floor(Math.random() * tracks.length)];
        if (candidate && candidate.lostAt === null && now > candidate.bornAt + 2000) candidate.lostAt = now;
        nextLoss = now + rand(5000, 10000);
      }
      tracks = tracks.map((t) => (t.lostAt !== null && now - t.lostAt > 900 ? spawn(now, 400) : t));

      // pontos de interesse (keypoints) piscando no fundo
      if (keypoints.length < (width < 640 ? 18 : 42) && Math.random() < dt / 60) {
        keypoints.push({ x: rand(0, width), y: rand(0, height), life: 0, ttl: rand(1200, 3200) });
      }
      for (const k of keypoints) k.life += dt;
      keypoints = keypoints.filter((k) => k.life < k.ttl);
    };

    /* ------------------------------- desenho ------------------------------- */

    const corners = (x: number, y: number, w: number, h: number, len: number) => {
      ctx.beginPath();
      ctx.moveTo(x, y + len);
      ctx.lineTo(x, y);
      ctx.lineTo(x + len, y);
      ctx.moveTo(x + w - len, y);
      ctx.lineTo(x + w, y);
      ctx.lineTo(x + w, y + len);
      ctx.moveTo(x + w, y + h - len);
      ctx.lineTo(x + w, y + h);
      ctx.lineTo(x + w - len, y + h);
      ctx.moveTo(x + len, y + h);
      ctx.lineTo(x, y + h);
      ctx.lineTo(x, y + h - len);
      ctx.stroke();
    };

    const tag = (text: string, x: number, y: number, color: string, alpha: number) => {
      ctx.font = FONT;
      const w = ctx.measureText(text).width + 10;
      const top = y - 17 < 0 ? y + 1 : y - 17;
      ctx.fillStyle = `rgba(${color}, ${0.92 * alpha})`;
      ctx.fillRect(x - 1, top, w, 17);
      ctx.fillStyle = `rgba(10, 12, 11, ${alpha})`;
      ctx.fillText(text, x + 4, top + 12.5);
    };

    const draw = (now: number, dt: number) => {
      ctx.clearRect(0, 0, width, height);
      ctx.lineCap = "square";
      ctx.textBaseline = "alphabetic";

      for (const k of keypoints) {
        const p = k.life / k.ttl;
        const a = Math.sin(p * Math.PI) * 0.35;
        ctx.strokeStyle = `rgba(${BONE}, ${a})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(k.x - 3, k.y);
        ctx.lineTo(k.x + 3, k.y);
        ctx.moveTo(k.x, k.y - 3);
        ctx.lineTo(k.x, k.y + 3);
        ctx.stroke();
      }

      let nearest: Track | null = null;
      let nearestDist = Infinity;

      for (const t of tracks) {
        const age = now - t.bornAt;
        if (age < 0) continue;
        const fadeIn = reducedMotion ? 1 : clamp(age / 500, 0, 1);
        const lostFor = t.lostAt === null ? 0 : now - t.lostAt;
        const alpha = fadeIn * (t.lostAt === null ? 1 : clamp(1 - lostFor / 900, 0, 1));
        const color = t.lostAt === null ? LIME : RED;

        const breathe = 1 + Math.sin(now * 0.0016 + t.seed) * (reducedMotion ? 0 : 0.035);
        const w = t.w * breathe;
        const h = t.h * breathe;
        const x = t.x - w / 2 + t.jitter[0];
        const y = t.y - h / 2 + t.jitter[1];
        const bw = w + t.jitter[2] - t.jitter[0];
        const bh = h + t.jitter[3] - t.jitter[1];

        // rastro
        if (t.trail.length > 1) {
          ctx.lineWidth = 1;
          for (let i = 1; i < t.trail.length; i++) {
            const a = t.trail[i - 1]!;
            const b = t.trail[i]!;
            ctx.strokeStyle = `rgba(${color}, ${(i / t.trail.length) * 0.35 * alpha})`;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }

        ctx.strokeStyle = `rgba(${color}, ${0.22 * alpha})`;
        ctx.lineWidth = 1;
        ctx.strokeRect(x, y, bw, bh);

        ctx.strokeStyle = `rgba(${color}, ${alpha})`;
        ctx.lineWidth = 2;
        corners(x, y, bw, bh, Math.min(14, bw * 0.22));

        const conf = (t.shownConf || t.conf).toFixed(2);
        tag(t.lostAt === null ? `${t.label} ${conf}` : lostLabel, x, y, color, alpha);

        ctx.font = FONT;
        ctx.fillStyle = `rgba(${color}, ${0.7 * alpha})`;
        const idText = `#${String(t.id).padStart(3, "0")}`;
        ctx.fillText(idText, x + bw - ctx.measureText(idText).width - 4, y + bh - 6);

        if (pointer.active && t.lostAt === null) {
          const dist = Math.hypot(t.x - pointer.sx, t.y - pointer.sy);
          if (dist < nearestDist) {
            nearest = t;
            nearestDist = dist;
          }
        }
      }

      // visitante (cursor)
      if (pointer.active) {
        const appear = clamp((now - pointer.seen) / 300, 0, 1);
        const w = 104 * scale;
        const h = 132 * scale;
        const x = pointer.sx - w / 2;
        const y = pointer.sy - h / 2;

        if (nearest && nearestDist < 420 * scale) {
          ctx.setLineDash([4, 6]);
          ctx.strokeStyle = `rgba(${AMBER}, ${0.55 * appear})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(pointer.sx, pointer.sy);
          ctx.lineTo(nearest.x, nearest.y);
          ctx.stroke();
          ctx.setLineDash([]);
          ctx.font = FONT;
          ctx.fillStyle = `rgba(${AMBER}, ${0.9 * appear})`;
          ctx.fillText(
            `Δ ${Math.round(nearestDist)}px`,
            (pointer.sx + nearest.x) / 2 + 6,
            (pointer.sy + nearest.y) / 2 - 6,
          );
        }

        ctx.strokeStyle = `rgba(${AMBER}, ${0.25 * appear})`;
        ctx.lineWidth = 1;
        ctx.strokeRect(x, y, w, h);
        ctx.strokeStyle = `rgba(${AMBER}, ${appear})`;
        ctx.lineWidth = 2;
        corners(x, y, w, h, 14);
        tag(`${visitorLabel} 0.99`, x, y, AMBER, appear);
        ctx.fillStyle = `rgba(${AMBER}, ${0.75 * appear})`;
        ctx.font = FONT;
        ctx.fillText(`#${visitorId}`, x + w - 26, y + h - 6);
      }

      // estatísticas para o HUD (2x por segundo)
      frames += 1;
      if (now - fpsClock > 500) {
        const fps = dt === 0 ? 0 : Math.round((frames * 1000) / (now - fpsClock));
        statsRef.current?.({ fps, tracks: tracks.filter((t) => t.lostAt === null).length + (pointer.active ? 1 : 0) });
        frames = 0;
        fpsClock = now;
      }
    };

    const loop = (now: number) => {
      const dt = Math.min(50, now - last);
      last = now;
      step(now, dt);
      draw(now, dt);
      raf = requestAnimationFrame(loop);
    };

    const start = () => {
      if (running || reducedMotion || !visible || document.hidden) return;
      running = true;
      last = performance.now();
      raf = requestAnimationFrame(loop);
    };
    const stop = () => {
      running = false;
      cancelAnimationFrame(raf);
    };

    /* ------------------------------- eventos ------------------------------- */

    const toLocal = (event: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      return { x: event.clientX - rect.left, y: event.clientY - rect.top, inside: event.clientY >= rect.top && event.clientY <= rect.bottom };
    };
    const onMove = (event: PointerEvent) => {
      const { x, y, inside } = toLocal(event);
      if (!inside) {
        pointer.active = false;
        return;
      }
      if (!pointer.active) {
        pointer.sx = x;
        pointer.sy = y;
        pointer.seen = performance.now();
      }
      pointer.x = x;
      pointer.y = y;
      pointer.active = true;
    };
    const onLeave = () => {
      pointer.active = false;
    };
    const onVisibility = () => (document.hidden ? stop() : start());

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(canvas);
    const intersection = new IntersectionObserver(([entry]) => {
      visible = Boolean(entry?.isIntersecting);
      if (visible) start();
      else stop();
    });
    intersection.observe(canvas);

    window.addEventListener("pointermove", onMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);
    document.addEventListener("visibilitychange", onVisibility);

    resize();
    if (reducedMotion) {
      const now = performance.now();
      for (const t of tracks) t.bornAt = now - 1000;
      draw(now, 0);
    } else {
      start();
    }

    return () => {
      stop();
      resizeObserver.disconnect();
      intersection.disconnect();
      window.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", onLeave);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [labels, visitorLabel, lostLabel, reducedMotion]);

  return <canvas ref={canvasRef} aria-hidden="true" style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} />;
}
