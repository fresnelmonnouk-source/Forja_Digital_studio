import { ImageResponse } from "next/og";
import { SITE_TAGLINE } from "@/lib/site";

export const alt = "FORJA — Digital Studio";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Image de partage (Open Graph / Twitter) générée dynamiquement.
export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #0B0908 0%, #1E1813 100%)",
          fontFamily: "serif",
          position: "relative",
        }}
      >
        {/* Orbe ember */}
        <div
          style={{
            width: 120,
            height: 120,
            borderRadius: "50%",
            background: "radial-gradient(circle at 35% 30%, #FFD27F 0%, #F39C2C 22%, #EE5A24 48%, #B83E0F 78%, #2A0E04 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 40,
          }}
        >
          <div style={{ color: "#1A0A04", fontSize: 64, fontWeight: 700, fontStyle: "italic" }}>F</div>
        </div>

        <div style={{ color: "#F1E9DA", fontSize: 88, fontWeight: 700, letterSpacing: "0.12em", display: "flex" }}>
          FORJA
        </div>
        <div style={{ color: "#EE5A24", fontSize: 22, letterSpacing: "0.35em", marginTop: 8, display: "flex" }}>
          DIGITAL STUDIO
        </div>
        <div style={{ color: "#C8BDA8", fontSize: 30, marginTop: 40, maxWidth: 820, textAlign: "center", display: "flex", lineHeight: 1.4 }}>
          {SITE_TAGLINE}
        </div>
      </div>
    ),
    { ...size }
  );
}
