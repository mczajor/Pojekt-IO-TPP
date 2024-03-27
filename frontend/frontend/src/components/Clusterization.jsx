import ClusterChart from "./ClusterChart";
import { useState } from "react";
import { clusterize } from "./Content/pythonConection";
import { clusterizationMethods } from "../operations/clusterizations";

export default function Clusteriazation({ columnsSet }) {
  const [clusters, setClusters] = useState([]);
  const [selectedClusterizeType, setselectedClusterizeType] = useState(0);
  const [plotColumnNames, setPlotColumnNames] = useState("");

  function handleSelectedClusterizeTypeChange(event) {
    setselectedClusterizeType(+event.target.value);
  }

  function convertStrToIntArr(input) {
    const cleanedInput = (input = input.trim().slice(1, -1));
    const numbers = cleanedInput.split(" ").map((element) => parseInt(element));
    setClusters(numbers);
  }

  return (
    <div className="plot-container">
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
      <button
        className="change-btn analize-btn"
        onClick={() => {
          clusterize([...columnsSet], selectedClusterizeType, convertStrToIntArr);
          setPlotColumnNames(
            [...columnsSet].length > 0
              ? [...columnsSet].join(", ")
              : "Uwzględniono wszystkie kolumny"
          );
        }}
      >
        Klasteryzuj
      </button>

      <ClusterChart clusters={clusters} columnNames={plotColumnNames} />
    </div>
  );
}
