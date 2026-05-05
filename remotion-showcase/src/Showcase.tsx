import React from "react";
import {
  AbsoluteFill,
  Easing,
  Img,
  Sequence,
  interpolate,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

// ---------- Configuration ----------
export const FPS = 30;
export const SCENE_FRAMES = 120; // 4s per scene

const COLOR = {
  ink: "#121619",
  inkSoft: "#1f2429",
  inkMuted: "#2c3137",
  gold: "#e6b24a",
  goldDeep: "#c8943a",
  goldSoft: "#f0c97a",
  cream: "#f2e9e1",
  creamDeep: "#e6dcd0",
  gray: "#a1aaaa",
  white: "#ffffff",
} as const;

const FONT = `-apple-system, BlinkMacSystemFont, "Segoe UI Variable Display", "Segoe UI", Helvetica, "Helvetica Neue", Arial, sans-serif`;
const FONT_MONO = `ui-monospace, SFMono-Regular, "SF Mono", Menlo, Monaco, Consolas, monospace`;

const EASE_OUT = Easing.bezier(0.16, 1, 0.3, 1);
const EASE_OUT_EXPO = Easing.bezier(0.19, 1, 0.22, 1);

// ---------- Scene definitions ----------
type SceneKind =
  | "intro"
  | "web"
  | "apps"
  | "mobile"
  | "support"
  | "security"
  | "wifi"
  | "server"
  | "outro";

type SceneDef = {
  kind: SceneKind;
  index: string;
  eyebrow: string;
  titleA: string;
  titleEm: string;
  bullets?: string[];
  price?: string;
  sub?: string;
};

export const SCENES: SceneDef[] = [
  {
    kind: "intro",
    index: "00",
    eyebrow: "Gross ICT · Showcase",
    titleA: "Sieben Disziplinen.",
    titleEm: "Eine Verantwortung.",
    sub: "Webseiten · Apps · Netzwerk · Support — aus einer Hand. Aus der Zentralschweiz.",
  },
  {
    kind: "web",
    index: "01",
    eyebrow: "01 · Webseiten",
    titleA: "Auftritte,",
    titleEm: "die wirken.",
    bullets: [
      "Schnell · Core Web Vitals",
      "SEO-fit von Tag 1",
      "Inhalte selbst pflegen",
    ],
    price: "ab CHF 1'500 · Festpreis",
  },
  {
    kind: "apps",
    index: "02",
    eyebrow: "02 · Web-Applikationen",
    titleA: "Software",
    titleEm: "nach Mass.",
    bullets: [
      "Kundenportale · Buchungssysteme",
      "Interne Tools, die Prozesse abbilden",
      "API-Anbindung an Drittsysteme",
    ],
    price: "ab CHF 15'000 · je nach Umfang",
  },
  {
    kind: "mobile",
    index: "03",
    eyebrow: "03 · Mobile Apps",
    titleA: "iOS & Android.",
    titleEm: "Nativ.",
    bullets: [
      "Swift / Kotlin oder Cross-Platform",
      "Push, Offline, App-Store-ready",
      "Update- & Wartungszyklen inklusive",
    ],
    price: "ab CHF 20'000",
  },
  {
    kind: "support",
    index: "04",
    eyebrow: "04 · ICT-Support",
    titleA: "Erreichbar,",
    titleEm: "wenn's klemmt.",
    bullets: [
      "Helpdesk · Remote · Vor Ort",
      "MS 365, Drucker, Drittsoftware",
      "Faire Servicepauschalen",
    ],
    price: "auf Anfrage",
  },
  {
    kind: "security",
    index: "05",
    eyebrow: "05 · Security & Firewall",
    titleA: "Schutz,",
    titleEm: "pragmatisch.",
    bullets: [
      "Next-Gen Firewall · VPN · MFA",
      "Backup-Strategie 3-2-1",
      "Patches & Endpoint-Protection",
    ],
    price: "auf Anfrage",
  },
  {
    kind: "wifi",
    index: "06",
    eyebrow: "06 · Netzwerk & WLAN",
    titleA: "Funkt.",
    titleEm: "Im ganzen Haus.",
    bullets: [
      "Site-Survey · Heatmap · VLANs",
      "Cloud-Managed Setup",
      "Monitoring 24/7",
    ],
    price: "auf Anfrage",
  },
  {
    kind: "server",
    index: "07",
    eyebrow: "07 · Server & Storage",
    titleA: "Lokal. Cloud.",
    titleEm: "Hybrid.",
    bullets: [
      "On-Prem · Azure · M365",
      "Backup mit echten Restore-Tests",
      "Disaster-Recovery-Plan",
    ],
    price: "auf Anfrage",
  },
  {
    kind: "outro",
    index: "08",
    eyebrow: "Nächster Schritt",
    titleA: "Reden wir über",
    titleEm: "Ihr Projekt.",
    sub: "Erstgespräch kostenlos und unverbindlich — persönlich, vor Ort oder remote.",
  },
];

// ---------- Helpers ----------
const fadeInUp = (frame: number, startF = 0, durF = 22, distance = 30) => {
  const t = interpolate(frame, [startF, startF + durF], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: EASE_OUT,
  });
  return {
    opacity: t,
    transform: `translateY(${(1 - t) * distance}px)`,
  };
};

const drawStroke = (frame: number, startF: number, durF: number) => {
  const p = interpolate(frame, [startF, startF + durF], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: EASE_OUT,
  });
  return p;
};

// ---------- Backdrop ----------
const Backdrop: React.FC<{ accent?: boolean }> = ({ accent }) => {
  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(180deg, ${COLOR.inkSoft} 0%, ${COLOR.ink} 100%)`,
      }}
    >
      {/* Subtle vignette + gold halo */}
      <AbsoluteFill
        style={{
          background: accent
            ? `radial-gradient(ellipse 70% 60% at 50% 50%, rgba(230,178,74,0.18), transparent 60%)`
            : `radial-gradient(ellipse 60% 40% at 80% 20%, rgba(230,178,74,0.07), transparent 60%),
               radial-gradient(ellipse 80% 60% at 0% 100%, rgba(230,178,74,0.04), transparent 60%)`,
        }}
      />
      {/* Faint grid */}
      <AbsoluteFill style={{ opacity: 0.04 }}>
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="80" height="80" patternUnits="userSpaceOnUse">
              <path d="M 80 0 L 0 0 0 80" fill="none" stroke={COLOR.cream} strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ---------- Player chrome (frame the video like a media player) ----------
const ChromeTopBar: React.FC<{ chapter: string }> = ({ chapter }) => {
  const dotColors = ["#f0593a", "#f5b333", "#4dbb6e"];
  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        height: 56,
        display: "flex",
        alignItems: "center",
        gap: 16,
        padding: "0 28px",
        background: "rgba(0,0,0,0.22)",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        zIndex: 5,
      }}
    >
      <div style={{ display: "flex", gap: 8 }}>
        {dotColors.map((c, i) => (
          <span
            key={i}
            style={{ width: 12, height: 12, borderRadius: 6, background: c, display: "block" }}
          />
        ))}
      </div>
      <div
        style={{
          flex: 1,
          textAlign: "center",
          fontFamily: FONT_MONO,
          fontSize: 14,
          color: "rgba(242,233,225,0.55)",
          letterSpacing: "0.04em",
        }}
      >
        gross-ict.ch · showcase / {chapter}
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          fontFamily: FONT_MONO,
          fontSize: 13,
          color: "rgba(242,233,225,0.55)",
          letterSpacing: "0.06em",
        }}
      >
        <span
          style={{
            width: 10,
            height: 10,
            borderRadius: 5,
            background: COLOR.gold,
            boxShadow: `0 0 12px ${COLOR.gold}aa`,
          }}
        />
        REC
      </div>
    </div>
  );
};

const ChromeProgressBar: React.FC<{ activeIndex: number; globalFrame: number }> = ({
  activeIndex,
  globalFrame,
}) => {
  const total = SCENES.length;
  const segs = Array.from({ length: total }, (_, i) => i);
  const totalFrames = SCENE_FRAMES * total;
  const elapsedSec = Math.floor(globalFrame / FPS);
  const totalSec = Math.floor(totalFrames / FPS);
  const fmt = (s: number) =>
    `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  const chapterLabels = [
    "Intro",
    "Webseiten",
    "Web-Apps",
    "Mobile Apps",
    "ICT-Support",
    "Security",
    "Netzwerk & WLAN",
    "Server & Storage",
    "Kontakt",
  ];

  return (
    <div
      style={{
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        height: 64,
        display: "flex",
        alignItems: "center",
        gap: 24,
        padding: "0 28px",
        background: "rgba(0,0,0,0.22)",
        borderTop: "1px solid rgba(255,255,255,0.06)",
        zIndex: 5,
      }}
    >
      {/* Play indicator */}
      <div
        style={{
          width: 36,
          height: 36,
          borderRadius: 18,
          background: COLOR.gold,
          color: COLOR.ink,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
          <path d="M7 5v14l12-7z" />
        </svg>
      </div>
      {/* Segments */}
      <div style={{ flex: 1, display: "grid", gridTemplateColumns: `repeat(${total}, 1fr)`, gap: 6 }}>
        {segs.map((i) => {
          const segStart = i * SCENE_FRAMES;
          const fillFrac =
            i < activeIndex
              ? 1
              : i === activeIndex
                ? Math.min(1, Math.max(0, (globalFrame - segStart) / SCENE_FRAMES))
                : 0;
          return (
            <div
              key={i}
              style={{
                position: "relative",
                height: 5,
                background: "rgba(255,255,255,0.10)",
                borderRadius: 3,
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  bottom: 0,
                  left: 0,
                  width: `${fillFrac * 100}%`,
                  background: COLOR.gold,
                }}
              />
            </div>
          );
        })}
      </div>
      {/* Meta */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-end",
          gap: 2,
          fontFamily: FONT_MONO,
          fontSize: 12,
          color: "rgba(242,233,225,0.55)",
          minWidth: 240,
        }}
      >
        <span
          style={{
            color: COLOR.gold,
            letterSpacing: "0.10em",
            textTransform: "uppercase",
            fontSize: 11,
          }}
        >
          {String(activeIndex).padStart(2, "0")} — {chapterLabels[activeIndex]}
        </span>
        <span style={{ letterSpacing: "0.06em" }}>
          {fmt(elapsedSec)} / {fmt(totalSec)}
        </span>
      </div>
    </div>
  );
};

// ---------- Brand logo (PNG) with reveal + glow animation ----------
const BrandLogo: React.FC<{ width?: number; gold?: boolean; animate?: boolean; frame: number }> = ({
  width = 880,
  gold,
  animate,
  frame,
}) => {
  // Aspect ratio of the source logo (2048x329 ≈ 6.22:1)
  const height = (width * 329) / 2048;
  const opacity = animate
    ? interpolate(frame, [4, 28], [0, 1], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
        easing: EASE_OUT,
      })
    : 1;
  const scale = animate
    ? interpolate(frame, [4, 38], [0.94, 1], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
        easing: EASE_OUT_EXPO,
      })
    : 1;
  return (
    <div
      style={{
        width,
        height,
        position: "relative",
        opacity,
        transform: `scale(${scale})`,
        filter: gold
          ? `drop-shadow(0 0 36px rgba(230,178,74,0.45))`
          : undefined,
      }}
    >
      <Img
        src={staticFile("logo.png")}
        style={{ width: "100%", height: "100%", display: "block" }}
      />
    </div>
  );
};

// ---------- Visuals per scene ----------
const VisBrowser: React.FC<{ frame: number }> = ({ frame }) => {
  const lines = [
    { width: 0.8, delay: 30 },
    { width: 0.6, delay: 36 },
    { width: 0.9, delay: 42 },
  ];
  const heroOpacity = interpolate(frame, [12, 24], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: EASE_OUT,
  });
  const ctaScale = interpolate(frame, [54, 70], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: EASE_OUT,
  });

  return (
    <div
      style={{
        width: 520,
        borderRadius: 14,
        background: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(255,255,255,0.10)",
        overflow: "hidden",
        boxShadow: "0 30px 60px -20px rgba(0,0,0,0.6)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "12px 16px",
          background: "rgba(255,255,255,0.04)",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            style={{ width: 10, height: 10, borderRadius: 5, background: "rgba(255,255,255,0.18)" }}
          />
        ))}
        <span
          style={{
            marginLeft: 12,
            fontFamily: FONT_MONO,
            fontSize: 13,
            color: "rgba(242,233,225,0.55)",
          }}
        >
          https://ihre-firma.ch
        </span>
      </div>
      <div style={{ padding: "20px 22px 26px", display: "grid", gap: 10 }}>
        <div
          style={{
            height: 90,
            borderRadius: 8,
            background: "linear-gradient(120deg, rgba(230,178,74,0.20), rgba(230,178,74,0.04))",
            border: "1px solid rgba(230,178,74,0.18)",
            opacity: heroOpacity,
          }}
        />
        {lines.map((l, i) => {
          const t = interpolate(frame, [l.delay, l.delay + 14], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: EASE_OUT,
          });
          return (
            <div
              key={i}
              style={{
                height: 10,
                borderRadius: 5,
                background: "rgba(255,255,255,0.10)",
                width: `${l.width * 100}%`,
                transformOrigin: "left center",
                transform: `scaleX(${t})`,
              }}
            />
          );
        })}
        <div
          style={{
            marginTop: 6,
            width: 130,
            height: 30,
            borderRadius: 6,
            background: COLOR.gold,
            transformOrigin: "left center",
            transform: `scaleX(${ctaScale})`,
          }}
        />
      </div>
    </div>
  );
};

const VisCode: React.FC<{ frame: number }> = ({ frame }) => {
  const lTrans = interpolate(frame, [10, 30], [60, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: EASE_OUT,
  });
  const rTrans = interpolate(frame, [10, 30], [-60, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: EASE_OUT,
  });
  const opa = interpolate(frame, [10, 28], [0, 0.85], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  // Caret blink (every 30 frames = 1s)
  const blink = Math.floor(frame / 15) % 2 === 0 ? 1 : 0;
  const caretOpa = frame > 28 ? blink : 0;

  return (
    <div
      style={{
        position: "relative",
        width: 460,
        height: 280,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 36,
        fontFamily: FONT_MONO,
        fontSize: 180,
        fontWeight: 300,
        color: COLOR.cream,
        letterSpacing: "-0.04em",
      }}
    >
      <div
        style={{
          position: "absolute",
          width: 360,
          height: 360,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(230,178,74,0.20), transparent 60%)",
          filter: "blur(14px)",
          zIndex: 0,
        }}
      />
      <span style={{ transform: `translateX(${lTrans}px)`, opacity: opa, zIndex: 1 }}>{"<"}</span>
      <span
        style={{
          width: 4,
          height: 80,
          background: COLOR.gold,
          opacity: caretOpa,
          zIndex: 1,
          alignSelf: "center",
        }}
      />
      <span style={{ transform: `translateX(${rTrans}px)`, opacity: opa, zIndex: 1 }}>{"/>"}</span>
    </div>
  );
};

const VisPhone: React.FC<{ frame: number }> = ({ frame }) => {
  const cards = [
    { delay: 18, height: 80, gold: true },
    { delay: 28, height: 60 },
    { delay: 38, height: 60 },
  ];
  const badgeScale = interpolate(frame, [50, 65], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: EASE_OUT_EXPO,
  });

  return (
    <div
      style={{
        width: 240,
        height: 480,
        borderRadius: 38,
        background: "#0d1115",
        border: "3px solid rgba(255,255,255,0.18)",
        padding: 12,
        position: "relative",
        boxShadow: "0 30px 60px -20px rgba(0,0,0,0.7)",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 6,
          left: "50%",
          transform: "translateX(-50%)",
          width: "38%",
          height: 18,
          background: "#000",
          borderRadius: "0 0 10px 10px",
        }}
      />
      <div
        style={{
          width: "100%",
          height: "100%",
          borderRadius: 26,
          background: `linear-gradient(180deg, ${COLOR.inkSoft}, ${COLOR.ink})`,
          padding: "32px 12px 12px",
          display: "flex",
          flexDirection: "column",
          gap: 10,
          overflow: "hidden",
          position: "relative",
        }}
      >
        <div style={{ width: "100%", height: 6, background: "rgba(255,255,255,0.10)", borderRadius: 3 }} />
        {cards.map((c, i) => {
          const t = interpolate(frame, [c.delay, c.delay + 18], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: EASE_OUT,
          });
          return (
            <div
              key={i}
              style={{
                width: "100%",
                height: c.height,
                borderRadius: 8,
                background: c.gold
                  ? "linear-gradient(120deg, rgba(230,178,74,0.22), rgba(230,178,74,0.06))"
                  : "rgba(255,255,255,0.06)",
                border: c.gold
                  ? "1px solid rgba(230,178,74,0.24)"
                  : "1px solid rgba(255,255,255,0.06)",
                opacity: t,
                transform: `translateY(${(1 - t) * 18}px)`,
              }}
            />
          );
        })}
        <div
          style={{
            position: "absolute",
            top: 18,
            right: 14,
            width: 26,
            height: 26,
            borderRadius: 13,
            background: COLOR.gold,
            color: COLOR.ink,
            fontSize: 14,
            fontWeight: 700,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transform: `scale(${badgeScale})`,
            boxShadow: `0 0 0 3px ${COLOR.ink}, 0 0 18px rgba(230,178,74,0.7)`,
          }}
        >
          3
        </div>
      </div>
    </div>
  );
};

const VisChat: React.FC<{ frame: number }> = ({ frame }) => {
  const inT = interpolate(frame, [10, 28], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: EASE_OUT,
  });
  const outT = interpolate(frame, [60, 78], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: EASE_OUT,
  });
  // Typing dots animation
  const dotPhase = (i: number) => {
    const phase = ((frame + i * 5) % 30) / 30;
    return Math.sin(phase * Math.PI * 2) * 0.5 + 0.5;
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16, width: 320 }}>
      <div
        style={{
          alignSelf: "flex-start",
          background: "rgba(255,255,255,0.08)",
          border: "1px solid rgba(255,255,255,0.06)",
          borderRadius: "16px 16px 16px 4px",
          padding: "16px 22px",
          display: "flex",
          gap: 8,
          opacity: inT,
          transform: `translateY(${(1 - inT) * 10}px)`,
        }}
      >
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            style={{
              width: 10,
              height: 10,
              borderRadius: 5,
              background: "rgba(242,233,225,0.6)",
              opacity: dotPhase(i),
              transform: `translateY(${-dotPhase(i) * 4}px)`,
            }}
          />
        ))}
      </div>
      <div
        style={{
          alignSelf: "flex-end",
          background: COLOR.gold,
          color: COLOR.ink,
          borderRadius: "16px 16px 4px 16px",
          width: 56,
          height: 56,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          opacity: outT,
          transform: `translateY(${(1 - outT) * 10}px)`,
        }}
      >
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <path d="M5 12l4 4 10-10" />
        </svg>
      </div>
    </div>
  );
};

const VisShield: React.FC<{ frame: number }> = ({ frame }) => {
  const pathOff = drawStroke(frame, 14, 30) * 100;
  const checkOff = drawStroke(frame, 50, 14) * 100;
  // Sweep happens after check
  const sweepX = interpolate(frame, [70, 110], [-100, 100], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        width: 280,
        height: 308,
        position: "relative",
        filter: "drop-shadow(0 0 32px rgba(230,178,74,0.35))",
      }}
    >
      <svg
        viewBox="0 0 100 110"
        width="100%"
        height="100%"
        fill="none"
        stroke={COLOR.gold}
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path
          d="M50 6 L88 22 V52 C88 78 70 96 50 104 C30 96 12 78 12 52 V22 Z"
          pathLength={100}
          strokeDasharray="100"
          strokeDashoffset={pathOff}
          fill="rgba(230,178,74,0.06)"
        />
        <path
          d="M34 56 L46 68 L68 44"
          pathLength={100}
          strokeDasharray="100"
          strokeDashoffset={checkOff}
          stroke={COLOR.cream}
          strokeWidth="4"
        />
      </svg>
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(110deg, transparent 40%, rgba(255,255,255,0.18) 50%, transparent 60%)",
          mixBlendMode: "screen",
          transform: `translateX(${sweepX}%)`,
          opacity: frame > 70 && frame < 110 ? 1 : 0,
        }}
      />
    </div>
  );
};

const VisWifi: React.FC<{ frame: number }> = ({ frame }) => {
  const dotScale = interpolate(frame, [10, 24], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: EASE_OUT_EXPO,
  });
  // Three concentric arcs pulsing outward, staggered
  const arcs = [0, 1, 2].map((i) => {
    const cycle = 60; // 2s per pulse
    const offset = i * 12;
    const local = (frame + offset) % cycle;
    const t = local / cycle;
    return {
      scale: interpolate(t, [0, 1], [0.4, 1.05], { easing: Easing.out(Easing.ease) }),
      opacity: interpolate(t, [0, 0.15, 0.85, 1], [0, 0.9, 0.4, 0]),
    };
  });

  return (
    <div
      style={{
        width: 320,
        height: 280,
        position: "relative",
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "center",
      }}
    >
      {arcs.map((a, i) => {
        const sz = 280 * a.scale;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              bottom: 70,
              left: "50%",
              width: sz,
              height: sz / 2,
              transform: `translateX(-50%)`,
              borderTop: `4px solid ${COLOR.gold}`,
              borderLeft: `4px solid ${COLOR.gold}`,
              borderRight: `4px solid ${COLOR.gold}`,
              borderRadius: `${sz}px ${sz}px 0 0`,
              opacity: a.opacity,
            }}
          />
        );
      })}
      <div
        style={{
          width: 22,
          height: 22,
          borderRadius: 11,
          background: COLOR.gold,
          marginBottom: 50,
          transform: `scale(${dotScale})`,
          boxShadow: `0 0 18px ${COLOR.gold}`,
        }}
      />
    </div>
  );
};

const VisRack: React.FC<{ frame: number }> = ({ frame }) => {
  const rows = [0, 1, 2, 3];
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10, width: 380 }}>
      {rows.map((i) => {
        const delay = 12 + i * 7;
        const t = interpolate(frame, [delay, delay + 18], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          easing: EASE_OUT,
        });
        const blinkA = Math.floor((frame + i * 8) / 20) % 2 === 0 ? 1 : 0.3;
        const blinkB = Math.floor((frame + i * 12 + 5) / 24) % 2 === 0 ? 1 : 0.3;
        return (
          <div
            key={i}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: "16px 18px",
              borderRadius: 8,
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
              opacity: t,
              transform: `translateX(${(1 - t) * 24}px)`,
            }}
          >
            <span
              style={{
                width: 10,
                height: 10,
                borderRadius: 5,
                background: COLOR.gold,
                boxShadow: `0 0 8px ${COLOR.gold}aa`,
                opacity: blinkA,
              }}
            />
            <span
              style={{
                width: 10,
                height: 10,
                borderRadius: 5,
                background: "#4dbb6e",
                boxShadow: `0 0 8px #4dbb6eaa`,
                opacity: blinkB,
              }}
            />
            <div
              style={{
                flex: 1,
                height: 6,
                borderRadius: 3,
                background:
                  "linear-gradient(90deg, rgba(255,255,255,0.10), rgba(255,255,255,0.04))",
              }}
            />
          </div>
        );
      })}
    </div>
  );
};

// ---------- Common scene typography ----------
const Eyebrow: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({
  children,
  style,
}) => (
  <span
    style={{
      fontFamily: FONT_MONO,
      fontSize: 18,
      letterSpacing: "0.22em",
      textTransform: "uppercase",
      color: COLOR.gold,
      ...style,
    }}
  >
    {children}
  </span>
);

const SceneTitle: React.FC<{ a: string; em: string; centered?: boolean }> = ({
  a,
  em,
  centered,
}) => (
  <h1
    style={{
      fontFamily: FONT,
      fontWeight: 700,
      fontSize: 110,
      lineHeight: 1.02,
      letterSpacing: "-0.025em",
      color: COLOR.cream,
      margin: 0,
      textAlign: centered ? "center" : "left",
    }}
  >
    {a}
    <br />
    <em style={{ fontStyle: "italic", color: COLOR.gold }}>{em}</em>
  </h1>
);

const Bullets: React.FC<{ items: string[]; frame: number; baseDelay: number }> = ({
  items,
  frame,
  baseDelay,
}) => (
  <ul style={{ display: "grid", gap: 14, margin: 0, padding: 0, listStyle: "none" }}>
    {items.map((b, i) => {
      const t = interpolate(frame, [baseDelay + i * 6, baseDelay + i * 6 + 18], [0, 1], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
        easing: EASE_OUT,
      });
      return (
        <li
          key={i}
          style={{
            position: "relative",
            paddingLeft: 36,
            fontFamily: FONT,
            fontSize: 30,
            lineHeight: 1.4,
            color: "rgba(242,233,225,0.82)",
            opacity: t,
            transform: `translateY(${(1 - t) * 14}px)`,
          }}
        >
          <span
            style={{
              position: "absolute",
              left: 0,
              top: "0.65em",
              width: 22,
              height: 2,
              background: COLOR.gold,
            }}
          />
          {b}
        </li>
      );
    })}
  </ul>
);

const PriceChip: React.FC<{ text: string }> = ({ text }) => (
  <span
    style={{
      display: "inline-block",
      padding: "10px 22px",
      borderRadius: 999,
      border: `1.5px solid rgba(230,178,74,0.40)`,
      background: "rgba(230,178,74,0.06)",
      fontFamily: FONT,
      fontSize: 22,
      color: COLOR.goldSoft,
      letterSpacing: "0.01em",
      alignSelf: "flex-start",
    }}
  >
    {text}
  </span>
);

// ---------- Scene wrapper with enter/exit fade + slight zoom ----------
const SceneWrap: React.FC<{ children: React.ReactNode; frame: number }> = ({
  children,
  frame,
}) => {
  const fadeIn = interpolate(frame, [0, 14], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: EASE_OUT,
  });
  const fadeOut = interpolate(frame, [SCENE_FRAMES - 14, SCENE_FRAMES], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: EASE_OUT,
  });
  // Subtle drift for cinematic feel
  const drift = interpolate(frame, [0, SCENE_FRAMES], [0, -12], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const zoom = interpolate(frame, [0, SCENE_FRAMES], [1.0, 1.02], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        position: "absolute",
        inset: "56px 0 64px 0",
        display: "flex",
        alignItems: "center",
        opacity: Math.min(fadeIn, fadeOut),
        transform: `translateY(${drift}px) scale(${zoom})`,
        transformOrigin: "center",
      }}
    >
      {children}
    </div>
  );
};

// ---------- Two-column layout (text + visual) ----------
const TwoColScene: React.FC<{
  scene: SceneDef;
  frame: number;
  visual: React.ReactNode;
}> = ({ scene, frame, visual }) => {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "grid",
        gridTemplateColumns: "1.05fr 0.95fr",
        gap: 80,
        padding: "0 100px",
        alignItems: "center",
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
        <div style={fadeInUp(frame, 6, 22, 16)}>
          <Eyebrow>{scene.eyebrow}</Eyebrow>
        </div>
        <div style={fadeInUp(frame, 14, 28, 26)}>
          <SceneTitle a={scene.titleA} em={scene.titleEm} />
        </div>
        {scene.bullets && (
          <div style={{ marginTop: 8 }}>
            <Bullets items={scene.bullets} frame={frame} baseDelay={32} />
          </div>
        )}
        {scene.price && (
          <div style={{ ...fadeInUp(frame, 64, 24, 14), marginTop: 12 }}>
            <PriceChip text={scene.price} />
          </div>
        )}
      </div>
      <div
        style={{
          ...fadeInUp(frame, 12, 30, 24),
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "100%",
        }}
      >
        {visual}
      </div>
    </div>
  );
};

// ---------- Center-stack layout (intro/outro) ----------
const CenterScene: React.FC<{
  scene: SceneDef;
  frame: number;
  brandGold?: boolean;
  cta?: string;
}> = ({ scene, frame, brandGold, cta }) => {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 28,
        padding: "0 100px",
        textAlign: "center",
      }}
    >
      <div style={fadeInUp(frame, 0, 18, 18)}>
        <BrandLogo width={920} gold={brandGold} animate frame={frame} />
      </div>
      <div style={fadeInUp(frame, 22, 22, 16)}>
        <Eyebrow>{scene.eyebrow}</Eyebrow>
      </div>
      <div style={fadeInUp(frame, 30, 28, 26)}>
        <SceneTitle a={scene.titleA} em={scene.titleEm} centered />
      </div>
      {scene.sub && (
        <p
          style={{
            ...fadeInUp(frame, 50, 24, 18),
            fontFamily: FONT,
            fontSize: 28,
            lineHeight: 1.5,
            color: "rgba(242,233,225,0.72)",
            margin: 0,
            maxWidth: 900,
          }}
        >
          {scene.sub}
        </p>
      )}
      {cta && (
        <div style={{ ...fadeInUp(frame, 70, 24, 18), marginTop: 14 }}>
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 14,
              padding: "20px 36px",
              borderRadius: 999,
              background: COLOR.gold,
              color: COLOR.ink,
              fontFamily: FONT,
              fontWeight: 600,
              fontSize: 26,
              boxShadow: "0 16px 40px -8px rgba(230,178,74,0.4)",
            }}
          >
            {cta}
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </span>
        </div>
      )}
    </div>
  );
};

// ---------- Per-scene components ----------
const SceneIntro: React.FC<{ scene: SceneDef }> = ({ scene }) => {
  const frame = useCurrentFrame();
  return (
    <>
      <Backdrop accent />
      <SceneWrap frame={frame}>
        <CenterScene scene={scene} frame={frame} />
      </SceneWrap>
    </>
  );
};

const SceneOutro: React.FC<{ scene: SceneDef }> = ({ scene }) => {
  const frame = useCurrentFrame();
  return (
    <>
      <Backdrop accent />
      <SceneWrap frame={frame}>
        <CenterScene scene={scene} frame={frame} brandGold cta="Termin vereinbaren" />
      </SceneWrap>
    </>
  );
};

const SceneTwoCol: React.FC<{ scene: SceneDef; visual: (frame: number) => React.ReactNode }> = ({
  scene,
  visual,
}) => {
  const frame = useCurrentFrame();
  return (
    <>
      <Backdrop />
      <SceneWrap frame={frame}>
        <TwoColScene scene={scene} frame={frame} visual={visual(frame)} />
      </SceneWrap>
    </>
  );
};

// ---------- Master composition ----------
export const Showcase: React.FC = () => {
  const frame = useCurrentFrame();
  useVideoConfig();
  const activeIndex = Math.min(SCENES.length - 1, Math.floor(frame / SCENE_FRAMES));
  const activeScene = SCENES[activeIndex];

  const renderScene = (scene: SceneDef) => {
    switch (scene.kind) {
      case "intro":
        return <SceneIntro scene={scene} />;
      case "outro":
        return <SceneOutro scene={scene} />;
      case "web":
        return <SceneTwoCol scene={scene} visual={(f) => <VisBrowser frame={f} />} />;
      case "apps":
        return <SceneTwoCol scene={scene} visual={(f) => <VisCode frame={f} />} />;
      case "mobile":
        return <SceneTwoCol scene={scene} visual={(f) => <VisPhone frame={f} />} />;
      case "support":
        return <SceneTwoCol scene={scene} visual={(f) => <VisChat frame={f} />} />;
      case "security":
        return <SceneTwoCol scene={scene} visual={(f) => <VisShield frame={f} />} />;
      case "wifi":
        return <SceneTwoCol scene={scene} visual={(f) => <VisWifi frame={f} />} />;
      case "server":
        return <SceneTwoCol scene={scene} visual={(f) => <VisRack frame={f} />} />;
    }
  };

  return (
    <AbsoluteFill style={{ background: COLOR.ink }}>
      {SCENES.map((scene, i) => (
        <Sequence
          key={i}
          from={i * SCENE_FRAMES}
          durationInFrames={SCENE_FRAMES}
          layout="none"
        >
          {renderScene(scene)}
        </Sequence>
      ))}

      {/* Persistent chrome (top + bottom bars) */}
      <ChromeTopBar chapter={`${activeScene.index}-${activeScene.kind}`} />
      <ChromeProgressBar activeIndex={activeIndex} globalFrame={frame} />
    </AbsoluteFill>
  );
};
