import React from "react";

interface FloatingLabelsProps {
  hoveredState: string | null;
  selectedStates: string[];
  width: number;
}

export const FloatingLabels: React.FC<FloatingLabelsProps> = ({
  hoveredState,
  selectedStates,
  width,
}) => {
  return (
    <>
      {/* Left: selectedStates[0] */}
      {selectedStates[0] && (
        <>
          <rect
            x={20}
            y={20}
            width={selectedStates[0].length * 10}
            height={30}
            fill="white"
            rx={5}
            ry={5}
            pointerEvents="none"
          />
          <text
            x={25}
            y={40}
            style={{
              fontSize: "1em",
              fontWeight: "bold",
              fill: "black",
              pointerEvents: "none",
            }}
          >
            {selectedStates[0]}
          </text>
        </>
      )}

      {/* Center: hoveredState */}
      {hoveredState && (
        <>
          <rect
            x={width / 2 - hoveredState.length * 5}
            y={20}
            width={hoveredState.length * 10}
            height={30}
            fill="white"
            rx={5}
            ry={5}
            pointerEvents="none"
          />
          <text
            x={width / 2}
            y={40}
            textAnchor="middle"
            style={{
              fontSize: "1em",
              fontWeight: "bold",
              fill: "black",
              pointerEvents: "none",
            }}
          >
            {hoveredState}
          </text>
        </>
      )}

      {/* Right: selectedStates[1] */}
      {selectedStates[1] && (
        <>
          <rect
            x={width - selectedStates[1].length * 10 - 20}
            y={20}
            width={selectedStates[1].length * 10}
            height={30}
            fill="white"
            rx={5}
            ry={5}
            pointerEvents="none"
          />
          <text
            x={width - (selectedStates[1].length * 10) / 2 - 20}
            y={40}
            textAnchor="middle"
            style={{
              fontSize: "1em",
              fontWeight: "bold",
              fill: "black",
              pointerEvents: "none",
            }}
          >
            {selectedStates[1]}
          </text>
        </>
      )}
    </>
  );
};
