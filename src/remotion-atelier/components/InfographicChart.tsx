import React from "react";
import {
  useCurrentFrame,
  useVideoConfig,
  spring,
  interpolate,
  Easing,
} from "remotion";
import { z } from "zod";
import { InfographicDataSchema } from "../schema";

export type InfographicData = z.infer<typeof InfographicDataSchema>;

export interface InfographicChartProps {
  data: InfographicData;
  /** スライド内での表示開始フレーム（オフセット）default: 0 */
  startFrame?: number;
}

// ── カラーパレット（Skin Atelier: モダン × Noble Gold）──
const C = {
  bgGlass: "rgba(252, 249, 248, 0.85)", // 強いすりガラス用ベース
  text: "#333333", // チャコールグレー
  muted: "#888888",
  gold: "#D4AF37",
  goldDim: "rgba(212, 175, 55, 0.25)",
  deepBlue: "#1a2a3a",
  line: "rgba(51, 51, 51, 0.1)",
  progressBar: "#D4AF37",
};

// ── Shared Header (Title, Source) ──
const ChartHeader: React.FC<{
  title: string;
  source: string;
  metricLabel?: string;
  frameInfo: { f: number; width: number };
}> = ({ title, source, metricLabel, frameInfo }) => {
  const { f, width } = frameInfo;
  
  const titleOpacity = interpolate(f, [0, 15], [0, 1], { extrapolateRight: "clamp", easing: Easing.out(Easing.ease) });
  const titleY = interpolate(f, [0, 15], [20, 0], { extrapolateRight: "clamp", easing: Easing.out(Easing.ease) });
  const badgeOpacity = interpolate(f, [5, 20], [0, 1], { extrapolateRight: "clamp" });
  const sourceOpacity = interpolate(f, [50, 65], [0, 1], { extrapolateRight: "clamp" });
  const progressWidth = interpolate(f, [0, 30], [0, width * 0.55], { extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) });

  return (
    <>
      {/* プログレスバー（上部ゴールドライン） */}
      <div style={{ position: "absolute", top: 0, left: 0, width: progressWidth, height: 5, backgroundColor: C.progressBar }} />

      {/* RESEARCH DATA バッジ */}
      <div style={{ opacity: badgeOpacity, alignSelf: "flex-start", border: `2px solid ${C.gold}`, borderRadius: 24, padding: "8px 24px", marginBottom: 28 }}>
        <span style={{ color: C.gold, fontSize: 18, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase" }}>Research Data</span>
      </div>

      {/* タイトル */}
      <div style={{ opacity: titleOpacity, transform: `translateY(${titleY}px)`, marginBottom: 40 }}>
        {metricLabel && (
          <div style={{ color: C.muted, fontSize: 22, fontWeight: 500, marginBottom: 10, letterSpacing: "0.08em", textTransform: "uppercase" }}>
            {metricLabel}
          </div>
        )}
        <h2 style={{ color: C.text, fontSize: 48, fontWeight: 800, margin: 0, lineHeight: 1.2 }}>
          {title}
        </h2>
      </div>

      {/* Source Attribution */}
      <div style={{ position: "absolute", bottom: 80, left: 80, opacity: sourceOpacity }}>
        <div style={{ width: "100%", height: 1, backgroundColor: C.line, marginBottom: 20, marginTop: 8 }} />
        <span style={{ color: C.muted, fontSize: 18 }}>Source: {source}</span>
      </div>
    </>
  );
};

// ── TYPE 1: ComparisonChart (Animated Bars) ──
const AnimatedBar: React.FC<{
  value: number; maxValue: number; maxWidth: number; height: number;
  color: string; label: string; unit: string; delay: number; frame: number; fps: number;
}> = ({ value, maxValue, maxWidth, height, color, label, unit, delay, frame, fps }) => {
  const progress = spring({ frame: Math.max(0, frame - delay), fps, config: { damping: 14, stiffness: 70, mass: 1 } });
  const barWidth = progress * (maxValue > 0 ? (value / maxValue) : 0) * maxWidth;
  const numDisplay = Math.round(progress * value);
  const numOpacity = interpolate(Math.max(0, frame - delay), [0, 10], [0, 1], { extrapolateRight: "clamp" });

  return (
    <div style={{ marginBottom: 36 }}>
      <div style={{ color: C.muted, fontSize: 26, fontWeight: 500, marginBottom: 14, fontFamily: "'Noto Sans JP', sans-serif", letterSpacing: "0.05em" }}>{label}</div>
      <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
        <div style={{ width: barWidth, height, backgroundColor: color, borderRadius: 0, minWidth: 4 }} />
        <span style={{ color: color === C.gold ? C.gold : C.text, fontSize: color === C.gold ? 56 : 42, fontWeight: 500, fontFamily: "'Noto Sans JP', sans-serif", opacity: numOpacity, minWidth: 100 }}>
          {numDisplay}{unit}
        </span>
      </div>
    </div>
  );
};

const ComparisonChart: React.FC<{ data: Extract<InfographicData, { type: "comparison" }>; f: number }> = ({ data, f }) => {
  const { fps, width } = useVideoConfig();
  const maxValue = Math.max(data.group1Value, data.group2Value);
  const BAR_MAX_WIDTH = Math.round(width * 0.75);
  const diffOpacity = interpolate(f, [45, 60], [0, 1], { extrapolateRight: "clamp" });

  return (
    <>
      <ChartHeader title={data.title} source={data.source} metricLabel={data.metricLabel} frameInfo={{ f, width }} />
      <div>
        <AnimatedBar value={data.group1Value} maxValue={maxValue} maxWidth={BAR_MAX_WIDTH} height={68} color={C.gold} label={data.group1Label} unit={data.unit} delay={20} frame={f} fps={fps} />
        <AnimatedBar value={data.group2Value} maxValue={maxValue} maxWidth={BAR_MAX_WIDTH} height={68} color={C.goldDim} label={data.group2Label} unit={data.unit} delay={32} frame={f} fps={fps} />
      </div>
      {data.group1Value > data.group2Value && (
        <div style={{ opacity: diffOpacity, alignSelf: "flex-start", marginTop: 16, marginBottom: 20, display: "flex", alignItems: "baseline", gap: 12 }}>
          <span style={{ color: C.gold, fontSize: 36, fontWeight: 700 }}>↑ +{(data.group1Value - data.group2Value).toFixed(1)}{data.unit}</span>
          <span style={{ color: C.muted, fontSize: 20 }}>vs control</span>
        </div>
      )}
    </>
  );
};

// ── TYPE 2: SingleValueChart (Big Number Display) ──
const SingleValueChart: React.FC<{ data: Extract<InfographicData, { type: "single_value" }>; f: number }> = ({ data, f }) => {
  const { fps, width } = useVideoConfig();
  const progress = spring({ frame: Math.max(0, f - 20), fps, config: { damping: 14, stiffness: 60 } });
  const currentNum = Math.round(progress * data.mainValue);
  
  const containerOpacity = interpolate(f, [10, 25], [0, 1], { extrapolateRight: "clamp" });
  const scale = interpolate(progress, [0, 1], [0.8, 1], { extrapolateRight: "clamp" });

  return (
    <>
      <ChartHeader title={data.title} source={data.source} metricLabel={data.metricLabel} frameInfo={{ f, width }} />
      <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", flex: 1, paddingBottom: 100, opacity: containerOpacity, transform: `scale(${scale})` }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 16, color: C.gold }}>
          <span style={{ fontSize: 160, fontWeight: 400, lineHeight: 1, fontFamily: "'Shippori Mincho', serif" }}>{currentNum}</span>
          <span style={{ fontSize: 60, fontWeight: 400, fontFamily: "'Shippori Mincho', serif", color: C.text }}>{data.unit}</span>
        </div>
        {data.subText && (
          <div style={{ marginTop: 24, fontSize: 36, color: C.text, fontWeight: 300, fontFamily: "'Noto Sans JP', sans-serif", letterSpacing: "0.05em" }}>
            {data.subText}
          </div>
        )}
      </div>
    </>
  );
};

// ── TYPE 3: ListChart (3 Key Points Popup) ──
const ListChart: React.FC<{ data: Extract<InfographicData, { type: "list" }>; f: number }> = ({ data, f }) => {
  const { fps, width } = useVideoConfig();

  return (
    <>
      <ChartHeader title={data.title} source={data.source} frameInfo={{ f, width }} />
      <div style={{ display: "flex", flexDirection: "column", gap: 40, marginTop: 20 }}>
        {data.items.map((item, i) => {
          // Stagger each item by 15 frames
          const delay = 20 + (i * 15);
          const spr = spring({ frame: Math.max(0, f - delay), fps, config: { damping: 14, stiffness: 80 } });
          const o = interpolate(spr, [0, 1], [0, 1]);
          const y = interpolate(spr, [0, 1], [20, 0]);
          return (
            <div key={i} style={{ opacity: o, transform: `translateY(${y}px)`, display: "flex", alignItems: "flex-start", gap: 24, padding: "24px 0", borderBottom: `1px solid ${C.line}` }}>
              <span style={{ color: C.gold, fontSize: 32, fontWeight: 400, fontFamily: "'Shippori Mincho', serif", fontStyle: "italic" }}>0{i + 1}.</span>
              <span style={{ color: C.text, fontSize: 32, fontWeight: 300, lineHeight: 1.6, fontFamily: "'Noto Sans JP', sans-serif" }}>{item}</span>
            </div>
          );
        })}
      </div>
    </>
  );
};

// ── Main Switcher Component ──
export const InfographicChart: React.FC<InfographicChartProps> = ({ data, startFrame = 0 }) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const f = frame - startFrame;

  return (
    <div style={{
      position: "absolute", top: 0, left: 0, width, height,
      backgroundColor: C.bgGlass,
      backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)",
      display: "flex", flexDirection: "column",
      padding: "180px 80px 0 80px",
      fontFamily: "'Noto Sans JP', sans-serif", boxSizing: "border-box",
    }}>
      {data.type === "comparison" && <ComparisonChart data={data} f={f} />}
      {data.type === "single_value" && <SingleValueChart data={data} f={f} />}
      {data.type === "list" && <ListChart data={data} f={f} />}
    </div>
  );
};
