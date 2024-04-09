import { viualizeData } from "./pythonConection";
import { useState } from "react";
import Plot from "react-plotly.js";
import "../styles/pca.css";
import PCATable from "./PCATable";
import PCAChart from "./PCAChart";
import VectorChart from "./VectorChart";

export default function PCA({
  normalized,
  columnsSet,
  setColumnsSet,
  addColumnsMode,
  setAddColumnsMode,
}) {
  const [data, setData] = useState({
    columnVector: [],
    eigenvector_1: [],
    eigenvector_2: [],
    x: [],
    y: [],
    pc_explains: [],
    contributions_pc1: [],
    contributions_pc2: []
  });

  function vizualize_callback(response) {
    let columnVector = response["column_vector"];
    let eigenvector_1 = response["eigenvector_1"];
    let eigenvector_2 = response["eigenvector_2"];
    let x = response["x"];
    let y = response["y"];
    let pc_explains = response["pc_explains"];
    let contributions_pc1 = response["contributions_pc1"];
    let contributions_pc2 = response["contributions_pc2"];
   
    setData({
      columnVector: columnVector,
      eigenvector_1: eigenvector_1,
      eigenvector_2: eigenvector_2,
      x: x,
      y: y,
      pc_explains: pc_explains,
      contributions_pc1: contributions_pc1,
      contributions_pc2: contributions_pc2
    });
  }

  function stopAdding() {
    setColumnsSet(new Set());
    setAddColumnsMode(false);
  }

  return (
    <div id="main-pca-container">
      {!normalized && (
        <>
          <h1 id="pca-h1">Musisz najpierw znormalizować dane</h1>{" "}
        </>
      )}
      {normalized && (
        <div id="clusterize-btn-container" className="buttons-container">
          <button
            className={!addColumnsMode ? "change-btn" : "delete-btn"}
            onClick={() => {
              !addColumnsMode ? setAddColumnsMode(true) : stopAdding();
            }}
          >
            {!addColumnsMode ? "Wybierz kolumny" : "Przerwij wybieranie"}
          </button>

          <button
            id="clusterize-btn"
            className="change-btn analize-btn"
            onClick={() => {
              viualizeData([...columnsSet], vizualize_callback);
              setAddColumnsMode(false);
              setColumnsSet(new Set());
            }}
          >
            Wizualizuj
          </button>
        </div>
      )}
      {data["x"].length > 0 && (
      <>
        <div id="pca-results-container">
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
          <PCATable title="Wektory własne Principal Components" columnVector={data.columnVector} firstRow={data.eigenvector_1} secondRow={data.eigenvector_2} />
        </div>
        <VectorChart columnVector = {data.columnVector} xData={data.eigenvector_1} yData={data.eigenvector_2}></VectorChart>

        <div id="silhouette-info"> 
          <p className="silhouette-info">Principal Component 1 wyjaśnia <span className="highlight">{data.pc_explains[0]}% </span>wariancji</p>
          <p className="silhouette-info">Principal Component 2 wyjaśnia <span className="highlight">{data.pc_explains[1]}% </span>wariancji</p>
          <p className="silhouette-info">Principal Components wyjaśniają razem <span className="highlight">{data.pc_explains[0] + data.pc_explains[1]}%</span> wariancji</p>
        </div>

        <div id="pca-results-container">
          <PCATable title="Wpływ zmiennych na Princpal Components" columnVector={data.columnVector} firstRow={data.contributions_pc1} secondRow={data.contributions_pc2} addToFrame="%" />
        </div>

          <div id="plot-pca-sticky">
            <PCAChart title="Wpływ na Principal Component 1" columnVector={data.columnVector} yVector={data.contributions_pc1} color="red"/>
          </div>
          <div id="plot-pca-sticky">
            <PCAChart title="Wpływ na Principal Component 2" columnVector={data.columnVector} yVector={data.contributions_pc2} color="blue"/>
          </div>
      </>
      )}
    </div>
  );
}
