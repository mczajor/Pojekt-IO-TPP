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
  const [columnName, setColumnName] = useState("");
  const [rowIndex, setRowIndex] = useState(-1);

  function handleColumnClick(column) {
    if (column === columnName) {
      setColumnName("");
    } else {
      setColumnName(column);
    }
    setRowIndex(-1);
  }

  function handleRowClick(row, column) {
    if (row === rowIndex && column === columnName) {
      setColumnName("");
      setRowIndex(-1);
    } else {
      setColumnName(column);
      setRowIndex(row);
    }
  }

  function handleSilhouette() {
    suggestClusterNb([...columnsSet], selectedClusterizeType, setSilhouette);
  }

  function handleSelectedClusterizeTypeChange(event) {
    setselectedClusterizeType(+event.target.value);
  }

  async function handleclusterStatisticsType(event) {
    setClusterStatisticsType(() => event.target.value);
    getEachClusterStatistics(event.target.value, setEachClusterStatistics)
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
        getEachClusterStatistics(clusterStatisticsType, setEachClusterStatistics);
      }
    }
  }
  loadClasters()



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
                getEachClusterStatistics(clusterStatisticsType, setEachClusterStatistics);

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
                        <th onClick={() => handleColumnClick("Cluster ID")}
                        className={("Cluster ID" === columnName && rowIndex === -1 ? "selected-column" : undefined)}>Cluster ID</th>
                        {Object.keys(eachClusterStatistics[0]['Result']).map(column => (
                          <th key={column} onClick={() => handleColumnClick(column)}
                          className={(column === columnName && rowIndex === -1 ? "selected-column" : undefined)}>{column}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {Object.keys(eachClusterStatistics).map(clusterId => (
                        <tr key={clusterId}>
                          <td onClick = {() => handleRowClick(clusterId, "Cluster ID")} 
                          className={("Cluster ID" === columnName && rowIndex === -1 ? "selected-column" : undefined) + " " +
                          (clusterId === rowIndex ? "selected-row" : undefined)}
                          style={{
                            backgroundColor:
                              rowIndex === clusterId &&
                              "Cluster ID" === columnName
                                ? "rgb(68, 190, 59)"
                                : undefined,
                            opacity: 30,
                          }}>{clusterId}
                          </td>
                          {Object.keys(eachClusterStatistics[clusterId]['Result']).map(column =>
                        <td key={column} onClick = {() => handleRowClick(clusterId, column)} 
                        className={(column === columnName && rowIndex === -1 ? "selected-column" : undefined) + " " + 
                      (clusterId === rowIndex ? "selected-row" : undefined)}
                      style={{
                        backgroundColor:
                          rowIndex === clusterId &&
                          column === columnName
                            ? "rgb(68, 190, 59)"
                            : undefined,
                        opacity: 30,
                      }}
                        >{eachClusterStatistics[clusterId]["Result"][column]}</td>)}
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
