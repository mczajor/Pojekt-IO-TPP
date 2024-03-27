import { viualizeData } from "./Content/pythonConection";
import { useState } from "react";
import Plot from "react-plotly.js";

export default function PCA() {
  const [data, setData] = useState({ 'x': [], 'y': [] });

  function vizualize_callback(response) {
    let x = StrToFloatArr(response[0]);
    let y = StrToFloatArr(response[1]);

    setData({'x': x, 'y' : y})
  }

  function StrToFloatArr(input) {
    const cleanedInput = (input = input.trim().slice(1, -1));
    const numbers = cleanedInput
      .split(" ")
      .map((element) => parseFloat(element));
    return numbers;
  }

  return (
    <>
      <div className="plot-container">
        <button
          className="change-btn analize-btn"
          onClick={() => {
            viualizeData(vizualize_callback);
          }}
        >
          Wizualizuj PCA
        </button>

        {data['x'].length > 0 && (
          <>
            <Plot
            data={[
              {
                x: data['x'],
                y: data['y'],
                mode: "markers",
                marker: { color: "blue" },
              },
            ]}
            layout={{
              width: 700,
              height: 500,
              title: "PCA - Principal Component Analysis",
              xaxis: { title: "Principal Component 1" },
              yaxis: { title: "Principal Component 2" },
            }}
          />
          </>
        )}
      </div>
    </>
  );
}
