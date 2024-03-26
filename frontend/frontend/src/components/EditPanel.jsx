import { saveToFile } from "./Content/pythonConection";


import Normalization from "./Normalization";

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
  updateFileContent_callback,
  columnsSet,
  setAddColumnsMode,
  setColumnsSet,
  addColumnsMode,
}) {

  return (
    <div id="change-container">
      {editMode && (
        <>
          {selectedCurrentRowIndex === -1 && (
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
              <button onClick={changeValue} className="change-btn">
                Zmień wartość
              </button>
              {selectedCurrentRowIndex !== -1 && (
                <button onClick={deleteRow} className="delete-btn">
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

      <Normalization
        updateFileContent_callback={updateFileContent_callback}
        columnsSet = {columnsSet}
        setAddColumnsMode = {setAddColumnsMode}
        setColumnsSet = {setColumnsSet}
        addColumnsMode = {addColumnsMode}
      />
    </div>
  );
}
