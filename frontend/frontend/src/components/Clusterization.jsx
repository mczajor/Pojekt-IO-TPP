import ClusterChart from "./ClusterChart";
import { useState } from "react";
import { clusterize } from "./pythonConection";
import { clusterizationMethods } from "../operations/clusterizations";
import "../styles/cluster.css";

export default function Clusteriazation({
  columnsSet,
  setColumnsSet,
  addColumnsMode,
  setAddColumnsMode,
}) {
  const [clusters, setClusters] = useState([]);
  const [selectedClusterizeType, setselectedClusterizeType] = useState(0);
  const [selectedNbOfClusters, setselectedNbOfClusters] = useState(2);
  const [plotColumnNames, setPlotColumnNames] = useState("");

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
      <div id="clusterize-options">
        <div className="input-btn-container">
          <h2>Wybierz metodę klasteryzacji:</h2>
          <select
            value={selectedClusterizeType}
            onChange={handleSelectedClusterizeTypeChange}
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
      </div>
      <div className="plot-container">
        <ClusterChart clusters={clusters} columnNames={plotColumnNames} />
      </div>
    </div>
  );
}
