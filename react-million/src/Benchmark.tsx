import { useState } from "react";
import { block } from "million/react";

const ITEM_COUNT = 1000;

export const Benchmark = block(() => {
  const [count, setCount] = useState(0);

  return (
    <div style={{ padding: "20px" }}>
      <button
        onClick={() => setCount((c) => c + 1)}
        style={{
          padding: "10px 20px",
          fontSize: "16px",
          marginBottom: "20px",
        }}
      >
        Update ({count})
      </button>

      <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
        {Array.from({ length: ITEM_COUNT }, (_, i) => (
          <span key={i} style={{ fontSize: "12px" }}>
            Item {i + count}
          </span>
        ))}
      </div>
    </div>
  );
});

export function BenchmarkWithoutBlock() {
  const [count, setCount] = useState(0);

  return (
    <div style={{ padding: "20px" }}>
      <button
        onClick={() => setCount((c) => c + 1)}
        style={{
          padding: "10px 20px",
          fontSize: "16px",
          marginBottom: "20px",
        }}
      >
        Update ({count})
      </button>

      <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
        {Array.from({ length: ITEM_COUNT }, (_, i) => (
          <span key={i} style={{ fontSize: "12px" }}>
            Item {i + count}
          </span>
        ))}
      </div>
    </div>
  );
}
