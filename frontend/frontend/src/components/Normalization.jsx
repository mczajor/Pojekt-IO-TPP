import {
  normalize,
  updateContent,
} from "./Content/pythonConection";

import { useState } from "react";
import {
  numericalNormalizationMerhods,
  categoricalNormalizationMerhods,
} from "../operations/normalizations";


export default function Normalization({
  updateFileContent_callback,
  columnsSet,
  setAddColumnsMode,
  setColumnsSet,
  addColumnsMode,
}) {
  const [selectedNumericalNormalization, setSelectedNumericalNormalization] =
    useState(0);
  const [
    selectedCategoricalNormalization,
    setSelectedCategoricalNormalization,
  ] = useState(0);
  
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
              {Object.entries(numericalNormalizationMerhods).map(
                ([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                )
              )}
            </select>
          </div>

          <div className="input-btn-container">
            <h2>Wybierz metodę normalizacji kategorycznej:</h2>
            <select
              value={selectedCategoricalNormalization}
              onChange={handleCategoricalNormalizationChange}
            >
              {Object.entries(categoricalNormalizationMerhods).map(
                ([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                )
              )}
            </select>
          </div>
        </div>

        <div className="buttons-container">
          <button
            className={!addColumnsMode ? "change-btn" : "delete-btn"}
            onClick={() => {
              !addColumnsMode ? setAddColumnsMode(true) : stopAdding();
            }}
          >
            {!addColumnsMode ? "Wybierz kolumny" : "Przerwij wybieranie"}
          </button>

          <button
            id="normalize-btn"
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
      </div>
    </>
  );
}
