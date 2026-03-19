import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "#0d0d12",
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: 6,
        }}
      >
        <div
          style={{
            display: "flex",
            fontFamily: "sans-serif",
            fontWeight: 700,
            fontSize: 14,
          }}
        >
          <span style={{ color: "#a78bfa" }}>S</span>
          <span style={{ color: "#ffffff" }}>R</span>
        </div>
      </div>
    ),
    { ...size }
  );
}
