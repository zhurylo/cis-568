import React from "react";
import { Feature, Geometry } from "geojson";

interface Props {
  states: Feature<Geometry, any>[];
  valueByState: Map<string, number>;
  colorScale: ((value: number) => string) | null;
  allSelected: boolean;
  pathGenerator: (feature: Feature) => string | null;
  hoveredState: string | null;
  selectedStates: string[];
  setHoveredState: (state: string | null) => void;
  handleSelectState: (state: string) => void;
}

export const MapPaths: React.FC<Props> = ({
  states,
  valueByState,
  colorScale,
  allSelected,
  pathGenerator,
  hoveredState,
  selectedStates,
  setHoveredState,
  handleSelectState,
}) => {
  function hasNameProperty(
    feature: Feature<Geometry, any>
  ): feature is Feature<Geometry, { name: string }> {
    return (
      feature.properties != null &&
      typeof feature.properties === "object" &&
      "name" in feature.properties &&
      typeof (feature.properties as any).name === "string"
    );
  }

  return (
    <>
      {states.map((feature) => {
        if (!hasNameProperty(feature)) {
          return null;
        }
        const stateName = feature.properties.name;
        const val = valueByState.get(stateName);

        if (val == null) {
          return null;
        }

        let fillColor = "#ccc"; // fallback gray
        if (allSelected && colorScale) {
          fillColor = colorScale(val);
        }

        return (
          <path
            key={stateName}
            d={pathGenerator(feature) || ""}
            fill={fillColor}
            stroke={
              selectedStates.slice(-2).includes(stateName)
                ? "#000"
                : hoveredState === stateName
                ? "#333"
                : "#999"
            }
            strokeWidth={
              selectedStates.slice(-2).includes(stateName)
                ? 3
                : hoveredState === stateName
                ? 2
                : 0.5
            }
            onClick={() => handleSelectState(stateName)}
            onMouseEnter={() => setHoveredState(stateName)}
            onMouseLeave={() => setHoveredState(null)}
          />
        );
      })}
    </>
  );
};
