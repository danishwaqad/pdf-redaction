import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Redact PDF Free";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #fff1f2 0%, #ffffff 50%, #f8fafc 100%)",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            marginBottom: 24,
          }}
        >
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: 16,
              background: "#e11d48",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              fontSize: 36,
              fontWeight: 700,
            }}
          >
            R
          </div>
          <span style={{ fontSize: 56, fontWeight: 800, color: "#0f172a" }}>RedactPDF</span>
        </div>
        <p style={{ fontSize: 40, fontWeight: 700, color: "#e11d48", margin: 0 }}>
          Redact PDF Free
        </p>
        <p style={{ fontSize: 28, color: "#64748b", marginTop: 16 }}>
          No upload · Browser-only · Permanent redaction
        </p>
      </div>
    ),
    { ...size }
  );
}
