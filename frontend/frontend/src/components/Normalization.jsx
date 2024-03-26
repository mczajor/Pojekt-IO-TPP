import {
  normalize,
  clusterize,
  updateContent,
  viualizeData,
} from "./Content/pythonConection";

import { useState } from "react";

import myImg from "../assets/obraz.png";
import ClusterChart from "./ClusterChart";

export default function Normalization({
  updateFileContent_callback,
  columnsSet,
  setAddColumnsMode,
  setColumnsSet,
  addColumnsMode,
}) {
  const [imagePath, setImagePath] = useState(false);
  const [selectedNumericalNormalization, setSelectedNumericalNormalization] =
    useState(0);
  const [
    selectedCategoricalNormalization,
    setSelectedCategoricalNormalization,
  ] = useState(0);
  const [clusters, setClusters] = useState([]);
  const [selectedClusterizeType, setselectedClusterizeType] =
    useState(0);
  const [plotColumnNames, setPlotColumnNames] = useState("");

  function vizualize_callback(response) {
    setImagePath(true);
  }

  function handleNumericalNormalizationChange(event) {
    setSelectedNumericalNormalization(+event.target.value);
  }

  function handleCategoricalNormalizationChange(event) {
    setSelectedCategoricalNormalization(+event.target.value);
  }

  function handleSelectedClusterizeTypeChange(event) {
    setselectedClusterizeType(+event.target.value)
  }

  function stopAdding() {
    setColumnsSet(new Set());
    setAddColumnsMode(false);
  }

  function convertStrToArr(input) {
    const cleanedInput = (input = input.trim().slice(1, -1));
    const numbers = cleanedInput.split(" ").map((element) => parseInt(element));
    setClusters(numbers);
  }

  return (
    <>
      <div className="normalize-cont">
        <div>
          <div className="input-btn-container">
            <h2>Wybierz metodę normalizacji numerycznej:</h2>
            <select
              value={selectedNumericalNormalization}
              onChange={handleNumericalNormalizationChange}
            >
              <option value="">Wybierz metodę...</option>
              <option value="0">MinMaxScaler</option>
              <option value="1">StandardScaler</option>
            </select>
          </div>

          <div className="input-btn-container">
            <h2>Wybierz metodę normalizacji kategorycznej:</h2>
            <select
              value={selectedCategoricalNormalization}
              onChange={handleCategoricalNormalizationChange}
            >
              <option value="">Wybierz metodę...</option>
              <option value="0">Label</option>
              <option value="1">OneHot</option>
            </select>
          </div>
        </div>

        <button
          id="change-btn"
          className={!addColumnsMode ? "change-btn" : "delete-btn"}
          onClick={() => {
            !addColumnsMode ? setAddColumnsMode(true) : stopAdding();
          }}
        >
          {!addColumnsMode ? "Wybierz kolumny" : "Przerwij wybieranie"}
        </button>

        <button
          id="save-btn"
          className="selected-row"
          onClick={() => {
            normalize(
              [...columnsSet],
              selectedNumericalNormalization,
              selectedCategoricalNormalization
            );
            updateContent(updateFileContent_callback);
            setAddColumnsMode(false);
            setColumnsSet(new Set());
          }}
        >
          Normalizuj
        </button>
      </div>

      <div className="plot-container">
        <button
          className="change-btn analize-btn"
          onClick={() => {
            viualizeData(vizualize_callback);
            updateContent(updateFileContent_callback);
          }}
        >
          Wizualizuj PCA
        </button>

        {imagePath && (
          <>
            <img className="plot" src={myImg} alt="img"></img>
          </>
        )}


        <div className="input-btn-container">
          <h2>Wybierz metodę klasteryzacji:</h2>
          <select
            value={selectedClusterizeType}
            onChange={handleSelectedClusterizeTypeChange}
          >
            <option value="">Wybierz metodę...</option>
            <option value="0">K_Means</option>
            <option value="1">Density</option>
            <option value="2">Agglomerative</option>
            <option value="3">GaussianMixture</option>
            <option value="4">AffinityPropagation</option>
            <option value="5">GaussianMixture</option>
            <option value="6">MeanShift</option>
          </select>
        </div>
        <button
          className="change-btn analize-btn"
          onClick={() => {clusterize([...columnsSet], selectedClusterizeType, convertStrToArr);
          setPlotColumnNames([...columnsSet].length > 0 ? [...columnsSet].join(", ") : "Uwzględniono wszystkie kolumny")}}
        >
          Klasteryzuj
        </button>

        <ClusterChart clusters={clusters} columnNames={plotColumnNames} />
      </div>
    </>
  );
}
