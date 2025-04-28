import React from "react";

interface FilterControlsProps {
  selectedYear: string;
  selectedClass: string;
  selectedTopic: string;
  selectedQuestion?: string;
  selectedResponse?: string;
  yearOptions: string[];
  classOptions: string[];
  topicOptions: string[];
  questionOptions: string[];
  responseOptions: string[];
  setSelectedYear: (year: string) => void;
  setSelectedClass: (className: string) => void;
  setSelectedTopic: (topic: string) => void;
  setSelectedQuestion: (question: string | undefined) => void;
  setSelectedResponse: (response: string | undefined) => void;
  moveYear: (delta: number) => void;
}

export const FilterControls: React.FC<FilterControlsProps> = ({
  selectedYear,
  selectedClass,
  selectedTopic,
  selectedQuestion,
  selectedResponse,
  yearOptions,
  classOptions,
  topicOptions,
  questionOptions,
  responseOptions,
  setSelectedYear,
  setSelectedClass,
  setSelectedTopic,
  setSelectedQuestion,
  setSelectedResponse,
  moveYear,
}) => {
  return (
    <div style={{ marginBottom: "0.5rem" }}>
      {/* FIRST ROW */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexWrap: "wrap",
          gap: "0.5rem",
          marginBottom: "0.5rem",
        }}
      >
        {/* Year */}
        <div style={{ display: "flex", alignItems: "center" }}>
          <button
            onClick={() => moveYear(-1)}
            style={{ marginRight: "0.25rem" }}
          >
            ◀
          </button>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
          >
            <option value="">Year</option>
            {yearOptions.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
          <button onClick={() => moveYear(1)} style={{ marginLeft: "0.25rem" }}>
            ▶
          </button>
        </div>

        {/* Class */}
        <select
          disabled={!selectedYear}
          value={selectedClass}
          onChange={(e) => setSelectedClass(e.target.value)}
        >
          <option value="">Class</option>
          {classOptions.map((classItem) => (
            <option key={classItem} value={classItem}>
              {classItem}
            </option>
          ))}
        </select>

        {/* Topic */}
        <select
          disabled={!selectedYear || !selectedClass}
          value={selectedTopic}
          onChange={(e) => setSelectedTopic(e.target.value)}
        >
          <option value="">Topic</option>
          {topicOptions.map((topic) => (
            <option key={topic} value={topic}>
              {topic}
            </option>
          ))}
        </select>
      </div>

      {/* SECOND ROW */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          flexWrap: "wrap",
          gap: "0.5rem",
        }}
      >
        {/* Question */}
        <select
          disabled={!selectedYear || !selectedClass || !selectedTopic}
          value={selectedQuestion ?? ""}
          onChange={(e) => setSelectedQuestion(e.target.value || undefined)}
          style={{ width: "45%" }}
        >
          <option value="">Question</option>
          {questionOptions.map((question) => (
            <option key={question} value={question}>
              {question}
            </option>
          ))}
        </select>

        {/* Response */}
        <select
          disabled={
            !selectedYear ||
            !selectedClass ||
            !selectedTopic ||
            !selectedQuestion
          }
          value={selectedResponse ?? ""}
          onChange={(e) => setSelectedResponse(e.target.value || undefined)}
          style={{ width: "45%" }}
        >
          <option value="">Response</option>
          {responseOptions.map((response) => (
            <option key={response} value={response}>
              {response}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};
