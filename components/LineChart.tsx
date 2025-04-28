import React, { useState } from "react";
import { scaleLinear, scalePoint, scaleOrdinal, line } from "d3";
import { schemeSet2 } from "d3-scale-chromatic";

interface LineChartProps {
  selectedStates: string[];
  data: {
    State: string;
    Year: string;
    Data_value: number;
  }[];
  width: number;
  height: number;
}

export const LineChart: React.FC<LineChartProps> = ({
  selectedStates,
  data,
  width,
  height,
}) => {
  const [hoveredYear, setHoveredYear] = useState<string | null>(null);
  const [hoveredState, setHoveredState] = useState<string | null>(null);

  if (selectedStates.length === 0) return null;

  const margin = { top: 60, right: 120, bottom: 50, left: 60 };
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  const years = Array.from(
    new Set(
      data.filter((d) => selectedStates.includes(d.State)).map((d) => d.Year)
    )
  ).sort();

  const allValues = data
    .filter((d) => selectedStates.includes(d.State))
    .map((d) => d.Data_value);

  const xScale = scalePoint().domain(years).range([0, innerWidth]);
  const yScale = scaleLinear()
    .domain([0, Math.max(...allValues) * 1.1])
    .range([innerHeight, 0]);

  const lineGenerator = line<{ Year: string; Data_value: number }>()
    .x((d) => xScale(d.Year)!)
    .y((d) => yScale(d.Data_value));

  const lineColorScale = scaleOrdinal<string>()
    .domain(selectedStates)
    .range(schemeSet2);

  const stateLines = selectedStates.map((state) => ({
    state,
    values: years.map((year) => {
      const match = data.find((d) => d.State === state && d.Year === year);
      return {
        Year: year,
        Data_value: match ? match.Data_value : 0,
      };
    }),
  }));

  return (
    <svg width={width} height={height}>
      <g transform={`translate(${margin.left},${margin.top})`}>
        {/* Chart Title */}
        <text
          x={innerWidth / 2}
          y={-30}
          textAnchor="middle"
          fontSize="1em"
          fontWeight="bold"
          fill="#333"
        >
          State Trends Over Time
        </text>

        {/* Grid + Y axis */}
        {yScale.ticks(5).map((val, idx) => (
          <g key={idx} transform={`translate(0,${yScale(val)})`}>
            <line x2={innerWidth} stroke="#eee" />
            <text x={-10} y={5} fontSize="1em" textAnchor="end" fill="#333">
              {val}
            </text>
          </g>
        ))}

        {/* Grid + X axis */}
        {years.map((year) => (
          <g key={year} transform={`translate(${xScale(year)},0)`}>
            <line y2={innerHeight} stroke="#eee" />
          </g>
        ))}

        {/* X-axis labels */}
        {years.map((year) => (
          <text
            key={year}
            x={xScale(year)}
            y={innerHeight + 30}
            textAnchor="middle"
            fontSize="1em"
            fill="#333"
          >
            {year}
          </text>
        ))}

        {/* Axis labels */}
        <text
          x={innerWidth / 2}
          y={innerHeight + 45}
          textAnchor="middle"
          fontSize="1em"
          fill="#333"
        >
          Year
        </text>

        <text
          x={-innerHeight / 2}
          y={-45}
          transform="rotate(-90)"
          textAnchor="middle"
          fontSize="1em"
          fill="#333"
        >
          Value
        </text>

        {/* Vertical hover line */}
        {hoveredYear && (
          <line
            x1={xScale(hoveredYear)!}
            x2={xScale(hoveredYear)!}
            y1={0}
            y2={innerHeight}
            stroke="#aaa"
            strokeDasharray="4"
          />
        )}

        {/* Lines and points */}
        {stateLines.map((lineData) => {
          const strokeColor = lineColorScale(lineData.state);

          return (
            <g key={lineData.state}>
              <path
                d={lineGenerator(lineData.values) || ""}
                fill="none"
                stroke={strokeColor}
                strokeWidth={2}
              />

              {lineData.values.map((point, idx) => (
                <g
                  key={idx}
                  onMouseEnter={() => {
                    setHoveredYear(point.Year);
                    setHoveredState(lineData.state);
                  }}
                  onMouseLeave={() => {
                    setHoveredYear(null);
                    setHoveredState(null);
                  }}
                >
                  <circle
                    cx={xScale(point.Year)}
                    cy={yScale(point.Data_value)}
                    r={
                      hoveredYear === point.Year &&
                      hoveredState === lineData.state
                        ? 6
                        : 4
                    }
                    fill={strokeColor}
                  />

                  {/* Show value if hovered */}
                  {hoveredYear === point.Year &&
                    hoveredState === lineData.state && (
                      <text
                        x={xScale(point.Year)}
                        y={yScale(point.Data_value) - 15}
                        textAnchor="middle"
                        fontSize="1em"
                        fontWeight="bold"
                        fill={strokeColor}
                      >
                        {lineData.state}: {point.Data_value.toFixed(1)}
                      </text>
                    )}
                </g>
              ))}
            </g>
          );
        })}

        {/* State labels on the right */}
        {stateLines.map((lineData) => {
          const last = lineData.values[lineData.values.length - 1];
          const lastValue = last?.Data_value ?? 0;
          const textColor = lineColorScale(lineData.state);

          return (
            <text
              key={lineData.state + "-label"}
              x={innerWidth + 5}
              y={yScale(lastValue)}
              fontSize="1em"
              textAnchor="start"
              fill={textColor}
              dominantBaseline="middle"
            >
              {lineData.state}
            </text>
          );
        })}
      </g>
    </svg>
  );
};
