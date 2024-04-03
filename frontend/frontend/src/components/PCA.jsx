import { viualizeData } from "./pythonConection";
import { useState } from "react";
import Plot from "react-plotly.js";
import "../styles/pca.css";

export default function PCA({ normalized }) {
  const [data, setData] = useState({
    columnVector: [],
    eigenvector_1: [],
    eigenvector_2: [],
    x: [],
    y: [],
  });

  function vizualize_callback(response) {
    console.log(response)
    let columnVector = ["Component", ...response["column_vector"]];
    let eigenvector_1 = ["Principal 1", ...response["eigenvector_1"]];
    let eigenvector_2 = ["Principal 2", ...response["eigenvector_2"]];
    let x = response["x"];
    let y = response["y"];

    setData({
      columnVector: columnVector,
      eigenvector_1: eigenvector_1,
      eigenvector_2: eigenvector_2,
      x: x,
      y: y,
    });
  }

  if (data["x"].length === 0 && normalized) {
    viualizeData(vizualize_callback);
  }

  return (
    <div id="main-pca-container">
      {!normalized && (
        <>
          <h1 id="pca-h1">Musisz najpierw znormalizować dane</h1>{" "}
        </>
      )}
      {data["x"].length > 0 && (
        <>
          <div id="plot-pca-sticky">
            <Plot
              className="plot"
              data={[
                {
                  x: data["x"],
                  y: data["y"],
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
          </div>
          <h1 id="pca-h1">Wektory własne Principal Componens</h1>

          <table id="pca-table">
            <thead>
              <tr>
                {data.columnVector.map((item, index) => (
                  <th key={index}>{item}</th>
                ))}
              </tr>
            </thead>

            <tbody>
              <tr>
                {data.eigenvector_1.map((item, index) => (
                  <td key={index} className="data-body">
                    {item}
                  </td>
                ))}
              </tr>
              <tr>
                {data.eigenvector_2.map((item, index) => (
                  <td key={index} className="data-body">
                    {item}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </>
      )}
    </div>
  );
}
