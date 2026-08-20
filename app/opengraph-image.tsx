import { ImageResponse } from "next/og";

export const alt = "Air by WZRD — Your personal creative assistant in your iMessages";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          position: "relative",
          overflow: "hidden",
          background: "linear-gradient(180deg,#3d8ed8 0%,#174c91 45%,#071124 100%)",
          color: "#f8f5ec",
          padding: "70px 78px",
          flexDirection: "column",
          justifyContent: "space-between",
          fontFamily: "Georgia, serif",
        }}
      >
        <div style={{ display: "flex", fontSize: 22, letterSpacing: "0.16em", textTransform: "uppercase" }}>
          air by WZRD.tech · private preorder
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div style={{ display: "flex", flexDirection: "column", fontSize: 92, lineHeight: 0.93, letterSpacing: "-0.06em" }}>
            <div>Your personal creative assistant</div>
            <div>in your iMessages.</div>
          </div>
          <div style={{ fontSize: 24, opacity: 0.78, letterSpacing: "0.01em" }}>
            Text a thought, a reference, or a rough brief. Air brings the next creative move back to the thread.
          </div>
        </div>
        <div
          style={{
            display: "flex",
            position: "absolute",
            width: 520,
            height: 250,
            right: -60,
            top: 20,
            borderRadius: 999,
            background: "rgba(255,255,255,0.25)",
            filter: "blur(45px)",
          }}
        />
      </div>
    ),
    size,
  );
}
