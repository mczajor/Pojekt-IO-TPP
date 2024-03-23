import React, { useState } from "react";
import {
  updateContent,
  renameColumn,
  removeColumn,
  removeRow,
  modifyValueAt,
  saveToFile,
  loadFile,
} from "./pythonConection.js";
import "../../styles/data_view.css";
import "../../styles/change_data.css";

export default function Content() {
  const [selectedFileName, setSelectedFileName] = useState(undefined);
  const [fileContent, setFileContent] = useState([]);
  const [editMode, setEditMode] = useState(false);
  const [selectedColumnName, setSelectedColumnName] = useState("");
  const [tempColumnName, setTempColumnName] = useState("");
  const [selectedRowIndex, setSelectedRowIndex] = useState(-1);
  const [newValue, setNewValue] = useState("");

  async function handleClick() {
    loadFile((filePath) => setSelectedFileName(filePath.split("/").pop()));

    updateContent(updateFileContent_callback);
  }

  function updateFileContent_callback(dataString) {
    let data = JSON.parse(dataString);
    setFileContent(data);
  }

  function changeName(currentValue) {
    setEditMode(true);
    setSelectedRowIndex(-1);
    setSelectedColumnName(currentValue);
    setTempColumnName(currentValue);
  }

  function handleInputValues(event) {
    setTempColumnName(event.target.value);
  }

  function confirmChanges() {
    renameColumn(selectedColumnName, tempColumnName);
    updateContent(updateFileContent_callback);
  }

  function deleteColumn(columnName) {
    removeColumn(columnName);
    updateContent(updateFileContent_callback);
    setEditMode(false);
    setTempColumnName("");
    setSelectedColumnName("");
  }

  function deleteRow() {
    removeRow(+selectedRowIndex); // konwerujemy na int
    setEditMode(false);
    setSelectedRowIndex(-1);
    updateContent(updateFileContent_callback);
  }

  function clickFrame(row, column) {
    setSelectedRowIndex(+row);
    changeName(column);
  }

  function handleNewValue(event) {
    setNewValue(event.target.value);
  }

  function changeValue() {
    modifyValueAt(+selectedRowIndex, selectedColumnName, newValue); //konwerujemy na int
    updateContent(updateFileContent_callback);
    setNewValue("");
  }
  const columnNames = Object.keys(fileContent);

  let content = (
    <div id="main-container">
      <button id="add-btn" onClick={handleClick}>
        +<p>Dodaj plik by rozpocząć analizę</p>
      </button>
    </div>
  );

  if (selectedFileName !== undefined) {
    content = (
      <>
        <div id="main-container">
          <div id="file-name">
            <p>Wybrany plik: {selectedFileName}</p>
          </div>
          {Object.keys(fileContent).length > 0 && (
            <table>
              <thead>
                <tr>
                  {Object.keys(fileContent).map((column) => (
                    <th key={column} onClick={() => changeName(column)}>
                      {column}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  ...Array(Object.keys(fileContent[columnNames[0]]).length),
                ].map((_, rowIndex) => (
                  <tr
                    key={rowIndex}
                    onClick={() =>
                      setSelectedRowIndex(
                        +Object.keys(fileContent[columnNames[0]])[rowIndex]
                      )
                    }
                  >
                    {columnNames.map((column) => (
                      <td
                        key={`${column}_${rowIndex}`}
                        onClick={() =>
                          clickFrame(
                            Object.keys(fileContent[columnNames[0]])[rowIndex],
                            column
                          )
                        }
                        className={
                          (rowIndex === selectedRowIndex
                            ? "selected-row "
                            : "") +
                          " " +
                          (column === selectedColumnName &&
                          selectedRowIndex == -1
                            ? "selected-column"
                            : "")
                        }
                        style={{
                          backgroundColor:
                            selectedRowIndex === rowIndex &&
                            column === selectedColumnName
                              ? "rgb(68, 190, 59)"
                              : undefined,
                          opacity: 30,
                        }}
                      >
                        {
                          fileContent[column][
                            Object.keys(fileContent[columnNames[0]])[rowIndex]
                          ]
                        }
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div id="change-container">
          {editMode && (
            <>
              <div className="input-btn-container">
                <input
                  type="text"
                  value={tempColumnName}
                  onChange={handleInputValues}
                  className="change-input"
                />
                <button onClick={confirmChanges} className="change-btn">
                  Zmień nazwę
                </button>
                <button
                  onClick={() => deleteColumn(tempColumnName)}
                  className="delete-btn"
                >
                  Usuń kolumnę
                </button>
              </div>
              {selectedRowIndex != -1 && (
                <div className="input-btn-container">
                  <input
                    type="text"
                    value={newValue}
                    placeholder={
                      "(" + selectedRowIndex + ", " + selectedColumnName + ")"
                    }
                    onChange={handleNewValue}
                    className="change-input"
                  />
                  <button onClick={changeValue} className="change-btn">
                    Zmień wartość
                  </button>
                  {selectedRowIndex !== -1 && (
                    <button onClick={deleteRow} className="delete-btn">
                      Usuń rząd: {selectedRowIndex}
                    </button>
                  )}
                </div>
              )}
            </>
          )}
          {selectedFileName !== undefined && (
            <div className="input-btn-container">
              <button
                onClick={saveToFile}
                className="selected-row"
                id="save-btn"
              >
                Zapisz
              </button>
            </div>
          )}
        </div>
      </>
    );
  }

  return content;
}
