import ClusterChart from "./ClusterChart";
import { useState } from "react";
import {
  clusterize,
  suggestClusterNb,
  saveToFile,
  getClusters,
  getClusterMetrics,
  getClusterTendencyScore,
  getEachClusterStatistics
} from "./pythonConection";
import { clusterizationMethods } from "../operations/clusterizations";
import { eachClusterStatisticsType } from "../operations/eachClusterStatisticsType";
import "../styles/cluster.css";

export default function Clusteriazation({
  columnsSet,
  setColumnsSet,
  addColumnsMode,
  setAddColumnsMode,
  normalized,
  updateDataContent,
  updateFileContent_callback,
}) {
  const [clusters, setClusters] = useState([]);
  const [selectedClusterizeType, setselectedClusterizeType] = useState(0);
  const [selectedNbOfClusters, setselectedNbOfClusters] = useState(2);
  const [plotColumnNames, setPlotColumnNames] = useState("");
  const [silhouette, setSilhouette] = useState(undefined);
  const [clusterMetrics, setClusterMetrics] = useState(undefined);
  const [tendecyScore, setTendencyScore] = useState(undefined);
  const [eachClusterStatistics, setEachClusterStatistics] = useState(undefined);
  const [clusterStatisticsType, setClusterStatisticsType] = useState("Mean")

  function handleSilhouette() {
    suggestClusterNb([...columnsSet], selectedClusterizeType, setSilhouette);
  }

  function handleSelectedClusterizeTypeChange(event) {
    setselectedClusterizeType(+event.target.value);
  }

  function handleclusterStatisticsType(event) {
    console.log(event.target.value)
    setClusterStatisticsType(event.target.value);
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

  function loadClasters() {
    if (clusters === null) {
      return;
    }
    if (clusters.length === 0) {
      getClusters(convertStrToIntArr);
    }
    else {
      if (clusterMetrics === undefined && tendecyScore === undefined && eachClusterStatistics === undefined){
        getClusterMetrics(setClusterMetrics);
        getClusterTendencyScore(setTendencyScore);
        getEachClusterStatistics(setEachClusterStatistics);
      }
    }
  }

  loadClasters();

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
          {clusters !== null && clusters.length > 0 && (
            <div className="input-btn-container">
              <button
                onClick={() => saveToFile(true)}
                className="selected-row"
                id="save-btn"
              >
                Zapisz
              </button>
            </div>
          )}
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
                updateDataContent(updateFileContent_callback);
                getClusterMetrics(setClusterMetrics);
                getClusterTendencyScore(setTendencyScore);
  getEachClusterStatistics(setEachClusterStatistics);

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
          {clusters !== null && clusters.length > 0 && (
            <>
              <div className="plot-container">
                <ClusterChart
                  clusters={clusters}
                  columnNames={plotColumnNames}
                />
              </div>
              {clusterMetrics !== undefined && tendecyScore !== undefined && eachClusterStatistics !== undefined &&(
                <>
                <div id="silhouette-info">
                  <p className="silhouette-info">
                  Współczynnik Silhouette:{" "}
                    <span className="highlight">
                      {clusterMetrics["Silhoutte Coefficient"]}
                    </span>
                  </p>
                  <p className="silhouette-info">
                  Indeks Daviesa-Bouldina:{" "}
                    <span className="highlight">
                      {clusterMetrics["Davies-Bouldin index"]}
                    </span>
                  </p>
                  <p className="silhouette-info">
                    Indeks Calińskiego-Harabasza:{" "}
                    <span className="highlight">
                      {clusterMetrics["Calinski-Harabasz index"]}
                    </span>
                  </p>
                  <p className="silhouette-info">
                    Tendency Score:{" "}
                    <span className="highlight">
                      {tendecyScore}
                    </span>
                  </p>
                </div>

                <div id="clusterize-options">
            <div className="input-btn-container">

              <h2>Wybierz statystykę:</h2>
              <select
                value={clusterStatisticsType}
                onChange={(e) => {
                  handleclusterStatisticsType(e);
                }}
              >
                {Object.entries(eachClusterStatisticsType).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
            </div>

                <div id="each-cluster-statistic-container">
                  <table id="pca-table">
                    <thead>
                      <tr>
                        {Object.keys(eachClusterStatistics[0]['Mean']).map(column => (
                          <th key={column}>{column}</th>
                        ))}
                        <th>Cluster Size</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.keys(eachClusterStatistics).map(clusterId => (
                        <tr key={clusterId}>
                          {Object.keys(eachClusterStatistics[clusterId][clusterStatisticsType]).map((columnName, value) =>
                        <td key={columnName+value}>{eachClusterStatistics[clusterId][clusterStatisticsType][columnName]}</td>)}
                        <td>{eachClusterStatistics[clusterId]['Cluster Size']}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                </>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}
