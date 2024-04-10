import React, { useState } from "react";

import {
  renameColumn,
  removeColumn,
  removeRow,
  modifyValueAt,
  getFileName,
  loadFile
} from "./pythonConection.js";
import "../styles/data_view.css";
import "../styles/change_data.css";
import AddFile from "./AddFile.jsx";

export default function Content({
  HelperComponent,
  updateDataContent,
  setNormalized,
  normalized,
  allData,
}) {
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

  const fileName = (filePath) => filePath.split("/").pop();

  function getFileName_callback(response) {
    if (response !== "") {
      updateDataContent(updateFileContent_callback);
      setSelectedFileName(fileName(response));
    }
  }

  function checkIfLoaded() {
    if (selectedFileName !== undefined) {
      return;
    }
    getFileName(getFileName_callback);
  }

  checkIfLoaded();

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

  function updateFileContent_callback(dataString) {
    let data = JSON.parse(dataString);
    setFileContent(data);
  }

  function toggleAddColumnsMode(value) {
    setSelectedColumnName("");
    setTempColumnName("");
    setAddColumnsMode(value);
  }

  function changeName(currentValue, currentRow = -1, backendRow = -1, editMode = true) {
    setEditMode(editMode);
    setSelectedBackendRowIndex(backendRow);
    setSelectedCurrentRowIndex(currentRow);
    setSelectedColumnName(currentValue);
    setTempColumnName(currentValue);
  }

  function handleInputValues(event) {
    setTempColumnName(event.target.value);
  }

  function confirmChanges() {
    renameColumn(selectedColumnName, tempColumnName);
    updateDataContent(updateFileContent_callback);
    setEditMode(false);
  }

  function deleteColumn(columnName) {
    removeColumn(columnName);
    updateDataContent(updateFileContent_callback);
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
    updateDataContent(updateFileContent_callback);
  }

  function clickFrame(currentRow, backendRow, column) {
    if (
      +currentRow === selectedCurrentRowIndex &&
      +backendRow === selectedBackendRowIndex &&
      column === selectedColumnName
    ) {
      changeName("", -1, -1, false)
    } else {
      changeName(column, +currentRow, +backendRow, true)
    }
  }

  function handleNewValue(event) {
    setNewValue(event.target.value);
  }

  function changeValue() {
    modifyValueAt(+selectedBackendRowIndex, selectedColumnName, newValue); //konwerujemy na int
    updateDataContent(updateFileContent_callback);
    setNewValue("");
  }

  async function handleAddFileClick() {
    loadFile((filePath) => {
      setSelectedFileName(fileName(filePath));
    });

    updateDataContent(updateFileContent_callback);
    setNormalized(false);
  }

  let content = (
    <AddFile
    handleAddFileClick = {handleAddFileClick}
    />
  );

  if (selectedFileName !== undefined) {
    content = (
      <>
        <div id="main-container" style={{ height: allData ? "70vh" : "20vh" }}>
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
                          ? (selectedColumnName === column && selectedCurrentRowIndex === -1? changeName("", -1, -1, false) : changeName(column))
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
          <HelperComponent
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
            updateDataContent={updateDataContent}
            setNormalized={setNormalized}
            normalized={normalized}
            handleAddFileClick = {handleAddFileClick}
          />
        </div>
      </>
    );
  }

  return content;
}
