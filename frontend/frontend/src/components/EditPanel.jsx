import { saveToFile, getColumnType, change_column_type } from "./pythonConection";
import { columnTypes } from "../operations/columnTypes";
import { useState } from "react";

export default function EditPanel({
  editMode,
  tempColumnName,
  selectedColumnName,
  confirmChanges,
  deleteColumn,
  newValue,
  handleInputValues,
  handleNewValue,
  changeValue,
  selectedCurrentRowIndex,
  deleteRow,
  setNormalized,
}) {
  const [currentType, setCurrentType] = useState(undefined);
  const [changedType, setChangedType] = useState(0);

  
  function handleChangedType(event) {
    setChangedType(+event.target.value);
  }


  return (
    <>
      {editMode && (
        <>
          {selectedCurrentRowIndex === -1 && (
            <>
              {getColumnType(tempColumnName, setCurrentType)}
              <div className="input-btn-container">
                <input
                  type="text"
                  value={tempColumnName}
                  onChange={handleInputValues}
                  className="change-input"
                />
                <button
                  onClick={() => {
                    confirmChanges();
                    setNormalized(false);
                  }}
                  className="change-btn"
                >
                  Zmień nazwę
                </button>
                <button
                  onClick={() => {
                    deleteColumn(tempColumnName);
                    setNormalized(false);
                  }}
                  className="delete-btn"
                >
                  Usuń kolumnę
                </button>
              </div>

              <div className="input-btn-container">
              <h2 >Typ: {currentType}</h2>
              <select
                value={changedType}
                onChange={handleChangedType}
              >
                {Object.entries(columnTypes).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>

              <button
                  onClick={() => {
                    change_column_type(tempColumnName, changedType);
                    getColumnType(tempColumnName, setCurrentType);
                    setNormalized(false)
                  }}
                  className="change-btn"
                  id = "change-type-btn"
                >
                  Zmień typ
                </button>
            </div>
            </>
          )}
          {selectedCurrentRowIndex !== -1 && (
            <div className="input-btn-container">
              <input
                type="text"
                value={newValue}
                placeholder={
                  "(" +
                  selectedCurrentRowIndex +
                  ", " +
                  selectedColumnName +
                  ")"
                }
                onChange={handleNewValue}
                className="change-input"
              />
              <button
                onClick={() => {
                  changeValue();
                  setNormalized(false);
                }}
                className="change-btn"
              >
                Zmień wartość
              </button>
              {selectedCurrentRowIndex !== -1 && (
                <button
                  onClick={() => {
                    deleteRow();
                    setNormalized(false);
                  }}
                  className="delete-btn"
                >
                  Usuń rząd: {selectedCurrentRowIndex}
                </button>
              )}
            </div>
          )}
        </>
      )}

      <div className="input-btn-container">
        <button onClick={saveToFile} className="selected-row" id="save-btn">
          Zapisz
        </button>
      </div>
    </>
  );
}
