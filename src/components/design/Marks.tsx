import React from "react";
import { PERSON } from "../../data/person";

export const Monogram = ({ size = 40, inverted = false }: { size?: number; inverted?: boolean }) => (
  <span
    aria-label="nk monogram"
    className={`ds-monogram${inverted ? " inverted" : ""}`}
    style={{ width: size, height: size, fontSize: size * 0.55 }}
  >
    <span style={{ transform: "translateY(-1px)" }}>nk</span>
    <span className="ds-corner-tick" style={{ width: 4, height: 4 }} />
  </span>
);

export const BrandMark = ({
  size = 28,
  shape = "circle",
}: {
  size?: number;
  shape?: "square" | "circle";
}) => {
  const shapeStyle: React.CSSProperties =
    shape === "square"
      ? { border: "1px solid var(--ink)", borderRadius: 0 }
      : { borderRadius: "50%" };
  return (
    <img
      src="/assets/images/profile/nick-karnik.jpeg"
      alt=""
      width={size}
      height={size}
      loading="eager"
      style={{
        display: "block",
        objectFit: "cover",
        objectPosition: "center top",
        flexShrink: 0,
        ...shapeStyle,
      }}
    />
  );
};

export const Wordmark = ({
  variant = "primary",
  size = 24,
}: {
  variant?: "primary" | "upright" | "stacked";
  size?: number;
}) => {
  if (variant === "stacked") {
    return (
      <span
        style={{
          display: "inline-flex",
          flexDirection: "column",
          lineHeight: 0.92,
          fontFamily: "var(--serif)",
          fontSize: size,
          letterSpacing: "-0.02em",
        }}
      >
        <span style={{ fontStyle: "italic" }}>Nick</span>
        <span style={{ fontWeight: 500 }}>Karnik</span>
      </span>
    );
  }
  if (variant === "upright") {
    return (
      <span
        style={{
          fontFamily: "var(--serif)",
          fontSize: size,
          letterSpacing: "-0.015em",
          lineHeight: 1,
          fontWeight: 500,
        }}
      >
        Nick Karnik
      </span>
    );
  }
  return (
    <span
      className="ds-wordmark"
      style={{ fontSize: size }}
    >
      Nick Karnik
    </span>
  );
};

export const SecondaryMark = ({ size = 16 }: { size?: number }) => (
  <span
    style={{
      display: "inline-flex",
      alignItems: "center",
      gap: 8,
      fontFamily: "var(--mono)",
      fontSize: size * 0.7,
      textTransform: "uppercase",
      letterSpacing: "0.18em",
      color: "var(--ink-2)",
    }}
  >
    <span
      style={{
        width: 6,
        height: 6,
        background: "var(--accent)",
        transform: "rotate(45deg)",
        flexShrink: 0,
      }}
    />
    <span>NK · est. {PERSON.estYear}</span>
  </span>
);

export const TinyMark = ({ size = 20 }: { size?: number }) => (
  <span
    style={{
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      width: size,
      height: size,
      border: "1px solid var(--ink)",
      fontFamily: "var(--serif)",
      fontStyle: "italic",
      fontSize: size * 0.5,
      letterSpacing: "-0.04em",
      lineHeight: 1,
    }}
  >
    nk
  </span>
);
