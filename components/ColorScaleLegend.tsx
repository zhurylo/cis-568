import React from "react";
import type { ScaleQuantize, ScaleSequential } from "d3-scale";

interface ColorScaleLegendProps {
  colorScale: ScaleSequential<string> | ScaleQuantize<string> | null;
}

export const ColorScaleLegend: React.FC<ColorScaleLegendProps> = ({
  colorScale,
}) => {
  if (!colorScale) return null;

  const [min, max] = colorScale.domain();

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "row",
        alignItems: "stretch",
        justifyContent: "center",
        height: "100%",
      }}
    >
      {/* Color bar */}
      <svg width={20} height="100%">
        <defs>
          <linearGradient
            id="legend-gradient-vertical"
            x1="0%"
            y1="100%"
            x2="0%"
            y2="0%"
          >
            <stop offset="0%" stopColor={colorScale(min)} />
            <stop offset="100%" stopColor={colorScale(max)} />
          </linearGradient>
        </defs>
        <rect
          x="0"
          y="0"
          width="20"
          height="100%"
          fill="url(#legend-gradient-vertical)"
        />
      </svg>

      {/* Labels */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          alignItems: "center",
          marginLeft: "5px",
          fontSize: "0.8rem",
          height: "100%",
        }}
      >
        <span>{max.toFixed(1)}</span>
        <span>{min.toFixed(1)}</span>
      </div>
    </div>
  );
};
