import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";
import { Benchmark, BenchmarkWithoutBlock } from "./Benchmark";

function App() {
  const [showBenchmark, setShowBenchmark] = useState(false);

  return (
    <>
      <div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React + Million.js</h1>
      <div className="card">
        <button onClick={() => setShowBenchmark(!showBenchmark)}>
          {showBenchmark ? "Hide" : "Show"} Benchmark
        </button>
      </div>
      {showBenchmark && (
        <div style={{ display: "flex", gap: "20px", textAlign: "left" }}>
          <div style={{ flex: 1 }}>
            <h3>With Million.js</h3>
            <Benchmark />
          </div>
          <div style={{ flex: 1 }}>
            <h3>Without Million.js</h3>
            <BenchmarkWithoutBlock />
          </div>
        </div>
      )}
    </>
  );
}

export default App;
