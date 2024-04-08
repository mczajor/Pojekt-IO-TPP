import { normalize } from "./pythonConection";

import { useState } from "react";
import {
  numericalNormalizationMerhods,
  categoricalNormalizationMerhods,
} from "../operations/normalizations";

export default function Normalization({
  updateFileContent_callback,
  updateDataContent,
  setNormalized,
}) {
  const [selectedNumericalNormalization, setSelectedNumericalNormalization] =
    useState(0);
  const [
    selectedCategoricalNormalization,
    setSelectedCategoricalNormalization,
  ] = useState(0);

  const [errorColumns, setErrorColumns] = useState("");

  function handleError_callback(error) {
    if (typeof error !== 'string') {
      setNormalized(true);
      return
    }
    let errorType = error.substring(0, 2);
    if (errorType === "E0" || errorType === "E1") {
      setErrorColumns(error.substring(2));
      setNormalized(false)
    }
  }

  function handleNumericalNormalizationChange(event) {
    setSelectedNumericalNormalization(+event.target.value);
  }

  function handleCategoricalNormalizationChange(event) {
    setSelectedCategoricalNormalization(+event.target.value);
  }

  return (
    <>
      {errorColumns === "" && (
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
              id="normalize-btn"
              className="selected-row"
              onClick={() => {
                normalize(
                  selectedNumericalNormalization,
                  selectedCategoricalNormalization,
                  handleError_callback
                );
                updateDataContent(updateFileContent_callback);
              }}
            >
              Normalizuj
            </button>
          </div>
        </div>
      )}
      {errorColumns !== "" && (
        <h2>Nie można znormalizować, gdyż wykryto brakujące wartości w kolumnie: {errorColumns}</h2>
      )}
    </>
  );
}
