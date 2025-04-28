import React from "react";
import { scaleLinear, scaleBand } from "d3-scale";

interface DataRow {
  State: string;
  Data_value: number;
}

interface Props {
  sortedData: DataRow[];
  colorScale: ((value: number) => string) | null;
  width: number;
  maxPrevalence: number;
  highlightedStates?: string[];
  handleSelectState?: (stateName: string) => void;
}

export const BarChart: React.FC<Props> = ({
  sortedData,
  colorScale,
  width,
  maxPrevalence,
  highlightedStates = [],
  handleSelectState,
}) => {
  if (!sortedData.length) return null;

  const marginLeft = 300;
  const marginRight = 100;
  const chartWidth = width - marginLeft - marginRight;

  const xScale = scaleLinear()
    .domain([0, maxPrevalence])
    .range([0, chartWidth]);

  const yScale = scaleBand()
    .domain(sortedData.map((d) => d.State))
    .range([0, sortedData.length * 40])
    .padding(0.2);

  return (
    <g transform={`translate(${marginLeft}, 20)`}>
      {sortedData.map((d) => {
        const isHighlighted = highlightedStates.includes(d.State);

        return (
          <g key={d.State}>
            {/* Bar */}
            <rect
              x={0}
              y={yScale(d.State)!}
              width={xScale(d.Data_value)}
              height={yScale.bandwidth()}
              fill={colorScale ? colorScale(d.Data_value) : "steelblue"}
              stroke={isHighlighted ? "black" : "none"}
              strokeWidth={isHighlighted ? 3 : 0}
              style={{ cursor: "pointer" }}
              onClick={() => handleSelectState?.(d.State)}
            />

            {/* State label */}
            <text
              x={-10}
              y={yScale(d.State)! + yScale.bandwidth() / 2}
              textAnchor="end"
              alignmentBaseline="middle"
              style={{
                fontSize: "2em",
                fontWeight: isHighlighted ? "bold" : "normal",
                fill: isHighlighted ? "black" : "gray",
              }}
            >
              {d.State}
            </text>

            {/* Data value label */}
            <text
              x={xScale(d.Data_value) + 10}
              y={yScale(d.State)! + yScale.bandwidth() / 2}
              alignmentBaseline="middle"
              style={{
                fontSize: "2em",
                fontWeight: isHighlighted ? "bold" : "normal",
                fill: isHighlighted ? "black" : "gray",
              }}
            >
              {d.Data_value.toFixed(1)}%
            </text>
          </g>
        );
      })}

      {/* Axis ticks */}
      {Array.from({ length: 6 }).map((_, i) => {
        const value = (i / 5) * maxPrevalence;
        return (
          <g
            key={i}
            transform={`translate(${xScale(value)}, ${sortedData.length * 40})`}
          >
            <line y2="6" stroke="black" />
            <text y="20" textAnchor="middle" style={{ fontSize: "1.5em" }}>
              {value.toFixed(0)}%
            </text>
          </g>
        );
      })}
    </g>
  );
};
