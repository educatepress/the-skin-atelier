import { ImageResponse } from "next/og";

// 動的OG画像生成（JPG/PNG 互換、Twitter/LINE/Facebook全対応）
export const runtime = "edge";
export const alt = "The Skin Atelier by Dr. Miyaka";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "80px 100px",
          background:
            "linear-gradient(135deg, #FDFCFA 0%, #F8EFE8 50%, #E8D3C9 100%)",
          fontFamily: '"Noto Serif JP", "Hiragino Mincho ProN", serif',
        }}
      >
        {/* Top */}
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              width: "120px",
              height: "1px",
              backgroundColor: "#D4A898",
              marginBottom: "40px",
            }}
          />
          <div
            style={{
              fontSize: "34px",
              fontStyle: "italic",
              color: "#4A4238",
              letterSpacing: "6px",
              fontFamily: '"Georgia", serif',
            }}
          >
            The Skin Atelier
          </div>
        </div>

        {/* Headline */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "24px",
          }}
        >
          <div
            style={{
              fontSize: "64px",
              color: "#4A4238",
              letterSpacing: "6px",
              lineHeight: 1.3,
              fontWeight: 500,
            }}
          >
            エビデンスと
          </div>
          <div
            style={{
              fontSize: "64px",
              color: "#4A4238",
              letterSpacing: "6px",
              lineHeight: 1.3,
              fontWeight: 500,
            }}
          >
            インナーウェルネスで、
          </div>
          <div
            style={{
              fontSize: "44px",
              color: "#8B7968",
              fontStyle: "italic",
              letterSpacing: "4px",
              marginTop: "12px",
            }}
          >
            10年後の自分を、もっと好きに。
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <div
              style={{
                width: "60px",
                height: "1px",
                backgroundColor: "#D4A898",
              }}
            />
            <div
              style={{
                fontSize: "22px",
                color: "#6B5E52",
                letterSpacing: "3px",
              }}
            >
              by Dr. Miyaka ｜ 美容皮膚科医 みやか先生
            </div>
          </div>
          <div
            style={{
              fontSize: "20px",
              color: "#8B7968",
              fontStyle: "italic",
              letterSpacing: "4px",
              fontFamily: '"Georgia", serif',
            }}
          >
            skin-atelier.jp
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
