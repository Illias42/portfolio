import { ImageResponse } from "next/og";

import { ogImageSize, staticPalette } from "@/shared/config";

type OgCardProps = {
  eyebrow: string;
  title: readonly string[];
  footer: string;
};

export function renderOgCard({ eyebrow, title, footer }: OgCardProps) {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "54px 64px",
        color: staticPalette.ink,
        backgroundColor: staticPalette.paper,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontSize: 28, fontWeight: 700, letterSpacing: -2 }}>IK.</span>
        <span
          style={{
            fontSize: 18,
            letterSpacing: 3,
            textTransform: "uppercase",
            color: staticPalette.smoke,
          }}
        >
          {eyebrow}
        </span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
        <div style={{ width: 64, height: 5, backgroundColor: staticPalette.accent }} />
        <div style={{ display: "flex", flexDirection: "column" }}>
          {title.map((line) => (
            <span
              key={line}
              style={{ fontSize: 80, fontWeight: 700, lineHeight: 1.05, letterSpacing: -3 }}
            >
              {line}
            </span>
          ))}
        </div>
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          paddingTop: 24,
          borderTop: `1px solid ${staticPalette.smoke}50`,
        }}
      >
        <span style={{ fontSize: 22, color: staticPalette.smoke }}>{footer}</span>
        <span style={{ fontSize: 28, color: staticPalette.accent }}>↗</span>
      </div>
    </div>,
    { ...ogImageSize },
  );
}
