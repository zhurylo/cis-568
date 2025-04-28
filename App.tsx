import React, { useState, useEffect, useMemo, useRef } from "react";

import { csv, json, scaleQuantize } from "d3";
import { geoPath, geoAlbersUsa } from "d3-geo";
import { zoom, ZoomBehavior } from "d3-zoom";
import { select } from "d3-selection";
import { schemeBlues } from "d3-scale-chromatic";

import type { Topology } from "topojson-specification";
import { feature } from "topojson-client";
import type { Feature, Geometry } from "geojson";

import { MapPaths } from "./components/MapPaths";
import { BarChart } from "./components/BarChart";
import { FilterControls } from "./components/FilterControls";
import { ColorScaleLegend } from "./components/ColorScaleLegend";

import { FloatingLabels } from "./components/FloatingLabels";
import { AppContainer } from "./components/AppContainer";
import { LineChart } from "./components/LineChart";

interface DataRow {
  Year: string;
  Class: string;
  Topic: string;
  Question: string;
  Response: string;
  State: string;
  Data_value: number;
  SampleSizeGroup?: number;
  ConfidenceLimitLow?: number;
  ConfidenceIntervalHigh?: number;
}

export interface HoveredStateInfo {
  name: string;
  dataValue: number;
  sampleSize?: number;
  ciLow?: number;
  ciHigh?: number;
}

const App: React.FC = () => {
  const svgRef = useRef<SVGSVGElement>(null);

  const [zoomScale, setZoomScale] = useState<number>(1);
  const zoomBehaviorRef = useRef<ZoomBehavior<SVGSVGElement, unknown> | null>(
    null
  );

  const [data, setData] = useState<DataRow[]>([]);
  const [states, setStates] = useState<Feature<Geometry, any>[]>([]);

  const [hoveredState, setHoveredState] = useState<HoveredStateInfo | null>(
    null
  );

  const [selectedStates, setSelectedStates] = useState<string[]>([]);
  const highlightedStates = selectedStates.slice(-2);

  // // State for selected filters
  // const [selectedYear, setSelectedYear] = useState<string | undefined>(
  //   undefined
  // );
  // const [selectedClass, setSelectedClass] = useState<string | undefined>(
  //   undefined
  // );
  // const [selectedTopic, setSelectedTopic] = useState("");

  // const [selectedQuestion, setSelectedQuestion] = useState<string | undefined>(
  //   undefined
  // );

  // const [selectedResponse, setSelectedResponse] = useState<string | undefined>(
  //   undefined
  // );

  // const [selectedYear, setSelectedYear] = useState<string>("2022");
  // const [selectedClass, setSelectedClass] = useState<string>(
  //   "Alcohol Consumption"
  // );
  // const [selectedTopic, setSelectedTopic] = useState<string>("Binge Drinking");
  // const [selectedQuestion, setSelectedQuestion] = useState<string | undefined>(
  //   "Adults who have had at least one drink of alcohol within the past 30 days"
  // );
  // const [selectedResponse, setSelectedResponse] = useState<string | undefined>(
  //   "Yes"
  // );

  const [selectedYear, setSelectedYear] = useState<string>("2022");
  const [selectedClass, setSelectedClass] = useState<string>(
    "Colorectal Cancer Screening"
  );
  const [selectedTopic, setSelectedTopic] = useState<string>(
    "USPSTF Recommendations"
  );
  const [selectedQuestion, setSelectedQuestion] = useState<string | undefined>(
    "Respondents aged 45-75 who have fully met the USPSTF recommendation (variable calculated from one or more BRFSS questions)"
  );
  const [selectedResponse, setSelectedResponse] = useState<string | undefined>(
    "Received one or more of the recommended CRC tests within the recommended time interval"
  );

  const topologyJson =
    "https://cdn.jsdelivr.net/npm/us-atlas@3/counties-10m.json";

  useEffect(() => {
    json<Topology>(topologyJson)
      .then((topology) => {
        if (!topology) {
          throw new Error("Failed to load topology data");
        }

        const statesObject = topology.objects?.states;
        if (!statesObject) {
          throw new Error("States object not found in topology");
        }

        const geo = feature(topology, statesObject);
        if (!geo || geo.type !== "FeatureCollection") {
          throw new Error("Map data is not a FeatureCollection");
        }

        setStates(geo.features);
      })
      .catch((err) => {
        console.error("Error loading USA states map:", err);
      });
  }, []);

  useEffect(() => {
    setSelectedStates([]);
    setHoveredState(null);
    setSelectedClass("");
    setSelectedTopic("");
    setSelectedQuestion(undefined);
    setSelectedResponse(undefined);
  }, [selectedYear]);

  useEffect(() => {
    if (!svgRef.current) return;

    const svg = select(svgRef.current);
    const g = svg.select<SVGGElement>("g");

    const zoomBehavior = zoom<SVGSVGElement, unknown>()
      .scaleExtent([1, 8])
      .translateExtent([
        [0, 0],
        [width, height],
      ])
      .on("zoom", (event) => {
        g.attr("transform", event.transform);
        setZoomScale(event.transform.k);
      });

    svg.call(zoomBehavior);
    zoomBehaviorRef.current = zoomBehavior;
  }, []);

  // Load CSV data on component mount
  useEffect(() => {
    csv<DataRow>(`${import.meta.env.BASE_URL}data.csv`, (row) => {
      return {
        Year: row.Year!,
        Class: row.Class!,
        Topic: row.Topic!,
        Question: row.Question!,
        Response: row.Response!,
        State: row.Locationdesc!,
        Data_value: +row.Data_value!,
        SampleSizeGroup: row.Sample_Size ? +row.Sample_Size : undefined,
        ConfidenceLimitLow: row.Confidence_limit_Low
          ? +row.Confidence_limit_Low
          : undefined,
        ConfidenceIntervalHigh: row.Confidence_limit_High
          ? +row.Confidence_limit_High
          : undefined,
      };
    })
      .then((loadedData) => {
        setData(loadedData);
      })
      .catch((err) => {
        console.error("Error loading CSV data:", err);
      });
  }, []);

  // Prepare unique values for dropdowns when data is loaded
  const yearOptions = useMemo(() => {
    const years = new Set<string>();
    data.forEach((d) => years.add(d.Year));
    return Array.from(years).sort();
  }, [data]);

  const classOptions = useMemo(() => {
    if (!selectedYear) return []; // No year selected → no class options yet

    const classes = new Set<string>();
    data.forEach((d) => {
      if (d.Year === selectedYear) {
        classes.add(d.Class);
      }
    });
    return Array.from(classes).sort();
  }, [data, selectedYear]);

  const topicOptions = useMemo(() => {
    if (!selectedYear || !selectedClass) return []; // No year/class selected → no topics yet

    const topics = new Set<string>();
    data.forEach((d) => {
      if (d.Year === selectedYear && d.Class === selectedClass) {
        topics.add(d.Topic);
      }
    });
    return Array.from(topics).sort();
  }, [data, selectedYear, selectedClass]);

  const questionOptions = useMemo(() => {
    if (!selectedYear || !selectedClass || !selectedTopic) return [];

    const questions = new Set<string>();
    data.forEach((d) => {
      if (
        d.Year === selectedYear &&
        d.Class === selectedClass &&
        d.Topic === selectedTopic
      ) {
        questions.add(d.Question);
      }
    });
    return Array.from(questions).sort();
  }, [data, selectedYear, selectedClass, selectedTopic]);

  const responseOptions = useMemo(() => {
    if (!selectedYear || !selectedClass || !selectedTopic || !selectedQuestion)
      return [];

    const responses = new Set<string>();
    data.forEach((d) => {
      if (
        d.Year === selectedYear &&
        d.Class === selectedClass &&
        d.Topic === selectedTopic &&
        d.Question === selectedQuestion
      ) {
        responses.add(d.Response);
      }
    });
    return Array.from(responses).sort();
  }, [data, selectedYear, selectedClass, selectedTopic, selectedQuestion]);

  // Determine if all selections are made
  const allSelected =
    selectedYear !== undefined &&
    selectedClass !== "" &&
    selectedTopic !== "" &&
    selectedQuestion !== undefined &&
    selectedResponse !== undefined;

  // Filter data for the selected Year, Class, and Topic (if all selected)
  // 1. BarChart data - filter by year (for map + bar chart)
  const filteredData = useMemo(() => {
    if (!allSelected) return [];

    return data.filter(
      (d) =>
        d.Year === selectedYear &&
        d.Class === selectedClass &&
        d.Topic === selectedTopic &&
        d.Question === selectedQuestion &&
        d.Response === selectedResponse
    );
  }, [
    allSelected,
    data,
    selectedYear,
    selectedClass,
    selectedTopic,
    selectedQuestion,
    selectedResponse,
  ]);

  // 2. LineChart data - DO NOT filter by year
  const lineChartData = useMemo(() => {
    if (
      selectedClass &&
      selectedTopic &&
      selectedQuestion &&
      selectedResponse
    ) {
      const result = data.filter(
        (d) =>
          d.Class === selectedClass &&
          d.Topic === selectedTopic &&
          d.Question === selectedQuestion &&
          d.Response === selectedResponse &&
          highlightedStates.includes(d.State)
      );

      if (highlightedStates.length === 2) {
        console.log(
          "Line Chart Data (ALL YEARS, after 2 states selected):",
          result
        );
      }

      return result;
    }
    return [];
  }, [
    data,
    selectedClass,
    selectedTopic,
    selectedQuestion,
    selectedResponse,
    highlightedStates,
  ]);

  // Create a lookup map of State -> Data_value for the filtered data
  const valueByState = useMemo(() => {
    const map = new Map<string, number>();

    const counts = new Map<string, number>();

    filteredData.forEach((d) => {
      const state = d.State;
      if (!map.has(state)) {
        map.set(state, d.Data_value);
        counts.set(state, 1);
      } else {
        map.set(state, map.get(state)! + d.Data_value);
        counts.set(state, counts.get(state)! + 1);
      }
    });

    // Now divide sum by count for average
    counts.forEach((count, state) => {
      map.set(state, map.get(state)! / count);
    });

    return map;
  }, [filteredData]);

  // Compute color scale for the filtered data values
  const colorScale = useMemo(() => {
    if (!allSelected || valueByState.size === 0) {
      return null;
    }

    const values = Array.from(valueByState.values());
    const minVal = Math.min(...values);
    const maxVal = Math.max(...values);

    return scaleQuantize<string>()
      .domain([minVal, maxVal * 1.05])
      .range(schemeBlues[9]);
  }, [allSelected, valueByState]);

  function zoomIn() {
    if (!svgRef.current || !zoomBehaviorRef.current) return;
    const svg = select(svgRef.current);
    svg.transition().call(zoomBehaviorRef.current.scaleBy as any, 1.2);
  }

  function zoomOut() {
    if (!svgRef.current || !zoomBehaviorRef.current) return;
    const svg = select(svgRef.current);
    svg.transition().call(zoomBehaviorRef.current.scaleBy as any, 0.8);
  }

  // Set up projection and path generator for the map
  const width = 975;
  const height = 610;
  const projection = useMemo(
    () => geoAlbersUsa().scale(1300).translate([487.5, 305]),
    []
  );
  const pathGenerator = useMemo(() => geoPath(projection), [projection]);

  const sortedData = useMemo(() => {
    return [...filteredData].sort((a, b) => b.Data_value - a.Data_value);
  }, [filteredData]);

  const maxPrevalence = Math.max(...filteredData.map((d) => d.Data_value));

  function moveYear(delta: number) {
    const years = yearOptions.map(Number).sort((a, b) => a - b);
    const current = Number(selectedYear);

    const index = years.indexOf(current);
    if (index === -1) return; // Not found

    const newIndex = index + delta;
    if (newIndex >= 0 && newIndex < years.length) {
      setSelectedYear(String(years[newIndex]));
    }
  }

  function handleSelectState(stateName: string) {
    setSelectedStates((prev) => {
      const alreadySelected = prev.includes(stateName);

      if (alreadySelected && prev.length <= 1) {
        // If it was already selected but now no longer highlighted, allow it
        return [stateName];
      }

      if (alreadySelected) {
        return prev; // Prevent double-click immediately
      }

      if (prev.length < 3) {
        return [...prev, stateName];
      } else {
        return [...prev.slice(1), stateName];
      }
    });
  }

  return (
    <AppContainer>
      <h2>Behavioral Risk Factor Surveillance System Analyzer </h2>

      <FilterControls
        selectedYear={selectedYear}
        selectedClass={selectedClass}
        selectedTopic={selectedTopic}
        selectedQuestion={selectedQuestion}
        selectedResponse={selectedResponse}
        yearOptions={yearOptions}
        classOptions={classOptions}
        topicOptions={topicOptions}
        questionOptions={questionOptions}
        responseOptions={responseOptions}
        setSelectedYear={setSelectedYear}
        setSelectedClass={setSelectedClass}
        setSelectedTopic={setSelectedTopic}
        setSelectedQuestion={setSelectedQuestion}
        setSelectedResponse={setSelectedResponse}
        moveYear={moveYear}
      />

      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "flex-start",
          gap: "1rem",
          marginTop: "1rem",
          flexWrap: "wrap",
        }}
      >
        {/* LEFT: Color Scale */}
        {allSelected && colorScale && (
          <div
            style={{
              flex: "0 0 auto",
              height: height,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <ColorScaleLegend colorScale={colorScale} />
          </div>
        )}

        {/* MIDDLE: Map */}
        <div style={{ flex: "2", minWidth: "600px", maxWidth: "1000px" }}>
          <svg
            ref={svgRef}
            viewBox={`0 0 ${width} ${height}`}
            width={width}
            style={{
              width: "100%",
              height: "auto",
              backgroundColor: "white",
              border: "1px solid #ccc",
            }}
          >
            {/* Zoomable group */}
            <g>
              <MapPaths
                states={states}
                valueByState={valueByState}
                colorScale={colorScale}
                allSelected={allSelected}
                pathGenerator={pathGenerator}
                hoveredState={hoveredState?.name ?? null}
                selectedStates={highlightedStates}
                setHoveredState={(stateName) => {
                  if (stateName) {
                    setHoveredState({ name: stateName, dataValue: 0 });
                  } else {
                    setHoveredState(null);
                  }
                }}
                handleSelectState={handleSelectState}
              />
            </g>

            <FloatingLabels
              hoveredState={hoveredState?.name ?? null}
              selectedStates={highlightedStates}
              width={width}
            />
          </svg>

          {/* Zoom Controls */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              marginTop: "0.5rem",
              justifyContent: "center",
            }}
          >
            <button onClick={() => zoomIn()}>+</button>
            <button onClick={() => zoomOut()}>−</button>
            <span style={{ fontSize: "0.9rem" }}>
              Zoom: {zoomScale.toFixed(1)}x
            </span>
          </div>
        </div>

        {/* RIGHT: Bar Chart */}
        <div
          style={{
            flex: "1",
            minWidth: "300px",
            maxWidth: "600px",
            height: "600px",
            overflowY: "auto",
            backgroundColor: "#fafafa",
            border: "1px solid #ccc",
            WebkitOverflowScrolling: "touch",
          }}
        >
          <svg
            viewBox={`0 0 ${width} ${sortedData.length * 45}`}
            style={{
              width: "100%",
            }}
          >
            <BarChart
              sortedData={sortedData}
              colorScale={colorScale}
              width={width}
              maxPrevalence={maxPrevalence}
              highlightedStates={highlightedStates}
              handleSelectState={handleSelectState}
            />
          </svg>
        </div>
      </div>

      <div style={{ marginTop: "2rem" }}>
        <h3>Yearly Comparison</h3>
        <LineChart
          selectedStates={highlightedStates}
          data={lineChartData}
          width={1200}
          height={300}
        />
      </div>

      {/* Info message when data is not yet displayed */}
      {!allSelected && (
        <p style={{ color: "#555", marginTop: "0.5rem" }}>
          Please select a Year, Class, and Topic to display the choropleth.
        </p>
      )}
    </AppContainer>
  );
};

export default App;
