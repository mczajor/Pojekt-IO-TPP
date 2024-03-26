import {
  normalize,
  clusterize,
  updateContent,
  viualizeData,
} from "./Content/pythonConection";

import { useState } from "react";

import myImg from "../assets/obraz.png";

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

  function vizualize_callback(response) {
    setImagePath(true);
  }

  function handleNumericalNormalizationChange(event) {
    setSelectedNumericalNormalization(+event.target.value);
  }

  function handleCategoricalNormalizationChange(event) {
    setSelectedCategoricalNormalization(+event.target.value);
  }

  function stopAdding() {
    setColumnsSet(new Set());
    setAddColumnsMode(false);
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
          {!addColumnsMode ? "Dodaj kolumny" : "Przerwij dodawanie"}
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
          id="vizualize-btn"
          className="change-btn"
          onClick={() => {
            viualizeData(vizualize_callback);
            updateContent(updateFileContent_callback);
          }}
        >
          Wizualizuj
        </button>
        {imagePath && <img className="plot" src={myImg} alt="img"></img>}
      </div>
    </>
  );
}
