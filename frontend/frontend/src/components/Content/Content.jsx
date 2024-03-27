import React, { useState } from "react";
import EditPanel from "../EditPanel.jsx";
import Normalization from "../Normalization.jsx";
import PCA from "../PCA.jsx";
import {
  updateContent,
  renameColumn,
  removeColumn,
  removeRow,
  modifyValueAt,
  loadFile,
} from "./pythonConection.js";
import "../../styles/data_view.css";
import "../../styles/change_data.css";
import Clusteriazation from "../Clusterization.jsx";

export default function Content() {
  const [selectedFileName, setSelectedFileName] = useState(undefined);
  const [fileContent, setFileContent] = useState([]);
  const [editMode, setEditMode] = useState(false);
  const [selectedColumnName, setSelectedColumnName] = useState("");
  const [tempColumnName, setTempColumnName] = useState("");
  const [selectedBackendRowIndex, setSelectedBackendRowIndex] = useState(-1);
  const [selectedCurrentRowIndex, setSelectedCurrentRowIndex] = useState(-1);
  const [newValue, setNewValue] = useState("");
  const [columnsSet, setColumnsSet] = useState(new Set());
  const [addColumnsMode, setAddColumnsMode] = useState(false);

  const columnNames = Object.keys(fileContent);

  const handleToggleColumn = (columnName) => {
    setEditMode(false);
    if (columnsSet.has(columnName)) {
      const newSet = new Set(columnsSet);
      newSet.delete(columnName);
      setColumnsSet(newSet);
    } else {
      setColumnsSet((prevSet) => new Set(prevSet).add(columnName));
    }
  };

  async function handleClick() {
    loadFile((filePath) => setSelectedFileName(filePath.split("/").pop()));

    updateContent(updateFileContent_callback);
  }

  function updateFileContent_callback(dataString) {
    let data = JSON.parse(dataString);
    setFileContent(data);
  }

  function toggleAddColumnsMode(value) {
    setSelectedColumnName("");
    setTempColumnName("");
    setAddColumnsMode(value);
  }

  function changeName(currentValue) {
    setEditMode(true);
    setSelectedBackendRowIndex(-1);
    setSelectedCurrentRowIndex(-1);
    setSelectedColumnName(currentValue);
    setTempColumnName(currentValue);
  }

  function handleInputValues(event) {
    setTempColumnName(event.target.value);
  }

  function confirmChanges() {
    renameColumn(selectedColumnName, tempColumnName);
    updateContent(updateFileContent_callback);
    setEditMode(false);
  }

  function deleteColumn(columnName) {
    removeColumn(columnName);
    updateContent(updateFileContent_callback);
    setEditMode(false);
    setTempColumnName("");
    setSelectedColumnName("");
  }

  function deleteRow() {
    removeRow(+selectedBackendRowIndex); // konwerujemy na int
    setEditMode(false);
    setSelectedBackendRowIndex(-1);
    setSelectedCurrentRowIndex(-1);
    setTempColumnName("");
    setSelectedColumnName("");
    updateContent(updateFileContent_callback);
  }

  function clickFrame(currentRow, backendRow, column) {
    setSelectedBackendRowIndex(+backendRow);
    setSelectedCurrentRowIndex(currentRow);
    changeName(column);
  }

  function handleNewValue(event) {
    setNewValue(event.target.value);
  }

  function changeValue() {
    modifyValueAt(+selectedBackendRowIndex, selectedColumnName, +newValue); //konwerujemy na int
    updateContent(updateFileContent_callback);
    setNewValue("");
  }

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
                    <th
                      className={
                        columnsSet.has(column) ? "selected-th" : undefined
                      }
                      key={column}
                      onClick={() =>
                        !addColumnsMode
                          ? changeName(column)
                          : handleToggleColumn(column)
                      }
                    >
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
                    onClick={() => {
                      setSelectedBackendRowIndex(
                        +Object.keys(fileContent[columnNames[0]])[rowIndex]
                      );
                      setSelectedCurrentRowIndex(+rowIndex);
                    }}
                  >
                    {columnNames.map((column) => (
                      <td
                        key={`${column}_${rowIndex}`}
                        onClick={() =>
                          clickFrame(
                            rowIndex,
                            Object.keys(fileContent[columnNames[0]])[rowIndex],
                            column
                          )
                        }
                        className={
                          (rowIndex === selectedCurrentRowIndex
                            ? "selected-row "
                            : "") +
                          " " +
                          (column === selectedColumnName &&
                          selectedCurrentRowIndex === -1
                            ? "selected-column"
                            : "")
                        }
                        style={{
                          backgroundColor:
                            selectedCurrentRowIndex === rowIndex &&
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
          <EditPanel
            editMode={editMode}
            tempColumnName={tempColumnName}
            selectedColumnName={selectedColumnName}
            confirmChanges={confirmChanges}
            deleteColumn={deleteColumn}
            newValue={newValue}
            handleInputValues={handleInputValues}
            handleNewValue={handleNewValue}
            changeValue={changeValue}
            selectedCurrentRowIndex={selectedCurrentRowIndex}
            deleteRow={deleteRow}
            updateFileContent_callback={updateFileContent_callback}
            columnsSet={columnsSet}
            setAddColumnsMode={toggleAddColumnsMode}
            addColumnsMode={addColumnsMode}
            setColumnsSet={setColumnsSet}
          />
          <Normalization
            updateFileContent_callback={updateFileContent_callback}
            columnsSet={columnsSet}
            setAddColumnsMode={setAddColumnsMode}
            setColumnsSet={setColumnsSet}
            addColumnsMode={addColumnsMode}
          />
          <PCA />
          <Clusteriazation columnsSet={columnsSet} />
        </div>
      </>
    );
  }

  return content;
}
