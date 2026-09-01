"use client";

import { scoreLabel } from "@/lib/utils";
import { scoreRingColor } from "@/lib/scores";

export function ScoreRing({ score, size = 180, label = "Overall" }: { score: number; size?: number; label?: string }) {
  const stroke = 12;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color = scoreRingColor(score);

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          className="text-muted"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute text-center">
        <div className="text-4xl font-semibold tracking-tight">{score}</div>
        <div className="text-xs text-muted-foreground">{label}</div>
        <div className="text-[11px] text-muted-foreground">{scoreLabel(score)}</div>
      </div>
    </div>
  );
}
