import { motion, useReducedMotion } from "motion/react";
import { profile } from "../../data/profile";
import { useLang } from "../../hooks/useLang";
import styles from "./DetectedPortrait.module.css";

// Coordenadas no espaço da foto (460×460). As classes são as do COCO,
// o dataset em que o YOLO é treinado — "cell phone" é uma delas.
const boxes = [
  { id: "person", x: 18, y: 56, w: 432, h: 400, label: "person 0.99", tone: "lime" },
  { id: "face", x: 94, y: 92, w: 136, h: 172, label: "face · leonardo_noria 0.97", tone: "amber" },
  { id: "phone", x: 256, y: 146, w: 96, h: 168, label: "cell phone 0.94", tone: "lime" },
] as const;

const keypoints = [
  [143, 152],
  [197, 150],
  [180, 190],
  [168, 213],
  [196, 212],
];

export function DetectedPortrait() {
  const { t } = useLang();
  const reduce = useReducedMotion();

  return (
    <figure className={styles.figure}>
      <div className={styles.frame}>
        <img src={profile.photo} alt={t("about.photoAlt")} width={460} height={460} className={styles.photo} />
        <div className={styles.scan} aria-hidden="true" />
        <svg className={styles.overlay} viewBox="0 0 460 460" aria-hidden="true">
          {boxes.map((box, i) => {
            const color = box.tone === "amber" ? "var(--amber)" : "var(--accent)";
            const len = 16;
            const { x, y, w, h } = box;
            const path = `M${x} ${y + len}V${y}H${x + len} M${x + w - len} ${y}H${x + w}V${y + len} M${x + w} ${y + h - len}V${y + h}H${x + w - len} M${x + len} ${y + h}H${x}V${y + h - len}`;
            const labelW = box.label.length * 6.6 + 12;
            const labelY = y - 17 < 0 ? y : y - 17;
            return (
              <motion.g
                key={box.id}
                initial={reduce ? false : { opacity: 0, scale: 1.08 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 + i * 0.35, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                style={{ transformOrigin: `${x + w / 2}px ${y + h / 2}px` }}
              >
                <rect x={x} y={y} width={w} height={h} fill="none" stroke={color} strokeOpacity={0.3} strokeWidth={1} />
                <path d={path} fill="none" stroke={color} strokeWidth={2.5} />
                <rect x={x - 1} y={labelY} width={labelW} height={17} fill={color} />
                <text x={x + 5} y={labelY + 12.5} className={styles.label}>
                  {box.label}
                </text>
              </motion.g>
            );
          })}
          {keypoints.map(([cx, cy], i) => (
            <motion.circle
              key={i}
              cx={cx}
              cy={cy}
              r={2.6}
              fill="var(--amber)"
              initial={reduce ? false : { opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 1.2 + i * 0.08 }}
            />
          ))}
        </svg>
      </div>
      <figcaption className={`mono ${styles.caption}`}>
        <span>CAM-01 · frame 000421</span>
        <span>3 objects · 5 keypoints · 31ms</span>
      </figcaption>
    </figure>
  );
}
