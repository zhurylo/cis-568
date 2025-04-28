import React from "react";

export const AppContainer: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => (
  <div
    style={{
      textAlign: "center",
      padding: "0.5rem",
      maxHeight: "100vh",
      width: "100%",
      overflow: "auto",
    }}
  >
    {children}
  </div>
);
