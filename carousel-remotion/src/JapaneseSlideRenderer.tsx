import React from "react";
import { Img, staticFile } from "remotion";

export const JapaneseSlideRenderer: React.FC<{ slide: any; themeIndex: number }> = ({ slide, themeIndex }) => {
  if (!slide || typeof themeIndex !== "number") {
    return <div style={{ backgroundColor: "red" }}>Slide data missing</div>;
  }

  // Determine Theme (Checkerboard alternating logic)
  const isDarkTheme = themeIndex % 2 !== 0;

  // Specific color logic mapped to the design system rules
  let bg = isDarkTheme ? "var(--theme-a-bg)" : "var(--theme-b-bg)";
  let text = isDarkTheme ? "var(--theme-a-text)" : "var(--theme-b-text)";
  let accent = isDarkTheme ? "var(--theme-a-accent)" : "var(--theme-b-accent)";
  let muted = isDarkTheme ? "var(--theme-a-muted)" : "var(--theme-b-muted)";

  if (slide.type === "Cover" || slide.type === "CTA") {
    bg = "var(--theme-a-bg)"; // Default dark grey surface
    text = "var(--theme-a-text)";
    accent = "var(--theme-a-accent)";
    muted = "var(--theme-a-muted)";
  } else if (slide.type === "Epilogue") {
    bg = "#f0ece8"; // Warm beige
    text = "var(--theme-a-text)"; // Keep dark brown text
  }

  const baseStyle: React.CSSProperties = {
    backgroundColor: bg,
    color: text,
    fontFamily: "var(--font-jp-sans)",
  };

  const renderChunks = (chunks: string[], fontSizeVar: string, fontWeight: number = 300, isSerif: boolean = false, lh: number = 1.65) => {
    if (!chunks) return null;
    return chunks.map((chunk, idx) => (
      <span
        key={idx}
        style={{
          display: "block",
          fontSize: `var(${fontSizeVar})`,
          fontWeight,
          fontFamily: isSerif ? "var(--font-jp-serif)" : "var(--font-jp-sans)",
          lineHeight: lh,
          wordBreak: "keep-all",
          whiteSpace: "nowrap"
        }}
      >
        {chunk}
      </span>
    ));
  };

  const renderContent = () => {
    switch (slide.type) {
      // ─────────────────────────────────────────────
      // Slide 01: COVER
      // ─────────────────────────────────────────────
      case "Cover":
        return (
          <div style={{ position: "relative", width: "100%", height: "100%", backgroundColor: bg, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", paddingTop: "var(--space-2xl)", paddingBottom: "var(--space-xl)", textAlign: "center" }}>
            
            {/* Title Chunks */}
            <h1 style={{ margin: 0, marginBottom: "var(--space-xl)" }}>
              {renderChunks(slide.headlineChunks, "--text-xl", 400, true, 1.4)}
            </h1>

            {/* Simulated Image Placeholder (White border style as seen in screenshots) */}
            <div style={{
              width: "75%",
              height: "450px",
              backgroundColor: "#EFEBE8",
              border: "12px solid #FFFFFF",
              boxShadow: "0 10px 40px rgba(0,0,0,0.03)",
              marginBottom: "var(--space-xl)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}>
               <span style={{ color: muted, fontSize: "var(--text-xs)" }}>[ Image Placement ]</span>
            </div>

            {/* Pink Accent Subheadline */}
            <p style={{
              fontFamily: "var(--font-jp-sans)",
              fontWeight: 300,
              fontSize: "var(--text-md)",
              color: accent,
              marginBottom: "var(--space-md)"
            }}>
              {slide.subheadline}
            </p>
          </div>
        );

      // ─────────────────────────────────────────────
      // Slide 02: EMPATHY (共感)
      // ─────────────────────────────────────────────
      case "Empathy":
        return (
          <div style={{ position: "relative", width: "100%", height: "100%", backgroundColor: bg, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textShadow: "0px 2px 10px rgba(255,255,255,0.5)" }}>
            <h2 style={{ margin: 0, color: text, marginBottom: "var(--space-2xl)", textAlign: "center" }}>
              {renderChunks(slide.headlineChunks, "--text-xl", 400, true, 1.4)}
            </h2>
            <p style={{ margin: 0, textAlign: "center", color: muted }}>
              {renderChunks(slide.bodyChunks, "--text-md", 300, false, 1.8)}
            </p>
          </div>
        );

      // ─────────────────────────────────────────────
      // Slide 03: OVERVIEW
      // ─────────────────────────────────────────────
      case "Overview":
        return (
          <div style={{ position: "relative", width: "100%", height: "100%", backgroundColor: bg, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "0 var(--space-xl)", textAlign: "center" }}>
            <div style={{ width: "40px", height: "1px", backgroundColor: accent, marginBottom: "var(--space-lg)" }} />
            <h2 style={{ margin: 0, marginBottom: "var(--space-xl)", color: text }}>
              {renderChunks(slide.headlineChunks, "--text-xl", 400, true, 1.4)}
            </h2>
            <p style={{ margin: 0, color: muted }}>
              {renderChunks(slide.bodyChunks, "--text-base", 300, false, 1.8)}
            </p>
          </div>
        );

      // ─────────────────────────────────────────────
      // Slide 04-07: CONTENT (ノウハウ編)
      // ─────────────────────────────────────────────
      case "Content":
        return (
          <div style={{ position: "relative", width: "100%", height: "100%", backgroundColor: bg, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "0 var(--space-xl)", textAlign: "center" }}>
             <p style={{
                fontFamily: "var(--font-manrope)",
                fontWeight: 300,
                fontSize: "var(--text-md)",
                letterSpacing: "0.2em",
                color: muted,
                marginBottom: "var(--space-lg)"
              }}>
                {slide.subheadline}
              </p>
            <h2 style={{ margin: 0, marginBottom: "var(--space-2xl)", color: text }}>
              {renderChunks(slide.headlineChunks, "--text-lg", 400, true, 1.4)}
            </h2>
            <p style={{ margin: 0, color: muted }}>
              {renderChunks(slide.bodyChunks, "--text-base", 300, false, 1.8)}
            </p>
          </div>
        );

      // ─────────────────────────────────────────────
      // Slide 08: FAQ
      // ─────────────────────────────────────────────
      case "FAQ":
        return (
          <div className="slide-grid">
            <div className="slide-header">
              <h2 style={{ margin: 0, color: accent }}>
                {renderChunks(slide.headlineChunks, "--text-xl", 400, true, 1.4)}
              </h2>
            </div>
            <div className="slide-body">
              <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-md)" }}>
                {/* Custom rendering for Q and A if formatted specifically */}
                <p style={{ margin: 0 }}>
                  {renderChunks(slide.bodyChunks, "--text-base", 300, false, 1.7)}
                </p>
              </div>
            </div>
          </div>
        );

      // ─────────────────────────────────────────────
      // Slide 09: EPILOGUE (マインドセット)
      // ─────────────────────────────────────────────
      case "Epilogue":
        return (
          <div style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            height: "100%",
            textAlign: "center",
            padding: "var(--space-xl)",
          }}>
            <h2 style={{ margin: 0, color: text }}>
              {renderChunks(slide.bodyChunks, "--text-xl", 400, true, 1.8)}
            </h2>
            {slide.sourceDetails && (
              <p style={{ position: "absolute", bottom: "var(--space-lg)", right: "var(--space-lg)", color: "rgba(0,0,0,0.4)", fontSize: "var(--text-xs)", fontFamily: "var(--font-jp-sans)" }}>
                {slide.sourceDetails}
              </p>
            )}
          </div>
        );

      // ─────────────────────────────────────────────
      // Slide 10: CTA
      // ─────────────────────────────────────────────
      case "CTA":
        return (
          <div style={{ display: 'flex', flexDirection: 'column', height: '100%', alignItems: 'center', justifyContent: 'center', textAlign: 'center', paddingTop: 'var(--space-xl)' }}>
            
            <h2 style={{ margin: 0, marginBottom: "var(--space-md)", color: text }}>
              {renderChunks(slide.headlineChunks, "--text-xl", 400, true, 1.4)}
            </h2>
            
            <p style={{ fontSize: "var(--text-sm)", color: muted, fontFamily: "var(--font-jp-sans)", marginBottom: "var(--space-2xl)" }}>
              {slide.actionText}
            </p>

            <div style={{
              padding: "var(--space-sm) var(--space-xl)",
              border: `1px solid ${accent}`,
              borderRadius: "100px",
              color: accent,
              fontFamily: "var(--font-manrope)",
              fontWeight: 300,
              letterSpacing: "0.2em",
              fontSize: "var(--text-sm)",
              marginBottom: "var(--space-xl)"
            }}>
              SAVE
            </div>

            <p style={{ fontFamily: "var(--font-serif)", fontStyle: "italic", fontSize: "var(--text-lg)", color: text }}>
              {slide.signature}
            </p>
          </div>
        );

      default:
        return <div>Unknown slide type: {slide.type}</div>;
    }
  };

  return (
    <div className="slide-container" style={baseStyle}>
      {/* Progress Bar - Exclude from Epilogue for a cleaner vibe */}
      {slide.type !== "Epilogue" && slide.type !== "Cover" && (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: `${(slide.slideNumber / 10) * 100}%`,
            height: "6px",
            backgroundColor: "var(--theme-a-accent)",
            zIndex: 20,
          }}
        />
      )}
      {renderContent()}
    </div>
  );
};
