import ClusterChart from "./ClusterChart";
import { useState } from "react";
import { clusterize, suggestClusterNb } from "./pythonConection";
import { clusterizationMethods } from "../operations/clusterizations";
import "../styles/cluster.css";

export default function Clusteriazation({
  columnsSet,
  setColumnsSet,
  addColumnsMode,
  setAddColumnsMode,
  normalized,
}) {
  const [clusters, setClusters] = useState([]);
  const [selectedClusterizeType, setselectedClusterizeType] = useState(0);
  const [selectedNbOfClusters, setselectedNbOfClusters] = useState(2);
  const [plotColumnNames, setPlotColumnNames] = useState("");
  const [silhouette, setSilhouette] = useState(undefined);

  function handleSilhouette() {
    suggestClusterNb([...columnsSet], selectedClusterizeType, setSilhouette);
  }

  function handleSelectedClusterizeTypeChange(event) {
    setselectedClusterizeType(+event.target.value);
  }

  function convertStrToIntArr(input) {
    setClusters(input["clusters"]);
  }

  function handleInputOnChange(event) {
    setselectedNbOfClusters(+event.target.value);
  }

  function stopAdding() {
    setColumnsSet(new Set());
    setAddColumnsMode(false);
  }

  return (
    <div id="clusterize-buttons-container">
      {!normalized && (
        <>
          <h1 id="pca-h1">
            Musisz najpierw znormalizować dane, by podać je klasteryzacji
          </h1>{" "}
        </>
      )}
      {normalized && (
        <>
          <div id="clusterize-options">
            <div className="input-btn-container">
              <h2>Wybierz metodę klasteryzacji:</h2>
              <select
                value={selectedClusterizeType}
                onChange={(e) => {
                  handleSelectedClusterizeTypeChange(e);
                  setSilhouette(undefined);
                }}
              >
                {Object.entries(clusterizationMethods).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            {[0, 2, 3].includes(selectedClusterizeType) && (
              <div className="input-btn-container">
                <h2 id="h2-cluster">Ilość klastrów:</h2>
                <input
                  type="number"
                  value={selectedNbOfClusters}
                  className="change-input"
                  id="cluster-input"
                  onChange={handleInputOnChange}
                />
              </div>
            )}
          </div>

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
                clusterize(
                  [...columnsSet],
                  selectedClusterizeType,
                  convertStrToIntArr,
                  selectedNbOfClusters
                );
                setPlotColumnNames(
                  [...columnsSet].length > 0
                    ? [...columnsSet].join(", ")
                    : "Uwzględniono wszystkie kolumny"
                );
                setAddColumnsMode(false);
                setColumnsSet(new Set());
              }}
            >
              Klasteryzuj
            </button>

            {[0, 2, 3].includes(selectedClusterizeType) && (
              <button
                id="clusterize-btn"
                className="change-btn analize-btn"
                onClick={() => handleSilhouette()}
              >
                Miara Silhouette
              </button>
            )}
            {silhouette !== undefined && (
              <div id="silhouette-info">
                <p className="silhouette-info">
                  Sugerowany podział:{" "}
                  <span className="highlight">
                    {silhouette["num_clusters"]} klastrów
                  </span>
                </p>
                <p className="silhouette-info">
                  Najwyższa miara Silhouette:{" "}
                  <span className="highlight">
                    {silhouette["silhouette_avg"]}
                  </span>
                </p>
              </div>
            )}
          </div>
          <div className="plot-container">
            <ClusterChart clusters={clusters} columnNames={plotColumnNames} />
          </div>
        </>
      )}
    </div>
  );
}
